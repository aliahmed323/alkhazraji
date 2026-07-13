/**
 * settings.js — Settings Page Module
 * Exposes: window.SettingsPage = { init, refresh }
 */
(function () {
  'use strict';

  /* ───────────────────────── helpers ───────────────────────── */
  function getSetting(key, fallback = '') {
    return window.APP_SETTINGS?.[key] ?? fallback;
  }

  /* ───────────────────────── render ────────────────────────── */
  function render() {
    const container = document.getElementById('settings-content');
    if (!container) return;

    const shopName       = getSetting('shopName', 'سمكنا');
    const marginEnabled  = getSetting('profitMarginEnabled', false);
    const marginType     = getSetting('profitMarginType', 'percent');    // 'percent' | 'dinar'
    const marginValue    = getSetting('profitMarginValue', 0);
    const firebaseId     = getSetting('firebaseProjectId', 'samakna-app');

    container.innerHTML = `

      <!-- ═══════════════════ Shop Info ═══════════════════ -->
      <div class="stg-section">
        <div class="stg-section-header">
          <div class="stg-section-icon accent">
            <i data-lucide="store"></i>
          </div>
          <div>
            <h2 class="stg-section-title">معلومات المحل</h2>
            <p class="stg-section-sub">اسم المحل الذي يظهر في التقارير والطباعة</p>
          </div>
        </div>
        <div class="stg-form-body">
          <div class="stg-form-group">
            <label class="stg-label" for="stg-shop-name">اسم المحل</label>
            <input
              type="text"
              id="stg-shop-name"
              class="stg-input"
              value="${escHtml(shopName)}\