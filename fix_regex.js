const fs = require('fs');
const iconv = require('iconv-lite');

const files = ['js/purchases.js', 'js/sales.js', 'js/debts.js', 'js/expenses.js', 'js/settings.js', 'index.html'];

files.forEach(f => {
    let p = 'c:/Users/hp/Downloads/alkhazraji/' + f;
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        
        // Match any sequence of characters that are NOT ascii and NOT valid Arabic.
        // Also allow spaces inside the sequence so we can decode whole phrases.
        // Actually, just find any character >= 128 (non-ascii) that is NOT Arabic.
        // But since we fixed some Arabic strings, we have valid Arabic mixed with mojibake.
        
        // A simpler way: we know PowerShell converted UTF-8 bytes to Win1252 chars.
        // Let's find every sequence of characters where EVERY character is either:
        // 1. A win1252 char >= 128 (like Ø, Ù, etc.)
        // 2. A space or punctuation (we can include them in the match to keep bytes aligned)
        // Let's just find sequences of characters >= 128 that are NOT Arabic (0x0600-0x06FF).
        
        let newContent = content.replace(/[^\x00-\x7F\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D]+/g, (match) => {
            try {
                // Convert the win1252 string back to bytes
                const bytes = iconv.encode(match, 'win1252');
                // Decode those bytes as UTF-8
                const decoded = iconv.decode(bytes, 'utf8');
                
                // If the decoded string contains replacement characters (U+FFFD), 
                // it might be because some bytes were lost (like ?).
                // We'll just return it anyway, it's better than mojibake.
                return decoded;
            } catch(e) {
                return match;
            }
        });

        if (newContent !== content) {
            fs.writeFileSync(p, newContent, 'utf8');
            console.log('Regex fixed ' + f);
        }
    }
});
