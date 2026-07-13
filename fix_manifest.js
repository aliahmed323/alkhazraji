const fs = require('fs');

const p = 'c:/Users/hp/Downloads/alkhazraji/manifest.json';
let manifest = fs.readFileSync(p, 'utf8');

manifest = manifest.replace(/"name":\s*".*?"/, '"name": "الخزرجي - نظام إدارة مطعم"');
manifest = manifest.replace(/"short_name":\s*".*?"/, '"short_name": "الخزرجي"');
manifest = manifest.replace(/"description":\s*".*?"/, '"description": "نظام إدارة مبيعات ومشتريات مطعم الخزرجي"');

fs.writeFileSync(p, manifest, 'utf8');
