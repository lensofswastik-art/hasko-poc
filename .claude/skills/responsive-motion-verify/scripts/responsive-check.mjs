#!/usr/bin/env node
/**
 * HASKO responsive + motion harness.
 *
 *   node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html [--shots]
 */
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const file = process.argv[2] || 'index.html';
const shots = process.argv.includes('--shots');
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

const BREAKPOINTS = [390, 768, 1024, 1280, 1440];
if (shots) mkdirSync('.qa', { recursive: true });

const browser = await launch();
const rows = [];
const say = (bp, kind, msg) => rows.push({ bp, kind, msg });

for (const w of BREAKPOINTS) {
  const page = await browser.newPage({ viewport: { width: w, height: w < 500 ? 844 : 900 } });
  await page.goto(url);
  await page.waitForTimeout(1000);
  // settle any scroll-triggered reveals
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  const r = await page.evaluate(vw => {
    const out = { overflow: null, hero: null, targets: [], small: [], lines: [] };
    const name = el => {
      const c = (el.className || '').toString().trim().split(/\s+/)[0];
      return el.tagName.toLowerCase() + (el.id ? '#' + el.id : c ? '.' + c : '');
    };

    if (document.documentElement.scrollWidth > vw + 1) {
      let worst = null, worstW = 0;
      document.querySelectorAll('*').forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.right > vw + 1 && b.width > worstW && b.width < 6000) { worstW = b.width; worst = el; }
      });
      out.overflow = {
        scrollWidth: document.documentElement.scrollWidth,
        widest: worst ? name(worst) : 'unknown',
        width: Math.round(worstW),
      };
    }

    if (vw < 500) {
      const hero = document.querySelector('.hero, [data-section="hero"], header + section, main > section:first-of-type');
      if (hero) {
        const h = hero.getBoundingClientRect().height;
        const svh = window.innerHeight;
        if (h > svh + 8) out.hero = { h: Math.round(h), svh: Math.round(svh) };
      }
      document.querySelectorAll('a,button,select,summary,[role=button],input[type=checkbox],input[type=radio]').forEach(el => {
        const b = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        if (!b.width || s.display === 'none' || s.visibility === 'hidden') return;
        if (el.closest('p,li') && el.tagName === 'A') return;
        if (b.width < 44 || b.height < 44) out.targets.push(`${name(el)} ${Math.round(b.width)}×${Math.round(b.height)}`);
      });
    }

    document.querySelectorAll('p,li,span,td,label,figcaption').forEach(el => {
      if (!el.textContent.trim() || el.children.length) return;
      const s = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      if (!b.width) return;
      const fs = parseFloat(s.fontSize);
      if (fs < 14) out.small.push(`${name(el)} ${fs}px`);
      const ch = el.textContent.trim().length;
      if (ch > 40) {
        const perLine = Math.round(b.width / (fs * 0.5));
        if (perLine > 80) out.lines.push(`${name(el)} ~${perLine} chars`);
      }
    });

    out.targets = [...new Set(out.targets)].slice(0, 6);
    out.small   = [...new Set(out.small)].slice(0, 6);
    out.lines   = [...new Set(out.lines)].slice(0, 4);
    return out;
  }, w);

  if (r.overflow) say(w, 'OVERFLOW', `scrollWidth ${r.overflow.scrollWidth} > ${w} — widest: ${r.overflow.widest} (${r.overflow.width}px)`);
  if (r.hero)     say(w, 'HERO',     `${r.hero.h}px > ${r.hero.svh} svh — content below the fold`);
  r.targets.forEach(t => say(w, 'TARGET', `${t}, needs 44×44`));
  r.small.forEach(s   => say(w, 'TYPE',   `${s} below the 14px floor`));
  r.lines.forEach(l   => say(w, 'LINE',   `${l}, max 80`));
  if (!r.overflow && !r.hero && !r.targets.length && !r.small.length && !r.lines.length) say(w, 'ok', '');

  if (shots) await page.screenshot({ path: `.qa/${w}.png`, fullPage: true });
  await page.close();
}

/* ---- motion ------------------------------------------------------------- */
const rm = await browser.newContext({ reducedMotion: 'reduce' });
const rmPage = await rm.newPage({ viewport: { width: 1280, height: 900 } });
await rmPage.goto(url);
await rmPage.waitForTimeout(1000);
const motion = await rmPage.evaluate(() => {
  const stuck = [];
  document.querySelectorAll('.reveal,[data-reveal],[data-parallax]').forEach(el => {
    const s = getComputedStyle(el);
    const t = s.transform;
    if (parseFloat(s.opacity) < 0.9 || (t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)')) {
      const c = (el.className || '').toString().trim().split(/\s+/)[0];
      stuck.push(el.tagName.toLowerCase() + (c ? '.' + c : ''));
    }
  });

  const OK_MS = new Set([160, 200, 240, 280, 680, 900, 70]);
  const odd = new Set();
  for (const sh of document.styleSheets) {
    try {
      const walk = rs => { for (const r of rs) {
        if (r.cssRules) walk(r.cssRules);
        if (!r.style) continue;
        const v = (r.style.transition || '') + ' ' + (r.style.animation || '') +
                  ' ' + (r.style.transitionDuration || '') + ' ' + (r.style.animationDuration || '');
        for (const m of v.matchAll(/(\d+(?:\.\d+)?)m?s\b/g)) {
          let ms = parseFloat(m[1]);
          if (!m[0].includes('ms')) ms *= 1000;
          if (ms > 0 && !OK_MS.has(Math.round(ms))) odd.add(Math.round(ms) + 'ms');
        }
      }};
      walk(sh.cssRules);
    } catch {}
  }
  return { stuck: [...new Set(stuck)], total: document.querySelectorAll('.reveal,[data-reveal]').length, odd: [...odd].slice(0, 8) };
});

if (motion.stuck.length) say('RM', 'STUCK', `${motion.stuck.length}/${motion.total} elements hidden under reduced motion: ${motion.stuck.slice(0, 5).join(', ')}`);
else say('RM', 'ok', motion.total ? `${motion.total} reveal elements render at final state` : 'no reveal elements');
if (motion.odd.length) say('RM', 'DURATION', `outside the vocabulary: ${motion.odd.join(', ')} — expected 160/200/240/280/680`);

if (shots) { await rmPage.screenshot({ path: '.qa/reduced-motion.png', fullPage: true }); }
await browser.close();

/* ---- report -------------------------------------------------------------- */
console.log(`\n  ${file} — responsive & motion\n`);
for (const r of rows) {
  if (r.kind === 'ok') console.log(`  ${String(r.bp).padEnd(6)} ok${r.msg ? '  ' + r.msg : ''}`);
  else console.log(`  ${String(r.bp).padEnd(6)} ${r.kind.padEnd(9)} ${r.msg}`);
}
const issues = rows.filter(r => r.kind !== 'ok').length;
console.log(issues ? `\n  ${issues} issues\n` : `\n  ✓ clean across ${BREAKPOINTS.join(', ')} and reduced motion\n`);
if (shots) console.log('  screenshots in .qa/\n');
process.exit(issues ? 1 : 0);
