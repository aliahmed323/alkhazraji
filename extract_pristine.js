const fs = require('fs');

const p1 = 'C:/Users/hp/.gemini/antigravity/brain/1912da86-655a-4250-b976-af1e293b7a22/.system_generated/logs/transcript.jsonl';
const p2 = 'C:/Users/hp/.gemini/antigravity/brain/f660ccd8-92b0-4f61-b8d1-40c0ba247a6c/.system_generated/logs/transcript.jsonl';
const dir = 'c:/Users/hp/Downloads/alkhazraji/pristine_files/';

fs.mkdirSync(dir, { recursive: true });

[p1, p2].forEach(p => {
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  lines.forEach((l, idx) => {
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
              console.log('Restored pristine:', basename);
            }
          });
        }
      } catch (e) {
      }
    }
  });
});
