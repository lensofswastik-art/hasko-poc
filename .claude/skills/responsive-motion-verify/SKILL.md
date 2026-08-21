---
name: responsive-motion-verify
description: Checks a built page across breakpoints for horizontal overflow, viewport fit, tap-target size and motion behaviour, and captures screenshots for visual review. Load after building any section, when something breaks on mobile, or before a demo. Triggers on responsive, breakpoint, mobile, overflow, viewport, screenshot, motion, animation, reduced motion, or "does this work on phones".
---

# Responsive & motion verify

Two failure modes this catches that nothing else does: a page that scrolls sideways on a phone, and an animation that leaves content invisible.

## Run it

```bash
npm i -D playwright                                       # once
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

`--shots` writes full-page captures to `.qa/` at every breakpoint plus one under reduced motion. Read them — the script measures, your eyes judge.

## Breakpoints checked

`390` · `768` · `1024` · `1280` · `1440`

390 is the mobile reference used throughout the audit and the wireframes.

## What it measures

| Check | Why |
|---|---|
| `scrollWidth > innerWidth` at every breakpoint | Horizontal overflow. Names the widest offending element, which is usually a table, a wide grid or a `nowrap` label |
| Hero height vs `100svh` at 390 | The hero must fit. If the CTAs fall below the fold on a phone the section has failed its job |
| Tap targets under 44×44 at 390 | Thumbs, and WCAG 2.5.5 |
| Text below 14px at any breakpoint | This audience reads specification tables. Body is 16.5px |
| Line length outside 45–80 characters | Readability at the width the text actually renders |
| Elements stuck hidden under `prefers-reduced-motion` | A reveal that never lands is worse than the animation |
| Durations and easings outside the vocabulary | Motion drift |
| Animations with no nameable function | Decoration |

## The reduced-motion trap

The common bug is a reveal implemented as `opacity: 0` in CSS, with JS adding a class on scroll. Under `prefers-reduced-motion` the *transition* is disabled but the element is still at `opacity: 0`, so the content is simply gone.

The fix is in `tokens.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1 !important; transform: none !important; }
}
```

The script checks specifically for this. It is the single most common accessibility regression in a build like this one.

## Reading the output

```
390    OVERFLOW  scrollWidth 447 > 390   widest: table.spec-table (412px)
390    HERO      968px > 844 svh          CTAs below the fold
390    TARGET    .card__cta 44×32
768    ok
1280   LINE      p.standfirst 94 chars    max 80
RM     STUCK     3 .reveal elements at opacity 0
```

## When you have the screenshots

Hand them to the `visual-qa` agent. The script confirms the page is correct; that agent judges whether it is any good.
