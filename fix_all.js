const fs = require('fs');
const iconv = require('iconv-lite');

function simulateCorruption(arabicText) {
    const utf8Buffer = Buffer.from(arabicText, 'utf8');
    return iconv.decode(utf8Buffer, 'win1252');
}

const stringsToFix = [
  'المصاريف', 'لا توجد بيانات', 'لا توجد مصاريف في هذه الفترة',
  'أخرى', 'إجمالي المصاريف', 'اليوم', 'هذا الأسبوع', 'هذا الشهر',
  'التوزيع حسب الفئة', 'سجل المصاريف', 'مصروف جديد', 'إضافة مصروف',
  'نوع المصروف', 'المبلغ (د.ع)', 'الكمية (عدد/كغ)', 'الكمية', 'ملاحظات اختيارية...',
  'التاريخ', 'إلغاء', 'حفظ', 'الرجاء اختيار نوع المصروف', 'الرجاء إدخال مبلغ صحيح',
  'جاري الحفظ...', 'تم حفظ المصروف بنجاح', 'حدث خطأ أثناء الحفظ', 'تعديل مصروف', 'حذف'
];

const files = ['js/expenses.js', 'js/purchases.js', 'js/sales.js', 'js/debts.js', 'js/settings.js'];

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
