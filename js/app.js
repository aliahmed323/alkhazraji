'use strict';

/* ===================== CONFIG ===================== */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCRy3JCTqiMYsP8tFt6V8bm1Gc5u7f2YbQ",
  authDomain: "samakna-c3578.firebaseapp.com",
  projectId: "samakna-c3578",
  storageBucket: "samakna-c3578.firebasestorage.app",
  messagingSenderId: "54015672408",
  appId: "1:54015672408:web:b24dd21abf6f8339080a2d"
};

const FISH_TYPES = ['شبوط', 'بني'];

const PAGES = [
  { id:'dashboard', label:'الرئيسية',  icon:'🏠' },
  { id:'sales',     label:'المبيعات',  icon:'📋' },
  { id:'purchases', label:'المشتريات', icon:'🛒' },
  { id:'expenses',  label:'المصاريف',  icon:'💸' },
  { id:'profits',   label:'الأرباح',   icon:'💰' },
  { id:'suppliers', label:'الموردون',  icon:'👥' },
  { id:'debts',     label:'الديون',    icon:'💳' },
  { id:'inventory', label:'المخزون',   icon:'📦' },
  { id:'reports',   label:'التقارير',  icon:'📊' },
  { id:'settings',  label:'الإعدادات', icon:'⚙️' },
];

const EXP_UNITS = {
  'فحم':    { qty:'كيس',  price:'سعر الكيس'   },
  'أكياس':  { qty:'رزمة', price:'سعر الرزمة'  },
  'بهارات': { qty:'كغم',  price:'سعر الكيلو'  },
  'ملح':    { qty:'كغم',  price:'سعر الكيلو'  },
  'وقود':   { qty:'لتر',  price:'سعر اللتر'   },
  'نقل':    { qty:'مرة',  price:'تكلفة المرة' },
  'أجور':   { qty:'يوم',  price:'أجرة اليوم'  },
  'كهرباء': { qty:'شهر',  price:'المبلغ'       },
  'ماء':    { qty:'شهر',  price:'المبلغ'       },
  'صيانة':  { qty:'مرة',  price:'المبلغ'       },
  'أخرى':   { qty:'وحدة', price:'المبلغ'       },
};

/* ===================== STATE ===================== */
let db, auth;
let APP = { shopName:'الخزرجي', expBags:500, expCharcoal:1000, expOther:0,
  profitShaboot:5000, profitBuni:5000 };
let suppCache = [];
let curPage='dashboard', sPeriod='today', pPeriod='today', ePeriod='today',
    rPeriod='today', prPeriod='month';
let rChart = null, calcStr = '0';

/* ===================== DOM ===================== */
const q  = id => document.getElementById(id);
const gv = id => (q(id)||{}).value||'';
const sv = (id,v) => { if(q(id)) q(id).value=v; };

/* ===================== FORMAT ===================== */
function fmt(n) {
  n = Number(n)||0;
  if (n < 0) return '-' + Math.abs(Math.round(n)).toLocaleString('ar-IQ') + ' د.ع';
  return Math.round(n).toLocaleString('ar-IQ') + ' د.ع';
}
function fmtN(n) { return (Number(n)||0).toLocaleString('ar-IQ'); }
function fmtD(ts) {
  if(!ts) return '-';
  const d = ts&&ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ar-IQ',{day:'2-digit',month:'2-digit',year:'numeric'});
}
function todayStr() { return new Date().toISOString().split('T')[0]; }
function pCls(n) { return Number(n)>=0?'green':'red'; }
function pIcon(n){ return Number(n)<0?'📉':'📈'; }
function toDate(ts){ return ts&&ts.toDate ? ts.toDate() : new Date(ts||0); }
function dayS(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0); }
function dayE(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate(),23,59,59); }
function inP(ts,s,e){ if(!ts)return false; const d=toDate(ts); return d>=s&&d<=e; }
function periodDates(p) {
  const now=new Date(), s=dayS(now), e=dayE(now);
  if(p==='today')  return {start:s,end:e};
  if(p==='week')   { const w=new Date(s); w.setDate(w.getDate()-6); return {start:w,end:e}; }
  if(p==='month')  return {start:new Date(now.getFullYear(),now.getMonth(),1),end:e};
  if(p==='3months'){ const w=new Date(s); w.setDate(w.getDate()-89); return {start:w,end:e}; }
  return {start:s,end:e};
}

/* ===================== TOAST ===================== */
function toast(msg,type) {
  type=type||'info';
  const el=document.createElement('div');
  el.className='toast t-'+type; el.textContent=msg;
  q('toast-wrap').appendChild(el);
  setTimeout(()=>{el.style.cssText='opacity:0;transform:translateX(50px);transition:.3s';setTimeout(()=>el.remove(),300);},3000);
}

/* ===================== MODALS ===================== */
function openM(id){ q(id).classList.add('on'); }
function closeM(id){ q(id).classList.remove('on'); }

/* ===================== AUTH ===================== */
function authTab(t) {
  q('tab-login').classList.toggle('on',t==='login');
  q('tab-reg').classList.toggle('on',t==='reg');
  q('pnl-login').classList.toggle('hidden',t!=='login');
  q('pnl-reg').classList.toggle('hidden',t!=='reg');
  q('auth-err').textContent='';
}
async function doLogin(){ q('auth-err').textContent=''; try{await auth.signInWithEmailAndPassword(gv('login-email'),gv('login-pass'));}catch(e){q('auth-err').textContent='البريد أو كلمة المرور غير صحيحة';} }
async function doRegister(){ q('auth-err').textContent=''; if(gv('reg-pass').length<6){q('auth-err').textContent='كلمة المرور 6 أحرف على الأقل';return;} try{await auth.createUserWithEmailAndPassword(gv('reg-email'),gv('reg-pass'));}catch(e){q('auth-err').textContent='تعذر إنشاء الحساب';} }
async function doLogout(){ await auth.signOut(); }

/* ===================== NAV ===================== */
function buildNav() {
  const h=PAGES.map(p=>`<button class="nav-item ${curPage===p.id?'on':''}" data-p="${p.id}" onclick="goto('${p.id}')"><span class="ic">${p.icon}</span>${p.label}</button>`).join('');
  if(q('desk-nav'))q('desk-nav').innerHTML=h;
  if(q('mob-sidebar'))q('mob-sidebar').innerHTML=`
    <div class="sb-logo" style="padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,.1);"><span style="font-size:28px;">🐟</span><span style="color:#fff;font-size:21px;font-weight:800;margin-right:10px;">الخزرجي</span></div>
    <nav class="nav-menu">${PAGES.map(p=>`<button class="nav-item ${curPage===p.id?'on':''}" data-p="${p.id}" onclick="goto('${p.id}');closeSidebar();"><span class="ic">${p.icon}</span>${p.label}</button>`).join('')}</nav>
    <div class="sb-foot" style="border-top:1px solid rgba(255,255,255,.1);"><button class="nav-item" onclick="doLogout()"><span class="ic">🚪</span>تسجيل الخروج</button></div>`;
}
function goto(pid) {
  curPage=pid;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  const pg=q('page-'+pid); if(pg)pg.classList.add('on');
  const info=PAGES.find(p=>p.id===pid);
  if(info&&q('page-title'))q('page-title').textContent=info.icon+' '+info.label;
  document.querySelectorAll('[data-p]').forEach(el=>el.classList.toggle('on',el.dataset.p===pid));
  if(q('page-wrap'))q('page-wrap').scrollTop=0;
  buildNav();
  loadPage(pid);
}
function loadPage(id) {
  const m={dashboard:loadDash,sales:loadSales,purchases:loadPurchases,expenses:loadExpenses,profits:loadProfits,suppliers:loadSuppliers,debts:loadDebts,inventory:loadInventory,reports:loadReports,settings:loadSettings};
  if(m[id])m[id]();
}
function openSidebar(){ buildNav(); q('mob-sidebar').classList.add('on'); q('sb-overlay').classList.add('on'); }
function closeSidebar(){ q('mob-sidebar').classList.remove('on'); q('sb-overlay').classList.remove('on'); }

/* ===================== PERIOD TABS ===================== */
function renderTabs(cId,cur,fn,extra) {
  const el=q(cId); if(!el)return;
  const tabs = extra || [['today','اليوم'],['week','الأسبوع'],['month','الشهر']];
  el.innerHTML=tabs.map(([v,l])=>`<button class="period-tab ${cur===v?'on':''}" onclick="(${fn})('${v}')">${l}</button>`).join('');
}

/* ===================== FB ===================== */
async function getAll(col){ return (await db.collection(col).get()).docs.map(d=>({id:d.id,...d.data()})); }
async function addFB(col,data){ return db.collection(col).add({...data,createdAt:firebase.firestore.Timestamp.now()}); }
async function updFB(col,id,data){ return db.collection(col).doc(id).update(data); }
async function delFB(col,id){ return db.collection(col).doc(id).delete(); }
function tsFrom(dateStr){ return firebase.firestore.Timestamp.fromDate(new Date(dateStr)); }

/* ===================== FISH GRID ===================== */
function buildFishGrid(gid,hid){
  const el=q(gid); if(!el)return;
  el.innerHTML=FISH_TYPES.map(t=>`<button type="button" class="fish-btn" onclick="pickFish('${gid}','${hid}','${t}')">${t}</button>`).join('');
}
function pickFish(gid,hid,t){
  document.querySelectorAll('#'+gid+' .fish-btn').forEach(b=>b.classList.toggle('on',b.textContent===t));
  sv(hid,t);
}

/* ===================== DASHBOARD ===================== */
async function loadDash() {
  const cnt=q('dash-cnt'); if(!cnt)return;
  cnt.innerHTML='<div style="text-align:center;padding:50px;"><div class="spinner" style="margin:auto;border:3px solid rgba(0,0,0,.1);border-top-color:var(--accent);width:38px;height:38px;border-radius:50%;animation:spin .8s linear infinite;"></div></div>';
  try {
    const now=new Date(), tS=dayS(now), tE=dayE(now), wS=new Date(tS); wS.setDate(wS.getDate()-6);
    const [allSales,allPur,allExp,allPay,allCPay]=await Promise.all([getAll('sales'),getAll('purchases'),getAll('expenses'),getAll('payments'),getAll('customerPayments')]);

    const filt=(arr,s,e)=>arr.filter(d=>inP(d.date,s,e));
    const sum=(arr,k)=>arr.reduce((s,x)=>s+(x[k]||0),0);

    // Today
    const tSales=filt(allSales,tS,tE), tPur=filt(allPur,tS,tE), tExp=filt(allExp,tS,tE);
    const tSA=sum(tSales,'total'), tPA=sum(tPur,'total'), tEA=sum(tExp,'amount');
    const tProfit=tSA-tPA-tEA;

    // Week
    const wSales=filt(allSales,wS,tE), wPur=filt(allPur,wS,tE), wExp=filt(allExp,wS,tE);
    const wSA=sum(wSales,'total'), wPA=sum(wPur,'total'), wEA=sum(wExp,'amount');
    const wProfit=wSA-wPA-wEA;

    // Debts SEPARATED
    const supDebt =Math.max(0, sum(allPur,'debtAmount')-sum(allPay,'amount'));
    const custDebt=Math.max(0, sum(allSales.filter(x=>x.payType==='debt'),'debtAmount')-sum(allCPay,'amount'));

    // Expected Profit from settings
    const inv={};
    FISH_TYPES.forEach(t=>{
      const inKg=allPur.filter(p=>p.fishType===t).reduce((s,p)=>s+(p.weight||0),0);
      const outKg=allSales.filter(s=>s.fishType===t).reduce((s,x)=>s+(x.weight||0),0);
      inv[t]=Math.max(0,inKg-outKg);
    });
    const expProfit=(inv['شبوط']*(APP.profitShaboot||0))+(inv['بني']*(APP.profitBuni||0));
    const totalRem=FISH_TYPES.reduce((s,t)=>s+(inv[t]||0),0);
    // Subtract est. fixed expenses
    const avgSaleW=allSales.length>0 ? sum(allSales,'weight')/allSales.length : 5;
    const estSalesCnt=avgSaleW>0?Math.ceil(totalRem/avgSaleW):0;
    const fixPer=(APP.expBags||0)+(APP.expCharcoal||0)+(APP.expOther||0);
    const netExpProfit=expProfit-(estSalesCnt*fixPer);

    const last6=[...allSales].sort((a,b)=>(b.date?.seconds||0)-(a.date?.seconds||0)).slice(0,6);

    cnt.innerHTML=`
      <div class="summary-row">
        <div class="summary-card today">
          <div class="stitle">📅 ملخص اليوم</div>
          <div class="summary-line"><span class="sl-label">المبيعات</span><span class="sl-val blue">${fmt(tSA)}</span></div>
          <div class="summary-line"><span class="sl-label">المشتريات</span><span class="sl-val">${fmt(tPA)}</span></div>
          <div class="summary-line"><span class="sl-label">المصاريف</span><span class="sl-val orange">${fmt(tEA)}</span></div>
          <div class="summary-line" style="border-top:2px solid var(--border);padding-top:10px;margin-top:4px;">
            <span class="sl-label fw8">${pIcon(tProfit)} الربح</span>
            <span class="sl-val ${pCls(tProfit)} fw8" style="font-size:19px;">${fmt(tProfit)}</span>
          </div>
        </div>
        <div class="summary-card week">
          <div class="stitle">📆 ملخص الأسبوع</div>
          <div class="summary-line"><span class="sl-label">المبيعات</span><span class="sl-val blue">${fmt(wSA)}</span></div>
          <div class="summary-line"><span class="sl-label">المشتريات</span><span class="sl-val">${fmt(wPA)}</span></div>
          <div class="summary-line"><span class="sl-label">المصاريف</span><span class="sl-val orange">${fmt(wEA)}</span></div>
          <div class="summary-line" style="border-top:2px solid var(--border);padding-top:10px;margin-top:4px;">
            <span class="sl-label fw8">${pIcon(wProfit)} الربح</span>
            <span class="sl-val ${pCls(wProfit)} fw8" style="font-size:19px;">${fmt(wProfit)}</span>
          </div>
        </div>
      </div>

      <div class="expected-card">
        <div class="ec-title">💎 الربح المتوقع (إذا بِيع كل المخزون)</div>
        <div class="ec-val" style="${netExpProfit<0?'color:#fca5a5;':''}">${pIcon(netExpProfit)} ${fmt(netExpProfit)}</div>
        <div style="font-size:13px;opacity:.7;margin-top:6px;">المخزون: ${FISH_TYPES.map(t=>t+': '+fmtN(inv[t])+' كغم').join(' | ')} | ربح/كغ: شبوط ${fmtN(APP.profitShaboot)} - بني ${fmtN(APP.profitBuni)}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card r"><div class="stat-lbl">⬅ ديون عليك (موردين)</div><div class="stat-val r">${fmt(supDebt)}</div></div>
        <div class="stat-card g"><div class="stat-lbl">➡ ديون لك (زبائن)</div><div class="stat-val o">${fmt(custDebt)}</div></div>
      </div>

      <div class="sec-title">آخر المبيعات</div>
      <div class="card"><div class="card-body">
        ${last6.length===0 ? '<div class="empty"><div class="ic">📋</div><p>لا توجد مبيعات بعد</p></div>'
        : `<div class="tbl-wrap"><table><thead><tr><th>التاريخ</th><th>الزبون</th><th>النوع</th><th>الوزن</th><th>الإجمالي</th><th>الدفع</th></tr></thead><tbody>
          ${last6.map(s=>`<tr><td>${fmtD(s.date)}</td><td>${s.customerName||'-'}</td><td><span class="badge bi">${s.fishType||'-'}</span></td><td>${fmtN(s.weight)} كغم</td><td class="fw8 tg">${fmt(s.total)}</td><td>${s.payType==='debt'?'<span class="badge bd">دين</span>':'<span class="badge bs">نقد</span>'}</td></tr>`).join('')}
        </tbody></table></div>`}
      </div></div>`;
  } catch(e){ cnt.innerHTML=`<div class="empty"><div class="ic">⚠️</div><p>${e.message}</p></div>`; console.error(e); }
}

/* ===================== SALES ===================== */
function openAddSale() {
  sv('sale-edit-id','');
  q('sale-m-title').textContent='➕ بيع جديد';
  q('sale-submit-btn').textContent='💾 حفظ البيعة';
  buildFishGrid('sale-fish-grid','sale-fish');
  sv('sale-date',todayStr());
  ['sale-weight','sale-qty','sale-price','sale-total','sale-notes','sale-cust','sale-fish'].forEach(id=>sv(id,''));
  sv('sale-paytype','cash'); selSalePay('cash');
  sv('sale-exp-bags',APP.expBags||0); sv('sale-exp-charcoal',APP.expCharcoal||0); sv('sale-exp-other',APP.expOther||0);
  openM('m-sale');
}

async function openEditSale(id) {
  const doc=await db.collection('sales').doc(id).get();
  if(!doc.exists){toast('لم يتم العثور على البيعة','error');return;}
  const d=doc.data();
  sv('sale-edit-id',id);
  q('sale-m-title').textContent='✏️ تعديل بيعة';
  q('sale-submit-btn').textContent='💾 حفظ التعديل';
  buildFishGrid('sale-fish-grid','sale-fish');
  sv('sale-fish',d.fishType||'');
  if(d.fishType) pickFish('sale-fish-grid','sale-fish',d.fishType);
  sv('sale-cust',d.customerName||'');
  sv('sale-weight',d.weight||''); sv('sale-qty',d.qty||'');
  sv('sale-price',d.pricePerKg||''); sv('sale-total',d.total||'');
  sv('sale-paytype',d.payType||'cash'); selSalePay(d.payType||'cash');
  sv('sale-exp-bags',d.fixedExpenses?.bags??APP.expBags);
  sv('sale-exp-charcoal',d.fixedExpenses?.charcoal??APP.expCharcoal);
  sv('sale-exp-other',d.fixedExpenses?.other??APP.expOther);
  const dt=toDate(d.date); sv('sale-date',dt.toISOString().split('T')[0]);
  sv('sale-notes',d.notes||'');
  openM('m-sale');
}

function selSalePay(t){ sv('sale-paytype',t); q('spb-cash').className='pay-btn'+(t==='cash'?' cash':''); q('spb-debt').className='pay-btn'+(t==='debt'?' debt':''); }
function calcSaleTotal(){ const w=parseFloat(gv('sale-weight'))||0, p=parseFloat(gv('sale-price'))||0; sv('sale-total',w&&p?Math.round(w*p):''); }

async function submitSale() {
  const editId=gv('sale-edit-id');
  const fish=gv('sale-fish'), cust=gv('sale-cust').trim();
  const weight=parseFloat(gv('sale-weight')), qty=parseInt(gv('sale-qty'))||0;
  const price=parseFloat(gv('sale-price')), total=parseFloat(gv('sale-total'))||Math.round((weight||0)*(price||0));
  const payType=gv('sale-paytype')||'cash', date=gv('sale-date'), notes=gv('sale-notes');
  const feBags=parseFloat(gv('sale-exp-bags'))||0, feChar=parseFloat(gv('sale-exp-charcoal'))||0, feOth=parseFloat(gv('sale-exp-other'))||0;
  const feTotal=feBags+feChar+feOth;

  if(!fish){toast('اختر نوع السمك','error');return;}
  if(!(weight>0)){toast('أدخل وزناً','error');return;}
  if(!(price>0)){toast('أدخل سعراً','error');return;}
  if(payType==='debt'&&!cust){toast('أدخل اسم الزبون للدين','error');return;}

  // Stock check (skip for edit)
  if(!editId) {
    const inv=await fishInv();
    if((inv[fish]||0)<weight){toast('لا يوجد مخزون كافٍ! المتوفر: '+fmtN(inv[fish]||0)+' كغم','error');return;}
  }

  const debtAmt=payType==='debt'?total:0;
  const saleData={fishType:fish,weight,qty,pricePerKg:price,total,customerName:cust,payType,debtAmount:debtAmt,
    fixedExpenses:{bags:feBags,charcoal:feChar,other:feOth},fixedExpensesTotal:feTotal,
    date:tsFrom(date),notes};

  try {
    if(editId) {
      // Delete old auto-expenses
      const oldExps=await getAll('expenses');
      for(const ex of oldExps){if(ex.autoFromSale===editId)await delFB('expenses',ex.id);}
      await updFB('sales',editId,saleData);
      // Re-create auto-expenses
      if(feBags>0) await addFB('expenses',{type:'أكياس (بيعة)',qty:1,unitPrice:feBags,amount:feBags,autoFromSale:editId,date:tsFrom(date),notes:'تلقائي - بيعة '+fish});
      if(feChar>0) await addFB('expenses',{type:'فحم (بيعة)',qty:1,unitPrice:feChar,amount:feChar,autoFromSale:editId,date:tsFrom(date),notes:'تلقائي - بيعة '+fish});
      if(feOth>0)  await addFB('expenses',{type:'أخرى (بيعة)',qty:1,unitPrice:feOth,amount:feOth,autoFromSale:editId,date:tsFrom(date),notes:'تلقائي - بيعة '+fish});
      toast('تم تعديل البيعة ✅','success');
    } else {
      const ref=await addFB('sales',saleData);
      if(feBags>0) await addFB('expenses',{type:'أكياس (بيعة)',qty:1,unitPrice:feBags,amount:feBags,autoFromSale:ref.id,date:tsFrom(date),notes:'تلقائي - بيعة '+fish});
      if(feChar>0) await addFB('expenses',{type:'فحم (بيعة)',qty:1,unitPrice:feChar,amount:feChar,autoFromSale:ref.id,date:tsFrom(date),notes:'تلقائي - بيعة '+fish});
      if(feOth>0)  await addFB('expenses',{type:'أخرى (بيعة)',qty:1,unitPrice:feOth,amount:feOth,autoFromSale:ref.id,date:tsFrom(date),notes:'تلقائي - بيعة '+fish});
      toast('تم تسجيل البيعة ✅','success');
    }
    closeM('m-sale'); loadSales();
  } catch(e){toast('خطأ: '+e.message,'error');}
}

async function loadSales() {
  renderTabs('sales-tabs',sPeriod,function(p){sPeriod=p;loadSales();});
  const{start,end}=periodDates(sPeriod);
  try {
    const items=(await getAll('sales')).filter(d=>inP(d.date,start,end)).sort((a,b)=>(b.date?.seconds||0)-(a.date?.seconds||0));
    const tA=items.reduce((s,x)=>s+(x.total||0),0), tW=items.reduce((s,x)=>s+(x.weight||0),0), tFE=items.reduce((s,x)=>s+(x.fixedExpensesTotal||0),0);
    q('sales-summ').innerHTML=`<div class="stats-grid" style="margin:0;">
      <div class="stat-card g"><div class="stat-lbl">إجمالي المبيعات</div><div class="stat-val g">${fmt(tA)}</div></div>
      <div class="stat-card b"><div class="stat-lbl">الوزن</div><div class="stat-val">${fmtN(tW)} كغم</div></div>
      <div class="stat-card o"><div class="stat-lbl">مصاريف ثابتة</div><div class="stat-val o">${fmt(tFE)}</div></div>
      <div class="stat-card n"><div class="stat-lbl">العمليات</div><div class="stat-val">${items.length}</div></div>
    </div>`;
    q('sales-body').innerHTML=items.length===0
      ? '<tr><td colspan="9"><div class="empty"><div class="ic">📋</div><p>لا توجد مبيعات</p></div></td></tr>'
      : items.map(s=>`<tr>
          <td>${fmtD(s.date)}</td><td>${s.customerName||'-'}</td>
          <td><span class="badge bi">${s.fishType||'-'}</span></td>
          <td>${fmtN(s.weight)} كغم</td><td>${fmt(s.pricePerKg)}</td>
          <td class="fw8 tg">${fmt(s.total)}</td>
          <td>${s.payType==='debt'?'<span class="badge bd">دين</span>':'<span class="badge bs">نقد</span>'}</td>
          <td class="tm fs13">${fmt(s.fixedExpensesTotal||0)}</td>
          <td><div class="act-btns"><button class="btn btn-icon btn-primary btn-sm" onclick="openEditSale('${s.id}')">✏️</button><button class="btn btn-icon btn-danger btn-sm" onclick="delSale('${s.id}')">🗑️</button></div></td>
        </tr>`).join('');
  } catch(e){console.error(e);}
}

async function delSale(id){
  if(!confirm('حذف هذه البيعة؟'))return;
  const exps=await getAll('expenses'); for(const ex of exps){if(ex.autoFromSale===id)await delFB('expenses',ex.id);}
  await delFB('sales',id); toast('تم الحذف','warning'); loadSales();
}

/* ===================== PURCHASES ===================== */
async function openAddPurchase() {
  sv('pur-edit-id','');
  q('pur-m-title').textContent='➕ شراء جديد';
  q('pur-submit-btn').textContent='💾 حفظ الشراء';
  suppCache=await getAll('suppliers');
  q('pur-supplier').innerHTML=suppCache.length===0?'<option value="">لا يوجد موردون</option>':suppCache.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
  buildFishGrid('pur-fish-grid','pur-fish');
  sv('pur-date',todayStr());
  ['pur-count','pur-avgw','pur-price','pur-weight','pur-total','pur-paid','pur-notes','pur-fish'].forEach(id=>sv(id,''));
  sv('pur-paytype','cash'); selPay('cash');
  openM('m-purchase');
}

async function openEditPurchase(id) {
  const doc=await db.collection('purchases').doc(id).get();
  if(!doc.exists){toast('لم يتم العثور','error');return;}
  const d=doc.data();
  sv('pur-edit-id',id);
  q('pur-m-title').textContent='✏️ تعديل شراء';
  q('pur-submit-btn').textContent='💾 حفظ التعديل';
  suppCache=await getAll('suppliers');
  q('pur-supplier').innerHTML=suppCache.map(s=>`<option value="${s.id}" ${s.id===d.supplierId?'selected':''}>${s.name}</option>`).join('');
  buildFishGrid('pur-fish-grid','pur-fish');
  if(d.fishType)pickFish('pur-fish-grid','pur-fish',d.fishType);
  sv('pur-fish',d.fishType||'');
  sv('pur-count',d.fishCount||''); sv('pur-avgw',d.avgWeight||'');
  sv('pur-price',d.pricePerKg||'');
  sv('pur-weight',d.weight?fmtN(d.weight)+' كغم':'');
  sv('pur-total',d.total?fmt(d.total):'');
  sv('pur-paytype',d.payType||'cash'); selPay(d.payType||'cash');
  if(d.payType==='partial')sv('pur-paid',d.paidAmount||'');
  const dt=toDate(d.date); sv('pur-date',dt.toISOString().split('T')[0]);
  sv('pur-notes',d.notes||'');
  openM('m-purchase');
}

function calcPurTotal(){
  const c=parseFloat(gv('pur-count'))||0, a=parseFloat(gv('pur-avgw'))||0, p=parseFloat(gv('pur-price'))||0;
  const tw=c*a, tot=tw*p;
  sv('pur-weight',tw>0?fmtN(tw)+' كغم':'');
  sv('pur-total',tot>0?fmt(tot):'');
  calcPartDebt();
}
function selPay(t){
  sv('pur-paytype',t);
  ['cash','debt','partial'].forEach(x=>{const b=q('pb-'+x);if(b)b.className='pay-btn'+(x===t?' '+x:'');});
  q('partial-grp').classList.toggle('hidden',t!=='partial');
}
function calcPartDebt(){
  const c=parseFloat(gv('pur-count'))||0, a=parseFloat(gv('pur-avgw'))||0, p=parseFloat(gv('pur-price'))||0;
  const tot=c*a*p, paid=parseFloat(gv('pur-paid'))||0;
  q('partial-lbl').textContent=Math.max(0,tot-paid)>0?'المبلغ المتبقي ديناً: '+fmt(Math.max(0,tot-paid)):'';
}

async function submitPurchase() {
  const editId=gv('pur-edit-id');
  const supId=gv('pur-supplier'), fish=gv('pur-fish');
  const cnt=parseInt(gv('pur-count')), avgW=parseFloat(gv('pur-avgw')), ppk=parseFloat(gv('pur-price'));
  const payT=gv('pur-paytype')||'cash', date=gv('pur-date'), notes=gv('pur-notes');
  if(!supId){toast('اختر مورداً','error');return;}
  if(!fish){toast('اختر نوع السمك','error');return;}
  if(!(cnt>0)){toast('أدخل عدد السمكات','error');return;}
  if(!(avgW>0)){toast('أدخل متوسط الوزن','error');return;}
  if(!(ppk>0)){toast('أدخل سعر الكيلو','error');return;}

  const weight=cnt*avgW, total=Math.round(weight*ppk);
  let paidAmt=0,debtAmt=0;
  if(payT==='cash'){paidAmt=total;}else if(payT==='debt'){debtAmt=total;}else{paidAmt=parseFloat(gv('pur-paid'))||0;debtAmt=Math.max(0,total-paidAmt);}
  const sup=suppCache.find(s=>s.id===supId);
  const data={supplierId:supId,supplierName:sup?sup.name:'',fishType:fish,fishCount:cnt,avgWeight:avgW,weight,pricePerKg:ppk,total,payType:payT,paidAmount:paidAmt,debtAmount:debtAmt,date:tsFrom(date),notes};
  try {
    if(editId){await updFB('purchases',editId,data);toast('تم تعديل الشراء ✅','success');}
    else{await addFB('purchases',data);toast('تم تسجيل الشراء ✅','success');}
    closeM('m-purchase'); loadPurchases();
  } catch(e){toast('خطأ: '+e.message,'error');}
}

async function loadPurchases() {
  renderTabs('purchases-tabs',pPeriod,function(p){pPeriod=p;loadPurchases();});
  const{start,end}=periodDates(pPeriod);
  try {
    const items=(await getAll('purchases')).filter(d=>inP(d.date,start,end)).sort((a,b)=>(b.date?.seconds||0)-(a.date?.seconds||0));
    const tA=items.reduce((s,x)=>s+(x.total||0),0), tD=items.reduce((s,x)=>s+(x.debtAmount||0),0);
    q('purchases-summ').innerHTML=`<div class="stats-grid" style="margin:0;">
      <div class="stat-card n"><div class="stat-lbl">إجمالي المشتريات</div><div class="stat-val">${fmt(tA)}</div></div>
      <div class="stat-card r"><div class="stat-lbl">الديون</div><div class="stat-val r">${fmt(tD)}</div></div>
      <div class="stat-card b"><div class="stat-lbl">العمليات</div><div class="stat-val">${items.length}</div></div>
    </div>`;
    const bp=t=>({cash:'<span class="badge bs">نقد</span>',debt:'<span class="badge bd">دين</span>',partial:'<span class="badge bw">جزئي</span>'})[t]||'-';
    q('purchases-body').innerHTML=items.length===0
      ?'<tr><td colspan="9"><div class="empty"><div class="ic">🛒</div><p>لا توجد مشتريات</p></div></td></tr>'
      :items.map(p=>`<tr>
          <td>${fmtD(p.date)}</td><td>${p.supplierName||'-'}</td>
          <td><span class="badge bi">${p.fishType||'-'}</span></td>
          <td>${p.fishCount||'-'}</td><td class="fw8">${fmtN(p.weight)} كغم</td>
          <td class="fw8">${fmt(p.total)}</td><td>${bp(p.payType)}</td><td class="tr">${fmt(p.debtAmount)}</td>
          <td><div class="act-btns"><button class="btn btn-icon btn-primary btn-sm" onclick="openEditPurchase('${p.id}')">✏️</button><button class="btn btn-icon btn-danger btn-sm" onclick="delPurchase('${p.id}')">🗑️</button></div></td>
        </tr>`).join('');
  } catch(e){console.error(e);}
}
async function delPurchase(id){if(!confirm('حذف؟'))return;await delFB('purchases',id);toast('تم الحذف','warning');loadPurchases();}

/* ===================== EXPENSES ===================== */
function onExpTypeChange(){const t=gv('exp-type'),u=EXP_UNITS[t]||{qty:'وحدة',price:'المبلغ'};q('exp-qty-lbl').textContent='الكمية ('+u.qty+')';q('exp-up-lbl').textContent=u.price;}
function calcExpTotal(){const qy=parseFloat(gv('exp-qty'))||0,up=parseFloat(gv('exp-uprice'))||0;sv('exp-amount',qy&&up?Math.round(qy*up):'');}

function openAddExpense(){
  sv('exp-edit-id','');
  q('exp-m-title').textContent='➕ مصروف جديد';
  q('exp-submit-btn').textContent='💾 حفظ المصروف';
  sv('exp-date',todayStr());['exp-qty','exp-uprice','exp-amount','exp-notes'].forEach(id=>sv(id,''));
  sv('exp-type','فحم');onExpTypeChange();
  openM('m-expense');
}

async function openEditExpense(id){
  const doc=await db.collection('expenses').doc(id).get();
  if(!doc.exists){toast('لم يتم العثور','error');return;}
  const d=doc.data();
  sv('exp-edit-id',id);
  q('exp-m-title').textContent='✏️ تعديل مصروف';
  q('exp-submit-btn').textContent='💾 حفظ التعديل';
  sv('exp-type',d.type||'أخرى');onExpTypeChange();
  sv('exp-qty',d.qty||'');sv('exp-uprice',d.unitPrice||'');sv('exp-amount',d.amount||'');
  const dt=toDate(d.date);sv('exp-date',dt.toISOString().split('T')[0]);
  sv('exp-notes',d.notes||'');
  openM('m-expense');
}

async function submitExpense(){
  const editId=gv('exp-edit-id');
  const type=gv('exp-type'),qy=parseFloat(gv('exp-qty'))||0,up=parseFloat(gv('exp-uprice'))||0;
  const amount=parseFloat(gv('exp-amount'))||Math.round(qy*up);
  const date=gv('exp-date'),notes=gv('exp-notes');
  if(!(amount>0)){toast('أدخل مبلغاً','error');return;}
  const data={type,qty:qy,unitPrice:up,amount,date:tsFrom(date),notes};
  try{
    if(editId){await updFB('expenses',editId,data);toast('تم التعديل ✅','success');}
    else{await addFB('expenses',data);toast('تم تسجيل المصروف ✅','success');}
    closeM('m-expense');loadExpenses();
  }catch(e){toast('خطأ: '+e.message,'error');}
}

async function loadExpenses(){
  renderTabs('expenses-tabs',ePeriod,function(p){ePeriod=p;loadExpenses();});
  const{start,end}=periodDates(ePeriod);
  try{
    const items=(await getAll('expenses')).filter(d=>inP(d.date,start,end)).sort((a,b)=>(b.date?.seconds||0)-(a.date?.seconds||0));
    const tA=items.reduce((s,x)=>s+(x.amount||0),0);
    q('expenses-summ').innerHTML=`<div class="stats-grid" style="margin:0;">
      <div class="stat-card r"><div class="stat-lbl">إجمالي المصاريف</div><div class="stat-val r">${fmt(tA)}</div></div>
      <div class="stat-card n"><div class="stat-lbl">العمليات</div><div class="stat-val">${items.length}</div></div>
    </div>`;
    q('expenses-body').innerHTML=items.length===0
      ?'<tr><td colspan="7"><div class="empty"><div class="ic">💸</div><p>لا توجد مصاريف</p></div></td></tr>'
      :items.map(e=>`<tr>
          <td>${fmtD(e.date)}</td><td><span class="badge ${e.autoFromSale?'bp':'bw'}">${e.type||'-'}${e.autoFromSale?' ↩':''}</span></td>
          <td>${e.qty?fmtN(e.qty):'-'}</td><td>${e.unitPrice?fmt(e.unitPrice):'-'}</td>
          <td class="fw8 tr">${fmt(e.amount)}</td><td class="tm fs13">${e.notes||'-'}</td>
          <td><div class="act-btns"><button class="btn btn-icon btn-primary btn-sm" onclick="openEditExpense('${e.id}')">✏️</button><button class="btn btn-icon btn-danger btn-sm" onclick="delExpense('${e.id}')">🗑️</button></div></td>
        </tr>`).join('');
  }catch(e){console.error(e);}
}
async function delExpense(id){if(!confirm('حذف؟'))return;await delFB('expenses',id);toast('تم الحذف','warning');loadExpenses();}

/* ===================== PROFITS ===================== */
async function loadProfits(){
  renderTabs('profits-tabs',prPeriod,function(p){prPeriod=p;loadProfits();},
    [['week','الأسبوع'],['month','الشهر'],['3months','3 أشهر']]);
  const{start,end}=periodDates(prPeriod);
  try{
    const[allSales,allPur,allExp]=await Promise.all([getAll('sales'),getAll('purchases'),getAll('expenses')]);
    const dayMap=new Map();
    const addD=ts=>{const d=toDate(ts);if(d>=start&&d<=end){const k=d.toISOString().split('T')[0];if(!dayMap.has(k))dayMap.set(k,d);}};
    allSales.forEach(x=>addD(x.date));allPur.forEach(x=>addD(x.date));allExp.forEach(x=>addD(x.date));
    const days=Array.from(dayMap.entries()).sort((a,b)=>b[0].localeCompare(a[0]));
    let gS=0,gP=0,gE=0;
    const html=days.map(([k,d])=>{
      const ds=dayS(d),de=dayE(d);
      const dS=allSales.filter(x=>inP(x.date,ds,de)), dP=allPur.filter(x=>inP(x.date,ds,de)), dE=allExp.filter(x=>inP(x.date,ds,de));
      const tS=dS.reduce((s,x)=>s+(x.total||0),0), tP=dP.reduce((s,x)=>s+(x.total||0),0), tE=dE.reduce((s,x)=>s+(x.amount||0),0);
      const pr=tS-tP-tE; gS+=tS;gP+=tP;gE+=tE;
      return `<div class="card"><div class="card-head"><span class="card-title">📅 ${fmtD(d)}</span><span class="fw8 ${pr>=0?'tg':'tr'}" style="font-size:17px;">${pIcon(pr)} ${fmt(pr)}</span></div>
        <div class="card-body">
          <div class="summary-line"><span class="sl-label">📋 المبيعات (${dS.length})</span><span class="sl-val blue">${fmt(tS)}</span></div>
          <div class="summary-line"><span class="sl-label">🛒 المشتريات (${dP.length})</span><span class="sl-val">${fmt(tP)}</span></div>
          <div class="summary-line"><span class="sl-label">💸 المصاريف (${dE.length})</span><span class="sl-val orange">${fmt(tE)}</span></div>
          ${dS.length>0?`<div style="margin-top:8px;font-size:13px;color:var(--text-l);">${dS.map(s=>`<span class="badge bi" style="margin:2px;">${s.fishType} ${fmtN(s.weight)}كغم ${fmt(s.total)}</span>`).join('')}</div>`:''}
        </div></div>`;
    }).join('');
    const gPr=gS-gP-gE;
    q('profits-summ').innerHTML=`<div class="stats-grid" style="margin:0;">
      <div class="stat-card g"><div class="stat-lbl">المبيعات</div><div class="stat-val g">${fmt(gS)}</div></div>
      <div class="stat-card n"><div class="stat-lbl">المشتريات</div><div class="stat-val">${fmt(gP)}</div></div>
      <div class="stat-card o"><div class="stat-lbl">المصاريف</div><div class="stat-val o">${fmt(gE)}</div></div>
      <div class="stat-card ${gPr>=0?'g':'r'}"><div class="stat-lbl">صافي الربح</div><div class="stat-val ${gPr>=0?'g':'r'}" style="font-size:22px;">${pIcon(gPr)} ${fmt(gPr)}</div></div>
    </div>`;
    q('profits-list').innerHTML=days.length===0?'<div class="empty"><div class="ic">💰</div><h3>لا توجد بيانات</h3></div>':html;
  }catch(e){console.error(e);}
}

/* ===================== SUPPLIERS ===================== */
async function loadSuppliers(){
  const list=q('suppliers-list');if(!list)return;
  try{
    suppCache=(await getAll('suppliers')).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
    const[allPur,allPay]=await Promise.all([getAll('purchases'),getAll('payments')]);
    if(suppCache.length===0){list.innerHTML='<div class="empty"><div class="ic">👥</div><h3>لا يوجد موردون</h3></div>';return;}
    list.innerHTML=suppCache.map(s=>{
      const debt=Math.max(0,allPur.filter(p=>p.supplierId===s.id).reduce((a,p)=>a+(p.debtAmount||0),0)-allPay.filter(p=>p.supplierId===s.id).reduce((a,p)=>a+(p.amount||0),0));
      const tPur=allPur.filter(p=>p.supplierId===s.id).reduce((a,p)=>a+(p.total||0),0);
      return `<div class="supplier-card"><div class="df ac g12"><div class="s-avatar">${(s.name||'?').charAt(0)}</div><div style="flex:1;">
        <div class="fw8" style="font-size:16px;">${s.name}</div>
        ${s.phone?`<div class="tm fs13"><a href="tel:${s.phone}" style="color:var(--accent);">📞 ${s.phone}</a></div>`:''}
        <div class="df g12" style="margin-top:7px;flex-wrap:wrap;"><div><div class="stat-lbl">المشتريات</div><div class="fw8">${fmt(tPur)}</div></div><div><div class="stat-lbl">الدين</div><div class="fw8" style="color:${debt>0?'var(--danger)':'var(--success)'};">${fmt(debt)}</div></div></div>
      </div></div>
      <div class="df g8" style="margin-top:11px;flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="viewSupplier('${s.id}')">👁️ تفاصيل</button>
        <button class="btn btn-primary btn-sm" onclick="editSupplier('${s.id}','${esc(s.name)}','${esc(s.phone||'')}','${esc(s.notes||'')}')">✏️ تعديل</button>
        <button class="btn btn-danger btn-sm" onclick="delSupplier('${s.id}')">🗑️ حذف</button>
        ${debt>0?`<button class="btn btn-success btn-sm" onclick="openPayM('${s.id}','${esc(s.name)}',${debt})">💳 دفعة</button>`:''}
      </div></div>`;
    }).join('');
  }catch(e){console.error(e);}
}
function esc(s){return String(s).replace(/'/g,"\\'").replace(/"/g,'&quot;');}
async function submitSupplier(){
  const name=gv('sup-name').trim(),phone=gv('sup-phone').trim(),notes=gv('sup-notes').trim();
  if(!name){toast('أدخل الاسم','error');return;}
  try{await db.collection('suppliers').add({name,phone,notes,createdAt:firebase.firestore.Timestamp.now()});closeM('m-add-sup');toast('تم إضافة المورد ✅','success');['sup-name','sup-phone','sup-notes'].forEach(id=>sv(id,''));loadSuppliers();}catch(e){toast('خطأ','error');}
}
function editSupplier(id,name,phone,notes){sv('edit-sup-id',id);sv('edit-sup-name',name);sv('edit-sup-phone',phone);sv('edit-sup-notes',notes);openM('m-edit-sup');}
async function updateSupplier(){const id=gv('edit-sup-id'),name=gv('edit-sup-name').trim(),phone=gv('edit-sup-phone').trim(),notes=gv('edit-sup-notes').trim();if(!name){toast('أدخل الاسم','error');return;}try{await db.collection('suppliers').doc(id).update({name,phone,notes});closeM('m-edit-sup');toast('تم التحديث ✅','success');loadSuppliers();}catch(e){toast('خطأ','error');}}
async function delSupplier(id){if(!confirm('حذف؟'))return;await delFB('suppliers',id);toast('تم الحذف','warning');loadSuppliers();}

async function viewSupplier(id){
  const sup=suppCache.find(s=>s.id===id);if(!sup)return;
  q('sup-detail-title').textContent='📋 '+sup.name;
  const body=q('sup-detail-body');
  body.innerHTML='<div style="text-align:center;padding:30px;"><div class="spinner" style="margin:auto;border:3px solid rgba(0,0,0,.1);border-top-color:var(--primary);width:30px;height:30px;border-radius:50%;animation:spin .8s linear infinite;"></div></div>';
  openM('m-sup-detail');
  try{
    const[purs,pays]=await Promise.all([
      db.collection('purchases').where('supplierId','==',id).get().then(s=>s.docs.map(d=>({id:d.id,...d.data()}))),
      db.collection('payments').where('supplierId','==',id).get().then(s=>s.docs.map(d=>({id:d.id,...d.data()}))),
    ]);
    const tPur=purs.reduce((s,p)=>s+(p.total||0),0),tDebt=purs.reduce((s,p)=>s+(p.debtAmount||0),0),tPaid=pays.reduce((s,p)=>s+(p.amount||0),0);
    const curD=Math.max(0,tDebt-tPaid);
    body.innerHTML=`<div class="stats-grid" style="margin-bottom:14px;">
      <div class="stat-card b"><div class="stat-lbl">إجمالي الشراء</div><div class="stat-val">${fmt(tPur)}</div></div>
      <div class="stat-card g"><div class="stat-lbl">المدفوع</div><div class="stat-val g">${fmt(tPaid)}</div></div>
      <div class="stat-card r"><div class="stat-lbl">الدين</div><div class="stat-val r">${fmt(curD)}</div></div>
    </div>
    ${curD>0?`<button class="btn btn-success btn-block" style="margin-bottom:14px;" onclick="closeM('m-sup-detail');openPayM('${id}','${esc(sup.name)}',${curD})">💳 تسجيل دفعة</button>`:''}
    <div class="sec-title">سجل الشراء</div>
    <div class="tbl-wrap"><table><thead><tr><th>التاريخ</th><th>النوع</th><th>العدد</th><th>الوزن</th><th>الإجمالي</th><th>الدين</th></tr></thead><tbody>
      ${purs.sort((a,b)=>(b.date?.seconds||0)-(a.date?.seconds||0)).map(p=>`<tr><td>${fmtD(p.date)}</td><td><span class="badge bi">${p.fishType}</span></td><td>${p.fishCount||'-'}</td><td>${fmtN(p.weight)} كغم</td><td>${fmt(p.total)}</td><td class="tr">${fmt(p.debtAmount)}</td></tr>`).join('')||'<tr><td colspan="6" class="tm" style="text-align:center;padding:12px;">لا توجد</td></tr>'}
    </tbody></table></div>
    <div class="sec-title" style="margin-top:14px;">سجل المدفوعات</div>
    <div class="tbl-wrap"><table><thead><tr><th>التاريخ</th><th>المبلغ</th><th>ملاحظات</th></tr></thead><tbody>
      ${pays.sort((a,b)=>(b.date?.seconds||0)-(a.date?.seconds||0)).map(p=>`<tr><td>${fmtD(p.date)}</td><td class="fw8 tg">${fmt(p.amount)}</td><td class="tm fs13">${p.notes||'-'}</td></tr>`).join('')||'<tr><td colspan="3" class="tm" style="text-align:center;padding:12px;">لا توجد</td></tr>'}
    </tbody></table></div>`;
  }catch(e){body.innerHTML='<p class="tr">'+e.message+'</p>';}
}

/* ===================== DEBTS (SEPARATED) ===================== */
async function loadDebts(){
  try{
    const[sups,allPur,allPay,allSales,allCPay]=await Promise.all([getAll('suppliers'),getAll('purchases'),getAll('payments'),getAll('sales'),getAll('customerPayments')]);

    // SUPPLIER debts
    let totalSupDebt=0;
    const supCards=sups.map(s=>{
      const tD=Math.max(0,allPur.filter(p=>p.supplierId===s.id).reduce((a,p)=>a+(p.debtAmount||0),0)-allPay.filter(p=>p.supplierId===s.id).reduce((a,p)=>a+(p.amount||0),0));
      const tTotal=allPur.filter(p=>p.supplierId===s.id).reduce((a,p)=>a+(p.debtAmount||0),0);
      const tPaid=allPay.filter(p=>p.supplierId===s.id).reduce((a,p)=>a+(p.amount||0),0);
      const pct=tTotal>0?Math.round((tPaid/tTotal)*100):0;
      totalSupDebt+=tD; return{s,tD,tTotal,tPaid,pct};
    }).filter(x=>x.tD>0);

    q('total-sup-debt').textContent=fmt(totalSupDebt);
    q('debts-sup-list').innerHTML=supCards.length===0
      ?'<div class="empty" style="padding:18px;"><div class="ic">✅</div><p>لا توجد ديون للموردين</p></div>'
      :supCards.map(({s,tD,tTotal,tPaid,pct})=>`<div class="debt-card"><div class="df jb ac"><div class="fw8" style="font-size:16px;">👤 ${s.name}</div><button class="btn btn-success btn-sm" onclick="openPayM('${s.id}','${esc(s.name)}',${tD})">💳 دفع</button></div><div class="stat-val r" style="margin:6px 0;">${fmt(tD)}</div><div class="prog-bar"><div class="prog-fill" style="width:${pct}%;"></div></div><div class="df jb fs13 tm"><span>المدفوع: ${fmt(tPaid)}</span><span>الإجمالي: ${fmt(tTotal)}</span></div></div>`).join('');

    // CUSTOMER debts
    let totalCustDebt=0;
    const custD={};
    allSales.filter(s=>s.payType==='debt'&&s.customerName).forEach(s=>{if(!custD[s.customerName])custD[s.customerName]={total:0,paid:0};custD[s.customerName].total+=(s.debtAmount||s.total||0);});
    allCPay.forEach(p=>{if(custD[p.customerName])custD[p.customerName].paid+=(p.amount||0);});
    const custCards=Object.entries(custD).map(([name,d])=>{const debt=Math.max(0,d.total-d.paid);const pct=d.total>0?Math.round((d.paid/d.total)*100):0;totalCustDebt+=debt;return{name,debt,total:d.total,paid:d.paid,pct};}).filter(x=>x.debt>0);

    q('total-cust-debt').textContent=fmt(totalCustDebt);
    q('debts-cust-list').innerHTML=custCards.length===0
      ?'<div class="empty" style="padding:18px;"><div class="ic">✅</div><p>لا توجد ديون على الزبائن</p></div>'
      :custCards.map(({name,debt,total,paid,pct})=>`<div class="debt-card cust"><div class="df jb ac"><div class="fw8" style="font-size:16px;">🙍 ${name}</div><button class="btn btn-success btn-sm" onclick="openCustPayM('${esc(name)}',${debt})">💳 دفع</button></div><div class="stat-val" style="color:var(--warning);margin:6px 0;">${fmt(debt)}</div><div class="prog-bar"><div class="prog-fill" style="width:${pct}%;"></div></div><div class="df jb fs13 tm"><span>المدفوع: ${fmt(paid)}</span><span>الإجمالي: ${fmt(total)}</span></div></div>`).join('');

    // Recent payments
    const recent=[...allPay.map(p=>({...p,who:sups.find(s=>s.id===p.supplierId)?.name||'-',tp:'مورد'})),...allCPay.map(p=>({...p,who:p.customerName,tp:'زبون'}))].sort((a,b)=>(b.date?.seconds||0)-(a.date?.seconds||0)).slice(0,20);
    q('payments-body').innerHTML=recent.length===0?'<tr><td colspan="5"><div class="empty" style="padding:18px;"><p>لا توجد مدفوعات</p></div></td></tr>'
      :recent.map(p=>`<tr><td>${fmtD(p.date)}</td><td>${p.who} <span class="badge ${p.tp==='مورد'?'bi':'bw'}" style="font-size:11px;">${p.tp}</span></td><td class="fw8 tg">${fmt(p.amount)}</td><td class="tm fs13">${p.notes||'-'}</td><td><button class="btn btn-icon btn-danger btn-sm" onclick="delPayment('${p.id}','${p.tp==='زبون'?'customerPayments':'payments'}')">🗑️</button></td></tr>`).join('');
  }catch(e){console.error(e);}
}

function openPayM(supId,supName,curDebt){sv('pay-sup-id',supId);sv('pay-sup-name',supName);sv('pay-cur-debt',fmt(curDebt));sv('pay-amount','');sv('pay-date',todayStr());sv('pay-notes','');openM('m-add-pay');}
async function submitPayment(){const supId=gv('pay-sup-id'),amount=parseFloat(gv('pay-amount')),date=gv('pay-date'),notes=gv('pay-notes'),name=gv('pay-sup-name');if(!(amount>0)){toast('أدخل مبلغاً','error');return;}try{await addFB('payments',{supplierId:supId,supplierName:name,amount,date:tsFrom(date),notes});closeM('m-add-pay');toast('تم ✅','success');loadDebts();}catch(e){toast('خطأ','error');}}
function openCustPayM(name,curDebt){sv('cp-name-val',name);sv('cp-cust-name',name);sv('cp-cur-debt',fmt(curDebt));sv('cp-amount','');sv('cp-date',todayStr());sv('cp-notes','');openM('m-cust-pay');}
async function submitCustPayment(){const name=gv('cp-name-val'),amount=parseFloat(gv('cp-amount')),date=gv('cp-date'),notes=gv('cp-notes');if(!(amount>0)){toast('أدخل مبلغاً','error');return;}try{await addFB('customerPayments',{customerName:name,amount,date:tsFrom(date),notes});closeM('m-cust-pay');toast('تم ✅','success');loadDebts();}catch(e){toast('خطأ','error');}}
async function delPayment(id,col){if(!confirm('حذف؟'))return;await delFB(col||'payments',id);toast('تم الحذف','warning');loadDebts();}

/* ===================== INVENTORY ===================== */
async function fishInv(){const[p,s]=await Promise.all([getAll('purchases'),getAll('sales')]);const inv={};FISH_TYPES.forEach(t=>inv[t]=0);p.forEach(x=>{if(x.fishType&&inv[x.fishType]!==undefined)inv[x.fishType]+=(x.weight||0);});s.forEach(x=>{if(x.fishType&&inv[x.fishType]!==undefined)inv[x.fishType]-=(x.weight||0);});return inv;}

async function loadInventory(){
  try{
    const[allPur,allSal,allExp]=await Promise.all([getAll('purchases'),getAll('sales'),getAll('expenses')]);
    q('fish-inv-body').innerHTML=FISH_TYPES.map(t=>{
      const inKg=allPur.filter(p=>p.fishType===t).reduce((s,p)=>s+(p.weight||0),0);
      const outKg=allSal.filter(s=>s.fishType===t).reduce((s,x)=>s+(x.weight||0),0);
      const rem=Math.max(0,inKg-outKg);
      let badge='<span class="badge bg-b">لا يوجد</span>';
      if(inKg>0){if(rem===0)badge='<span class="badge bd">نفذ</span>';else if(rem<5)badge='<span class="badge bw">منخفض</span>';else badge='<span class="badge bs">جيد</span>';}
      return `<tr><td class="fw8">${t}</td><td>${fmtN(inKg)} كغم</td><td>${fmtN(outKg)} كغم</td><td class="fw8">${fmtN(rem)} كغم</td><td>${badge}</td></tr>`;
    }).join('');
    const chBought=allExp.filter(e=>e.type==='فحم').reduce((s,e)=>s+(e.qty||0),0);
    const chUsed=allExp.filter(e=>(e.type||'').includes('فحم')&&e.autoFromSale).length;
    const bgBought=allExp.filter(e=>e.type==='أكياس').reduce((s,e)=>s+(e.qty||0),0);
    const bgUsed=allExp.filter(e=>(e.type||'').includes('أكياس')&&e.autoFromSale).length;
    q('mat-inv-body').innerHTML=`<tr><td class="fw8">🔥 فحم (أكياس)</td><td>${fmtN(chBought)} كيس</td><td>${fmtN(chUsed)} (بيعات)</td><td class="fw8">${fmtN(Math.max(0,chBought-chUsed))} كيس</td></tr>
      <tr><td class="fw8">🛍️ أكياس</td><td>${fmtN(bgBought)} رزمة</td><td>${fmtN(bgUsed)} (بيعات)</td><td class="fw8">${fmtN(Math.max(0,bgBought-bgUsed))} رزمة</td></tr>`;
  }catch(e){console.error(e);}
}

/* ===================== REPORTS ===================== */
async function loadReports(){
  renderTabs('reports-tabs',rPeriod,function(p){rPeriod=p;loadReports();});
  const{start,end}=periodDates(rPeriod);
  try{
    const[sales,purs,exps]=await Promise.all([getAll('sales').then(a=>a.filter(d=>inP(d.date,start,end))),getAll('purchases').then(a=>a.filter(d=>inP(d.date,start,end))),getAll('expenses').then(a=>a.filter(d=>inP(d.date,start,end)))]);
    const tS=sales.reduce((s,x)=>s+(x.total||0),0),tP=purs.reduce((s,x)=>s+(x.total||0),0),tE=exps.reduce((s,x)=>s+(x.amount||0),0),pr=tS-tP-tE;
    q('reports-stats').innerHTML=`
      <div class="stat-card g"><div class="stat-lbl">المبيعات</div><div class="stat-val g">${fmt(tS)}</div></div>
      <div class="stat-card n"><div class="stat-lbl">المشتريات</div><div class="stat-val">${fmt(tP)}</div></div>
      <div class="stat-card r"><div class="stat-lbl">المصاريف</div><div class="stat-val r">${fmt(tE)}</div></div>
      <div class="stat-card ${pr>=0?'g':'r'}"><div class="stat-lbl">صافي الربح</div><div class="stat-val ${pr>=0?'g':'r'}">${fmt(pr)}</div></div>`;
    const canvas=q('reports-chart');if(rChart){rChart.destroy();rChart=null;}
    const[allS,allE]=await Promise.all([getAll('sales'),getAll('expenses')]);
    const dL=[],dS=[],dE=[];
    for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=dayS(d),de=dayE(d);dL.push(d.toLocaleDateString('ar-IQ',{weekday:'short',day:'numeric'}));dS.push(allS.filter(x=>inP(x.date,ds,de)).reduce((s,x)=>s+(x.total||0),0));dE.push(allE.filter(x=>inP(x.date,ds,de)).reduce((s,x)=>s+(x.amount||0),0));}
    rChart=new Chart(canvas,{type:'bar',data:{labels:dL,datasets:[{label:'المبيعات',data:dS,backgroundColor:'rgba(22,163,74,.7)',borderRadius:5},{label:'المصاريف',data:dE,backgroundColor:'rgba(220,38,38,.7)',borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{family:'Cairo'}}}},scales:{x:{ticks:{font:{family:'Cairo'}}},y:{ticks:{font:{family:'Cairo'}}}}}});
  }catch(e){console.error(e);}
}
async function exportExcel(){const{start,end}=periodDates(rPeriod);const[s,p,e]=await Promise.all([getAll('sales').then(a=>a.filter(d=>inP(d.date,start,end))),getAll('purchases').then(a=>a.filter(d=>inP(d.date,start,end))),getAll('expenses').then(a=>a.filter(d=>inP(d.date,start,end)))]);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(s.map(x=>({'التاريخ':fmtD(x.date),'الزبون':x.customerName,'النوع':x.fishType,'الوزن':x.weight,'سعر/كغ':x.pricePerKg,'الإجمالي':x.total,'الدفع':x.payType==='debt'?'دين':'نقد'}))),'المبيعات');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(p.map(x=>({'التاريخ':fmtD(x.date),'المورد':x.supplierName,'النوع':x.fishType,'العدد':x.fishCount,'الوزن':x.weight,'الإجمالي':x.total,'الدين':x.debtAmount}))),'المشتريات');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(e.map(x=>({'التاريخ':fmtD(x.date),'النوع':x.type,'الكمية':x.qty,'المبلغ':x.amount}))),'المصاريف');XLSX.writeFile(wb,'الخزرجي-تقرير.xlsx');toast('تم ✅','success');}
async function exportPDF(){const{start,end}=periodDates(rPeriod);const[s,p,e]=await Promise.all([getAll('sales').then(a=>a.filter(d=>inP(d.date,start,end))),getAll('purchases').then(a=>a.filter(d=>inP(d.date,start,end))),getAll('expenses').then(a=>a.filter(d=>inP(d.date,start,end)))]);const{jsPDF}=window.jspdf;const doc=new jsPDF();doc.setFontSize(16);doc.text('Al-Khazraji Report',105,18,{align:'center'});const tS=s.reduce((a,x)=>a+(x.total||0),0),tP=p.reduce((a,x)=>a+(x.total||0),0),tE=e.reduce((a,x)=>a+(x.amount||0),0);doc.autoTable({startY:30,head:[['Item','Value']],body:[['Sales',fmt(tS)],['Purchases',fmt(tP)],['Expenses',fmt(tE)],['Profit',fmt(tS-tP-tE)]]});doc.save('khazraji-report.pdf');toast('تم ✅','success');}

/* ===================== SETTINGS ===================== */
async function loadSettings(){
  try{const doc=await db.collection('settings').doc('main').get();if(doc.exists){const d=doc.data();APP={...APP,...d};sv('s-shop-name',d.shopName||'الخزرجي');sv('s-exp-bags',d.expBags??500);sv('s-exp-charcoal',d.expCharcoal??1000);sv('s-exp-other',d.expOther??0);sv('s-profit-shaboot',d.profitShaboot??5000);sv('s-profit-buni',d.profitBuni??5000);}}catch(e){console.error(e);}
}
async function saveSettings(){
  const data={shopName:gv('s-shop-name').trim()||'الخزرجي',expBags:parseFloat(gv('s-exp-bags'))||0,expCharcoal:parseFloat(gv('s-exp-charcoal'))||0,expOther:parseFloat(gv('s-exp-other'))||0,profitShaboot:parseFloat(gv('s-profit-shaboot'))||0,profitBuni:parseFloat(gv('s-profit-buni'))||0};
  try{await db.collection('settings').doc('main').set(data);APP={...APP,...data};toast('تم حفظ الإعدادات ✅','success');}catch(e){toast('خطأ','error');}
}
function confirmReset(){sv('reset-word','');openM('m-confirm-reset');}
async function doReset(){if(gv('reset-word').trim()!=='تأكيد'){toast('اكتب كلمة تأكيد','error');return;}closeM('m-confirm-reset');toast('جاري الحذف...','warning');for(const col of['sales','purchases','expenses','payments','customerPayments']){const snap=await db.collection(col).get();if(!snap.empty){const batch=db.batch();snap.docs.forEach(d=>batch.delete(d.ref));await batch.commit();}}toast('تم حذف كل البيانات ✅','success');loadDash();}

/* ===================== CALCULATOR ===================== */
function ca(key){const disp=q('calc-disp');if(key==='C'){calcStr='0';}else if(key==='DEL'){calcStr=calcStr.length>1?calcStr.slice(0,-1):'0';}else if(key==='='){try{const r=Function('"use strict";return('+calcStr+')')();calcStr=isFinite(r)?String(+r.toFixed(8)):'خطأ';}catch(e){calcStr='خطأ';}}else{calcStr=(calcStr==='0'&&key!=='.')?key:calcStr+key;}disp.textContent=calcStr;}

/* ===================== PWA INSTALL ===================== */
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
function installPWA(){if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(r=>{if(r.outcome==='accepted')toast('تم تثبيت التطبيق ✅','success');deferredPrompt=null;});}else{toast('افتح الموقع من Safari ثم اختر "إضافة للشاشة الرئيسية"','info');}}

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded',()=>{
  firebase.initializeApp(FIREBASE_CONFIG);
  db=firebase.firestore();auth=firebase.auth();
  db.enablePersistence({synchronizeTabs:true}).catch(()=>{});
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('SW:',e));
  document.querySelectorAll('.m-overlay').forEach(o=>{o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('on');});});
  auth.onAuthStateChanged(user=>{
    q('loading-screen').style.display='none';
    if(user){q('auth-screen').classList.remove('on');q('app').classList.add('on');q('bottom-nav').style.display='';loadSettings().then(()=>{buildNav();goto('dashboard');});}
    else{q('auth-screen').classList.add('on');q('app').classList.remove('on');}
  });
});
