# HASKO Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full HASKO Inc. landing page demo — 13 sections, the machine detail template, and the 404 page — as a static HTML/CSS/vanilla-JS site that closes 23 of the 24 measured UX audit findings and beats all 8 competitor conventions plus both field gaps, per `CLAUDE.md`.

**Architecture:** One `index.html` assembled section-by-section (00–12) on top of a shared design-token system, a 16-component library (`css/components.css`), section-specific layout (`css/sections.css`), and three vanilla-JS modules (`finder.js`, `motion.js`, `quote.js`). `machine.html` is a single worked template (SR-36) reused as the pattern for all 21 machines. `404.html` is a standalone error page. Machine data lives in `data/machines.json`. Every section is built, then verified against three scripts and one visual pass, before the next section starts — this is the project's own prescribed loop (`AGENTS.md`), not a generic process invented for this plan.

**Tech Stack:** Plain HTML5 + CSS (custom properties, no preprocessor) + vanilla JS (ES modules, no bundler). No framework, no build step. Playwright (dev dependency only, drives the verifier scripts headlessly — never shipped).

**Spec:** `/Users/swastikbose/Claude (Happening)/output/Hasko/hasko-poc/CLAUDE.md` (self-contained: audit, tokens, wireframes, final copy) and `/Users/swastikbose/Claude (Happening)/output/Hasko/hasko-poc/AGENTS.md` (agent/skill workflow). Both travel with this plan — every task below points at exact sections of `CLAUDE.md` rather than re-quoting them.

---

## Two decisions already made, and why they matter to every phase

**1. Tech stack: plain HTML/CSS/JS, not the Next.js scaffold.** `hasko-poc` currently contains a 100%-untouched `create-next-app` scaffold (`app/page.tsx`, `app/layout.tsx` are stock boilerplate — nothing custom in either). `CLAUDE.md` §10 mandates "Plain HTML + CSS + vanilla JS. No framework," with a specific file structure and a stated performance rationale (199 KB / 1.75 s budget, zero-build open-from-file requirement). Confirmed with you directly — this plan targets that stack. The Next.js scaffold (`app/`, `next.config.ts`, `tsconfig.json`, `package.json`'s next/react deps, `node_modules/`, `.next/`) is left in place but unused; Phase 0 does not touch it, and removing it is an optional cleanup at the very end, not part of this plan.

**2. The prebuilt agent/skill kit exists, but one hue behind the brief — it needs reconciling before first use, not just copying.** The five agents and four skills AGENTS.md refers to (`section-builder`, `design-system-guardian`, `accessibility-auditor`, `visual-qa`, `audit-verifier`; `hasko-design-system`, `hasko-section-specs`, `accessibility-verify`, `responsive-motion-verify`) live in the sibling folder `../hasko-kit/.claude/`, not in `hasko-poc/`. I read every one of them. They are an **earlier revision** of the design system than the one in `CLAUDE.md`:

| | `hasko-kit` skill kit (older) | `CLAUDE.md` (current, authoritative) |
|---|---|---|
| Palette | Red **+ blue** (`--blue: #1C5CAB` for links/data/focus rings/chip fills) | **No blue at all** — `CLAUDE.md` §1.5 explains the deeper finding (three mismatched brand colours, logo is pure red) and drops blue entirely. Eight-step red ramp instead. |
| Fonts | Archivo + JetBrains Mono | Instrument Sans + Geist + Geist Mono |
| Focus ring | `2px solid var(--blue)` | `2px solid var(--focus)` — ink on light, white on dark. "Never a red focus ring" and no blue exists to use instead |
| `validate-tokens.mjs` | Suggests `var(--blue) #1C5CAB` as the fix for the banned `#62ACDA` | Would actively recommend re-introducing the exact colour family `CLAUDE.md` eliminates |

`CLAUDE.md` §0 says it is self-contained and the skills carry "deeper reference" — that's true structurally (agent workflow, script logic, component anatomy), but not true for the specific token values in `references/tokens.css`, `references/components.md`, `references/sections.md`, and one line of `validate-tokens.mjs`. Phase 0 patches exactly those four files so every downstream agent invocation reads the current palette. Skipping this step would let `section-builder` faithfully reproduce the *old* audit's fix — reintroducing a banned colour family under a different name.

---

## Global Constraints

Copied verbatim from `CLAUDE.md` §9 and §13 — every task below implicitly includes these.

- **No carousel.** Not in the hero, not anywhere (audit 1.4).
- **Never `#62ACDA`.** 2.49:1 on white. No blue anywhere in this system.
- **Never `#FF0000` as text or as a fill behind text.** `--red-mark` reproduces the logo only.
- **Never `--red` on a dark band.** Dark bands carry class `.on-dark`, which swaps `--red` → `--red-light` and `--focus` → white.
- **Never a red focus ring.** Focus ring is always `var(--focus)` (ink on light, white on dark).
- **Never a placeholder as a form label.** Every field gets a visible `<label>`.
- **Never an image without `alt`.** Decorative gets `alt=""`.
- **Never `role="tab"` without managing `aria-selected`.** (Simplest compliant path: don't use tabs at all — nothing in this build requires them.)
- **No lorem ipsum.** Copy in `CLAUDE.md` §6 is final — do not paraphrase, do not substitute.
- **No invented machine specifications.** Only SR Series specs in `data/machines.json` are real; every other machine is `"_status": "placeholder"` and any UI showing its specs renders a `PLACEHOLDER` badge.
- **No fictional testimonials.** Only the Roger Isaacs quote is real. The other two proof slots render an awaiting-content state or are omitted — never invented.
- **No page builder, jQuery, or carousel library.**
- Body text is **16.5px, never 14px** (`--fs-body`). `--fs-small` (14px) and `--fs-index` (11px, mono, uppercase, letter-spaced) are legitimate exceptions — see the validator caveat below.
- **Geist Mono for every number** a buyer reads as data — specs, model codes, capacities, part numbers, file sizes, result counts, section indices.
- Minimum touch target **44×44px**.
- Inline links: ink + underline, never colour alone (WCAG 1.4.1).
- Status colour always paired with an icon and a word.
- `prefers-reduced-motion: reduce` fully honoured — content renders at final state, never stuck at `opacity: 0`.
- **Performance budget:** total < 900 KB, JS uncompressed < 120 KB, LCP < 2.0 s on 4G, CLS < 0.05, fonts `woff2`/subset/`font-display: swap`, images lazy below the fold with explicit dimensions.
- **Responsive:** no horizontal overflow at 390 / 768 / 1024 / 1280 / 1440, hero fits `100svh` on mobile, readable at 200% zoom.
- **Imagery, three treatments, never mixed inside one component:** in-plant documentary (hero, industry cards, proof, parts), machine-on-seamless (`--surface-3`, catalogue cards, machine page), blueprint line work (backgrounds/dividers, `--ink` 6–8%, never behind body text). **No real Hasko photography exists in this repo.** Per `CLAUDE.md` §4's own fallback ("if all 21 machines cannot be reshot, use one consistent silhouette treatment on the seamless grey — consistency beats fidelity"), every phase below uses generated placeholder treatments — flat seamless-grey panels with a simple line-art machine silhouette for catalogue imagery, CSS gradients for in-plant documentary bands, and inline SVG line work for blueprint texture — never a fabricated photograph presented as real. This keeps faith with the same honesty principle that governs specs and testimonials: a client spotting a fake photo of their own plant is worse than an honest placeholder.
- **Known validator false-positive, do not "fix" around it:** `validate-tokens.mjs`'s check 8 flags any `font-size` under 14px. `--fs-index` (11px, mono, uppercase, `0.14em` tracking — section indices, category eyebrows) is spec-correct at that size. When the script flags it, verify the element is genuinely an index/eyebrow label per `CLAUDE.md`'s type scale table, then leave it — do not inflate it to 14px to silence the tool.

---

## File Structure

```
hasko-poc/
├── index.html                the landing page, sections 00–12
├── machine.html              machine detail template (SR-36 worked example)
├── 404.html                  error page
├── css/
│   ├── tokens.css            ONLY place values are defined (from CLAUDE.md §4, verbatim)
│   ├── base.css              reset, font loading, type scale, grid/layout primitives
│   ├── components.css        the 16 components, built once each, reused across sections
│   └── sections.css          section-specific layout only — no component definitions here
├── js/
│   ├── finder.js             filter/compare/URL state, machine-card rendering, zero-result panel
│   ├── motion.js             scroll reveal, count-up, sticky header, mega-menu, focus trap, dialog helpers
│   └── quote.js              quote drawer: open/close, focus trap, validation, honeypot
├── data/
│   └── machines.json         moved from repo root — 21 machines, taxonomy, specs (SR Series real, rest placeholder)
├── assets/
│   ├── machines/              one reusable seamless-grey silhouette treatment (svg/png), referenced per machine
│   ├── blueprint/              inline-SVG blueprint line-art fragments (header bg, section dividers, parts diagram)
│   └── haskologo.svg           moved from public/ — the real two-colour mark, #FF0000 on white
├── .qa/                       screenshot output from responsive-check.mjs --shots (gitignored)
└── .claude/
    ├── agents/                copied from ../hasko-kit/.claude/agents/, unmodified (workflow logic is current)
    └── skills/                copied from ../hasko-kit/.claude/skills/, four reference files patched in Phase 0
```

## Shared JS Interfaces

Defined once here so every phase that touches JS uses identical names — the self-review pass in `superpowers:writing-plans` calls this out explicitly as a common plan bug.

```js
// js/quote.js — exposed as window.HaskoQuote
HaskoQuote.open({
  machine: string | null,      // model code, pre-fills and is still editable
  mode: 'quote' | 'parts',     // 'parts' shows the parts-specific framing/copy
  serial: string | null,       // pre-fills serial number field, parts mode only
  application: string | null,  // pre-fills "what are you making", optional
  trigger: HTMLElement | null, // element focus returns to on close
});
HaskoQuote.close();

// js/finder.js — exposed as window.HaskoFinder
HaskoFinder.machineCardHTML(machine: MachineRecord): string;   // returns the 7-element card markup, reused by finder grid AND machine.html's related-machines block
HaskoFinder.applyFiltersFromURL(): void;                        // reads ?application=&process=&width=&hp=&q= on load
HaskoFinder.renderResults(): void;                               // filters data/machines.json, updates #finder-count via aria-live, writes URL
HaskoFinder.compare: { selected: string[] };                     // up to 3 machine slugs, drives the compare tray

// js/motion.js — exposed as window.HaskoMotion
HaskoMotion.initReveal(root?: Element): void;      // IntersectionObserver on .reveal within root (default: document)
HaskoMotion.initCountUp(root?: Element): void;      // [data-count-to] elements count up once on entry
HaskoMotion.initStickyHeader(): void;               // condenses header past 120px scroll
HaskoMotion.initMegaMenu(): void;                   // hover + click/Enter open, Esc close, focus trap
HaskoMotion.trapFocus(el: HTMLElement): () => void; // returns a release function; used by quote drawer, mega-menu, filter bottom-sheet
```

`MachineRecord` is the shape already defined in `data/machines.json` — `model`, `name`, `slug`, `category`, `process[]`, `applications[]`, `description`, `capability`, `image`, `specs{}`, `_status`.

---

## Component → Phase map (build once, reuse — never duplicate)

| # | Component | Built in | Reused in |
|---|---|---|---|
| 1 | Announcement bar | Phase 3 | — |
| 2 | Header + mega-menu | Phase 1 | every page |
| 3 | Quote drawer | Phase 1 | every page |
| 4 | Machine card | Phase 5 | Phase 6 (related machines) |
| 5 | Spec table | Phase 6 | — |
| 6 | Filter rail + chips | Phase 5 | — |
| 7 | Compare tray | Phase 5 | — |
| 8 | Zero-result panel | Phase 5 | — |
| 9 | Industry card | Phase 4 | Phase 1 (mega-menu thumbnails, smaller variant) |
| 10 | Testimonial block | Phase 7 | Phase 6 (two-way link back from MPEM-C page) |
| 11 | Parts lookup | Phase 8 | — |
| 12 | Document row | Phase 8 | Phase 10 (resources) |
| 13 | Process rail | Phase 9 | — |
| 14 | Sticky-centre band | Phase 9 | — |
| 15 | Route selector | Phase 11 | — |
| 16 | Footer | Phase 1 | every page |

## Audit finding → Phase map (target: 23 of 24; 1.1 is out of scope)

| Phase | Findings closed |
|---|---|
| 0 | 1.5 (token layer) |
| 1 | 1.5 (nav contrast), 2.1 (Industries in primary nav), 2.6 (quote drawer fields), 3.1 (no Google+), 3.8 (footer nav), convention 6 |
| 2 | 1.4, convention 1 |
| 3 | 3.9, convention 7, convention 8 |
| 4 | 2.1 (industry paths built), convention 2 (partial) |
| 5 | 2.3, 3.3, 3.4, 3.6, convention 2 (complete), convention 3, field gap +2 |
| 6 | 1.3, 1.6, 2.8, 2.9, 3.7, convention 4, convention 5 |
| 7 | 2.2, field gap +1 |
| 8 | 2.4 |
| 9 | (offensive section, not an audit fix — no finding number) |
| 10 | 3.2 |
| 11 | 2.5 |
| 12 | 1.2 |
| 13 (cumulative, verified) | 2.7 (alt coverage, checked every phase, confirmed here), 3.5 (imagery consistency, confirmed here) |

23 numbered findings plus both field gaps and all 8 conventions. 1.1 (news archive) stays `N/A — template fix` per `CLAUDE.md`.

---

## Phase 0: Reconcile the design-system kit and scaffold the file structure

No visible output yet — this phase makes every later phase's tooling trustworthy.

**Files:**
- Create: `.claude/agents/*.md` (copied), `.claude/skills/**` (copied then patched)
- Create: `index.html`, `machine.html`, `404.html`, `css/tokens.css`, `css/base.css`, `css/components.css`, `css/sections.css`, `js/finder.js`, `js/motion.js`, `js/quote.js` (all as minimal valid skeletons)
- Move: `machines.json` → `data/machines.json`
- Move: `public/haskologo.svg` → `assets/haskologo.svg`
- Modify: `.claude/skills/hasko-design-system/references/tokens.css`, `.claude/skills/hasko-design-system/references/components.md`, `.claude/skills/hasko-section-specs/references/sections.md`, `.claude/skills/hasko-design-system/scripts/validate-tokens.mjs`

- [ ] **Step 1: Copy the agent/skill kit into this repo**

```bash
cp -R "../hasko-kit/.claude" ".claude"
mkdir -p data assets/machines assets/blueprint css js .qa
mv machines.json data/machines.json
mv public/haskologo.svg assets/haskologo.svg
echo ".qa/" >> .gitignore
```

- [ ] **Step 2: Replace the stale tokens reference with `CLAUDE.md`'s current token block**

Open `CLAUDE.md` §4, copy the entire ` ```css ... ``` ` block under "Tokens — copy this to `css/tokens.css`" verbatim into `.claude/skills/hasko-design-system/references/tokens.css`, replacing its contents entirely (delete the old `--hasko-red`/`--blue`/Archivo/JetBrains version).

- [ ] **Step 3: Create the real `css/tokens.css` from the same block**

```bash
cp .claude/skills/hasko-design-system/references/tokens.css css/tokens.css
```

Confirm `css/tokens.css` contains `--red-mark`, `--red-action`, `--red-light`, `.on-dark`, and contains **no** occurrence of `--blue`.

- [ ] **Step 4: Patch `.claude/skills/hasko-design-system/references/components.md`**

Read the file's 16 entries. Every mention of `--blue` or `--blue-tint` must be replaced per `CLAUDE.md`'s colour-rules table (§4):
- Industry card arrow glyph: `--blue` → `--red` (or `--red-light` if the card sits on a dark band)
- Filter chip fill: `--blue-tint` → `--red-tint`, text → `--red-ink`
- Testimonial "machine link": → ink + underline (this is an inline link, per `CLAUDE.md`'s explicit rule that inline links are never colour-distinguished alone) — remove the `--blue` mono-link styling instruction
- Any remaining "Archivo" / "JetBrains Mono" reference → "Instrument Sans" / "Geist Mono" (font families are defined once in `css/tokens.css`; this file should reference roles like "mono" and "sans", not hardcode the old family names, so a future font swap in tokens.css doesn't require a second edit here)

- [ ] **Step 5: Patch `.claude/skills/hasko-section-specs/references/sections.md`**

Two known-stale lines: section 00 says "Event label mono `--fs-index` `--hasko-red`" — `CLAUDE.md` §6 corrects this to `--red-light` specifically (the bar is a dark band, `--red` at 3.36:1 fails there). Update that line. Add a one-line pointer at the top of the file: `Superseded by CLAUDE.md §6 for copy and token names — this file's layout/behaviour notes still apply.`

- [ ] **Step 6: Patch `.claude/skills/hasko-design-system/scripts/validate-tokens.mjs` line ~68**

```js
// before
add('CRITICAL', rel, n, `#62ACDA — 2.49:1 on white, fails AA`, 'var(--blue) #1C5CAB  [audit 1.5]');
// after
add('CRITICAL', rel, n, `#62ACDA — 2.49:1 on white, fails AA`, 'var(--ink) for text, var(--red-deep) for red text — no blue in this system  [audit 1.5]');
```

- [ ] **Step 7: Scaffold `css/base.css`**

Reset (box-sizing, margin removal on headings/lists), the Google Fonts `<link>` block from `CLAUDE.md` §4 (Instrument Sans + Geist + Geist Mono), `body { background: var(--surface); color: var(--ink); font-family: var(--font-primary); font-size: var(--fs-body); line-height: var(--lh-body); }`, the 12-column grid utility class used by every section (`.grid-12` with `--container`/`--gutter` from tokens), and the `.reveal` base rule (`opacity: 0; transform: translateY(20px); transition: opacity var(--t-enter) var(--ease-pop), transform var(--t-enter) var(--ease-pop);`) plus its `.reveal.is-visible` end state.

- [ ] **Step 8: Scaffold empty `index.html`, `machine.html`, `404.html`**

Each gets `<!DOCTYPE html>`, `<html lang="en">`, `<head>` with the font preconnect/link block, `<link rel="stylesheet" href="css/tokens.css">` → `base.css` → `components.css` → `sections.css` in that order, a real `<title>` (not "Home" — audit 1.4), and a meta description. `index.html`'s `<body>` gets HTML comments marking each section slot: `<!-- 00 announcement --> <!-- header --> <!-- 01 hero --> ... <!-- 12 footer -->` so later phases insert in the right place without hunting.

- [ ] **Step 9: Verify the scaffold is clean**

```bash
npm i -D playwright   # once, dev dependency only — never shipped
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
```

Expected: `✓ design system clean — N files checked` (nothing built yet, so nothing to flag). Confirm `grep -ri "62ACDA\|1C5CAB\|Archivo\|JetBrains" css/tokens.css .claude/skills/hasko-design-system/references/*` returns nothing.

- [ ] **Step 10: Commit**

```bash
git add .claude css js data assets index.html machine.html 404.html .gitignore
git rm machines.json public/haskologo.svg
git commit -m "Scaffold static build, reconcile design-system kit with CLAUDE.md's current no-blue palette"
```

---

## Phase 1: Global chrome — header + mega-menu, footer, quote drawer

These three are listed "Should" in the build order, but every "Must" section either links into the header nav or opens the quote drawer, so they're built first as shared infrastructure. Dispatch to `section-builder`, scoped explicitly to these three components (not a numbered section).

**Files:** `index.html` (header + footer inserted), `css/components.css` (components #2, #3, #16), `js/motion.js` (`initStickyHeader`, `initMegaMenu`, `trapFocus`), `js/quote.js` (full drawer)

**Closes:** 1.5 (nav contrast), 2.1 (Industries in primary nav — the mega-menu fix for the orphaned `/why-hasko/` silo), 2.6 (quote drawer fields), 3.1 (no Google+ link), 3.8 (footer navigation), convention 6 (persistent contact route)

- [ ] **Step 1: Header markup and two-row → one-row condense**

Build per `CLAUDE.md` §6 "Header" (both the expanded and condensed wireframes) and component #2 in `components.md`: utility row (`SINCE 1930` · `MADE IN THE USA` · real `tel:423.648.5200` · Parts · Contact) over a primary row (logo · Industries ▾ · Machines ▾ · Automation · Parts & Service · About · search · **Request a Quote**). Nav links `--ink`, 15px, Geist, `--fw-medium` — never any blue. Insert into `index.html` at the `<!-- header -->` marker, and duplicate the same header markup into `machine.html` and `404.html` (static duplication is correct here — no templating layer exists in a build-step-free static site).

- [ ] **Step 2: Mega-menus**

Industries mega-menu: four industry-card thumbnails (reuses component #9 in a compact variant, built properly in Phase 4 — for now, static placeholder cards with real copy from `CLAUDE.md` §6 header wireframe: Flooring/Ripped products/Dimensional wood/Moulding, each with its machine count) plus "Not sure which line you need? Talk to an engineer →" linking to the contact route selector (Phase 11 — link the anchor now, the target section exists later in Phase 11; do not leave it pointing at nothing, point it at `#contact` which will resolve once Phase 11 lands). Machines mega-menu: 12 categories from `data/machines.json`'s `_categories` array, three columns, plus "View all 21 machines" linking to `#machine-finder`.

In `js/motion.js`, implement `initMegaMenu()`: opens on `mouseenter` **and** `click`/`Enter`, closes on `Esc` and on focus leaving the menu, traps focus while open via `trapFocus()`. Call it from a `DOMContentLoaded` listener at the bottom of `index.html` (and `machine.html`, `404.html`).

- [ ] **Step 3: Sticky condense behaviour**

`initStickyHeader()`: on scroll, once `window.scrollY > 120`, add `.is-condensed` to the header (utility row collapses via CSS `max-height`/`opacity` transition using `--t-standard`); remove below that threshold. Guard the whole listener with a `prefers-reduced-motion` check per the base rule — under reduced motion the condense still happens (it's a layout state, not decoration) but with `transition: none`.

- [ ] **Step 4: Footer**

Per `CLAUDE.md` §6 "12 · Footer" and component #16: `--steel` dark band, `.on-dark` class applied to the `<footer>` element. Logo mark (real `<img src="assets/haskologo.svg" alt="HASKO">`) plus tagline. Four column groups exactly as listed (Machines — 12 categories, Industries — 4, Company, Support) each a real `<nav>` with a visible heading. Bottom bar: address, real `tel:` link, real `mailto:hello@hasko...` (use a plausible `hello@haskomachines.com` — flag in your final report that the real address needs confirming from Hasko, do not silently invent and hide it), association marks, social icons, `© 2026 HASKO Inc.`, Privacy, Accessibility statement links. **No Google+ icon or link anywhere** — grep for `plus.google` after writing this and confirm zero hits.

- [ ] **Step 5: Quote drawer**

Component #3, full implementation in `js/quote.js` per the `HaskoQuote` interface defined above. Fields in order, every one with a visible `<label>`: machine of interest (pre-filled from `HaskoQuote.open()`'s `machine` param, still editable — a plain `<input>`, not a rigid dropdown, since a buyer may be asking about a machine not yet in the finder), what are you making, full name, company, email, phone, timeline (`<select>`: This week / This month / This quarter / Just researching), message (optional `<textarea>`). Honeypot field (visually hidden via `position:absolute; left:-9999px`, never `display:none` which some screen readers still announce is a different failure — but honeypots specifically should be unreachable by AT too, so `aria-hidden="true"` plus `tabindex="-1"` on the honeypot field is correct) plus a timing check (reject submissions faster than 3 seconds — store `Date.now()` on open, compare on submit). Success state names a person and a timeframe per the spec: *"Sent. Steve Pugh or someone on the sales team will come back to you within one business day."* Focus moves into the drawer on open, traps via `HaskoMotion.trapFocus()`, returns to the `trigger` element on close. `Esc` closes.

Wire a placeholder `<form>` `action`/submit handler that prevents default and shows the success state locally (no real backend exists in this demo — note this explicitly in your final report so it isn't mistaken for a wired integration).

- [ ] **Step 6: Verify**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

Fix everything the scripts flag. Then dispatch `accessibility-auditor` for the keyboard-path checks the script can't run: mega-menu open/choose/land, quote drawer open/complete/submit/`Esc`. Dispatch `visual-qa` and review `.qa/` screenshots at all five breakpoints — the header/footer are on every future screenshot, so get them right now.

**Definition of done:** `grep -ri "62ACDA\|plus\.google"` returns nothing; nav text measures ≥ 4.5:1 in the a11y script's output; quote drawer completes an end-to-end keyboard path; footer has four real `<nav>` groups plus address/phone/email; `--focus` (never red) is visible on every interactive element in both light and dark contexts.

- [ ] **Step 7: Commit**

```bash
git add index.html machine.html 404.html css/components.css js/motion.js js/quote.js
git commit -m "Build header/mega-menu, footer, quote drawer — closes 1.5, 2.1, 2.6, 3.1, 3.8"
```

---

## Phase 2: Hero (section 01)

**Files:** `index.html` (section 01 markup), `css/sections.css`, `js/motion.js` (`initCountUp`, hero's inline application-selector expansion), `assets/` (in-plant documentary placeholder treatment)

**Closes:** 1.4 (first viewport has no proposition/action), convention 1 (first screen states what the company makes)

- [ ] **Step 1: Structure and copy**

Build exactly to `CLAUDE.md` §6 "01 · Hero" — both desktop and mobile wireframes. `<section>` with `aria-labelledby` pointing at the H1. Copy is final, use verbatim:
- Eyebrow: `HEAVY-BUILT PERFORMANCE · SINCE 1930` (mono, `--fs-index`)
- `<h1>`: **Machines that are still running in 25 years.** — this is the literal fix for audit 1.4 ("The `<h1>` is the string 'Home'"); confirm via `grep -o '<h1[^>]*>[^<]*</h1>' index.html` that it renders this exact sentence, not "Home" or anything generic.
- Standfirst paragraph verbatim from the spec
- Primary button: `Find machines for my application ▾` — expands a four-way inline selector (Flooring / Ripped products / Dimensional wood / Moulding) with **no page load**, then navigates to `#machine-finder?application=<slug>` (Phase 5's finder reads this on load via `applyFiltersFromURL()`)
- Secondary button: `Browse all 21 machines →` → `#machine-finder`
- Proof strip: `96 YEARS` · `21 MACHINES` · `25-YEAR SERVICE LIFE` · `MADE IN SODDY-DAISY, TN` — each figure is a `[data-count-to]` element where the value is numeric (96, 21, 25), the two non-numeric ones render statically

- [ ] **Step 2: Layout**

`--steel` background with a warm gradient overlay (CSS `radial-gradient`/`linear-gradient` using `--steel`/`--steel-2`, no image needed for the gradient itself). `88vh` desktop, `min-height: 720px`. 12-column grid, content cols 1–6, machine imagery cols 7–12 bleeding off the right edge. This section carries `.on-dark` — confirm the eyebrow/index-style text and any red accent use `--red-light`, and the focus ring uses white.

- [ ] **Step 3: Imagery placeholder**

Per the Global Constraints imagery note: build the "machine bleeding off the right edge" as a CSS-composed placeholder — a large geometric silhouette (simple inline SVG, single-weight line art in `--on-steel-3`) on a subtly darker panel, not a fabricated photo. Blueprint texture at 6% lower-right per spec, as an inline SVG grid pattern at low opacity, `--ink` equivalent adjusted for the dark band.

- [ ] **Step 4: Behaviour**

No carousel — confirmed by construction (there is exactly one composed frame, no slider markup exists). Proof numbers count up once via `HaskoMotion.initCountUp()`, 900ms, using an `IntersectionObserver` fired once (`observer.unobserve` after firing) — static under reduced motion (the `[data-count-to]` element renders its final numeric value immediately in that case; verify this against the reduced-motion capture, not just the CSS rule, since this is exactly the "stuck at initial state" trap `responsive-motion-verify`'s SKILL.md warns about — count-up must default-render the *final* number in markup, with JS only re-triggering the animation, so a no-JS or reduced-motion page never shows `0`). Machine image gets `4%` parallax drift on scroll (`data-parallax` attribute, transform only, disabled entirely under reduced motion per the global CSS rule already in `tokens.css`).

- [ ] **Step 5: Mobile**

Everything above the fold stays within `100svh` — this is a hard responsive-check.mjs criterion. Eyebrow/H1 at the mobile clamp, both buttons full-width, proof strip as a 2×2 grid, machine image drops to a 16:9 band below the `100svh` boundary (scrolls into view, not counted against the fold constraint).

- [ ] **Step 6: Verify**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

Specifically confirm in the responsive script's output: hero height ≤ `100svh` at 390px, and no `RM STUCK` warnings on the proof-strip or reveal elements. Dispatch `visual-qa` — per its own instructions, this is *the* section to scrutinize at 1280×900 and 390×844: "does a stranger learn what Hasko makes and where to start, without scrolling?"

**Definition of done:** `<h1>` is the real headline (not "Home"); no carousel markup exists anywhere in the section; both CTAs and the proof strip are visible without scrolling at 1280×900 and 390×844; count-up elements never render `0` under reduced motion.

- [ ] **Step 7: Commit**

```bash
git add index.html css/sections.css js/motion.js assets/
git commit -m "Build hero section — closes audit 1.4, convention 1"
```

---

## Phase 3: Announcement bar (00) + Trust strip (02)

Both small, both listed "Should," both independent of everything else — bundled into one phase.

**Files:** `index.html` (sections 00 and 02), `css/sections.css`, `js/motion.js` (dismiss + `sessionStorage`)

**Closes:** 3.9 (IWF presence absent), convention 7 (heritage/credentials surfaced), convention 8 (trade-show presence promoted)

- [ ] **Step 1: Announcement bar**

Per `CLAUDE.md` §6 "00 · Announcement bar" and component #1. `<div>` (not `<section>` — it's a global utility strip, not page content) inserted above the header at the `<!-- 00 announcement -->` marker, `.on-dark`, 44px, centred: `IWF ATLANTA 2026` (mono index style, `--red-light`) · `Booth #XXXX · 25–28 Aug · Georgia World Congress Center` (13px `--on-steel-2`) · `Book a meeting at the show →` as a real text link (not the whole bar) · a 44×44 dismiss button with an accessible name (`aria-label="Dismiss announcement"`).

**Conditional render, no empty state:** wrap the bar's insertion in a small JS check — since this is a static demo with one always-current event, hardcode `IS_EVENT_LIVE = true` as a documented constant near the top of the bar's script, with a comment explaining that in production this would be a date-range check against the event's start/end. When `false`, the bar's container `display: none` and the header sits at the top with no gap (verify no residual margin/padding remains when hidden — check by flipping the constant and re-running `responsive-check.mjs`).

Dismiss: on click, hide the bar and set `sessionStorage.setItem('hasko-announcement-dismissed', '1')`. On load, check that key before rendering.

- [ ] **Step 2: Trust strip**

Per `CLAUDE.md` §6 "02 · Trust strip." Light surface, 96px, five items with vertical rule dividers: `EST. 1930` · `MADE IN THE USA` · WMMA mark · Mekanika mark · USNR mark. Real `<img>` for each logo mark (simple inline SVG wordmarks are fine as placeholders — these are third-party marks, not Hasko's own, so treat them the same as machine imagery: consistent, honest placeholder treatment, not a fabricated "official" logo). Monochrome `--ink-3` by default (legal here — these are non-text graphics, exactly what `--ink-3`'s 3.4:1 exception is for), full colour on hover via a CSS filter transition (`--t-micro`). Mobile: two rows, dividers dropped.

- [ ] **Step 3: Verify and commit**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

**Definition of done:** dismiss button is 44×44 with an accessible name; flipping `IS_EVENT_LIVE` to `false` leaves no visual gap; every trust-strip mark has real `alt` text; announcement bar text on the dark band uses `--red-light`, never `--red`.

```bash
git add index.html css/sections.css js/motion.js
git commit -m "Build announcement bar and trust strip — closes 3.9, conventions 7 and 8"
```

---

## Phase 4: Industry paths (section 03)

**Files:** `index.html` (section 03), `css/components.css` (component #9, full version — Phase 1's mega-menu thumbnails were a compact variant of this), `css/sections.css`, `js/motion.js` (progress rail arrow buttons)

**Closes:** 2.1 (application-led buying path — this section is the structural fix for the orphaned `/why-hasko/` silo), convention 2 (partial — the industry tier of the two-tier catalogue; completed in Phase 5)

- [ ] **Step 1: Structure and copy**

Per `CLAUDE.md` §6 "03 · Industry paths," the four cards with **exact** figures from the table: Solid & engineered flooring (7 machines, from 400 FPM), Ripped products & rough mill (6 machines, up to 7,000 bd ft/hr), Dimensional wood/furniture/cabinetry (5 machines, scan-driven yield), Moulding & panelling (3 machines, heavy-built arbors). H2 "What are you making?", supporting line "Four production lines, one engineering approach. Start where your plant does." Semantic markup: a `<ul>` of `<li>` cards inside a horizontally-scrolling `<div>`, not a div-soup carousel.

- [ ] **Step 2: Native scroll-snap, no JS required for the base interaction**

`overflow-x: auto; scroll-snap-type: x mandatory` on the list container, `scroll-snap-align: start` on each card. This is the audit's own requirement — "works with JS disabled" — confirm by disabling JS in a manual browser check (DevTools → disable JavaScript) and scrolling the gallery. Real `<button>` arrow controls (not just decorative) call `element.scrollBy()` — these are progressive enhancement layered on top of the native behaviour, not a replacement for it.

- [ ] **Step 3: Progress rail and hover**

Progress rail beneath the gallery reflects scroll position (a simple `scroll` event listener updating a filled-bar width, throttled via `requestAnimationFrame`). Hover: image scales `1.04` inside a fixed frame (`overflow: hidden` on the frame, `transform: scale()` on the image only — never on the frame, which would break the layout), arrow slides 4px, both `--t-micro`.

- [ ] **Step 4: Mobile and reduced motion**

Mobile: 1.2 cards visible so the next card is deliberately cut off (a hard width value on the card, e.g. `width: 83vw`, verified visually — not just "should look cut off"). Under `prefers-reduced-motion`, the rail becomes a static 2×2 CSS grid (media query swap, not a JS branch) — confirm this against the reduced-motion screenshot in `.qa/`.

- [ ] **Step 5: Card destinations**

Each card's link (and its arrow) points at `#machine-finder?application=<slug>` using the same four slugs as `data/machines.json`'s `_filters.application` array (`flooring`, `ripped-products`, `dimensional-wood`, `moulding`) — this is what makes Phase 5's finder pre-filter correctly when a buyer arrives from here.

- [ ] **Step 6: Verify**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

Confirm keyboard access to the arrow buttons and that each card's whole clickable area is a single focusable link (not nested interactive elements, which is an a11y anti-pattern — the "card is a link" pattern here is one `<a>` wrapping the image+text, with the arrow as a purely visual `::after`-free real SVG inside that same link, not a second separately-focusable control).

**Definition of done:** scrolling works with JS disabled; all four figures match the spec table exactly; mobile shows a visibly cut-off next card; reduced motion shows a static 2×2 grid, not a frozen mid-scroll state.

- [ ] **Step 7: Commit**

```bash
git add index.html css/components.css css/sections.css js/motion.js
git commit -m "Build industry paths section — closes audit 2.1"
```

---

## Phase 5: Machine finder (section 04) — the core section

The largest phase. Four components ship here: machine card, filter rail + chips, compare tray, zero-result panel.

**Files:** `index.html` (section 04), `css/components.css` (components #4, #6, #7, #8), `css/sections.css`, `js/finder.js` (full implementation), `assets/machines/` (the reusable seamless-grey silhouette)

**Closes:** 2.3, 3.3, 3.4, 3.6, convention 2 (complete), convention 3, field gap +2 (specifications as filterable data)

- [ ] **Step 1: Machine card component**

Per `components.md` #4 (post-Phase-0 patch) and `CLAUDE.md` §8: seven elements in fixed order — photo on `--surface-3` seamless → category eyebrow (mono, uppercase, `--ink-3`) → model code (mono, `--ink`) → plain-language name (`--fs-h4`, `--fw-semi` — this directly closes 3.6, "model codes lead product names": the code is present but small and secondary, the name is what reads first) → one capability figure (mono) → one-line description → two real actions, *View specs* and *Request quote*, both real `<a>`/`<button>` elements with real text (closes 3.3 — no `content: "View"` pseudo-element anywhere; confirm via `grep -o 'content:\s*"View"' css/*.css` returning nothing).

`HaskoFinder.machineCardHTML(machine)` in `js/finder.js` generates this markup from a `MachineRecord`. When `machine._status === "placeholder"`, render the `PLACEHOLDER` badge (small, `--warn` colour **plus** the word "PLACEHOLDER" — never colour alone) next to the capability figure.

*Request quote* action calls `HaskoQuote.open({ machine: machine.model, mode: 'quote', trigger: this })`.

- [ ] **Step 2: Filter rail + chips, and the four filter groups**

Per component #6: a sticky `<div>` below the header containing four real `<fieldset>` elements, each with a `<legend>` — Application, Process, Material width, Horsepower — using the exact option sets from `data/machines.json`'s `_filters` object (already defined, do not invent new filter values). A `<input type="search">` for free-text search across `name`/`model`/`description`.

Result count: `<p aria-live="polite">Showing <span id="finder-count">21</span> of 21 machines</p>` — `HaskoFinder.renderResults()` updates the count text on every filter change.

Active filters render as removable chip `<button>`s, `--red-tint` fill, `--red-ink` text, each with an accessible name built as `` `Remove filter: ${groupLabel} ${valueLabel}` `` — e.g. "Remove filter: material width 24–36 inches" (this exact pattern is named in the spec; match it, don't approximate).

- [ ] **Step 3: URL state**

`HaskoFinder.renderResults()` writes the current filter state to the URL via `history.replaceState` on every change: `?application=flooring&width=24-36`. `HaskoFinder.applyFiltersFromURL()` runs on `DOMContentLoaded` and reads these back — this is also what makes Phase 2's hero selector and Phase 4's industry cards work (they navigate to `#machine-finder?application=<slug>`, which this function parses on load). Reflow (grid re-layout on filter change) uses `--t-reflow` (240ms).

- [ ] **Step 4: Compare tray**

Checkbox on each machine card, max three selected (disable further checkboxes with an `aria-disabled` explanation once three are checked, don't silently ignore clicks). Tray docks to the viewport bottom once two are selected, `position: sticky` or `fixed` at the bottom with `--shadow-raised`. Opens a side-by-side spec table using the exact same field order as component #5 (built fully in Phase 6 — for Phase 5, build the compare tray's table using the same ten-field order listed in `CLAUDE.md` §8, so Phase 6 isn't inventing a second field-order definition).

- [ ] **Step 5: Zero-result panel**

Per component #8 and `CLAUDE.md`'s explicit zero-state wireframe. When `renderResults()` finds no matches: render "No machine matches all N filters," compute and show the **closest actual machine** (simplest honest heuristic: the machine matching the most of the active filter groups, ties broken by first in `data/machines.json`'s array order) with its real figures, a "View the [model] →" link, a "Talk to an engineer" link (→ contact route selector), and one-click removal chips for each active filter — reusing the exact same chip component from Step 2, not a second implementation.

- [ ] **Step 6: Mobile filter sheet**

At mobile widths, the filter rail becomes a bottom sheet (`90vh`, slide-up via `transform: translateY()`, `--t-standard`) triggered by a "Filters" button, with "Apply" pinned to the bottom. Use `HaskoMotion.trapFocus()` while the sheet is open, same pattern as the quote drawer.

- [ ] **Step 7: Placeholder machine imagery**

Build one reusable seamless-grey silhouette (a single inline SVG or small PNG — simple three-quarter-angle machine block silhouette, line art, sits on `--surface-3`) referenced by every machine card via `assets/machines/silhouette.svg`, with `alt` text built per-machine from real data: `alt="${machine.name} (${machine.model})"` — never `alt="placeholder"` or `alt=""` for these, since they are meaningful content images, just not real photography.

- [ ] **Step 8: Verify**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

Manually walk the full keyboard path per `accessibility-verify`'s checklist: open Industries mega-menu → choose an industry → land on the filtered finder; apply two filters → remove one via its chip → (if applicable) reach zero-result recovery; select two machines → open compare → close it. Dispatch `design-system-guardian` here specifically — this phase has the most new CSS and is the highest-risk phase for hardcoded values or a duplicate card/chip implementation.

**Definition of done:** filtering works with no page reload; result count announces via `aria-live`; filter state round-trips through the URL (paste a filtered URL in a new tab, confirm it restores the same filtered view); zero-result state never dead-ends; every card shows a real plain-language name above the model code; no `content: "View"` anywhere; compare tray works by keyboard.

- [ ] **Step 9: Commit**

```bash
git add index.html css/components.css css/sections.css js/finder.js assets/machines/
git commit -m "Build machine finder — closes 2.3, 3.3, 3.4, 3.6; completes convention 2, closes convention 3, field gap +2"
```

---

## Phase 6: Machine detail page (`machine.html`, SR-36 worked example)

**Files:** `machine.html` (full page), `css/components.css` (component #5), `css/sections.css` (machine-page-specific layout), `js/finder.js` (reuse `machineCardHTML` for related machines)

**Closes:** 1.3, 1.6, 2.8, 2.9, 3.7, convention 4, convention 5

- [ ] **Step 1: Breadcrumb and header**

Per `CLAUDE.md` §7 Template A. `<nav aria-label="Breadcrumb">Machines / Board Ripping / SR Series Gang Ripsaw</nav>` as a real list of links (closes 3.7's breadcrumb requirement). Category eyebrow `BOARD RIPPING · SR-36` (mono). `<h1>SR Series Gang Ripsaw</h1>` — plain-language name as the heading, not the model code alone.

- [ ] **Step 2: Imagery and gallery**

Machine-on-seamless treatment (same silhouette approach as Phase 5, larger), with four thumbnail placeholders below the main image — clicking a thumbnail swaps the main image `src` (a small vanilla-JS handler, no new file needed, inline `<script>` at the bottom of `machine.html` is acceptable for a page-specific single interaction this small — don't add a fourth JS file for one behaviour).

- [ ] **Step 3: Spec table — visible on load, no tab wrapper**

Component #5, the direct fix for audit 1.6. Two-column `<dl>`: label (`--ink-2`, sentence case) / value (mono, `--ink`). **Exact field order, every machine, no exceptions:** Material width · Material thickness · Minimum length · Arbor HP · Saw diameter · Feed rate · Feed drive · Footprint · Weight · Power requirement. Populate SR-36's real values from `data/machines.json` (the only machine marked with real specs). Confirm by construction there is no `<div role="tab">`, no `hidden` attribute, no `display: none` anywhere near this table — this also closes 2.8 by simply not building a tabbed interface at all, which is the simplest compliant path per the Global Constraints note above.

- [ ] **Step 4: Features list and quote CTA — within the first viewport**

Bullet list of SR-36 features (from `CLAUDE.md` §7's worked example: direct-coupled arbors 75–150 HP, individual electric gear motors per feed roll, 8" chromed knurled hydraulic feed rolls). Sticky side panel: "Interested in the SR-36?" → **Request a quote** button calling `HaskoQuote.open({ machine: 'SR-36', mode: 'quote', trigger: this })`, real `tel:` link, spec-sheet document row (component #12, built properly in Phase 8 — build a minimal compliant instance here now, Phase 8 will not need to touch this page again). This CTA existing **above the fold, carrying the machine identifier** is the literal audit-verifier check for 1.3 — confirm the button is within the viewport at 1280×900 without scrolling.

- [ ] **Step 5: Testimonial — the two-way link**

Embed the Roger Isaacs testimonial block (component #10, built fully in Phase 7) on this page since it names the MPEM-C... **note the discrepancy:** the real testimonial names the **MPEM-C End Matcher**, not the SR-36. Build `machine.html` as the SR-36 template per the wireframe, but when wiring the two-way link in Phase 7, the testimonial's "two-way" link must point at the **MPEM-C's** machine page, not SR-36's. Since only one machine page exists in this build (SR-36, per `CLAUDE.md`'s explicit scope — "machine.html machine detail template (SR-36 worked example)"), the honest resolution is: SR-36's page shows its own placeholder-testimonial-slot state (no real quote exists for SR-36), and the Roger Isaacs quote lives on the homepage (Phase 7) linking to a machine page for MPEM-C that this build does not construct. Do not fabricate an SR-36 quote to make the template's testimonial slot "look complete" — leave it in the awaiting-content state, exactly as the Global Constraints require, and say so plainly in your phase report rather than quietly working around it.

- [ ] **Step 6: Related machines and cross-links**

"Machines that run with this one" — three related machine cards reusing `HaskoFinder.machineCardHTML()` from Phase 5 (closes 3.7's "related machines" requirement; confirms the interface contract defined at the top of this plan actually gets reused, not reimplemented). "Used in" links back to the relevant industry paths (Ripped products, Dimensional wood) from Phase 4.

- [ ] **Step 7: Verify**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs machine.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs machine.html --shots
```

**Definition of done:** spec table renders on load with the full ten-field order and no tab wrapper; quote CTA is above the fold and carries `SR-36` as the machine identifier; breadcrumb and related-machines both present; no fabricated SR-36 testimonial exists.

- [ ] **Step 8: Commit**

```bash
git add machine.html css/components.css css/sections.css
git commit -m "Build machine detail page (SR-36) — closes 1.3, 1.6, 2.8, 2.9, 3.7"
```

---

## Phase 7: Proof (section 06)

**Files:** `index.html` (section 06), `css/components.css` (component #10, full build — Phase 6 used a minimal instance), `css/sections.css`, `js/motion.js` (count-up reuse)

**Closes:** 2.2, field gap +1

- [ ] **Step 1: The real testimonial**

Per `CLAUDE.md` §6 "06 · Proof" — use verbatim, do not clean up the grammar even though "through put" and "9″" look like they could be tidied:

> "After installing our new Hasko MPEM-C, through put increased by 2k per shift. Yield increased by .5%, added ability to cut 9″ boards (with a much better cut). Out of square boards are a non-issue."
> — Roger Isaacs · Production Manager · SFL

Metric row: `+2,000` BD FT/SHIFT, `+0.5%` YIELD, `9"` BOARDS, CLEANLY — each a `[data-count-to]` element, counts up once on entry via `HaskoMotion.initCountUp()` (the same function built in Phase 2, called again here — confirms reuse rather than a second count-up implementation). Attribution line preceded by a 32px rule. Machine link: mono, ink+underline (not blue — Phase 0 already removed that styling instruction from `components.md`), reading "MACHINE: MPEM-C END MATCHER →" — since Phase 6 built only the SR-36 page, this link has no real target in this build. Point it at `machine.html?model=MPEM-C` as a documented placeholder route and say so in your report — do not silently point it at `#` or at the SR-36 page, either of which would misrepresent the two-way link the spec calls for.

- [ ] **Step 2: The other two slots — awaiting content, never invented**

Per the Global Constraints (this is the single most important honesty rule in the whole build): render two additional testimonial-slot containers in an explicit "awaiting attributed quote" state — visible, styled consistently with the real slot's frame but containing no fabricated name, company, or figures. Do not write placeholder quotes "for layout purposes."

- [ ] **Step 3: Layout and imagery**

H2 "What changes when a Hasko goes in." Two-column: metrics + quote at cols 1–8, in-plant documentary placeholder image cols 9–12 (per the imagery constraint — a CSS-composed dark/warm panel, not a fabricated photo).

- [ ] **Step 4: Verify**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

**Definition of done:** the Roger Isaacs quote is verbatim, attributed, and its metrics count up once; the two other slots are visibly "awaiting content," not fabricated; the machine link points at a documented (if not yet real) target.

- [ ] **Step 5: Commit**

```bash
git add index.html css/components.css css/sections.css
git commit -m "Build proof section — closes audit 2.2, field gap +1 (named customer outcomes)"
```

---

## Phase 8: Parts & service (section 07)

**Files:** `index.html` (section 07), `css/components.css` (components #11, #12), `css/sections.css`, `js/quote.js` (parts-mode wiring, already supported by the interface built in Phase 1)

**Closes:** 2.4

- [ ] **Step 1: Parts lookup card**

Component #11: raised card, `--surface-2`, `--r-feature`, `--shadow-raised`. Step 1 — machine model `<select>` (visible `<label>`, populated from `data/machines.json`'s machine names). Step 2 — serial number, optional, visible `<label>`, placeholder text like "e.g. SR36-1042" used **only** as an example-format hint inside the input, never as the label itself (the label is a separate, always-visible `<label for="...">Serial number</label>` element — this is exactly the distinction audit 2.6/`accessibility-verify` checks for). "Find parts →" submit reveals, in place (no navigation), the selected machine's documents.

Per `CLAUDE.md` §6: "Demo populates three machines with real data and labels it as a sample." Hardcode three machines (SR-36 plus two others already in `data/machines.json`) with real document rows (see Step 2) and clearly label this section "Sample — three machines shown" so it isn't mistaken for a complete parts catalogue.

- [ ] **Step 2: Document rows**

Component #12: 56px rows, icon · name · mono file meta · arrow, opens in a new tab (`target="_blank" rel="noopener noreferrer"`). Parts list / operator manual / exploded diagram, each showing a revision date and file size per the spec (`PDF · 2.4MB` style, mono). Since no real PDFs exist in this repo, link each row to a `#` placeholder **and** visibly label the row `(sample)` — do not leave a dead link with no indication it's non-functional.

"Request a part" opens the quote drawer in parts mode: `HaskoQuote.open({ machine: selectedModel, mode: 'parts', serial: serialFieldValue || null, trigger: this })` — this is the exact call the Phase 1 interface was built to support.

- [ ] **Step 3: Real `tel:` link**

`<a href="tel:4232255763">Call 423-225-5763</a>`, 44×44 minimum target — this is the literal fix for "the parts number sits as unlinked plain text inside a paragraph."

- [ ] **Step 4: Copy and layout**

H2 "Your machine is 20 years old. We still have the drawings." Standfirst verbatim from `CLAUDE.md` §6. Blueprint parts-diagram texture at 8% on the right half (inline SVG, `--ink` at that opacity, per the imagery constraint).

- [ ] **Step 5: Verify and commit**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

**Definition of done:** every field has a visible `<label>` distinct from its placeholder; phone number is a real `tel:` link at 44×44; "Request a part" opens the drawer in parts mode carrying machine + serial; sample data is labeled as a sample.

```bash
git add index.html css/components.css css/sections.css js/quote.js
git commit -m "Build parts and service section — closes audit 2.4"
```

---

## Phase 9: Integrated lines (05) + Why heavy-built (08)

Both "Nice," both structurally novel (process rail, sticky-centre band), bundled since neither depends on the other and both are dark/mid-page bands.

**Files:** `index.html` (sections 05, 08), `css/components.css` (components #13, #14), `css/sections.css`, `js/motion.js` (stagger reveal for the rail, sticky release under reduced motion/mobile)

**Closes:** no numbered finding (05 is explicitly "the offensive section, not an audit fix"); 08 closes no single finding either but is called out in `CLAUDE.md` as "the conviction gap" — both still ship since they're in the "Nice" tier and the brief frames them as differentiation, not optional filler.

- [ ] **Step 1: Integrated lines (05)**

`.on-dark`, 160px padding. H2 "One line. One number to call." + standfirst verbatim. Component #13: five nodes on a hairline (Infeed/Optimise/Surface/Profile/Handle), rail draws left→right over 900ms on entry, nodes stagger 70ms (cap six — five nodes fits under the cap). Model codes mono `--red-light` (dark band), each linking into its machine category in the Phase 5 finder. Mobile flips to a vertical timeline, rail on the left.

- [ ] **Step 2: Why heavy-built (08)**

H2 "We spent decades rebuilding other people's machines. Then we built ours." + body copy verbatim. Component #14: centre column `position: sticky; top: 30vh`, cols 5–8, containing the H2/body. Four side cards (Fewer wear parts / Direct-coupled arbors / Heavy-built frames / Simple to set up and operate) at cols 1–3 and 10–12, right column offset `+180px`, copy verbatim from `CLAUDE.md`'s table. Blueprint line work at 8% across the whole band.

Under reduced motion or mobile: sticky releases (`position: static`), single column — this is the exact case `tokens.css`'s `.sticky-centre { position: static !important; }` reduced-motion rule exists for; confirm the class name matches what this component actually uses.

- [ ] **Step 3: Verify and commit**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

**Definition of done:** rail animation is nameable (draws once on entry, not on every scroll); sticky-centre band releases correctly under reduced motion and at mobile widths; all dark-band red usage is `--red-light`.

```bash
git add index.html css/components.css css/sections.css js/motion.js
git commit -m "Build integrated lines and why-heavy-built sections"
```

---

## Phase 10: Automation (09) + Resources (10)

**Files:** `index.html` (sections 09, 10), `css/components.css` (component #12 reused), `css/sections.css`

**Closes:** 3.2

- [ ] **Step 1: Automation (09)**

H2 "Machines are half of it. Moving material is the other half." + copy verbatim. Click-to-play video placeholder: a poster-frame `<div>` with a centred play button — **never autoplay** (this is explicit in the wireframe). Since no real video exists, the poster frame is a CSS-composed placeholder (blueprint/in-plant treatment) and the play button, on click, shows an inline "Video coming soon" state rather than attempting to load a nonexistent file. Two capability-bullet columns (verbatim from spec). Partner link: **point at Mekanika's English destination, not `/accueil/`** — since the real URL isn't confirmed in this repo, link to a documented placeholder and flag in your report that the real English-language URL needs confirming before this ships; do not silently ship a link to the French page, which is the exact audit finding (3.2) this section exists to close.

- [ ] **Step 2: Resources (10)**

H2 "Everything downloadable, in one place." Six category cards (Machine brochures, Spec sheets, Operator manuals, Parts lists, Line layouts, Case studies) each showing a document count. Sort control (`<select>`, "Newest" default — a real, working sort even if the underlying set is small/sample data). Expanding a category reveals document rows reusing component #12 from Phase 8 — every row shows its revision date and file size, e.g. `SR Series brochure — REV. 2016 · PDF · 3.1 MB`. This is the direct fix for the audit's "2016 brochure served as current spec" finding: label it honestly rather than hiding the date.

- [ ] **Step 3: Verify and commit**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

**Definition of done:** video never autoplays; every document row shows a revision date; partner link is documented as pointing at the English destination (even if the exact URL needs later confirmation) rather than silently left at a French path.

```bash
git add index.html css/components.css css/sections.css
git commit -m "Build automation and resources sections — closes audit 3.2"
```

---

## Phase 11: Contact (section 11)

**Files:** `index.html` (section 11), `css/components.css` (component #15), `css/sections.css`

**Closes:** 2.5

- [ ] **Step 1: Route selector**

Component #15: three cards, each naming a person or desk at real visual weight (not nine identical cards where the VP of Sales matches the fax line) — "I am looking at a machine" (Sales · Steve Pugh, VP), "I need a part or service" (Parts · 423-225-5763), "I have a technical question" (Engineering · Robert Hall). Selecting one calls `HaskoQuote.open({ mode: route === 'parts' ? 'parts' : 'quote', application: null, trigger: this })` — pre-routed per the spec.

- [ ] **Step 2: Who you'll talk to, and real `mailto:` links**

List Steve Pugh (VP Sales), Robert Hall (Engineering Director), Joey Walker (Operations Director), each with a direct line and a real `mailto:` link — per `CLAUDE.md`, "the current site has zero." Use a plausible pattern (`steve.pugh@haskomachines.com` etc.) and flag in your report that real addresses need confirming from Hasko before this ships publicly.

- [ ] **Step 3: Address and map**

HASKO Inc., Soddy-Daisy, Tennessee, real `tel:423.648.5200` as the main office line. An embedded map **placeholder** (not two bulleted lists of driving directions, which is the audit finding) — since no live map embed exists in this offline demo, build a static styled panel (blueprint-style abstracted map treatment) labeled clearly as a map placeholder, not a broken iframe.

- [ ] **Step 4: Verify and commit**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

**Definition of done:** three route cards at distinct visual weight from any secondary info; every named contact has a real `mailto:`; selecting a route opens the drawer pre-routed.

```bash
git add index.html css/components.css css/sections.css
git commit -m "Build contact section — closes audit 2.5"
```

---

## Phase 12: 404 page

**Files:** `404.html`

**Closes:** 1.2

- [ ] **Step 1: Structure**

Per `CLAUDE.md` §7 Template B — reuse the header/footer from Phase 1 (already duplicated into `404.html` in Phase 0/1). `<h1>Error 404</h1>` — visually can show "ERROR 404" as an eyebrow with a real, human `<h1>` "That page isn't here." below it (don't make the literal string "404" the only heading text — the audit's complaint was an *empty* page, but keep the heading human-readable too). Body copy: "It may have moved, or the link may be old. Here is the way back."

- [ ] **Step 2: Recovery paths**

Search field (`<label>` "Search machines, parts and documents") — wire it to redirect to `index.html#machine-finder?q=<value>` on submit, reusing Phase 5's finder search rather than building a second search implementation. Four industry links (Flooring/Ripped/Dimensional/Moulding) reusing the same slugs as Phase 4. "Looking for a part? Machine model ▾ → Find parts" — a compact version of Phase 8's lookup, linking into the parts section. Real `tel:` link.

- [ ] **Step 3: Verify and commit**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs 404.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs 404.html --shots
```

**Definition of done:** page has a real, descriptive `<title>` and `<h1>`; search, industry links, parts lookup, and phone are all present and functional/linked (not a blank content area).

```bash
git add 404.html
git commit -m "Build 404 page — closes audit 1.2"
```

---

## Phase 13: Full-site verification, audit coverage, and handoff

No new sections — this phase proves the whole claim rather than one part of it.

**Files:** none created; this phase only reads and reports (dispatches `audit-verifier`, does not modify code except to fix what it finds)

- [ ] **Step 1: Full verifier sweep across all three pages**

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs machine.html
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs 404.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs machine.html --shots
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs 404.html --shots
```

Fix anything still flagged. Zero `CRITICAL`/`FAIL` results required before continuing.

- [ ] **Step 2: Cross-cutting checks the per-phase loop doesn't catch on its own**

```bash
grep -o '<img[^>]*>' index.html machine.html 404.html | grep -v 'alt='   # expect: no output (closes 2.7)
grep -c 'role="tab"' index.html machine.html 404.html                    # expect: 0 everywhere (closes 2.8)
grep -ri "62ACDA\|plus\.google" --include=*.html --include=*.css --include=*.js .   # expect: no output
grep -o 'color:\s*#FF0000' css/*.css                                     # expect: no output — red-mark is logo-only
```

Dispatch `design-system-guardian` for a full-repo pass (not per-section) to catch drift that only shows up once every component exists side by side — duplicate component patterns, imagery-treatment mixing across sections (audit 3.5), monospace discipline on every numeric value site-wide.

- [ ] **Step 3: Performance budget**

Measure total transferred bytes and JS size (`du -sh css js index.html machine.html 404.html assets`, or a quick `python3 -m http.server` + browser DevTools Network tab). Confirm total < 900 KB, JS uncompressed < 120 KB. Confirm fonts load via the `woff2` Google Fonts link with `font-display: swap` (already true if Phase 0's `base.css` head block was used unmodified). Confirm images are lazy (`loading="lazy"`) below the fold with explicit `width`/`height` attributes (CLS < 0.05 depends on this).

- [ ] **Step 4: Audit coverage — the honest count**

Dispatch `audit-verifier`. Per its own instructions, it checks the *built artefact*, not this plan's claims — do not hand it this plan document as evidence. Expect it to report against the table in `CLAUDE.md` §2 and `hasko-kit`'s `audit-findings.md`. Target: **23 closed, 1 out of scope (1.1), 0 open.** If it reports fewer than 23, that's real information — fix the specific open findings it names, re-run, and do not round the number up in any client-facing summary.

- [ ] **Step 5: Cross-link integrity pass**

Manually click through every internal link built across all 13 phases: header nav → mega-menus → sections; hero CTAs → finder with pre-filter; industry cards → finder; finder cards → machine.html and quote drawer; machine.html → related machines, breadcrumb, quote drawer; proof section → machine link; parts section → quote drawer in parts mode; contact routes → quote drawer pre-routed; footer → every listed page/section; 404 → search, industries, parts, phone. Confirm nothing points at a bare `#` with no documented reason (Phase 7 and 10 each intentionally left one placeholder target — those are acceptable *because* they're flagged in this plan and in the final report, not because they're invisible).

- [ ] **Step 6: Final visual-qa pass**

Dispatch `visual-qa` against the full `.qa/` screenshot set from Step 1 (all three pages, all five breakpoints, plus reduced-motion captures). This is the "before showing the build to anyone" pass its own SKILL.md calls for.

- [ ] **Step 7: Write the handoff note**

Not a new file — append a short section to `README.md` (already exists in the repo) covering: how to open the demo (`file://` or `python3 -m http.server`), the audit-verifier's final honest count, the explicit list of items flagged throughout this plan as needing real data before a public launch (email addresses, Mekanika's English URL, real machine photography and specs for the 20 placeholder machines, real PDF documents, a real map embed, a real form backend for the quote drawer). This list matters as much as the demo itself — it's the difference between "a demo that looks finished" and "a demo that's honest about what's left."

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "Full-site verification pass — confirms audit coverage and closes cross-cutting findings 2.7, 3.5"
```

---

## Self-Review

**Spec coverage.** Every numbered section in `CLAUDE.md` §6 (00–12) has a phase. Both templates (§7) have phases (6, 12). All 16 components (§8) are each built exactly once and mapped to their reuse points. All 23 in-scope audit findings and 1.1's `N/A` status are mapped to a phase. All 8 competitor conventions and both field gaps are mapped. The tech-stack conflict and the skill-kit/CLAUDE.md palette conflict — both real risks that would have silently broken the build — are resolved in Phase 0 rather than discovered mid-build.

**Placeholder scan.** Every task names the exact file, the exact component, and either the exact copy (pointing at `CLAUDE.md`'s verbatim text) or the exact generation rule for placeholder content (imagery, sample parts data, sample contact emails) — each placeholder is explicitly flagged as needing real data before launch, per the project's own two honesty rules (no invented specs, no invented testimonials), extended here to imagery, contact details, and document links for the same reason.

**Type/interface consistency.** `HaskoQuote.open()`, `HaskoFinder.machineCardHTML()`, `HaskoFinder.applyFiltersFromURL()`, `HaskoMotion.initCountUp()`/`initReveal()`/`trapFocus()` are defined once at the top and referenced by the same names in every phase that uses them (Phase 1 defines `HaskoQuote.open` and `trapFocus`; Phases 5–11 call `HaskoQuote.open` with the same four/five named params each time; Phase 2 defines `initCountUp`, Phase 7 reuses it verbatim; Phase 5 defines `machineCardHTML`, Phase 6 reuses it verbatim).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-21-hasko-landing-page.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Given this plan is already built around `section-builder` doing the implementation and `design-system-guardian`/`accessibility-auditor`/`visual-qa` doing the review, this maps almost exactly onto the project's own prescribed workflow.

**2. Inline Execution** — Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach?
