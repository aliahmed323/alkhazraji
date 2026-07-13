/* =============================================================
   utils.js  –  Global utilities for سمكنا PWA
   All functions are exposed via the window object (no ES modules)
   ============================================================= */

'use strict';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

window.FISH_TYPES = ['شبوط', 'كطان', 'بني', 'گطان', 'مشهوف', 'سمك آخر'];

window.EXPENSE_TYPES = {
  charcoal:    { name: 'فحم',        icon: 'flame' },
  spices:      { name: 'بهارات',     icon: 'leaf' },
  salt:        { name: 'ملح',        icon: 'circle-dot' },
  bags:        { name: 'أكياس',      icon: 'package' },
  fuel:        { name: 'وقود',       icon: 'fuel' },
  transport:   { name: 'نقل',        icon: 'truck' },
  wages:       { name: 'أجور',       icon: 'users' },
  electricity: { name: 'كهرباء',     icon: 'zap' },
  water:       { name: 'ماء',        icon: 'droplets' },
  maintenance: { name: 'صيانة',      icon: 'wrench' },
  other:       { name: 'أخرى',       icon: 'more-horizontal' }
};

window.PAYMENT_TYPES = {
  cash:    'نقد كامل',
  debt:    'دين كامل',
  partial: 'جزء نقد + دين'
};

/* ─────────────────────────────────────────
   FORMATTING
───────────────────────────────────────── */

/**
 * Format amount in Iraqi Dinar
 * @param {number} amount
 * @returns {string}  e.g. "١٥,٠٠٠ د.ع\