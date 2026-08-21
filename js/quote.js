/**
 * js/quote.js — quote drawer (closes 1.3, 2.6).
 *
 * One component, invoked from anywhere, always carrying context (machine of
 * interest, parts mode with machine + serial, route-selector pre-routing).
 * Reads window.HaskoMotion.trapFocus (motion.js loads first).
 *
 * No real backend exists in this demo. Submitting the form prevents the
 * default POST, runs the honeypot + timing spam checks, and shows the
 * success state locally — there is nothing wired to an actual mail/CRM
 * endpoint here.
 */
window.HaskoQuote = (function () {
  'use strict';

  const MIN_ELAPSED_MS = 3000; // reject submissions faster than a human could fill four required fields

  let drawer, backdrop, panel, form, titleEl, submitBtn;
  let machineField, applicationField, serialField, honeypotField;
  let successEl, errorEl;
  let releaseTrap = null;
  let triggerEl = null;
  let openedAt = 0;
  let isOpen = false;
  let ready = false;

  function cacheEls() {
    drawer = document.querySelector('[data-quote-drawer]');
    if (!drawer) return false;
    backdrop = drawer.querySelector('[data-quote-backdrop]');
    panel = drawer.querySelector('[data-quote-panel]');
    form = drawer.querySelector('[data-quote-form]');
    titleEl = drawer.querySelector('[data-quote-title]');
    submitBtn = drawer.querySelector('[data-quote-submit]');
    machineField = drawer.querySelector('[data-quote-machine]');
    applicationField = drawer.querySelector('[data-quote-application]');
    serialField = drawer.querySelector('[data-quote-serial]');
    honeypotField = drawer.querySelector('[data-quote-honeypot]');
    successEl = drawer.querySelector('[data-quote-success]');
    errorEl = drawer.querySelector('[data-quote-error]');
    return true;
  }

  function resetForm() {
    if (form) {
      form.reset();
      form.hidden = false;
    }
    if (successEl) successEl.hidden = true;
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
  }

  /**
   * HaskoQuote.open({ machine, mode, serial, application, trigger })
   * mode: 'quote' | 'parts' — changes the drawer title only; the field
   * list is identical either way (a parts request is a quote request
   * carrying a serial number).
   */
  function open(opts) {
    opts = opts || {};
    if (!drawer && !cacheEls()) return; // no drawer markup on this page
    if (!drawer) return;

    const machine = opts.machine || '';
    const mode = opts.mode === 'parts' ? 'parts' : 'quote';
    const serial = opts.serial || '';
    const application = opts.application || '';

    resetForm();

    if (titleEl) titleEl.textContent = mode === 'parts' ? 'Request a part' : 'Request a quote';
    if (submitBtn) submitBtn.textContent = mode === 'parts' ? 'Send request' : 'Send request';
    if (machineField) machineField.value = machine;
    if (applicationField) applicationField.value = application;
    if (serialField) serialField.value = serial;
    drawer.dataset.quoteMode = mode;

    triggerEl = opts.trigger || document.activeElement;
    openedAt = Date.now();

    // If a trigger fires open() again while the drawer is already open
    // (e.g. a second card's "Request a quote"), only refresh the content —
    // re-running the open choreography would stack a second global Esc
    // listener and a second focus trap on the same panel.
    if (isOpen) {
      const firstField = machineField || (form && form.querySelector('input, select, textarea'));
      if (firstField) firstField.focus();
      return;
    }

    drawer.hidden = false;
    void drawer.offsetHeight; // force reflow so the class toggle below animates in
    drawer.classList.add('is-open');
    document.documentElement.classList.add('quote-drawer-open');
    isOpen = true;

    releaseTrap = window.HaskoMotion ? window.HaskoMotion.trapFocus(panel) : null;

    document.addEventListener('keydown', onKeydown);
    if (backdrop) backdrop.addEventListener('click', close);

    const firstField = machineField || (form && form.querySelector('input, select, textarea'));
    if (firstField) firstField.focus();
    else if (panel) panel.focus();
  }

  function close() {
    if (!drawer || !isOpen) return;
    drawer.classList.remove('is-open');
    document.documentElement.classList.remove('quote-drawer-open');
    isOpen = false;

    document.removeEventListener('keydown', onKeydown);
    if (backdrop) backdrop.removeEventListener('click', close);
    if (releaseTrap) {
      releaseTrap();
      releaseTrap = null;
    }

    const hide = () => { if (!isOpen) drawer.hidden = true; };
    drawer.addEventListener('transitionend', hide, { once: true });
    window.setTimeout(hide, 320); // fallback if no transition fires (reduced motion)

    if (triggerEl && typeof triggerEl.focus === 'function') triggerEl.focus();
    triggerEl = null;
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!form) return;

    // Honeypot: a real visitor never fills a field that's off-screen and
    // aria-hidden. If it's filled, this is a bot — drop it silently rather
    // than confirming to the bot that the field mattered.
    if (honeypotField && honeypotField.value.trim() !== '') return;

    // Timing: a human takes more than three seconds to fill four required
    // fields. Faster than that is scripted. Drop it the same way — no
    // visible error, so a bot gets no signal either way.
    if (Date.now() - openedAt < MIN_ELAPSED_MS) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = 'Check the highlighted fields and try again.';
      }
      return;
    }

    if (errorEl) errorEl.hidden = true;

    // No backend exists in this demo — the success state is shown locally,
    // nothing is actually sent.
    form.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.focus();
    }
  }

  function init() {
    if (ready) return;
    if (!cacheEls()) return; // page has no quote drawer markup at all
    ready = true;

    drawer.querySelectorAll('[data-quote-close]').forEach((btn) => {
      btn.addEventListener('click', close);
    });
    if (form) form.addEventListener('submit', onSubmit);

    document.querySelectorAll('[data-open-quote]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        open({
          machine: trigger.dataset.quoteMachine || '',
          mode: trigger.dataset.quoteMode || 'quote',
          serial: trigger.dataset.quoteSerial || '',
          application: trigger.dataset.quoteApplication || '',
          trigger,
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { open, close };
})();
