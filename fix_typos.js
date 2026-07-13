const fs = require('fs');

function fixFile(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/ح\?ظ/g, 'حفظ');
    content = content.replace(/إضا\?ية/g, 'إضافية');
    content = content.replace(/مشهو\?/g, 'مشهوف');
    content = content.replace(/المصاري\?/g, 'المصاريف');
    content = content.replace(/المصاري\?/g, 'المصاريف');
    
    // Also fix standard ? marks if they are exactly matching the words
    content = content.replace(/ح\?ظ البيع/g, 'حفظ البيع');
    content = content.replace(/إضا\?ية/g, 'إضافية');
    content = content.replace(/مشهو\?/g, 'مشهوف');
    
    fs.writeFileSync(path, content, 'utf8');
}

['js/sales.js', 'js/app.js', 'index.html', 'js/expenses.js', 'js/dashboard.js'].forEach(p => fixFile('c:/Users/hp/Downloads/alkhazraji/' + p));
