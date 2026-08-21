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

  /**
   * Bulk-observes every [data-count-to] element (hero proof strip, later
   * the section 06 proof stats) and fires the single-element countUp()
   * once per element on entry, via IntersectionObserver.unobserve so it
   * never re-fires. Static under reduced motion — and note every
   * [data-count-to] element already carries its correct final number as
   * literal markup (e.g. <span data-count-to="96">96</span>), so a page
   * with JS disabled, or reduced motion before this ever runs, never
   * shows "0": this function only ever re-triggers the animation on top
   * of an already-correct value, it doesn't supply the value.
   *
   * Elements already on screen are fired via a direct
   * getBoundingClientRect() check rather than waiting on the observer's
   * first callback, AND that check runs twice — once immediately, once
   * again after document.fonts.ready. The double-check matters: at the
   * moment DOMContentLoaded fires, Instrument Sans/Geist/Geist Mono
   * haven't loaded yet, so the hero renders in fallback system fonts,
   * which measure taller — enough to push the proof strip a few pixels
   * below a short viewport. An immediate-only check misjudges it as
   * off-screen there; once the real fonts swap in (font-display:swap)
   * the layout settles shorter and the strip is back on screen, which
   * document.fonts.ready catches directly instead of waiting on the
   * IntersectionObserver to eventually notice the reflow on its own. A
   * `fired` set guards against the observer and either manual check
   * both racing to fire the same element.
   */
  function initCountUp() {
    const targets = document.querySelectorAll('[data-count-to]');
    if (!targets.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => { el.textContent = el.dataset.countTo; });
      return;
    }

    const fired = new Set();

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !fired.has(entry.target)) {
            fired.add(entry.target);
            countUp(entry.target, { duration: 900 });
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    function checkAndFire() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      targets.forEach((el) => {
        if (fired.has(el)) return;
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          fired.add(el);
          countUp(el, { duration: 900 });
          observer.unobserve(el);
        }
      });
    }

    targets.forEach((el) => observer.observe(el));
    checkAndFire();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(checkAndFire);
    }
  }

  /**
   * Drifts every [data-parallax] element (the hero machine visual) up to
   * 4% of its own height as it crosses the viewport, transform-only.
   * Skips attaching the scroll listener at all under reduced motion —
   * belt-and-braces alongside the `[data-parallax] { transform: none
   * !important }` rule already in tokens.css, which is what actually
   * guarantees the element renders at rest if this ever ran anyway.
   */
  function initParallax() {
    const targets = document.querySelectorAll('[data-parallax]');
    if (!targets.length || prefersReducedMotion()) return;

    let ticking = false;

    function update() {
      const vh = window.innerHeight || 1;
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const clamped = Math.max(-1, Math.min(1, progress));
        const drift = clamped * (rect.height * 0.04);
        el.style.transform = `translateY(${drift.toFixed(1)}px)`;
      });
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
   * Hero primary CTA (component-adjacent, closes 1.4 alongside the
   * markup): a native <details data-hero-select>/<summary> disclosure
   * already opens and closes with zero JS, and already exposes its state
   * to assistive tech natively. This only layers on the two behaviours
   * native <details> doesn't give you for free — Escape closes it and
   * returns focus to the trigger, and a click outside closes it too.
   */
  function initHeroApplicationSelector() {
    const details = document.querySelector('[data-hero-select]');
    if (!details) return;

    document.addEventListener('click', (e) => {
      if (details.open && !details.contains(e.target)) details.removeAttribute('open');
    });

    details.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && details.open) {
        details.removeAttribute('open');
        const trigger = details.querySelector('summary');
        if (trigger) trigger.focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initMobileNav();
    initCountUp();
    initParallax();
    initHeroApplicationSelector();
  });

  return {
    initReveal,
    trapFocus,
    countUp,
    prefersReducedMotion,
    initStickyHeader,
    initMegaMenu,
    initCountUp,
    initParallax,
    initHeroApplicationSelector,
  };
})();
