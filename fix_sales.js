const fs = require('fs');

const p = 'c:/Users/hp/Downloads/alkhazraji/js/sales.js';
let html = fs.readFileSync(p, 'utf8');

const replacement = \    const saleData = {
      fishType:   _selectedFishType,
      weight:     weight,
      pricePerKg: pricePerKg,
      quantity:   quantity,
      total:      total,
      cost:       cost,
      profit:     profit,
      notes:      notes,
      date:       dateVal,
      createdAt:  dateObj
    };

    // Disable submit button
    const btn = document.getElementById('sale-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" style="width:18px;height:18px;vertical-align:middle;margin-left:6px;animation:spin 1s linear infinite;"></i> جاري الحفظ...';
      if (window.lucide) try { lucide.createIcons({ nodes: [btn] }); } catch(e){}
    }
    _submitting = true;

    try {
      await window.db.collection('sales').add(saleData);
      
      // Auto-deduct supplies
      const bagRatio = window.APP_SETTINGS?.bagRatio || 0;
      const charRatio = window.APP_SETTINGS?.charcoalRatio || 0;
      
      if (bagRatio > 0) {
        await window.db.collection('expenses').add({
          type: 'bags',
          typeName: 'أكياس',
          amount: 0,
          quantity: -(quantity * bagRatio),
          notes: 'مبيعات يوم ' + window.getToday(),
          date: dateVal,
          createdAt: dateObj
        });
      }
      if (charRatio > 0) {
        await window.db.collection('expenses').add({
          type: 'charcoal',
          typeName: 'فحم',
          amount: 0,
          quantity: -(quantity * charRatio),
          notes: 'مبيعات يوم ' + window.getToday(),
          date: dateVal,
          createdAt: dateObj
        });
      }

      showToast('تم حفظ المبيعة بنجاح', 'success');\;

const target = \    // Disable submit button
    const btn = document.getElementById('sale-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" style="width:18px;height:18px;vertical-align:middle;margin-left:6px;animation:spin 1s linear infinite;"></i> OO OUS O U,O-U?O,...';
      if (window.lucide) try { lucide.createIcons({ nodes: [btn] }); } catch(e){}
    }
    _submitting = true;

    try {
      await window.db.collection('sales').add(saleData);
      showToast('OU. OO3OUSU, O U,O"USO1 O"U+OO O- o"', 'success');\;

if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync(p, html, 'utf8');
    console.log('Fixed sales.js');
} else {
    console.log('Target not found in sales.js');
}
