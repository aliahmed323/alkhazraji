/* =============================================================
   dashboard.js  –  Dashboard Page for سمكنا PWA
   Exposes: window.DashboardPage = { init, refresh }
   ============================================================= */

'use strict';

(function () {

  /* ─── internal state ─────────────────────────────── */
  let _chartInstance = null;    // Chart.js instance
  let _unsubscribers = [];      // Firestore listeners to clean up

  /* ─── fish type colors (for badges) ─────────────── */
  const FISH_COLORS = {
    'شبوط':    { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },
    'كطان':    { bg: '#F3E5F5', text: '#7B1FA2', border: '#CE93D8' },
    'بني':     { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
    'گطان':    { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
    'مشهوف':   { bg: '#FCE4EC', text: '#C62828', border: '#F48FB1' },
    'سمك آخر': { bg: '#F5F5F5', text: '#424242', border: '#BDBDBD' }
  };

  /* ─── Arabic day names ───────────────────────────── */
  const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  /* ─────────────────────────────────────────────────
     RENDER HTML SKELETON
  ───────────────────────────────────────────────── */
  function renderSkeleton() {
    const page = document.getElementById('page-dashboard');
    if (!page) return;

    page.innerHTML = `
      <!-- ══ HEADER ══ -->
      <div class="page-header" style=\