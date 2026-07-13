const fs = require('fs');

const edits = JSON.parse(fs.readFileSync('edits.json', 'utf8'));

// Collect all unique TargetContent blocks per file (as the original content)
// to reconstruct the original files
const fileOriginals = {};

edits.forEach(edit => {
  const file = edit.file;
  if (!fileOriginals[file]) fileOriginals[file] = [];
  
  if (edit.chunks) {
    edit.chunks.forEach(chunk => {
      if (chunk.TargetContent && chunk.TargetContent.length > 0) {
        fileOriginals[file].push(chunk.TargetContent);
      }
    });
  }
});

console.log('Files found with original content:');
Object.keys(fileOriginals).forEach(f => {
  const totalLen = fileOriginals[f].reduce((sum, c) => sum + c.length, 0);
  console.log(` ${f}: ${fileOriginals[f].length} chunks, ${totalLen} chars`);
});

// The edits.json also has TargetContent which IS the original text
// But we need the full original file, not just patches
// Let's look at the biggest TargetContent in db.js to see if it's the full file
const dbEdits = edits.filter(e => e.file && e.file.includes('db.js'));
console.log('\ndb.js TargetContent sizes:');
dbEdits.forEach((e, i) => {
  if (e.chunks) {
    e.chunks.forEach((c, j) => {
      console.log(` chunk[${i}][${j}]: ${(c.TargetContent||'').length} chars`);
    });
  }
});
