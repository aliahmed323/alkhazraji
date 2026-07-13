const fs = require('fs');
const iconv = require('iconv-lite');

// This function simulates what PowerShell did to the Arabic text
function simulateCorruption(arabicText) {
    // 1. Original string is written as UTF-8
    const utf8Buffer = Buffer.from(arabicText, 'utf8');
    // 2. PowerShell reads it as windows-1252 (default in many locales)
    const str = iconv.decode(utf8Buffer, 'win1252');
    return str;
}

const stringsToFix = [
  'سمكنا', 'نظام إدارة مطعم لبيع سمك مشوي', 'لوحة التحكم', 'المبيعات', 'المشتريات',
  'المصاريف', 'الموردون', 'الديون', 'المخزون', 'التقارير', 'الإعدادات', 'المزيد',
  'إضافة بيع', 'إضافة شراء', 'إضافة مصروف', 'إضافة مورد', 'تسجيل دفعة', 'النسخة الاحتياطية',
  'استرجاع', 'خروج', 'نوع السمك', 'الوزن (كغ)', 'سعر الكيلو', 'الإجمالي', 'ملاحظات',
  'التاريخ', 'المدفوع', 'فحم', 'أكياس', 'حفظ', 'إلغاء', 'العدد', 'المورد', 'طريقة الدفع',
  'مكتبة التصدير غير محملة', 'لا توجد بيانات للتصدير', 'سجل المصاريف', 'توزيع حسب الفئة',
  'خطأ في تحميل المصاريف', 'تم حفظ المصروف بنجاح', 'حدث خطأ أثناء الحفظ', 'الرجاء اختيار نوع المصروف',
  'الرجاء إدخال مبلغ صحيح', 'إجمالي المصاريف', 'اليوم', 'هذا الأسبوع', 'هذا الشهر', 'مصروف جديد'
];

const files = ['index.html', 'js/purchases.js', 'js/sales.js', 'js/debts.js', 'js/expenses.js', 'js/settings.js'];

files.forEach(f => {
    let p = 'c:/Users/hp/Downloads/alkhazraji/' + f;
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        let changes = 0;
        stringsToFix.forEach(arabic => {
            const corrupted = simulateCorruption(arabic);
            if (content.includes(corrupted)) {
                content = content.split(corrupted).join(arabic);
                changes++;
            }
        });
        if (changes > 0) {
            fs.writeFileSync(p, content, 'utf8');
            console.log('Fixed ' + changes + ' strings in ' + f);
        }
    }
});
