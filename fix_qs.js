const fs = require('fs');

const p = 'c:/Users/hp/Downloads/alkhazraji/js/purchases.js';
let html = fs.readFileSync(p, 'utf8');

// Replace known patterns of ? with their obvious Arabic translations based on context
const replacements = [
  [/<p style="margin-top:8px;font-size:13px;">\?{3} \?{3} \?{3} \?{5} \?{8}<\/p>/g, '<p style="margin-top:8px;font-size:13px;">لم يتم العثور على مشتروات</p>'],
  [/showToast\('\?{3} \?{3} \?{5} \?{5} \?{8}: ' \+ err.message, 'error'\)/g, "showToast('حدث خطأ أثناء تحميل الموردين: ' + err.message, 'error')"],
  [/showToast\('\?{4} \?{5} \?{6}', 'error'\)/g, "showToast('يرجى إكمال البيانات', 'error')"],
  [/showToast\('\?{3} \?{3} \?{5} \?{6}', 'error'\)/g, "showToast('حدث خطأ أثناء الحفظ', 'error')"],
  [/confirmDialog\('\?\? \?{4} \?{4} \?\?\? \?{7}', async \(\) => {/g, "confirmDialog('هل تريد تأكيد حذف المشتريات', async () => {"],
  [/showToast\('\?\? \?{4} \?{6}', 'success'\)/g, "showToast('تم الحذف بنجاح', 'success')"],
  [/'\?{8}':         p.paidAmount/g, "'المدفوع':         p.paidAmount"],
  [/'\?{5} \?{6}':     window.PAYMENT_TYPES/g, "'طريقة الدفع':     window.PAYMENT_TYPES"],
  [/<div style="font-size:11px;color:var\(--text-medium\);margin-top:2px;">\?{6}<\/div>/g, '<div style="font-size:11px;color:var(--text-medium);margin-top:2px;">المورد</div>'],
  [/<div style="font-size:11px;color:var\(--text-light\);margin-bottom:2px;">\?{6}<\/div>/g, '<div style="font-size:11px;color:var(--text-light);margin-bottom:2px;">المورد</div>'],
  [/label: '\?{3}'/g, "label: 'نقد'"],
  [/label: '\?{4}'/g, "label: 'دين'"],
  [/label: '\?\?\?\?'/g, "label: 'جزء'"],
  [/bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },\n    '\?{4}'/g, "bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },\n    'كطان'"],
  [/bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },\n    '\?{3}'/g, "bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },\n    'بني'"],
  [/bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },\n    '\?{4}'/g, "bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },\n    'گطان'"],
  [/bg: '#FCE4EC', text: '#C62828', border: '#F48FB1' },\n    '\?{5}'/g, "bg: '#FCE4EC', text: '#C62828', border: '#F48FB1' },\n    'مشهوف'"],
  [/bg: '#F5F5F5', text: '#424242', border: '#E0E0E0' },\n    '\?{3} \?{3}'/g, "bg: '#F5F5F5', text: '#424242', border: '#E0E0E0' },\n    'سمك آخر'"],
  [/>\?{4} <\/span>/g, ">اليوم </span>"],
  [/>\?{7} <\/span>/g, ">الاسبوع </span>"],
  [/>\?{5} <\/span>/g, ">الشهر </span>"],
];

replacements.forEach(([regex, good]) => {
  html = html.replace(regex, good);
});

fs.writeFileSync(p, html, 'utf8');
