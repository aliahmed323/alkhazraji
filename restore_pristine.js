const fs = require('fs');

// Read the pristine file
const files = [
  { src: 'pristine_files/index.html', dest: 'index.html' },
  { src: 'pristine_files/main.css', dest: 'css/main.css' },
  { src: 'pristine_files/components.css', dest: 'css/components.css' },
  { src: 'pristine_files/utils.js', dest: 'js/utils.js' },
  { src: 'pristine_files/db.js', dest: 'js/db.js' },
  { src: 'pristine_files/app.js', dest: 'js/app.js' },
  { src: 'pristine_files/dashboard.js', dest: 'js/dashboard.js' },
  { src: 'pristine_files/sales.js', dest: 'js/sales.js' },
  { src: 'pristine_files/purchases.js', dest: 'js/purchases.js' },
  { src: 'pristine_files/expenses.js', dest: 'js/expenses.js' },
  { src: 'pristine_files/suppliers.js', dest: 'js/suppliers.js' },
  { src: 'pristine_files/debts.js', dest: 'js/debts.js' },
  { src: 'pristine_files/inventory.js', dest: 'js/inventory.js' },
  { src: 'pristine_files/reports.js', dest: 'js/reports.js' },
  { src: 'pristine_files/settings.js', dest: 'js/settings.js' },
];

for (const f of files) {
  try {
    const raw = fs.readFileSync(f.src, 'utf8').trim();
    
    // Check if the file is stored as a JSON string (starts with ")
    let content;
    if (raw.startsWith('"')) {
      // It's a JSON-encoded string — decode it manually
      // Replace common escaped sequences
      content = raw
        .slice(1, raw.lastIndexOf('"')) // strip surrounding quotes
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\u003c/g, '<')
        .replace(/\\u003e/g, '>')
        .replace(/\\u0026/g, '&');
    } else {
      content = raw;
    }
    
    fs.writeFileSync(f.dest, content, 'utf8');
    console.log(`Restored: ${f.dest} (${content.length} chars)`);
  } catch (e) {
    console.error(`Failed: ${f.src} — ${e.message}`);
  }
}
