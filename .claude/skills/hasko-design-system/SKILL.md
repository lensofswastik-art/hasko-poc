---
name: hasko-design-system
description: The HASKO design system — colour, type, spacing, radii, motion tokens and the sixteen components. Load this before writing any CSS or building any component for the HASKO landing page. Triggers on writing styles, picking a colour, sizing type, adding a transition, building a card, button, form field, filter chip, spec table or modal, or when checking whether a value should be a token.
---

# HASKO design system

Engineered, not decorated. The reference points are a machine spec sheet and a blueprint.

**Read `references/tokens.css` and copy it into `css/tokens.css` verbatim.** That file is the only place values are defined. Everything else references it.

## The rule

If a value exists as a token, use the token. If you need a value that is not a token, stop and ask — do not hardcode. The one exception is inside `tokens.css` itself.

## Colour

Full values in `references/tokens.css`. What you need to know at the point of use:

| Role | Token | Note |
|---|---|---|
| Brand mark, primary action | `--hasko-red` `#DB2128` | 4.93:1 on surface. **Action only, never body emphasis** |
| Links, secondary action, data | `--blue` `#1C5CAB` | 6.9:1 |
| Body text | `--ink-2` `#4A5058` | 7.4:1 |
| Muted labels | `--ink-3` `#878E97` | 3.4:1 — **large text and non-text only** |
| Dark sections | `--steel` `#1A1F26` | |

**`#62ACDA` is banned.** It measures 2.49:1 on white against a 4.5:1 requirement and is the site-wide contrast failure this build exists to fix (audit 1.5). If you find it anywhere, it is a critical bug.

Never place `--hasko-red` adjacent to `--good` without an icon or label — they sit close for red-green deficiency.

## Type

Two families. A grotesque for everything, a monospace for every number.

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Display | `clamp(44px, 6vw, 86px)` | 700 | `-0.025em` |
| H2 | `clamp(30px, 3.8vw, 52px)` | 700 | `-0.02em` |
| H3 | `clamp(21px, 2.2vw, 28px)` | 600 | `-0.015em` |
| Body | `16.5px` | 400 | `0` |
| Small | `14px` | 400 | `0` |
| Spec / numeric | `13–15px` mono | 500 | `0` |
| Index label | `11px` mono | 500 | `0.14em` uppercase |

**Body is 16.5px, never 14px.** The old 14px base was an audit finding — this audience reads specification tables.

**The monospace rule is load-bearing.** Every measurement, model code, capacity, part number, file size, result count and section index is monospace. A buyer scanning for "does this handle 30-inch material" finds the numbers by texture before reading a word. Prose numbers stay in the grotesque.

## Spacing, grid, radii

- Scale: `4 8 12 16 24 32 48 64 96 128 160` — nothing between steps
- Container `1280px`, full-bleed media `1440px`
- 12 columns, `24px` gap
- Gutters `24 / 40 / 64` at mobile / tablet / desktop
- Section rhythm `96px` mobile, `128px` desktop, `160px` at major transitions
- Radii: `4px` inputs · `12px` cards · `20px` feature cards · `999px` pills and chips

## Motion

| Purpose | Token | Duration | Easing |
|---|---|---|---|
| Micro | `--t-micro` | `160ms` | `--ease-standard` |
| Standard | `--t-standard` | `280ms` | `--ease-standard` |
| Entrance | `--t-enter` | `680ms` | `--ease-pop` |
| Exit | `--t-exit` | `200ms` | `--ease-exit` |
| Filter reflow | `--t-reflow` | `240ms` | `--ease-standard` |

Reveal is `opacity` plus `translateY(20px→0)`. Nothing else. Stagger `70ms`, cap at six siblings.

Every animation must be nameable as a function. Reveal on entry, count-up on stat entry, reflow on filter change, nav condensing at scroll depth. If you cannot name it, delete it.

Every transform, transition and animation needs a `prefers-reduced-motion: reduce` escape that renders the final state. The pattern is in `references/tokens.css`.

## Components

Sixteen for the whole build. Full anatomy in `references/components.md`. Reuse before creating.

Announcement bar · Header + mega-menu · Quote drawer · Machine card · Spec table · Filter rail + chips · Compare tray · Zero-result panel · Industry card · Testimonial block · Parts lookup · Document row · Process rail · Sticky-centre band · Route selector · Footer

## Validate

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
```

Reports hardcoded colours, off-scale spacing, durations outside the vocabulary, the banned blue, and reduced-motion gaps. Run it after every section.
