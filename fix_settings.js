const fs = require('fs');

const p = 'c:/Users/hp/Downloads/alkhazraji/js/settings.js';
let html = fs.readFileSync(p, 'utf8');

// We need to add the supply ratios setting
const ratioSettingsHTML = \
      <!-- Supplies Ratios -->
      <div class="stg-section" style="margin-top:20px;">
        <div class="stg-section-header">
          <div class="stg-section-icon success">
            <i data-lucide="package"></i>
          </div>
          <div>
            <h2 class="stg-section-title">إعدادات المواد</h2>
            <p class="stg-section-sub">تحديد نسبة الاستهلاك لكل سمكة مباعة</p>
          </div>
        </div>
        <div class="stg-form-body">
          <div class="stg-form-group">
            <label class="stg-label" for="stg-bag-ratio">عدد الأكياس لكل سمكة</label>
            <input type="number" id="stg-bag-ratio" class="stg-input" value="\" step="any" min="0">
          </div>
          <div class="stg-form-group">
            <label class="stg-label" for="stg-charcoal-ratio">كمية الفحم لكل سمكة</label>
            <input type="number" id="stg-charcoal-ratio" class="stg-input" value="\" step="any" min="0">
          </div>
          <button class="stg-save-btn success" id="stg-save-ratios">
            <i data-lucide="save"></i> حفظ إعدادات المواد
          </button>
        </div>
      </div>
\;

// Insert it before the backup section
if (html.includes('id="stg-save-shop"')) {
    html = html.replace(/<button class="stg-save-btn accent" id="stg-save-shop">[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/, (match) => {
        return match + '\n' + ratioSettingsHTML;
    });
}

// Add the JS logic to save the ratios
const jsLogic = \
    // Save Supplies Ratios
    const btnRatios = document.getElementById('stg-save-ratios');
    if (btnRatios) {
      btnRatios.addEventListener('click', async () => {
        const bagRatio = parseFloat(document.getElementById('stg-bag-ratio').value) || 0;
        const charRatio = parseFloat(document.getElementById('stg-charcoal-ratio').value) || 0;
        btnRatios.disabled = true;
        btnRatios.innerHTML = '<i data-lucide="loader"></i> جاري الحفظ...';
        
        const newSettings = Object.assign({}, window.APP_SETTINGS, {
          bagRatio: bagRatio,
          charcoalRatio: charRatio
        });
        
        try {
          await window.DB.saveSettings(newSettings);
          window.APP_SETTINGS = newSettings;
          window.showToast('تم حفظ الإعدادات بنجاح', 'success');
        } catch (e) {
          window.showToast('حدث خطأ', 'error');
        } finally {
          btnRatios.disabled = false;
          btnRatios.innerHTML = '<i data-lucide="save"></i> حفظ إعدادات المواد';
          if (window.lucide) window.lucide.createIcons();
        }
      });
    }
\;

if (html.includes('const btnShop = document.getElementById(\\'stg-save-shop\\');')) {
    html = html.replace(/const btnShop = document\.getElementById\('stg-save-shop'\);/, match => jsLogic + '\n' + match);
}

fs.writeFileSync(p, html, 'utf8');
