const fs = require('fs');
const path = require('path');

const brainDir = 'C:/Users/hp/.gemini/antigravity/brain';
let found = false;

function searchLogs() {
  const dirs = fs.readdirSync(brainDir);
  for (const dir of dirs) {
    const logPath = path.join(brainDir, dir, '.system_generated/logs/transcript.jsonl');
    if (fs.existsSync(logPath)) {
      try {
        const lines = fs.readFileSync(logPath, 'utf8').split('\n');
        for (const l of lines) {
          if (!l.trim()) continue;
          try {
            const j = JSON.parse(l);
            if (j.type === 'TOOL_RESPONSE') {
              const out = JSON.stringify(j.output || '');
              if (out.includes('<html') && out.includes('<body>')) {
                console.log('Found HTML in', logPath, out.length);
                fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/recovered_html.txt', out, 'utf8');
                found = true;
              }
            }
          } catch(e) {}
        }
      } catch(e) {}
    }
  }
}

searchLogs();
if (!found) console.log('No HTML found in any view_file');
