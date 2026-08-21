#!/usr/bin/env node
/**
 * HASKO design-token validator.
 * Finds hardcoded values where a token exists, the banned colour,
 * off-scale spacing, motion outside the vocabulary, and reduced-motion gaps.
 *
 *   node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs [dir]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.argv[2] || '.';
const SKIP = new Set(['node_modules', '.git', '.claude', '.qa', 'dist']);
const TOKENS_FILE = 'tokens.css';

const SPACING = new Set([0, 1, 2, 3, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160]);
const DURATIONS = new Set([160, 200, 240, 280, 680, 70, 900]);
const EASINGS = [
  'cubic-bezier(.4,0,.2,1)', 'cubic-bezier(0.4,0,0.2,1)',
  'cubic-bezier(.2,.7,.3,1)', 'cubic-bezier(0.2,0.7,0.3,1)',
  'cubic-bezier(.4,0,1,1)',  'cubic-bezier(0.4,0,1,1)',
  'linear', 'steps',
];

const findings = [];
const add = (sev, file, line, msg, fix) =>
  findings.push({ sev, file, line, msg, fix });

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (['.css', '.html', '.js'].includes(extname(p))) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
if (!files.length) {
  console.log('No .css/.html/.js files found under', ROOT);
  process.exit(0);
}

let sawReducedMotion = false;
let motionUsers = [];

for (const file of files) {
  const rel = relative(ROOT, file) || file;
  const isTokens = rel.endsWith(TOKENS_FILE);
  const src = readFileSync(file, 'utf8');

  /* Blank out /* … *\/ blocks so commented-out code and prose that mentions a
     banned value are not reported. Newlines are preserved so line numbers hold. */
  const stripped = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  const lines = stripped.split('\n');

  if (/prefers-reduced-motion/.test(src)) sawReducedMotion = true;

  lines.forEach((raw, i) => {
    const n = i + 1;
    const l = raw.trim();
    if (l.startsWith('//')) return;

    /* 1 — the banned colour, anywhere including markup and JS */
    if (/62ACDA/i.test(raw)) {
      add('CRITICAL', rel, n, `#62ACDA — 2.49:1 on white, fails AA`, 'var(--ink) for text, var(--red-deep) for red text — no blue in this system  [audit 1.5]');
    }

    /* 2 — dead Google+ link */
    if (/plus\.google/i.test(raw)) {
      add('CRITICAL', rel, n, 'Google+ link — service closed April 2019', 'remove  [audit 3.1]');
    }

    /* 3 — "View" as a pseudo-element */
    if (/content:\s*["']View["']/i.test(raw)) {
      add('HIGH', rel, n, '"View" as CSS generated content', 'real text in a real element  [audit 3.3]');
    }

    if (isTokens || !file.endsWith('.css')) return;

    /* 4 — hardcoded colour where a token exists */
    const hex = raw.match(/#[0-9a-f]{3,8}\b/gi);
    if (hex) {
      for (const h of hex) {
        if (/62ACDA/i.test(h)) continue; // already reported
        add('HIGH', rel, n, `hardcoded colour ${h}`, 'use a --token from tokens.css');
      }
    }

    /* 5 — off-scale spacing */
    const sp = raw.match(/\b(?:margin|padding|gap|top|bottom|left|right)[^:]*:\s*([^;]+);/i);
    if (sp) {
      for (const m of sp[1].matchAll(/(-?\d+(?:\.\d+)?)px/g)) {
        const v = Math.abs(parseFloat(m[1]));
        if (v && !SPACING.has(v)) {
          const near = [...SPACING].reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);
          add('MEDIUM', rel, n, `spacing ${m[1]}px is off-scale`, `nearest step ${near}px`);
        }
      }
    }

    /* 6 — duration outside the vocabulary */
    for (const m of raw.matchAll(/(?:transition|animation)[^:]*:\s*[^;]*?(\d+)ms/gi)) {
      const v = parseInt(m[1], 10);
      if (!DURATIONS.has(v)) {
        add('MEDIUM', rel, n, `duration ${v}ms outside the motion vocabulary`,
          '160 / 200 / 240 / 280 / 680 ms');
      }
    }

    /* 7 — easing outside the vocabulary */
    for (const m of raw.matchAll(/cubic-bezier\([^)]+\)/gi)) {
      const e = m[0].replace(/\s/g, '');
      if (!EASINGS.some(ok => e === ok.replace(/\s/g, ''))) {
        add('MEDIUM', rel, n, `easing ${m[0]} outside the vocabulary`,
          '--ease-standard / --ease-pop / --ease-exit');
      }
    }

    /* 8 — body type below the floor */
    const fs = raw.match(/font-size:\s*(\d+(?:\.\d+)?)px/i);
    if (fs && parseFloat(fs[1]) < 14) {
      add('MEDIUM', rel, n, `font-size ${fs[1]}px below the 14px floor`, 'body is 16.5px  [audit 2.x]');
    }

    /* 9 — focus removed with no replacement */
    if (/outline:\s*(none|0)/i.test(raw)) {
      const ctx = lines.slice(i, i + 6).join(' ');
      if (!/outline|box-shadow|border/.test(ctx.replace(/outline:\s*(none|0)/i, ''))) {
        add('HIGH', rel, n, 'outline removed with no visible replacement', 'WCAG 2.4.7');
      }
    }

    if (/transform|transition|animation/.test(l)) motionUsers.push(rel);
  });
}

if (motionUsers.length && !sawReducedMotion) {
  add('HIGH', 'project', 0,
    'motion is used but no prefers-reduced-motion block exists anywhere',
    'add the escape block from tokens.css  [WCAG 2.3.3]');
}

/* ---- report -------------------------------------------------------------- */
const ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
findings.sort((a, b) => ORDER[a.sev] - ORDER[b.sev] || a.file.localeCompare(b.file) || a.line - b.line);

if (!findings.length) {
  console.log(`\n  ✓ design system clean — ${files.length} files checked\n`);
  process.exit(0);
}

console.log('');
for (const f of findings) {
  const loc = f.line ? `${f.file}:${f.line}` : f.file;
  console.log(`  ${f.sev.padEnd(9)} ${loc.padEnd(34)} ${f.msg}`);
  console.log(`  ${''.padEnd(9)} ${''.padEnd(34)} → ${f.fix}`);
}

const counts = findings.reduce((a, f) => (a[f.sev] = (a[f.sev] || 0) + 1, a), {});
const critical = counts.CRITICAL || 0;
console.log(`\n  ${findings.length} issues — ` +
  Object.entries(counts).map(([k, v]) => `${v} ${k.toLowerCase()}`).join(', ') + '\n');

process.exit(critical ? 1 : 0);
