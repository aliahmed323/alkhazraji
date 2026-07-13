const fs = require('fs');

const p = 'C:/Users/hp/.gemini/antigravity/brain/';
const dir = 'c:/Users/hp/Downloads/alkhazraji/pristine_files/';
fs.mkdirSync(dir, { recursive: true });

fs.readdirSync(p).forEach(d => {
  if (!d.includes('-')) return;
  if (d === 'dcdb5aaa-fc8b-4b44-a613-31ba5ee8112c') return; // skip main conversation

  const log = p + d + '/.system_generated/logs/transcript.jsonl';
  if (fs.existsSync(log)) {
    const lines = fs.readFileSync(log, 'utf8').split('\n');
    lines.forEach(l => {
      if (l.includes('write_to_file')) {
        try {
          const j = JSON.parse(l);
          if (j.tool_calls) {
            j.tool_calls.forEach(tc => {
              if (tc.name === 'write_to_file' || tc.name.includes('write_to_file')) {
                let args = tc.args;
                if (typeof args === 'string') {
                  args = JSON.parse(args);
                }
                const target = args.TargetFile.replace(/^"|"$/g, '');
                let content = args.CodeContent;
                
                if (typeof content === 'string' && content.startsWith('"') && content.endsWith('"')) {
                  try {
                    content = JSON.parse(content);
                  } catch(err) {
                    content = content.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                  }
                }

                const basename = target.split('\\').pop().split('/').pop();
                fs.writeFileSync(dir + basename, content, 'utf8');
                console.log('Restored pristine from', d, ':', basename);
              }
            });
          }
        } catch (e) {}
      }
    });
  }
});
