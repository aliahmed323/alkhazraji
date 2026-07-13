/* =============================================================
   purchases.js  –  Purchases Page for سمكنا PWA
   Exposes: window.PurchasesPage = { init, refresh, openAddModal }
   ============================================================= */

'use strict';

(function () {

  /* ─── state ──────────────────────────────────────── */
  let _currentFilter = 'today';
  let _purchases     = [];
  let _suppliers     = [];
  let _submitting    = false;

  /* ─── payment type badge colors ─────────────────── */
  const PAYMENT_BADGE = {
    cash:    { bg: '#E8F5E9', text: '#2E7D32', label: 'نقد' },
    debt:    { bg: '#FFEBEE', text: '#C62828', label: 'دين' },
    partial: { bg: '#FFF3E0', text: '#E65100', label: 'جزئي' }
  };

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
    const page = document.getElementById('page-purchases');
    if (!page) return;

    page.innerHTML = `
      <!-- ══ HEADER ══ -->
      <div style=\