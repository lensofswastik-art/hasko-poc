/**
 * js/motion.js — scroll reveal, count-up, sticky nav, focus-trap helpers.
 *
 * Loads before finder.js and quote.js, which both read from
 * window.HaskoMotion for trapFocus/reveal helpers.
 *
 * Everything here must honour prefers-reduced-motion: the CSS escape hatch
 * in tokens.css already forces .reveal to its visible end state, so this
 * module only needs to avoid re-hiding content when that media query is on.
 */
window.HaskoMotion = (function () {
  'use strict';

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Reveals .reveal elements as they enter the viewport by adding
   * .is-visible. Skips straight to visible under reduced motion.
   */
  function initReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /**
   * Traps Tab/Shift+Tab focus within `container` (a mega-menu panel, the
   * quote drawer). Returns a release function that removes the listener.
   */
  function trapFocus(container) {
    if (!container) return () => {};

    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function onKeydown(e) {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(container.querySelectorAll(selector)).filter(
        (el) => el.offsetParent !== null
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    container.addEventListener('keydown', onKeydown);
    return () => container.removeEventListener('keydown', onKeydown);
  }

  /**
   * Counts a numeric element up from 0 to its target once, on entry.
   * Static under reduced motion.
   */
  function countUp(el, { duration = 900 } = {}) {
    if (!el) return;
    const target = parseFloat(el.dataset.countTo || el.textContent);
    if (Number.isNaN(target)) return;

    if (prefersReducedMotion()) {
      el.textContent = el.dataset.countTo || el.textContent;
      return;
    }

    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(target * t).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener('DOMContentLoaded', initReveal);

  return { initReveal, trapFocus, countUp, prefersReducedMotion };
})();
