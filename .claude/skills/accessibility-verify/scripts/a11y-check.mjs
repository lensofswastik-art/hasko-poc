#!/usr/bin/env node
/**
 * HASKO WCAG 2.1 AA harness.
 * Measures in the rendered page. Does not estimate.
 *
 *   node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html [--json]
 */
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const file = process.argv[2] || 'index.html';
const asJson = process.argv.includes('--json');
if (!existsSync(file)) { console.error(`not found: ${file}`); process.exit(2); }
const url = 'file://' + resolve(file);

/* Resolve a browser across environments: default install, an explicit
   PW_CHROMIUM path, or a system Chrome channel. */
async function launch() {
  const tries = [
    {},
    ...(process.env.PW_CHROMIUM ? [{ executablePath: process.env.PW_CHROMIUM }] : []),
    { executablePath: '/opt/pw-browsers/chromium' },
    { channel: 'chrome' },
    { channel: 'msedge' },
  ];
  let last;
  for (const opts of tries) {
    try { return await chromium.launch(opts); } catch (e) { last = e; }
  }
  console.error('\n  Could not launch a browser. Run:  npx playwright install chromium');
  console.error('  Or set PW_CHROMIUM to a Chrome/Chromium binary.\n');
  throw last;
}


const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url);
await page.waitForTimeout(1200);

const results = await page.evaluate(() => {
  const out = [];
  const push = (state, sc, sel, msg) => out.push({ state, sc, sel, msg });

  /* ---- colour helpers -------------------------------------------------- */
  const lum = c => {
    const m = c.match(/[\d.]+/g); if (!m) return null;
    const [r, g, b] = m.slice(0, 3).map(Number);
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    if (l1 == null || l2 == null) return null;
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const paintedBg = el => {
    let e = el;
    while (e && e !== document.documentElement) {
      const c = getComputedStyle(e).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) {
        const a = c.match(/[\d.]+/g);
        if (!a || a.length < 4 || parseFloat(a[3]) > 0.85) return c;
      }
      e = e.parentElement;
    }
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    if (bodyBg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bodyBg)) return bodyBg;
    const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
    if (htmlBg && !/rgba\(0, 0, 0, 0\)|transparent/.test(htmlBg)) return htmlBg;
    return 'rgb(255, 255, 255)';   // the canvas default
  };
  const label = el => {
    const cls = (el.className || '').toString().trim().split(/\s+/)[0];
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : cls ? '.' + cls : '');
  };
  const visible = el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  };

  /* ---- 1.4.3 contrast --------------------------------------------------- */
  let cFail = 0, cChecked = 0;
  document.querySelectorAll('p,h1,h2,h3,h4,h5,h6,a,span,li,td,th,label,button,legend,figcaption,cite,em,strong,dt,dd').forEach(el => {
    if (!el.textContent.trim() || el.children.length || !visible(el)) return;
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    const r = ratio(cs.color, paintedBg(el));
    if (r == null) return;
    cChecked++;
    if (r < need) {
      cFail++;
      if (cFail <= 12) push('FAIL', '1.4.3', label(el),
        `${cs.color} on ${paintedBg(el)} = ${r.toFixed(2)}:1, needs ${need}:1 (${Math.round(size)}px${bold ? ' bold' : ''})`);
    }
  });
  if (!cFail) push('PASS', '1.4.3', '', `${cChecked} text nodes all meet AA`);
  else if (cFail > 12) push('FAIL', '1.4.3', '', `…and ${cFail - 12} more`);

  /* ---- 1.1.1 alt text --------------------------------------------------- */
  const imgs = [...document.images];
  const noAlt = imgs.filter(i => !i.hasAttribute('alt'));
  noAlt.slice(0, 8).forEach(i => push('FAIL', '1.1.1', label(i), `missing alt: ${(i.currentSrc || i.src).split('/').pop()}`));
  if (!noAlt.length) push('PASS', '1.1.1', '', `${imgs.length}/${imgs.length} images have alt`);
  else if (noAlt.length > 8) push('FAIL', '1.1.1', '', `…and ${noAlt.length - 8} more`);

  /* ---- 3.3.2 / 1.3.1 labels --------------------------------------------- */
  let fFail = 0;
  const fields = [...document.querySelectorAll('input,select,textarea')]
    .filter(f => !['hidden', 'submit', 'button', 'reset'].includes(f.type));
  fields.forEach(f => {
    const byFor = f.id && document.querySelector(`label[for="${CSS.escape(f.id)}"]`);
    const wrapping = f.closest('label');
    const aria = f.getAttribute('aria-label') || f.getAttribute('aria-labelledby');
    const hasVisible = (byFor && visible(byFor)) || (wrapping && visible(wrapping));
    if (!hasVisible && !aria) {
      fFail++; push('FAIL', '3.3.2', label(f), 'no label at all');
    } else if (!hasVisible && f.placeholder) {
      fFail++; push('FAIL', '3.3.2', label(f), `placeholder used as the label ("${f.placeholder}")`);
    } else if (!hasVisible) {
      push('WARN', '3.3.2', label(f), 'aria-label only, no visible label');
    }
  });
  if (!fFail && fields.length) push('PASS', '3.3.2', '', `${fields.length} fields have visible labels`);

  /* ---- 4.1.2 ARIA state -------------------------------------------------- */
  let aFail = 0;
  document.querySelectorAll('[role=tab]').forEach(el => {
    if (el.getAttribute('aria-selected') == null) { aFail++; push('FAIL', '4.1.2', label(el), 'role=tab without aria-selected'); }
  });
  document.querySelectorAll('[aria-haspopup],[role=button][aria-expanded],details>summary').forEach(el => {
    if (el.tagName !== 'SUMMARY' && el.getAttribute('aria-expanded') == null) {
      push('WARN', '4.1.2', label(el), 'popup trigger without aria-expanded');
    }
  });
  const tabs = document.querySelectorAll('[role=tab]');
  if (tabs.length) {
    const zero = [...tabs].filter(t => t.getAttribute('tabindex') === '0').length;
    if (zero > 1) push('WARN', '4.1.2', '[role=tab]', `${zero} tabs are tabindex=0 — roving tabindex missing`);
  }
  if (!aFail) push('PASS', '4.1.2', '', 'ARIA widgets report state');

  /* ---- 2.5.5 target size ------------------------------------------------- */
  let tFail = 0;
  document.querySelectorAll('a,button,input[type=checkbox],input[type=radio],select,summary,[role=button]').forEach(el => {
    if (!visible(el)) return;
    const r = el.getBoundingClientRect();
    if (el.closest('p,li') && el.tagName === 'A') return;      // inline prose links are exempt
    if (r.width < 44 || r.height < 44) {
      tFail++;
      if (tFail <= 8) push('FAIL', '2.5.5', label(el), `${Math.round(r.width)}×${Math.round(r.height)}px, needs 44×44`);
    }
  });
  if (!tFail) push('PASS', '2.5.5', '', 'all targets ≥ 44×44');
  else if (tFail > 8) push('FAIL', '2.5.5', '', `…and ${tFail - 8} more`);

  /* ---- 1.3.1 headings ---------------------------------------------------- */
  const h1s = [...document.querySelectorAll('h1')];
  if (h1s.length === 0) push('FAIL', '1.3.1', '', 'no <h1>');
  else if (h1s.length > 1) push('WARN', '1.3.1', '', `${h1s.length} <h1> elements`);
  else {
    const t = h1s[0].textContent.trim();
    if (/^(home|welcome|index|page)$/i.test(t)) push('FAIL', '1.3.1', 'h1', `<h1> is the generic word "${t}" — audit finding 1.4`);
    else push('PASS', '1.3.1', '', `<h1> "${t.slice(0, 48)}${t.length > 48 ? '…' : ''}"`);
  }
  let prev = 0, skip = false;
  document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
    const lv = +h.tagName[1];
    if (prev && lv > prev + 1) skip = true;
    prev = lv;
  });
  if (skip) push('WARN', '1.3.1', '', 'heading level skipped');

  /* ---- 2.4.7 focus visibility ------------------------------------------- */
  const focusables = [...document.querySelectorAll('a,button,input,select,textarea,[tabindex]')].filter(visible);
  push('INFO', '2.4.7', '', `${focusables.length} focusable elements — tab through by hand`);

  /* ---- 3.1.1 / 2.4.2 ---------------------------------------------------- */
  if (!document.documentElement.lang) push('FAIL', '3.1.1', 'html', 'no lang attribute');
  else push('PASS', '3.1.1', '', `lang="${document.documentElement.lang}"`);
  const title = (document.title || '').trim();
  if (!title || title.length < 10) push('FAIL', '2.4.2', '', `weak <title>: "${title}"`);
  else push('PASS', '2.4.2', '', `title "${title.slice(0, 48)}"`);

  return out;
});

/* ---- 2.3.3 reduced motion — reload emulating it -------------------------- */
const rm = await browser.newContext({ reducedMotion: 'reduce' });
const rmPage = await rm.newPage({ viewport: { width: 1280, height: 900 } });
await rmPage.goto(url);
await rmPage.waitForTimeout(900);
const rmResult = await rmPage.evaluate(() => {
  const hidden = [...document.querySelectorAll('.reveal, [data-reveal]')].filter(el => {
    const s = getComputedStyle(el);
    return parseFloat(s.opacity) < 0.9 || (s.transform !== 'none' && s.transform !== 'matrix(1, 0, 0, 1, 0, 0)');
  });
  return { total: document.querySelectorAll('.reveal,[data-reveal]').length, stuck: hidden.length };
});
if (rmResult.stuck > 0) {
  results.push({ state: 'FAIL', sc: '2.3.3', sel: '.reveal',
    msg: `${rmResult.stuck}/${rmResult.total} reveal elements stay hidden under prefers-reduced-motion` });
} else {
  results.push({ state: 'PASS', sc: '2.3.3', sel: '',
    msg: rmResult.total ? `${rmResult.total} reveal elements render at final state` : 'no reveal elements' });
}

await browser.close();

/* ---- report -------------------------------------------------------------- */
if (asJson) { console.log(JSON.stringify(results, null, 2)); }
else {
  console.log(`\n  ${file} — WCAG 2.1 AA\n`);
  const ORDER = { FAIL: 0, WARN: 1, PASS: 2, INFO: 3 };
  results.sort((a, b) => ORDER[a.state] - ORDER[b.state] || a.sc.localeCompare(b.sc));
  for (const r of results) {
    console.log(`  ${r.state.padEnd(5)} ${r.sc.padEnd(7)} ${(r.sel || '').padEnd(24)} ${r.msg}`);
  }
  const fails = results.filter(r => r.state === 'FAIL').length;
  const warns = results.filter(r => r.state === 'WARN').length;
  console.log(fails
    ? `\n  ${fails} failures, ${warns} warnings — not AA compliant\n`
    : `\n  ✓ AA compliant${warns ? ` — ${warns} warnings to review` : ''}\n`);
}

process.exit(results.some(r => r.state === 'FAIL') ? 1 : 0);
