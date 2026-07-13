const fs = require('fs');
let html = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', 'utf8');

const regex1 = /<button type="button" class="fish-type-btn" data-value="شبوط">.*? شبوط<\/button>/;
html = html.replace(regex1, '<button type="button" class="fish-type-btn" data-value="شبوط">🐟 شبوط</button>');

const regex2 = /<button type="button" class="fish-type-btn" data-value="كطان">.*? كطان<\/button>/;
html = html.replace(regex2, '<button type="button" class="fish-type-btn" data-value="كطان">🦈 كطان</button>');

const regex3 = /<button type="button" class="fish-type-btn" data-value="بني">.*? بني<\/button>/;
html = html.replace(regex3, '<button type="button" class="fish-type-btn" data-value="بني">🐡 بني</button>');

const regex4 = /<button type="button" class="fish-type-btn" data-value="مشهو.?">.*? مشهو.?<\/button>/;
html = html.replace(regex4, '<button type="button" class="fish-type-btn" data-value="مشهوف">🛶 مشهوف</button>');

const regex5 = /<button type="button" class="fish-type-btn" data-value="سمك آخر">.*? آخر<\/button>/;
html = html.replace(regex5, '<button type="button" class="fish-type-btn" data-value="سمك آخر">🐟 آخر</button>');

html = html.replace(/<title>.*?<\/title>/, '<title>الخزرجي - نظام إدارة مطعم</title>');
html = html.replace(/content="سمكنا"/g, 'content="الخزرجي"');

fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', html, 'utf8');
