/**
 * js/finder.js — machine finder: filter, compare, URL state (closes 2.3).
 *
 * Reads window.HASKO_MACHINES (data/machines.js — a plain <script> global,
 * not fetch(), since fetch() of a local file is CORS-blocked under file://).
 * Reads window.HaskoMotion for reveal/reflow helpers (motion.js loads first).
 *
 * Scaffold only — filtering, compare tray and zero-result behaviour land
 * with section 04 (CLAUDE.md §6, "Machine finder").
 */
(function () {
  'use strict';

  function init() {
    const data = window.HASKO_MACHINES;
    if (!data) return; // finder degrades to the unfiltered static list — progressive enhancement

    // TODO: instant client-side filtering (Application/Process/Width/HP),
    // aria-live result count, removable filter chips, compare tray (max 3),
    // URL query-string sync, zero-result panel with closest-match suggestion.
  }

  document.addEventListener('DOMContentLoaded', init);
})();
