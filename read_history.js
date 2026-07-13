const fs = require('fs');

const logPath = "C:/Users/hp/.gemini/antigravity/brain/dcdb5aaa-fc8b-4b44-a613-31ba5ee8112c/.system_generated/logs/transcript.jsonl";
const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(l => l.trim());

const userMessages = [];
const toolCalls = [];

lines.forEach(line => {
  try {
    const j = JSON.parse(line);
    
    // Collect user messages
    if (j.type === 'USER_INPUT' && j.content) {
      userMessages.push(j.content.substring(0, 500));
    }
    
    // Collect write_to_file calls
    if (j.tool_calls) {
      j.tool_calls.forEach(tc => {
        if (tc.name === 'write_to_file' || tc.name === 'replace_file_content') {
          const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
          toolCalls.push({
            tool: tc.name,
            file: args.TargetFile || args.file || 'unknown'
          });
        }
      });
    }
  } catch(e) {}
});

console.log('=== USER MESSAGES ===');
userMessages.forEach((m, i) => console.log(`[${i+1}] ${m}\n---`));

console.log('\n=== FILE OPERATIONS ===');
const fileSet = {};
toolCalls.forEach(t => {
  const f = t.file.split('\\').pop();
  fileSet[f] = (fileSet[f] || 0) + 1;
});
Object.entries(fileSet).forEach(([f, count]) => console.log(` ${f}: modified ${count} times`));
