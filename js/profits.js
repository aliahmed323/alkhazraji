/**
 * profits.js - Profits Page Module for الخزرجي
 */
(function () {
  'use strict';

  let currentFilter = 'today';

  /* ─────────────────────────────────────────────────
     DATE RANGE HELPER
  ───────────────────────────────────────────────── */
  function getDateRange(filter) {
    const now  = new Date();
    const today = window.getToday ? window.getToday() : now.toISOString().slice(0, 10);
    let start, end;

    switch (filter) {
      case 'today':
        start = new Date(today + 'T00:00:00');
        end   = new Date(today + 'T23:59:59');
        break;
      case 'week':
        start = window.startOfWeek ? window.startOfWeek() : (() => {
          const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d;
        })();
        end = new Date(now); end.setHours(23,59,59,999);
        break;
      case 'month':
        start = window.startOfMonth ? window.startOfMonth() : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        end   = new Date(now); end.setHours(23, 59, 59, 999);
        break;
      case 'all':
        start = new Date(2000, 0, 1);
        end   = new Date(2100, 0, 1);
        break;
      default:
        start = new Date(today + 'T00:00:00');
        end   = new Date(today + 'T23:59:59');
    }
    return { start, end };
  }

  /* ─────────────────────────────────────────────────
     NORMALIZE DATE (handles Firestore Timestamp, JS Date, string)
  ───────────────────────────────────────────────── */
  function toMs(val) {
    if (!val) return 0;
    if (typeof val.toDate === 'function') return val.toDate().getTime();
    if (typeof val.toMillis === 'function') return val.toMillis();
    if (val instanceof Date) return val.getTime();
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }

  /* ─────────────────────────────────────────────────
     LOAD DATA + RENDER
  ───────────────────────────────────────────────── */
  async function loadAndRender() {
    const container = document.getElementById('profits-content');
    if (!container) return;

    // SWR: Try cache first
    let allSales = [], allPurchases = [], allExpenses = [];
    let isDataLoaded = false;
    let debtSummary = [];

    try {
      const cached = localStorage.getItem('samakna_dash_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        allSales = parsed.sales || [];
        allPurchases = parsed.purchases || [];
        allExpenses = parsed.expenses || [];
        const debt = parsed.debt || 0;
        debtSummary = [{ currentDebt: debt }];
        isDataLoaded = true;
      }
    } catch(e){}

    const doRender = () => {
      const { start, end } = getDateRange(currentFilter);
      const startMs = start.getTime();
      const endMs   = end.getTime();

      function inRange(item) {
        const ms = toMs(item.date) || toMs(item.createdAt);
        return ms >= startMs && ms <= endMs;
      }

      const sales     = allSales.filter(inRange);
      const purchases = allPurchases.filter(inRange);
      const expenses  = allExpenses.filter(inRange);

      let totalSales = 0, totalCost = 0, totalExpenses = 0;
      sales.forEach(s => {
        totalSales += (s.total || 0);
        totalCost  += (s.cost  || 0);
      });
      purchases.forEach(p => { /* purchases don't reduce profit directly */ });
      expenses.forEach(e => { totalExpenses += (e.amount || 0); });

      const grossProfit = totalSales - totalCost;
      const netProfit   = grossProfit - totalExpenses;

      let totalDebt = 0;
      debtSummary.forEach(s => { totalDebt += (s.currentDebt || 0); });

      const filterLabels = { today: 'اليوم', week: 'هذا الأسبوع', month: 'هذا الشهر', all: 'كل الوقت' };

      container.innerHTML = `
        <!-- Filter Tabs -->
        <div style="display:flex;gap:6px;background:var(--card);padding:6px;border-radius:12px;box-shadow:var(--shadow);margin-bottom:20px;">
          ${Object.entries(filterLabels).map(([key, label]) => `
            <button id="prf-tab-${key}"
              onclick="window.ProfitsPage.setFilter('${key}')"
              style="
                flex:1;border:none;border-radius:8px;padding:10px 4px;
                font-family:Cairo,sans-serif;font-size:13px;font-weight:700;cursor:pointer;
                transition:all 0.2s;
                background:${currentFilter === key ? 'var(--primary)' : 'transparent'};
                color:${currentFilter === key ? '#fff' : 'var(--text-medium)'};
              ">${label}</button>
          `).join('')}
        </div>

        <!-- Main Profit Card -->
        <div style="
          background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 100%);
          border-radius:16px;padding:24px;color:#fff;text-align:center;
          box-shadow:0 8px 24px rgba(13,33,55,0.25);margin-bottom:20px;
        ">
          <p style="margin:0 0 6px;font-size:13px;opacity:0.85;">صافي الأرباح (${filterLabels[currentFilter]})</p>
          <div style="font-size:38px;font-weight:800;">${window.formatCurrency(netProfit)}</div>
          <p style="margin:8px 0 0;font-size:12px;opacity:0.7;">
            ${netProfit >= 0 ? 'ربح ممتاز' : 'خسارة في هذه الفترة'}
          </p>
        </div>

        <!-- Narrative Breakdown -->
        <div style="background:var(--card);border-radius:16px;padding:20px;box-shadow:var(--shadow);margin-bottom:16px;">
          <h3 style="font-size:14px;font-weight:700;color:var(--text-dark);margin:0 0 16px;border-bottom:1px solid var(--border);padding-bottom:10px;">
            <i data-lucide="bar-chart-2" style="width:15px;height:15px;vertical-align:middle;margin-left:6px;color:var(--accent);"></i>
            تفاصيل الفترة
          </h3>

          ${_row('trending-up','var(--success)','rgba(46,125,50,0.07)','إجمالي المبيعات', totalSales)}
          ${_row('minus-circle','var(--warning)','rgba(255,143,0,0.07)','كلفة البضاعة المباعة', totalCost)}

          <div style="height:1px;background:var(--border);margin:10px 0;"></div>
          ${_row('dollar-sign','#43A047','rgba(67,160,71,0.1)','الربح الإجمالي', grossProfit, true)}
          ${_row('receipt','var(--danger)','rgba(211,47,47,0.07)','المصاريف', totalExpenses)}

          <div style="height:1px;background:var(--border);margin:10px 0;"></div>
          <div style="
            display:flex;align-items:center;justify-content:space-between;
            padding:12px 14px;border-radius:12px;
            background:${netProfit >= 0 ? 'linear-gradient(135deg,#1B5E20,#2E7D32)' : 'linear-gradient(135deg,#B71C1C,#D32F2F)'};
            color:#fff;
          ">
            <span style="font-weight:700;font-size:15px;">
              <i data-lucide="${netProfit >= 0 ? 'trending-up' : 'trending-down'}" style="width:15px;height:15px;vertical-align:middle;margin-left:6px;"></i>
              صافي الربح
            </span>
            <span style="font-weight:800;font-size:18px;">${window.formatCurrency(netProfit)}</span>
          </div>

          ${totalDebt > 0 ? `
            <div style="margin-top:10px;">
              ${_row('alert-circle','var(--warning)','rgba(255,143,0,0.07)','الديون المطلوبة', totalDebt)}
              <div style="
                display:flex;align-items:center;justify-content:space-between;
                padding:12px 14px;border-radius:12px;margin-top:8px;
                background:linear-gradient(135deg,var(--primary),var(--primary-light));
                color:#fff;
              ">
                <span style="font-weight:700;font-size:15px;">صافي الربح بعد الديون</span>
                <span style="font-weight:800;font-size:18px;">${window.formatCurrency(netProfit - totalDebt)}</span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Stats Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:80px;">
          ${_statCard('المبيعات','trending-up','var(--success)', sales.length + ' عملية', totalSales)}
          ${_statCard('المصاريف','receipt','var(--danger)', expenses.length + ' سجل', totalExpenses)}
        </div>
      `;
      if (window.lucide) try { lucide.createIcons({ nodes: [container] }); } catch(e) {}
    };

    if (isDataLoaded) {
      doRender(); // Render instantly
    } else {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-light);">
          <i data-lucide="loader" style="width:32px;height:32px;"></i>
          <p style="margin-top:10px;font-size:13px;">جاري تحميل البيانات...</p>
        </div>`;
      if (window.lucide) try { lucide.createIcons({ nodes: [container] }); } catch(e) {}
    }

    try {
      // Fetch fresh data in background
      const [s, p, e, ds] = await Promise.all([
        window.DB.getSales(),
        window.DB.getPurchases(),
        window.DB.getExpenses(),
        window.DB.getSupplierDebtSummary ? window.DB.getSupplierDebtSummary() : Promise.resolve([])
      ]);
      allSales = s || [];
      allPurchases = p || [];
      allExpenses = e || [];
      debtSummary = ds || [];
      
      let td = 0;
      debtSummary.forEach(i => { td += (i.currentDebt || 0); });
      try {
        localStorage.setItem('samakna_dash_cache', JSON.stringify({
          sales: allSales, purchases: allPurchases, expenses: allExpenses, debt: td
        }));
      } catch(e){}

      doRender(); // Re-render with fresh data

    } catch (err) {
      console.error('[ProfitsPage] error:', err);
      if (container) container.innerHTML = '<p style="text-align:center;padding:32px;color:var(--danger);">حدث خطأ في تحميل البيانات</p>';
    }
  }

  function _row(icon, color, bg, label, amount, bold) {
    return `
      <div style="
        display:flex;align-items:center;justify-content:space-between;
        padding:9px 12px;border-radius:10px;margin-bottom:6px;
        background:${bg};
      ">
        <span style="color:var(--text-medium);font-size:14px;${bold ? 'font-weight:700;' : ''}">
          <i data-lucide="${icon}" style="width:14px;height:14px;vertical-align:middle;color:${color};margin-left:6px;"></i>
          ${label}
        </span>
        <span style="font-weight:${bold ? '800' : '700'};font-size:${bold ? '17px' : '15px'};color:${color};">
          ${window.formatCurrency(amount)}
        </span>
      </div>`;
  }

  function _statCard(title, icon, color, sub, amount) {
    return `
      <div style="
        background:var(--card);border-radius:14px;padding:16px;
        box-shadow:var(--shadow);border-top:3px solid ${color};
      ">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <i data-lucide="${icon}" style="width:16px;height:16px;color:${color};"></i>
          <span style="font-size:13px;font-weight:600;color:var(--text-medium);">${title}</span>
        </div>
        <div style="font-size:18px;font-weight:800;color:${color};">${window.formatCurrency(amount)}</div>
        <div style="font-size:11px;color:var(--text-light);margin-top:4px;">${sub}</div>
      </div>`;
  }

  /* ─────────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────────── */
  async function init() {
    const page = document.getElementById('page-profits');
    if (page && !document.getElementById('profits-content')) {
      page.innerHTML = `
        <div style="
          background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 100%);
          color:#fff;padding:24px 20px 16px;margin:-16px -16px 20px;
        ">
          <h1 style="font-size:20px;font-weight:800;margin:0;color:#fff;">
            <i data-lucide="pie-chart" style="width:20px;height:20px;vertical-align:middle;margin-left:8px;"></i>
            الأرباح والتحليل
          </h1>
        </div>
        <div id="profits-content"></div>
      `;
      if (window.lucide) try { lucide.createIcons({ nodes: [page] }); } catch(e) {}
    }
    currentFilter = 'today';
    await loadAndRender();
  }

  async function refresh() {
    await loadAndRender();
  }

  function setFilter(f) {
    currentFilter = f;
    loadAndRender();
  }

  window.ProfitsPage = { init, refresh, setFilter };

  console.log('[profits.js] ProfitsPage loaded');

})();
