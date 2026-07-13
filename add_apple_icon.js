const fs = require('fs');
let html = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', 'utf8');

const link = \
  <!-- PWA Icons -->
  <link rel="apple-touch-icon" href="icons/icon-192.png">
  <link rel="manifest" href="manifest.json" />
\;

if (!html.includes('apple-touch-icon')) {
    html = html.replace('</head>', link + '\n</head>');
    fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', html, 'utf8');
}
