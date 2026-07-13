const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/hp/Downloads/alkhazraji/pristine_files/';
const destDir = 'c:/Users/hp/Downloads/alkhazraji/';

const FFFD = '\uFFFD';
const corruptF = FFFD + '?';

function fixCorruption(txt) {
  if (!txt) return txt;
  let fixed = txt.replace(new RegExp(FFFD + '\\?\\? ', 'g'), '🐟 ');
  fixed = fixed.replace(new RegExp(FFFD + '\\? أكياس', 'g'), '📦 أكياس');
  fixed = fixed.replace(new RegExp('<div class="auth-logo-icon">' + FFFD + '\\?' + FFFD + '</div>', 'g'), '<div class="auth-logo-icon">🐟</div>');
  fixed = fixed.replace(new RegExp('<span class="loading-emoji">' + FFFD + '\\?' + FFFD + '</span>', 'g'), '<span class="loading-emoji">🐟</span>');
  fixed = fixed.replace(new RegExp('<span class="sidebar-logo-icon">' + FFFD + '\\?' + FFFD + '</span>', 'g'), '<span class="sidebar-logo-icon">🐟</span>');
  fixed = fixed.replace(new RegExp(corruptF, 'g'), 'ف');
  return fixed;
}

// 1. Restore pristine files
['index.html', 'main.css', 'components.css', 'dashboard.js', 'sales.js', 'purchases.js', 'debts.js', 'suppliers.js', 'expenses.js', 'settings.js', 'inventory.js', 'reports.js', 'utils.js', 'db.js', 'app.js', 'sw.js'].forEach(f => {
    let src = srcDir + f;
    if (!fs.existsSync(src)) src = destDir + (f.endsWith('.js') && f !== 'sw.js' ? 'js/' : (f.endsWith('.css') ? 'css/' : '')) + f; // Fallback to current if not in pristine
    
    if (fs.existsSync(src)) {
        let dest = destDir + (f.endsWith('.js') && f !== 'sw.js' ? 'js/' : (f.endsWith('.css') ? 'css/' : '')) + f;
        fs.copyFileSync(src, dest);
    }
});

// 2. Replay edits
const edits = JSON.parse(fs.readFileSync(destDir + 'edits.json', 'utf8'));

let success = 0;
let fail = 0;

edits.forEach((edit, idx) => {
    if (!fs.existsSync(edit.file)) return;
    let content = fs.readFileSync(edit.file, 'utf8');
    
    let chunkSuccess = true;
    edit.chunks.forEach(chunk => {
        let target = chunk.TargetContent;
        let replace = chunk.ReplacementContent;
        
        // Sometimes target itself has corruption if the previous agent copied it!
        // We do NOT fix corruption in TargetContent because we want it to match what's in the file at that point in time.
        // But wait! The file at that point might NOT have corruption yet!
        // Actually, if it's an exact string match, we just replace it.
        
        replace = fixCorruption(replace);
        
        if (content.includes(target)) {
            content = content.replace(target, replace);
        } else {
            // Try standardizing newlines
            let t2 = target.replace(/\r\n/g, '\n');
            let c2 = content.replace(/\r\n/g, '\n');
            if (c2.includes(t2)) {
                content = c2.replace(t2, replace.replace(/\r\n/g, '\n'));
            } else {
                chunkSuccess = false;
                console.log('Failed to match chunk in', edit.file, 'at edit', idx);
            }
        }
    });
    
    if (chunkSuccess) {
        fs.writeFileSync(edit.file, content, 'utf8');
        success++;
    } else {
        fail++;
    }
});

console.log('Replayed', success, 'edits successfully, failed', fail);
