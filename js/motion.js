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
   *
   * Filters on the `tabIndex` IDL property rather than a compound CSS
   * selector — `input:not([disabled])` alone would still match an
   * `<input tabindex="-1">` honeypot field (the clause is independent of
   * the `[tabindex]:not([tabindex="-1"])` clause in a comma-separated
   * selector), which would let the trap wrap focus onto an
   * aria-hidden field a keyboard user can never reach naturally.
   */
  function trapFocus(container) {
    if (!container) return () => {};

    const selector = 'a[href], button, input, select, textarea, summary, [tabindex]';

    function getFocusable() {
      return Array.from(container.querySelectorAll(selector)).filter(
        (el) => !el.hasAttribute('disabled') && el.tabIndex >= 0 && el.offsetParent !== null
      );
    }

    function onKeydown(e) {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
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
   * Sticky header condense (component #2, closes 1.5/2.1 alongside the
   * markup). Past 120px scroll the utility row collapses via a CSS
   * max-height/opacity transition on --t-standard. The listener itself
   * doesn't branch on reduced motion — collapsing is a layout state, not
   * decoration — the global `prefers-reduced-motion` block in tokens.css
   * already forces the transition duration to ~0 everywhere, so the state
   * change still happens, just without the animated collapse.
   */
  function initStickyHeader() {
    const header = document.querySelector('[data-site-header]');
    if (!header) return;

    const THRESHOLD = 120;
    let ticking = false;

    function update() {
      header.classList.toggle('is-condensed', window.scrollY > THRESHOLD);
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /**
   * Mega-menus (component #2, closes 1.5/2.1). Every `[data-mega-menu-item]`
   * (an <li> wrapping a `[data-mega-menu-trigger]` button and a
   * `[data-mega-menu-panel]` panel) opens on mouseenter AND click/Enter,
   * closes on Esc, on an outside click, and when focus leaves the item,
   * and traps focus while open via trapFocus().
   */
  function initMegaMenu() {
    const items = document.querySelectorAll('[data-mega-menu-item]');
    if (!items.length) return;

    let openItem = null;
    let releaseTrap = null;
    let hoverCloseTimer = null;

    function openMenu(item) {
      if (openItem === item) return;
      if (openItem) closeMenu(openItem);

      const trigger = item.querySelector('[data-mega-menu-trigger]');
      const panel = item.querySelector('[data-mega-menu-panel]');
      if (!trigger || !panel) return;

      panel.hidden = false;
      // Force a reflow so removing [hidden] and adding .is-open land in
      // separate frames — otherwise the opacity/transform transition has
      // nothing to animate from.
      void panel.offsetHeight;
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      item.classList.add('is-open');

      releaseTrap = window.HaskoMotion.trapFocus(panel);
      openItem = item;
    }

    function closeMenu(item) {
      const trigger = item.querySelector('[data-mega-menu-trigger]');
      const panel = item.querySelector('[data-mega-menu-panel]');
      if (!trigger || !panel) return;

      panel.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      item.classList.remove('is-open');

      if (releaseTrap) {
        releaseTrap();
        releaseTrap = null;
      }

      const hide = () => { panel.hidden = true; };
      panel.addEventListener('transitionend', hide, { once: true });
      window.setTimeout(hide, 320); // fallback if no transition fires (reduced motion)

      if (openItem === item) openItem = null;
    }

    items.forEach((item) => {
      const trigger = item.querySelector('[data-mega-menu-trigger]');
      const panel = item.querySelector('[data-mega-menu-panel]');
      if (!trigger || !panel) return;

      item.addEventListener('mouseenter', () => {
        window.clearTimeout(hoverCloseTimer);
        openMenu(item);
      });
      item.addEventListener('mouseleave', () => {
        hoverCloseTimer = window.setTimeout(() => closeMenu(item), 150);
      });

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        if (item.classList.contains('is-open')) closeMenu(item);
        else openMenu(item);
      });

      // Close when focus leaves the item entirely (not just moving between
      // the trigger and the panel's own links).
      item.addEventListener('focusout', () => {
        window.setTimeout(() => {
          if (item.classList.contains('is-open') && !item.contains(document.activeElement)) {
            closeMenu(item);
          }
        }, 0);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !openItem) return;
      const trigger = openItem.querySelector('[data-mega-menu-trigger]');
      const item = openItem;
      closeMenu(item);
      if (trigger) trigger.focus();
    });

    document.addEventListener('click', (e) => {
      if (openItem && !openItem.contains(e.target)) closeMenu(openItem);
    });
  }

  /**
   * Mobile nav panel (part of component #2) — full-screen, 48px rows, CTA
   * pinned bottom. Not part of the public HaskoMotion interface; self-runs
   * on DOMContentLoaded like initReveal since no other module needs to
   * call it by name.
   */
  function initMobileNav() {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-nav]');
    const closeBtn = document.querySelector('[data-mobile-close]');
    if (!toggle || !panel) return;

    let releaseTrap = null;

    function open() {
      panel.hidden = false;
      void panel.offsetHeight;
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('quote-drawer-open'); // reuse the scroll-lock utility
      releaseTrap = trapFocus(panel);
      const firstLink = panel.querySelector('a, button');
      if (firstLink) firstLink.focus();
      document.addEventListener('keydown', onKeydown);
    }

    function close() {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('quote-drawer-open');
      if (releaseTrap) { releaseTrap(); releaseTrap = null; }
      document.removeEventListener('keydown', onKeydown);
      const hide = () => { panel.hidden = true; };
      panel.addEventListener('transitionend', hide, { once: true });
      window.setTimeout(hide, 320);
      toggle.focus();
    }

    function onKeydown(e) {
      if (e.key === 'Escape') close();
    }

    toggle.addEventListener('click', () => {
      if (panel.classList.contains('is-open')) close();
      else open();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
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

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initMobileNav();
  });

  return {
    initReveal,
    trapFocus,
    countUp,
    prefersReducedMotion,
    initStickyHeader,
    initMegaMenu,
  };
})();
