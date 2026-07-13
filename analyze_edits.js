const fs = require('fs');

const edits = JSON.parse(fs.readFileSync('edits.json', 'utf8'));
console.log('Total edits:', edits.length);

// Group by file
const byFile = {};
edits.forEach((e, i) => {
  const f = e.file || e.TargetFile || 'unknown';
  if (!byFile[f]) byFile[f] = [];
  byFile[f].push({ index: i, ...e });
});

console.log('\nFiles in edits:');
Object.keys(byFile).forEach(f => {
  console.log(` - ${f}: ${byFile[f].length} edits`);
});

// Find largest ReplacementContent pieces to understand the original code
let largest = [];
edits.forEach((e, i) => {
  const content = e.ReplacementContent || e.replacement || '';
  if (content.length > 500) {
    largest.push({ index: i, file: e.TargetFile || e.file, length: content.length });
  }
});

largest.sort((a, b) => b.length - a.length);
console.log('\nLargest replacement blocks:');
largest.slice(0, 10).forEach(l => console.log(` [${l.index}] ${l.file}: ${l.length} chars`));
