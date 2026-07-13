/* =============================================================
   sales.js  –  Sales Page for سمكنا PWA
   Exposes: window.SalesPage = { init, refresh, openAddModal }
   ============================================================= */

'use strict';

(function () {

  /* ─── state ──────────────────────────────────────── */
  let _currentFilter = 'today';   // 'today' | 'week' | 'month'
  let _sales = [];                 // current loaded sales
  let _submitting = false;         // prevent double-submit

  /* ─── fish type badge colors ─────────────────────── */
  const FISH_BADGE = {
    'شبوط':    { bg: '#E3F2FD', text: '#1565C0' },
    'كطان':    { bg: '#F3E5F5', text: '#7B1FA2' },
    'بني':     { bg: '#FFF8E1', text: '#F57F17' },
    'گطان':    { bg: '#E8F5E9', text: '#2E7D32' },
    'مشهوف':   { bg: '#FCE4EC', text: '#C62828' },
    'سمك آخر': { bg: '#F5F5F5', text: '#424242' }
  };

  const FISH_BTN_COLORS = [
    '#1565C0','#7B1FA2','#F57F17','#2E7D32','#C62828','#455A64'
  ];

  /* ─────────────────────────────────────────────────
     RENDER PAGE SKELETON
  ───────────────────────────────────────────────── */
  function renderSkeleton() {
    const page = document.getElementById('page-sales');
    if (!page) return;

    page.innerHTML = `
      <!-- ══ HEADER ══ -->
      <div style="
        background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 100%);
        color:#fff;padding:20px 16px 0;margin:-16px -16px 0;
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <h1 style=\