const fs = require('fs');
const glob = require('fs').readdirSync;

const files = [
  'c:/Users/hp/Downloads/alkhazraji/index.html',
  'c:/Users/hp/Downloads/alkhazraji/js/debts.js',
  'c:/Users/hp/Downloads/alkhazraji/js/suppliers.js',
  'c:/Users/hp/Downloads/alkhazraji/js/expenses.js',
  'c:/Users/hp/Downloads/alkhazraji/js/purchases.js',
  'c:/Users/hp/Downloads/alkhazraji/js/sales.js',
  'c:/Users/hp/Downloads/alkhazraji/js/settings.js'
];

// \uFFFD is the replacement character ''
const FFFD = '\uFFFD';
const corruptF = FFFD + '?'; // "?"

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let txt = fs.readFileSync(f, 'utf8');

  // Fix specific Emojis first
  txt = txt.replace(new RegExp(FFFD + '\\?\\?' + ' ', 'g'), '🐟 '); // "? " -> "🐟 "
  txt = txt.replace(new RegExp(FFFD + '\\?' + ' أكياس', 'g'), '📦 أكياس'); // "? أكياس" -> "📦 أكياس"
  
  // Fix the fish logo in login screen (has no space)
  txt = txt.replace('<div class="auth-logo-icon">' + FFFD + '?' + FFFD + '</div>', '<div class="auth-logo-icon">🐟</div>');
  txt = txt.replace('<span class="loading-emoji">' + FFFD + '?' + FFFD + '</span>', '<span class="loading-emoji">🐟</span>');
  txt = txt.replace('<span class="sidebar-logo-icon">' + FFFD + '?' + FFFD + '</span>', '<span class="sidebar-logo-icon">🐟</span>');

  // Fix the word "ف" which became "?"
  txt = txt.replace(new RegExp(corruptF, 'g'), 'ف');

  // Also in some places it might be just FFFD without '?'. Let's check:
  // js/expenses.js:133: : '';
  // This was supposed to be '—' (em dash) or similar, but wait, '—' or 'لا توجد دفعات'
  // I will leave '' alone if it's isolated, or replace it with '—'
  txt = txt.replace(/: ''/g, ": '—'");

  fs.writeFileSync(f, txt, 'utf8');
  console.log('Fixed', f);
});
