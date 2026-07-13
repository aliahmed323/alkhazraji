const fs = require('fs');
let html = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', 'utf8');

html = html.replace(/<title>.*<\/title>/g, '<title>الخزرجي - نظام إدارة مطعم</title>');
html = html.replace(/O3U\.UU\+O /g, 'الخزرجي');
html = html.replace(/<meta name="apple-mobile-web-app-title" content=".*?" \/>/g, '<meta name="apple-mobile-web-app-title" content="الخزرجي" />');
html = html.replace(/<meta name="description" content=".*?" \/>/g, '<meta name="description" content="نظام إدارة مطعم الخزرجي" />');

// Emojis for Sales
const fishRegexSales = /<div class="fish-type-grid">[\s\S]*?<\/div>/;
const fishGridFixed = \<div class="fish-type-grid">
              <button type="button" class="fish-type-btn" data-value="شبوط">🐟 شبوط</button>
              <button type="button" class="fish-type-btn" data-value="كطان">🦈 كطان</button>
              <button type="button" class="fish-type-btn" data-value="بني">🐡 بني</button>
              <button type="button" class="fish-type-btn" data-value="گطان">🦈 گطان</button>
              <button type="button" class="fish-type-btn" data-value="مشهوف">🛶 مشهوف</button>
              <button type="button" class="fish-type-btn" data-value="سمك آخر">🐟 آخر</button>
            </div>\;
html = html.replace(fishRegexSales, fishGridFixed); // this will replace the first one (Sales)

// Emojis for Purchases
const purchaseGridFixed = \<div class="fish-type-grid">
              <button type="button" class="fish-type-btn" data-value="شبوط">🐟 شبوط</button>
              <button type="button" class="fish-type-btn" data-value="كطان">🦈 كطان</button>
              <button type="button" class="fish-type-btn" data-value="بني">🐡 بني</button>
              <button type="button" class="fish-type-btn" data-value="گطان">🦈 گطان</button>
              <button type="button" class="fish-type-btn" data-value="مشهوف">🛶 مشهوف</button>
              <button type="button" class="fish-type-btn" data-value="سمك آخر">🐟 آخر</button>
            </div>\;
html = html.replace(fishRegexSales, purchaseGridFixed); // replaces the second one (Purchases)

fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', html, 'utf8');
