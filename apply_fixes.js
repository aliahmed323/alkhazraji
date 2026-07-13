const fs = require('fs');

// 1. db.js: Add safeGet and wrap get()
let dbStr = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/js/db.js', 'utf8');
const safeGetCode = `
/**
 * Execute a query with a timeout. If it hangs, fallback to cache.
 */
async function safeGet(query) {
  try {
    const res = await Promise.race([
      query.get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
    ]);
    return res;
  } catch (err) {
    if (err.message === 'timeout' || err.code === 'unavailable') {
      console.warn('[db.js] Network timeout/unavailable, falling back to cache for query');
      try {
        return await query.get({ source: 'cache' });
      } catch (cacheErr) {
        throw cacheErr;
      }
    }
    throw err;
  }
}
`;
if (!dbStr.includes('async function safeGet')) {
    dbStr = dbStr.replace("window.DB = {", safeGetCode + "\nwindow.DB = {");
    dbStr = dbStr.replace(/await query\.get\(\)/g, "await safeGet(query)");
    dbStr = dbStr.replace(/await window\.db\.collection\(([^)]+)\)\.get\(\)/g, "await safeGet(window.db.collection($1))");
    dbStr = dbStr.replace(/await ref\.get\(\)/g, "await safeGet(ref)");
    // The exact query.get might be used directly in getPurchases etc.
    fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/js/db.js', dbStr, 'utf8');
}

// 2. index.html: Add calculator, profits.js, and floating fish
let idxStr = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', 'utf8');
if (!idxStr.includes('js/profits.js')) {
    idxStr = idxStr.replace('<script src="js/dashboard.js"></script>', '<script src="js/profits.js"></script>\n  <script src="js/dashboard.js"></script>');
}
if (!idxStr.includes('window.showCalculator()')) {
    idxStr = idxStr.replace('<div class="top-bar-right">', '<div class="top-bar-right">\n        <button onclick="window.showCalculator()" style="background:rgba(255,255,255,0.15);border:none;border-radius:12px;padding:8px;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;margin-left:10px;"><i data-lucide="calculator"></i></button>');
}
idxStr = idxStr.replace('<span class="loading-emoji">🐟</span>', '<span class="loading-emoji floating-fish">🐟</span>');
idxStr = idxStr.replace('<title>سمكنا - نظام إدارة مطعم</title>', '<title>الخزرجي - نظام إدارة مطعم</title>');
fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', idxStr, 'utf8');

// 3. main.css: Add floating fish animation
let cssStr = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/css/main.css', 'utf8');
if (!cssStr.includes('floating-fish')) {
    cssStr += `\n
@keyframes floatFish {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}
.floating-fish {
  display: inline-block;
  animation: floatFish 3s ease-in-out infinite;
}
`;
    fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/css/main.css', cssStr, 'utf8');
}

// 4. dashboard.js: Delegate to profits.js
let dashStr = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/js/dashboard.js', 'utf8');
if (!dashStr.includes('window.ProfitsPage.init()')) {
    dashStr = dashStr.replace(/async function init\(\) \{[\s\S]*?async function refresh\(\)/, `async function init() {
    if (window.ProfitsPage) {
      await window.ProfitsPage.init();
    }
  }

  async function refresh()`);
    fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/js/dashboard.js', dashStr, 'utf8');
}

// 5. utils.js: Add showCalculator() global function
let utilStr = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/js/utils.js', 'utf8');
if (!utilStr.includes('window.showCalculator')) {
    utilStr += `\n
window.showCalculator = function() {
  if (document.getElementById('calc-widget')) {
    document.getElementById('calc-widget').remove();
    return;
  }
  const div = document.createElement('div');
  div.id = 'calc-widget';
  div.innerHTML = \`<div style="position:fixed;bottom:90px;left:20px;z-index:9999;background:var(--card);box-shadow:var(--shadow-lg);border-radius:16px;padding:16px;width:260px;border:1px solid var(--border);">
    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
      <h4 style="margin:0;">الحاسبة</h4>
      <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:var(--danger);"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
    </div>
    <input type="text" id="calc-display" readonly style="width:100%;height:40px;text-align:left;direction:ltr;margin-bottom:10px;border:1px solid var(--border);border-radius:8px;padding:8px;font-size:18px;">
    <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;direction:ltr;">
      \${['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => 
        \`<button onclick="window.calcPress('\${btn}')" style="padding:10px;border:none;border-radius:8px;background:\${['/','*','-','+','='].includes(btn)?'var(--primary-light)':'var(--bg)'};font-weight:bold;">\${btn}</button>\`
      ).join('')}
    </div>
  </div>\`;
  document.body.appendChild(div);
  if(window.lucide) window.lucide.createIcons();
};
window.calcPress = function(val) {
  const display = document.getElementById('calc-display');
  if(!display) return;
  if(val === 'C') { display.value = ''; }
  else if(val === '=') { 
    try { display.value = eval(display.value); } catch(e) { display.value = 'Error'; } 
  }
  else { display.value += val; }
};
`;
    fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/js/utils.js', utilStr, 'utf8');
}

console.log('Fixes applied successfully!');
