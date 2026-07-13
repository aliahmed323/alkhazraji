const fs = require('fs');
const transcriptPath = 'C:/Users/hp/.gemini/antigravity/brain/dcdb5aaa-fc8b-4b44-a613-31ba5ee8112c/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let edits = [];

lines.forEach(l => {
  if (!l.trim()) return;
  try {
    const j = JSON.parse(l);
    if (j.tool_calls) {
      j.tool_calls.forEach(tc => {
        if (tc.name === 'multi_replace_file_content' || tc.name === 'replace_file_content') {
          let args = tc.args;
          if (typeof args === 'string') {
            try { args = JSON.parse(args); } catch(e) {}
          }
          if (args && args.TargetFile) {
            let targetFile = args.TargetFile.replace(/^"|"$/g, '');
            if (!targetFile.includes('.md') && !targetFile.includes('sw.js')) {
              
              let chunks = args.ReplacementChunks || [{
                TargetContent: args.TargetContent,
                ReplacementContent: args.ReplacementContent
              }];
              
              if (typeof chunks === 'string') {
                try { chunks = JSON.parse(chunks); } catch(e) {}
              }
              
              let parsedChunks = [];
              if (Array.isArray(chunks)) {
                  chunks.forEach(c => {
                      let t = c.TargetContent;
                      let r = c.ReplacementContent;
                      if (typeof t === 'string' && t.startsWith('"') && t.endsWith('"')) {
                          try { t = JSON.parse(t); } catch(e) {}
                      }
                      if (typeof r === 'string' && r.startsWith('"') && r.endsWith('"')) {
                          try { r = JSON.parse(r); } catch(e) {}
                      }
                      parsedChunks.push({TargetContent: t, ReplacementContent: r});
                  });
              }

              edits.push({
                name: tc.name,
                file: targetFile,
                chunks: parsedChunks
              });
            }
          }
        }
      });
    }
  } catch(e) {}
});

fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/edits.json', JSON.stringify(edits, null, 2), 'utf8');
console.log('Extracted', edits.length, 'edits safely');
