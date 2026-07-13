const fs = require('fs');

let html = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', 'utf8');
if (!html.includes('id="btn-reset-data"')) {
    html = html.replace('<!-- Restore Backup -->', '<div style="margin-top:40px;padding:20px;background:rgba(211,47,47,0.1);border:1px solid var(--danger);border-radius:12px;"><h4 style="color:var(--danger);margin-bottom:10px;">تصفير النظام</h4><p style="font-size:12px;color:var(--text-medium);margin-bottom:15px;">سيتم حذف كافة البيانات (المبيعات، المشتريات، الديون، الموردين) بشكل نهائي. لا يمكن التراجع عن هذه الخطوة.</p><button id="btn-reset-data" class="btn btn-danger" style="width:100%;"><i data-lucide="alert-triangle"></i> حذف جميع البيانات وتصفير الموقع</button></div>\n      <!-- Restore Backup -->');
    fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', html, 'utf8');
}

let settingsJs = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/js/settings.js', 'utf8');
if (!settingsJs.includes('btn-reset-data')) {
    const resetLogic = `
  const btnResetData = document.getElementById('btn-reset-data');
  if (btnResetData) {
    btnResetData.addEventListener('click', async () => {
      window.confirmDialog('تحذير خطير: هل أنت متأكد أنك تريد حذف جميع البيانات وتصفير الموقع؟ هذا الإجراء لا يمكن التراجع عنه!', async () => {
        try {
          btnResetData.disabled = true;
          btnResetData.innerHTML = '<i data-lucide="loader"></i> جاري التصفير...';
          const collections = ['sales', 'purchases', 'expenses', 'suppliers', 'payments', 'inventory_transactions'];
          for (const coll of collections) {
            const snapshot = await window.db.collection(coll).get();
            const batch = window.db.batch();
            snapshot.docs.forEach((doc) => {
              batch.delete(doc.ref);
            });
            await batch.commit();
          }
          window.showToast('تم تصفير الموقع بنجاح', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
          console.error(e);
          window.showToast('حدث خطأ أثناء التصفير', 'error');
          btnResetData.disabled = false;
          btnResetData.innerHTML = '<i data-lucide="alert-triangle"></i> حذف جميع البيانات وتصفير الموقع';
          if (window.lucide) window.lucide.createIcons();
        }
      });
    });
  }
`;
    settingsJs = settingsJs.replace('function init() {', 'function init() {\n' + resetLogic);
    fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/js/settings.js', settingsJs, 'utf8');
}
