---
name: accessibility-verify
description: Measures WCAG 2.1 AA compliance on a built HTML page — computed colour contrast, alt text coverage, form labels, ARIA state, touch targets, focus visibility and reduced-motion coverage. Load before claiming any page is accessible, after building a section, and before a client demo. Triggers on accessibility, a11y, WCAG, contrast, alt text, screen reader, keyboard navigation, focus, or "is this accessible".
---

# Accessibility verify

Every criterion here is a **measured, current failure on haskomachines.com**. This build exists partly to fix them, so regressing one is worse than never trying.

**Measure. Do not estimate.** "Looks like enough contrast" is not a finding. `2.49:1` is.

## Run it

```bash
npm i -D playwright                                  # once
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
```

Add `--json` for machine-readable output. Exit code is non-zero when a criterion fails.

## What the script measures

| Check | Criterion | Live-site failure it guards against |
|---|---|---|
| Computed contrast on every text node, against its real painted background | 1.4.3 | Nav at 2.49:1 |
| `alt` on every `<img>`, background-image elements carrying text | 1.1.1 | 17 of 24 catalogue images |
| Visible `<label>` bound to every field; placeholder-as-label detection | 3.3.2, 1.3.1 | Placeholder-only form |
| `aria-selected` / `aria-expanded` present on every widget declaring a role | 4.1.2 | `aria-selected` null on 5 tabs |
| Bounding box ≥ 44×44 on every interactive element | 2.5.5 | Card CTA under minimum on mobile |
| `outline` not removed without replacement | 2.4.7 | Browser default only |
| Heading order, single `<h1>`, `<h1>` is not a generic word | 1.3.1 | `<h1>` is the string "Home" |
| `prefers-reduced-motion` block exists and content renders visible under it | 2.3.3 | Auto-carousel, no pause |
| `lang` on `<html>`, page `<title>` is descriptive | 3.1.1, 2.4.2 | |

## What the script cannot check — do these by hand

**Keyboard path.** Tab through and complete each of these with no mouse:

- Open Industries mega-menu → choose an industry → land on the filtered finder
- Apply two filters → remove one via its chip → reach the zero-result recovery links
- Select two machines → open compare → close it
- Open the quote drawer from a card → complete → submit → `Esc` closes
- Parts lookup: choose a model → enter a serial → reach the document links

**Focus management.** Drawer opening moves focus in and traps it. Closing returns focus to the trigger.

**Announcements.** Filter result count updates through `aria-live="polite"`. Form errors announce.

**Reduced motion in practice.** Emulate it and reload. Nothing moves, and content is at final state — not hidden, not mid-transition. A reveal that stays at `opacity: 0` is a worse failure than the animation was.

## Reading the output

```
FAIL  1.4.3  .spec-label            #878E97 on #FFFFFF = 3.4:1, needs 4.5:1
FAIL  2.5.5  .card__cta             44×32px on 390px viewport
PASS  1.1.1  24/24 images have alt
WARN  4.1.2  [role=tab] × 5         aria-selected present, roving tabindex missing
```

`FAIL` blocks the build. `WARN` needs a human decision — usually it is a real problem.

## The threshold that matters most

`--ink-3` (`#878E97`) measures **3.4:1** on `--surface`. That is legal for large text and non-text only. If the script flags it on body copy, the fix is `--ink-2`, not a smaller font.

## Legal context

Over 5,000 US digital accessibility lawsuits were filed in 2025; 64% of the companies sued had under $25M annual revenue. That is Hasko's band.
