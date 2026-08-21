/**
 * js/quote.js — quote drawer (closes 1.3, 2.6).
 *
 * One component, invoked from anywhere, always carrying context (machine of
 * interest, parts mode with machine + serial, route-selector pre-routing).
 * Reads window.HaskoMotion.trapFocus (motion.js loads first).
 *
 * Scaffold only — the drawer markup, fields and honeypot/timing validation
 * land with the quote-drawer component build.
 */
(function () {
  'use strict';

  function init() {
    const drawer = document.querySelector('[data-quote-drawer]');
    if (!drawer) return;

    // TODO: open/close, focus trap via window.HaskoMotion.trapFocus, Esc to
    // close, focus return to trigger, pre-filled machine-of-interest field,
    // inline validation, honeypot + timing check (no reCAPTCHA — audit 2.6).
  }

  document.addEventListener('DOMContentLoaded', init);
})();
