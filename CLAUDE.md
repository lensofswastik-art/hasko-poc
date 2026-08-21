# HASKO landing page — project brief

You are building an interactive, immersive landing page for **HASKO Inc.**, a Tennessee manufacturer of heavy-duty industrial woodworking machinery, founded 1930.

This is a **demo build for a client pitch**. Beautiful enough to win the work, correct enough that a developer could ship it.

This file is self-contained: the audit, the tokens, the wireframe and the copy are all here. The skills carry deeper reference and the runnable verifiers.

---

## 1 · The one thing to understand first

Every section closes a numbered finding from a measured UX audit of `haskomachines.com`. If a change does not close a finding or serve the aesthetic, it is scope creep.

**The audit's conclusion:** Hasko owns everything it needs to win online — 96 years of engineering, machines running after 25 years, customers reporting yield gains in writing — and none of it is where a buyer will find it.

### Who the page is for

Three buyers. The current site serves only the second.

| | Buyer | What they need | Current site |
|---|---|---|---|
| 1 | **Plant / operations manager** *(primary)* | Thinks in problems: yield is down, the line is bottlenecked. Does not know model codes. | **No route at all** |
| 2 | Engineer / maintenance lead | Arbor HP, material width, feed rate, fast | Specs behind a tab |
| 3 | Owner with an installed machine | A part, a manual, a serial match. Worth ~2× the margin of a machine sale. | A phone number in a paragraph |

### The three primary tasks

The first screen must make all three obvious.

1. Find the right machine for my application → industry-led path
2. Check whether a machine fits my line → specs + a quote route
3. Get a part or manual for a machine I own → parts path

---

## 2 · The UX audit — all 24 findings

Measured 19 Aug 2026, desktop 1440×900 and mobile 390×844. Contrast ratios, image counts, ARIA attributes and performance figures were computed in the live pages, not estimated.

### P1 — Critical (6)

**1.1 · News archive renders with no styling at all**
`/news/` loads as raw unstyled HTML — default serif headings, blue underlined links, the contact form above the news list. Reproduced across loads. Individual posts render correctly, so the fault is scoped to the archive template. Linked from the homepage.
→ **Out of scope.** Template fix.

**1.2 · The 404 page is blank**
Header, empty white content area, footer. No heading, no explanation, no search, no links. `<title>` says "Page not found"; the body says nothing. Every mistyped URL and stale inbound link terminates here.
→ `404.html`

**1.3 · No way to request a quote from a product page**
21 machine pages, zero per-product conversion elements. Only routes are the header phone and a generic sidebar form. A buyer who has just read arbor HP and material width is at peak intent and the page offers nothing.
→ Quote drawer + machine detail page

**1.4 · Homepage first viewport has no proposition and no action**
Auto-rotating carousel of a machine photo with the model name burned into the JPEG. No headline, no sentence about what Hasko makes, no CTA. **The `<h1>` is the string "Home".** The four industry tiles sit entirely below the fold.
→ Section 01

**1.5 · Primary navigation fails colour contrast**

| Element | FG | BG | Size | Ratio | Needs |
|---|---|---|---|---|---|
| Primary nav | `#62ACDA` | `#FFFFFF` | 16px bold | **2.49:1** | 4.5:1 |
| Sidebar categories | `#62ACDA` | `#FFFFFF` | 14px | **2.49:1** | 4.5:1 |
| Product card titles | `#DB2128` | `#FFFFFF` | 20px | 4.93:1 | pass |
| Utility bar tagline | `#62ACDA` | `#333333` | 14px bold | 5.07:1 | pass |

The brand blue passes on the dark utility bar and fails everywhere it sits on white. One token, site-wide reach.

**And the deeper problem underneath it.** The logo file is a two-colour mark — `#FF0000` on white, 45.5% red coverage, no other colour in it. The interface is built from `#62ACDA` blue and `#DB2128` red. **Three brand colours, none of which match each other, and the one in the logo appears nowhere in the interface.** Pure `#FF0000` measures 3.83:1 on the page background and 4.00:1 under white — it cannot legally carry text either way, which is presumably why someone reached for a different red in CSS and never reconciled the two.

→ Drop blue entirely. The interface is built from the logo's red family, and `#FF0000` is reserved for reproducing the mark. See §4.

**1.6 · Specifications hidden behind a tab that opens on a one-sentence panel**
Five tabs; the default is "Application", one sentence. The Specifications panel holds material width, arbor HP, saw diameter, sleeve, feed rolls and feed drive — what a buyer came for, invisible on load.
→ Spec table visible on load

### P2 — High (9)

**2.1 · The application-led buying path is orphaned**
A complete silo at `/why-hasko/` — Testimonials, Flooring, Ripped Products, Dimensional Wood, Moulding — with **no entry in the primary navigation**. Only reachable from four unlabelled tiles below the homepage carousel.
→ Industries mega-menu + section 03

**2.2 · The strongest proof is two levels deep and unnavigated**
Named, quantified testimonials sitting in that orphaned silo. Nowhere on the homepage, products index, or any product page. The only product-page proof is one anonymous pull-quote.
→ Section 06

**2.3 · 21 machines on one flat page, no filtering**
Sidebar lists 12 categories as links that navigate away rather than filter. No sort, no compare, no in-catalogue search. Mobile is a single column, ~6,000px of scroll to the last machine. **The taxonomy already exists in the markup** — `category-flooring`, `category-side-matching` and ten more.
→ Section 04

**2.4 · Parts & Service has no self-service**
No parts lookup, serial search, request form, manuals, diagrams or ordering. The parts number sits as **unlinked plain text inside a paragraph**. Zero `mailto:` links exist anywhere on the site.
→ Section 07

**2.5 · Contact page has no routing**
Nine identically-weighted cards — eight phone and fax lines plus the address. No email addresses, no guidance. Naming individuals is a real differentiator, undercut by giving the VP of Sales the same weight as the fax number. Directions are two bulleted lists with no map.
→ Section 11

**2.6 · The enquiry form cannot qualify a lead**
Fields: Name, Email, Subject, Message. No company, phone, application, machine or timeline. **Placeholder text is the only label**, so it disappears on typing. reCAPTCHA v2 adds friction and its own accessibility cost.
→ Quote drawer

**2.7 · 71% of catalogue images have no alt text** — 17 of 24 on `/products/`, 3 of 7 on the SR Series page.

**2.8 · Tabs declare a role without state** — five controls with `role="tab"` and `aria-controls`, but `aria-selected` is **null on all five** and all carry `tabindex="0"`.

**2.9 · The catalogue is built as blog posts** — every machine is a WordPress `post` (`post-199 post type-post`), not a product. No structured specs, no `Product` schema. Only JSON-LD is a generic `WebPage` graph.

### P3 — Medium (9)

| # | Finding |
|---|---|
| 3.1 | **Dead Google+ link** in the header of every page — service closed April 2019 |
| 3.2 | **Content staleness** — SR Series brochure served from `/2016/08/` as current spec; Mekanika link resolves to `mekanika.net/accueil/`, a French page, from a US site; four news posts, latest March 2026 |
| 3.3 | **"View" is a CSS pseudo-element** — `::after { content: "View" }`. Not real text, not independently focusable |
| 3.4 | **Search returns junk with no zero-state** — media-library attachments ("O15", "O14") appear as results. Zero results is the sentence "No Results Found." with nothing else |
| 3.5 | **Inconsistent product imagery** — photography on white, blue CAD renders, and raw multi-colour CAD exports in the same grid |
| 3.6 | **Model codes lead product names** — "PF MPEM-C LP (Locking Profile)". Every card CTA is the same word |
| 3.7 | **No breadcrumbs, related machines or next step** — the product page simply ends. Machines are bought as lines |
| 3.8 | **Footer carries no navigation** — five badges and a copyright line. No address, phone, sitemap or links |
| 3.9 | **IWF presence absent** — Hasko/Mekanika is a listed IWF Atlanta exhibitor; the site never mentions it. Mereen-Johnson runs a sitewide bar with its booth number |

### What is already working — do not break it

- **Performance.** 35 requests, ~199KB transferred, painted ~1.75s, 287 DOM nodes. A redesign that loses this has traded down.
- **Mobile.** Working hamburger, clean single-column reflow, no horizontal overflow. The mobile problems are content and hierarchy, not layout.
- **The specifications themselves.** Specific, quantified, in mill units.
- **The testimonials themselves.** "Throughput increased by 2k per shift" beats any headline.
- **Named people on the contact page.** Direct lines for VP Sales, Engineering Director, Operations Director. Needs routing, not removal.
- **On-page SEO basics.** Meta descriptions written, canonical tags present.

### Coverage target

**23 of 24 closed.** 1.1 is a template fix outside this build. Do not overstate — `audit-verifier` checks the claim against the built artefact.

---

## 3 · What the build must beat

Three competitors were rendered and scored: Mereen-Johnson, WEINIG USA, Eagle Machines. Eight conventions recur. **Hasko currently meets 3.**

| # | Convention | MJ | WEINIG | Eagle | Hasko now |
|---|---|---|---|---|---|
| 1 | First screen states what the company makes | ✓ | ✓ | ✗ | ✗ |
| 2 | Two-tier catalogue (category → machine) | ✓ | ✓ | ✓ | ✗ |
| 3 | Product cards carry a description | ✓ | ✓ | ✓ | ✗ |
| 4 | Ungated spec sheets on the machine page | ✓ | ✓ | part | ✓ |
| 5 | A conversion CTA on the machine page | ✓ | ✓ | ✗ | ✗ |
| 6 | Persistent contact route in the header | ✓ | ✓ | ✓ | ✓ |
| 7 | Heritage and credentials surfaced | ✓ | ✓ | ✓ | ✓ |
| 8 | Trade-show presence promoted on site | ✓ | ✗ | ✓ | ✗ |

### The two gaps nobody in the field fills

These are why the page can **beat** the field rather than match it. If either gets watered down, the build becomes a nicer version of the category instead of a better one.

**+1 · Named customer outcomes on the homepage.** None of the three does this. Mereen-Johnson leads with heritage, WEINIG with product, Eagle with a stock photograph of a mountain range. Hasko already owns the material.

**+2 · Specifications as data, not documents.** Every site delivers specs as a PDF. None lets a buyer ask "which of your machines handles my material width at my throughput" without opening four documents.

---

## 4 · Design system

Engineered, not decorated. The reference points are a machine spec sheet and a blueprint, not a SaaS landing page.

**If a value exists as a token, use the token.** If you need one that does not exist, ask — do not hardcode. The only exception is inside `css/tokens.css`.

### The brand mark, and what the palette is built from

`haskologo_1.png` — 1482×332, **two colours: `#FF0000` and `#FFFFFF`**, with red covering 45.5% of the artwork. No blue, no secondary, no gradient. Hasko's brand is red.

So the palette is **one hue and a set of neutrals**. Blue is gone — it was never in the mark, and the blue that was in the interface (`#62ACDA`) is the failure this build exists to fix.

Pure `#FF0000` cannot do the work on its own: 3.83:1 on the page background, 4.00:1 under white. It fails AA as text in both directions, which is almost certainly why the site quietly uses a second, darker red (`#DB2128`) in CSS and never reconciled the two. **The fix is a proper ramp in the logo's hue** — `#FF0000` reproduces the mark, and calibrated steps either side of it do the interface work. Every step below carries its measured ratio.

### Typefaces

**Instrument Sans is primary. Geist is secondary.**

| Role | Family | Used for |
|---|---|---|
| `--font-primary` | **Instrument Sans** | Display, headings, body, standfirsts — the voice of the page |
| `--font-secondary` | **Geist** | UI labels, buttons, form fields, nav, captions |
| `--font-mono` | **Geist Mono** | **Every number a buyer reads as data** |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400&family=Geist:wght@400..600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Self-host the `woff2` subsets before any real launch — the performance budget allows 2 families and 4 weights, and three families from a CDN will breach it. For the demo the CDN link is fine.

**The monospace rule is load-bearing.** Every measurement, model code, capacity, part number, file size, result count and section index is **Geist Mono**. A buyer scanning for "does this handle 30-inch material" finds the numbers by texture before reading a word. Prose numbers stay in Instrument Sans.

### Type scale

| Role | Family | Size | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Display | Instrument Sans | `clamp(44px, 6vw, 86px)` | 700 | `-0.025em` | 1.02 |
| H2 | Instrument Sans | `clamp(30px, 3.8vw, 52px)` | 700 | `-0.02em` | 1.1 |
| H3 | Instrument Sans | `clamp(21px, 2.2vw, 28px)` | 600 | `-0.015em` | 1.2 |
| H4 | Instrument Sans | `18px` | 600 | `-0.01em` | 1.3 |
| Body L | Instrument Sans | `18px` | 400 | `0` | 1.65 |
| Body | Instrument Sans | `16.5px` | 400 | `0` | 1.65 |
| UI label | Geist | `15px` | 500 | `0` | 1.4 |
| Small | Geist | `14px` | 400 | `0` | 1.55 |
| Spec / numeric | Geist Mono | `14px` | 500 | `0` | 1.5 |
| Index label | Geist Mono | `11px` | 500 | `0.14em` uppercase | 1 |

**Body is 16.5px, never 14px.** The old 14px base was an audit finding — this audience reads specification tables.

### Tokens — copy this to `css/tokens.css`

```css
:root {
  /* ---- neutrals ---- ratios measured against --surface #FBFAF8 ----------
     BANNED: #62ACDA — 2.49:1, the site-wide failure this build fixes.
     There is no blue in this system. The logo is red; so is the palette.  */
  --ink:            #0E1116;   /* 16.9:1  primary text, dark sections      */
  --ink-2:          #4A5058;   /*  7.4:1  body text, captions              */
  --ink-3:          #878E97;   /*  3.4:1  muted — large/non-text ONLY      */
  --surface:        #FBFAF8;   /* page background, warm off-white          */
  --surface-2:      #FFFFFF;   /* cards                                    */
  --surface-3:      #EFEDE8;   /* machine photography seamless             */
  --steel:          #1A1F26;   /* dark sections, footer                    */
  --steel-2:        #252B34;   /* cards on dark                            */
  --rule:           #E2E0DA;   /* hairlines, dividers                      */
  --rule-strong:    #C9C6BE;   /* link underlines, input borders           */
  --on-steel:       #FFFFFF;
  --on-steel-2:     rgba(255,255,255,.82);
  --on-steel-3:     rgba(255,255,255,.56);
  --rule-dark:      rgba(255,255,255,.16);

  /* ---- the red ramp ---- one hue, ~358deg, taken from the logo ----------
     Each step has one job. Using the wrong step is a contrast bug, not a
     taste question — the measured ratio is on every line.                 */
  --red-mark:       #FF0000;   /*  3.83:1  THE LOGO ONLY. Never text.
                                  Never a fill with text on top.           */
  --red:            #DB2128;   /*  4.73:1  brand accent on light: rules,
                                  section indices, icons, underlines       */
  --red-action:     #C41219;   /*  white label on it 6.09:1 — solid fills,
                                  primary buttons                          */
  --red-deep:       #A8161C;   /*  7.20:1  hover, pressed, red body text   */
  --red-ink:        #8E1116;   /*  8.20:1 on --red-tint — text on tint     */
  --red-light:      #FF6B6E;   /*  5.98:1 on --steel, 5.14:1 on --steel-2
                                  the ONLY red for dark bands              */
  --red-tint:       #FDECEC;   /*  selected chips, callouts. ink 16.6:1    */
  --red-line:       #F7D9DA;   /*  hairline on --red-tint                  */

  /* ---- status ---- never the only signal; always icon + label ---------- */
  --good:           #1B7F4B;   /*  4.8:1  in stock, confirmed              */
  --warn:           #B26A00;   /*  4.6:1  lead time, made to order         */

  /* ---- type ------------------------------------------------------------ */
  --font-primary:   "Instrument Sans", system-ui, -apple-system, sans-serif;
  --font-secondary: "Geist", "Instrument Sans", system-ui, sans-serif;
  --font-mono:      "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  --fs-display: clamp(44px, 6vw, 86px);
  --fs-h2:      clamp(30px, 3.8vw, 52px);
  --fs-h3:      clamp(21px, 2.2vw, 28px);
  --fs-h4:      18px;
  --fs-body-l:  18px;
  --fs-body:    16.5px;          /* never 14px — audit finding */
  --fs-ui:      15px;
  --fs-small:   14px;
  --fs-spec:    14px;            /* mono */
  --fs-index:   11px;            /* mono, uppercase */

  --lh-display: 1.02;  --lh-heading: 1.15;  --lh-body: 1.65;  --lh-spec: 1.5;
  --tr-display: -0.025em; --tr-h2: -0.02em; --tr-h3: -0.015em;
  --tr-body: 0; --tr-index: 0.14em;
  --fw-regular: 400; --fw-medium: 500; --fw-semi: 600; --fw-bold: 700;

  /* ---- spacing — nothing between steps --------------------------------- */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-6: 24px;  --space-8: 32px;  --space-12: 48px; --space-16: 64px;
  --space-24: 96px; --space-32: 128px; --space-40: 160px;
  --section-y: var(--space-24);      /* mobile  */
  --section-y-md: var(--space-32);   /* desktop */
  --section-y-lg: var(--space-40);   /* major transitions */

  /* ---- layout ---------------------------------------------------------- */
  --container: 1280px; --container-wide: 1440px;
  --gutter: 24px; --gutter-md: 40px; --gutter-lg: 64px; --grid-gap: 24px;

  /* ---- radii ----------------------------------------------------------- */
  --r-input: 4px; --r-card: 12px; --r-feature: 20px; --r-pill: 999px;

  /* ---- elevation ------------------------------------------------------- */
  --shadow-card:   0 2px 8px rgba(14,17,22,.04);
  --shadow-raised: 0 16px 40px rgba(14,17,22,.08);
  --shadow-drawer: 0 24px 64px rgba(14,17,22,.18);

  /* ---- motion ---------------------------------------------------------- */
  --ease-standard: cubic-bezier(.4,0,.2,1);
  --ease-pop:      cubic-bezier(.2,.7,.3,1);
  --ease-exit:     cubic-bezier(.4,0,1,1);
  --t-micro: 160ms; --t-standard: 280ms; --t-enter: 680ms;
  --t-exit: 200ms;  --t-reflow: 240ms;   --stagger: 70ms;

  /* ---- focus & targets — never remove without replacing ----------------
     Ink, not red. A red ring on a red button is invisible; ink measures
     3.10:1 against --red-action, clearing 1.4.11 on the worst pairing.    */
  --focus:      var(--ink);          /* 18.13:1 on --surface              */
  --focus-ring: 2px solid var(--focus);
  --focus-offset: 2px;
  --target-min: 44px;
}

/* Dark bands flip two tokens and nothing else. */
.on-dark {
  --focus: #FFFFFF;                  /* 16.56:1 on --steel                */
  --red:   var(--red-light);         /* --red at 3.36:1 on steel FAILS    */
}

/* Required. Every transform, transition and animation renders at final
   state. Content must be VISIBLE, not hidden and not mid-transition.      */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
  .reveal { opacity: 1 !important; transform: none !important; }
  [data-parallax] { transform: none !important; }
  .sticky-centre { position: static !important; }
}

:where(a,button,input,select,textarea,summary,[tabindex]):focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-offset);
}
```

### Colour rules

**The palette is red and neutrals. There is no blue.** The logo is a two-colour mark — `#FF0000` on white and nothing else — so the interface is built from that hue and the greys around it. Every step of the ramp has one job.

| You need | Use | Not |
|---|---|---|
| The logo | `--red-mark` `#FF0000` | any other red — reproduce the mark exactly |
| A primary button | `--red-action` fill, `#FFFFFF` label | `--red-mark` — white on it is 4.00:1, fails |
| Button hover / pressed | `--red-deep` | a lightened red |
| A section index, rule, icon, arrow | `--red` | `--red-mark` |
| Red text at body size | `--red-deep` | `--red` at 4.73:1 — no margin at 16.5px |
| Anything red on a dark band | `--red-light` (via `.on-dark`) | `--red` — 3.36:1 on steel, fails |
| A selected chip or callout | `--red-tint` fill, `--red-ink` text | `--red-tint` with `--red` text |
| A focus ring | `--focus` (ink, or white on dark) | red — invisible against red controls |

**`#62ACDA` is banned.** 2.49:1 on white. If you find it anywhere it is a critical bug.

**`--red-mark` is the logo and nothing else.** `#FF0000` is 3.83:1 on the page background and 4.00:1 under white — it fails AA as text in both directions. It appears in the `<img>` or `<svg>` of the mark and nowhere else in the stylesheet. If you find `color: #FF0000` it is a bug.

**Red now carries more of the page, so protect its signal.** Solid red fill means *this is the action*. If three things on one screen are filled red, none of them reads as the action. One primary per view; everything else is `--red` as an accent on a neutral ground, or a neutral button with a red arrow.

**Inline links are ink with an underline, not red.** `--ink` plus a 1px `--rule-strong` underline, going `--red-deep` with a `--red` underline on hover. Colour is never the only thing distinguishing a link (WCAG 1.4.1), and it keeps red meaning *action* rather than *text*.

**`--ink-3` at 3.4:1 is legal for large text and non-text only.** On body copy the fix is `--ink-2`, not a smaller font.

**Status colour is never the only signal.** `--good` and `--warn` measure 1.21:1 and 1.44:1 against `--red-action` — under red-green deficiency they are nearly the same colour as the buttons around them. Every status carries an icon and a word: `✓ In stock`, `◷ 6–8 week lead time`. Never a bare coloured dot.

### Motion

| Purpose | Token | Duration | Easing |
|---|---|---|---|
| Micro — hover, colour, focus | `--t-micro` | `160ms` | `--ease-standard` |
| Standard — transforms, panels | `--t-standard` | `280ms` | `--ease-standard` |
| Entrance — scroll reveal | `--t-enter` | `680ms` | `--ease-pop` |
| Exit | `--t-exit` | `200ms` | `--ease-exit` |
| Filter reflow | `--t-reflow` | `240ms` | `--ease-standard` |

Reveal is `opacity 0→1` plus `translateY(20px→0)`. Nothing else. Stagger siblings `70ms`, cap at six.

**Every animation must be nameable as a function.** Reveal on entry, count-up on a stat entering view, reflow on filter change, nav condensing at scroll depth. If you cannot name it, delete it.

### Imagery — three treatments, never mixed inside a component

| Treatment | Where | Spec |
|---|---|---|
| **In-plant documentary** | Hero, industry cards, proof, parts | Dark, warm, real. Machines running, operators working. 16:9 and 4:5 |
| **Machine on seamless** | Catalogue cards, machine pages | Same three-quarter angle, same lens and height, `--surface-3` #EFEDE8 |
| **Blueprint line work** | Section backgrounds, dividers | CAD exports as single-weight line art, `--ink` at 6–8%, never behind body text |

Audit 3.5 was three visual languages in one grid. If all 21 machines cannot be reshot, use one consistent silhouette treatment on the seamless grey. Consistency beats fidelity here.

---

## 5 · Wireframe — the page stack

**Legend** — `▓▓▓` image · `░░░` blueprint texture · `▒▒▒` video · `[ Btn ]>` primary filled · `<mono>` Geist Mono · `( 01 )` section index · `->` link with arrow · `[ ]` checkbox · `(o)` selected chip

```
│  00   ANNOUNCEMENT BAR      44px        dark     conditional     │
│  --   HEADER                utility + primary    sticky          │
│  01   HERO                  88vh / min 720px                     │
│  02   TRUST STRIP           96px                                 │
│  03   INDUSTRY PATHS        ~720px                               │
│  04   MACHINE FINDER        ~1100px              the core        │
│  05   INTEGRATED LINES      ~640px      dark                     │
│  06   PROOF                 ~820px                               │
│  07   PARTS & SERVICE       ~760px                               │
│  08   WHY HEAVY-BUILT       ~1200px     sticky                   │
│  09   AUTOMATION            ~560px                               │
│  10   RESOURCES             ~480px                               │
│  11   CONTACT               ~640px                               │
│  12   FOOTER                ~480px      dark                     │
├··································································┤
│  Total ~8,900px desktop      Dark bands: 00, 05, 12              │
```

Desktop grid: 12 columns, 1280px container, 24px gutter.

---

## 6 · Section specs

Each section below: the frame, the real copy, the behaviour, the finding it closes.
**The copy is final. Do not paraphrase it, do not substitute lorem.**

### 00 · Announcement bar — *closes 3.9*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ DARK BAND                                                             44px                 │
│                                                                                            │
│      <IWF ATLANTA 2026>  Booth #XXXX · 25-28 Aug · Georgia World                           │
│      Congress Center     Book a meeting at the show  ->            [x]                     │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

Renders **only when an event is live**. No empty state — when there is none it does not render and the header moves up.

The bar is a dark band, so it carries `.on-dark`. Event label Geist Mono `--fs-index` `--red-light` — `--red` is 3.36:1 on steel and would fail here. Detail 13px `--on-steel-2`. Text link, not a whole-bar link. Dismiss 44×44, `sessionStorage` so it returns next visit.

### Header — *closes 1.5, 2.1*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ <SINCE 1930>  ·  <MADE IN THE USA>     423.648.5200 · Parts · Contact                      │
├····························································································┤
│                                                                                            │
│  [HASKO]     Industries v  Machines v  Automation  Parts & Service                         │
│              About                    search   [ Request a Quote ]>                        │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

Condensed past 120px scroll — utility row collapses, one 60px row.

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│  [HASKO]      Industries ^  Machines v  Automation  Parts  About                           │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                            │
│   +------------+ +------------+ +------------+ +------------+                              │
│   | ▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓ |                              │
│   | Flooring   | | Ripped     | | Dimensional| | Moulding & |                              │
│   | solid, eng | | products & | | wood, furn | | panelling  |                              │
│   | truck      | | rough mill | | cabinetry  | |            |                              │
│   | <7 MACH.>  | | <6 MACH.>  | | <5 MACH.>  | | <3 MACH.>  |                              │
│   +------------+ +------------+ +------------+ +------------+                              │
│                                                                                            │
│   Not sure which line you need?   Talk to an engineer  ->                                  │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**The Industries mega-menu is the fix for the orphaned `/why-hasko/` silo.** Machines mega-menu: 12 categories in three columns plus "View all 21 machines".

Nav links `--ink` 15px Geist `--fw-medium`. Opens on hover **and** click/Enter. `Esc` closes. Focus trapped. Mobile: full-screen panel, 48px rows, CTA pinned bottom.

### 01 · Hero — *closes 1.4*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ DARK, warm gradient                              88vh / min 720px                          │
│ | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9  | 10 | 11 | 12 |                              │
│                                                                                            │
│  <HEAVY-BUILT PERFORMANCE · SINCE 1930>   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                         │
│                                          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                         │
│  Machines that are still                 ▓▓▓                    ▓▓▓                        │
│  running in 25 years.                    ▓▓▓  machine, bleeds   ▓▓▓                        │
│                        H1, cols 1-6      ▓▓▓  off right edge    ▓▓▓                        │
│  Hasko builds heavy-duty machinery for   ▓▓▓                    ▓▓▓                        │
│  solid and engineered flooring, rough    ▓▓▓  cols 7-12         ▓▓▓                        │
│  mills, moulding and dimensional wood.   ▓▓▓                    ▓▓▓                        │
│  Designed to be simple to set up,        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                         │
│  simple to operate, simple to keep        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                         │
│  running.                                                                                  │
│                                                                                            │
│  [ Find machines for my application v ]>  [ Browse all 21  -> ]                            │
│                                        ░░░░ blueprint 6% ░░░░░░░░░                         │
├····························································································┤
│  <96 YEARS> · <21 MACHINES> · <25-YEAR SERVICE LIFE> · <SODDY-DAISY>                       │
│  v scroll                                                                                  │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Copy, final:**

- Eyebrow — `HEAVY-BUILT PERFORMANCE · SINCE 1930`
- H1 — **Machines that are still running in 25 years.**
- Standfirst — *Hasko builds heavy-duty machinery for solid and engineered flooring, rough mills, moulding and dimensional wood. Designed to be simple to set up, simple to operate, and simple to keep running.*
- Primary — `Find machines for my application ▾` · Secondary — `Browse all 21 machines →`
- Proof strip — `96 YEARS` · `21 MACHINES` · `25-YEAR SERVICE LIFE` · `MADE IN SODDY-DAISY, TN`

The headline states the promise as an outcome. "Heavy-built" is a claim; "still running in 25 years" is the same claim a buyer can act on.

**Behaviour.** **No carousel** — one composed frame. The primary button expands a four-way selector inline, no page load, jumping to section 04 pre-filtered. Proof numbers count up once, 900ms, static under reduced motion. Machine image gets `4%` parallax drift only.

**Mobile** — everything above the image stays within `100svh`.

```
┌──────────────────────────────────────┐
│ DARK                       100svh    │
│                                      │
│ <HEAVY-BUILT PERFORMANCE>            │
│ <SINCE 1930>                         │
│                                      │
│ Machines that are                    │
│ still running in                     │
│ 25 years.                            │
│                                      │
│ Hasko builds heavy-duty machinery    │
│ for solid and engineered flooring,   │
│ rough mills, moulding and            │
│ dimensional wood.                    │
│                                      │
│ [ Find machines for my app.  v ]>    │
│ [ Browse all 21 machines  ->   ]     │
│                                      │
│ +--------------+-------------------+ │
│ | <96 YEARS>   | <21 MACHINES>     | │
│ +--------------+-------------------+ │
│ | <25-YR LIFE> | <SODDY-DAISY, TN> | │
│ +--------------+-------------------+ │
├──────────────────────────────────────┤
│ ▓▓▓▓▓▓  machine 16:9  ▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└──────────────────────────────────────┘
```

### 02 · Trust strip — *convention 7*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ LIGHT SURFACE                                                    96px                      │
│                                                                                            │
│  <EST. 1930> | <MADE IN THE USA> | [WMMA] | [MEKANIKA] | [USNR]                            │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

Logo marks monochrome `--ink-3`, full colour on hover, real `<img>` with alt. USNR appears on Hasko's IWF exhibitor listing; the current site mentions only Mekanika. Mobile: two rows, dividers dropped.

### 03 · Industry paths — *closes 2.1, the largest structural gap*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│  ( 01 ) -------- <INDUSTRIES>                                                              │
│                                                                                            │
│  What are you making?      Four production lines, one engineering                          │
│  H2, cols 1-6              approach. Start where your plant does.                          │
│                                                                                            │
│  +------------+ +------------+ +------------+ +------------+ +----                         │
│  | ▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓                         │
│  | ▓ 4:5    ▓ | | ▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓                         │
│  | ░ scrim  ░ | | ░░░░░░░░░░ | | ░░░░░░░░░░ | | ░░░░░░░░░░ | | ░░░                         │
│  | <( 01 )>   | | <( 02 )>   | | <( 03 )>   | | <( 04 )>   | | nxt                         │
│  | Solid &    | | Ripped     | | Dimensional| | Moulding & | | crd                         │
│  | engineered | | products & | | wood, furn | | panelling  | | cut                         │
│  | flooring   | | rough mill | | cabinetry  | |            | | off                         │
│  |            | |            | |            | |            | |                             │
│  | End match, | | Gang rip-  | | Chopping,  | | Matchers,  | |                             │
│  | side match,| | saws, scan/| | defect     | | planers,   | |                             │
│  | pre-surf.  | | rip, strip | | scanning   | | surfacers  | |                             │
│  |            | |            | |            | |            | |                             │
│  | <7 MACH.>  | | <6 MACH.>  | | <5 MACH.>  | | <3 MACH.>  | |                             │
│  | <400 FPM>  | | <7,000 BF> | | <SCAN-DRV> | | <HVY ARBR> | |                             │
│  |        (->)| |        (->)| |        (->)| |        (->)| |                             │
│  +------------+ +------------+ +------------+ +------------+ +----                         │
│                                                                                            │
│  =============---------------------  progress rail       < >                               │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**H2** — *What are you making?*  **Supporting** — *Four production lines, one engineering approach. Start where your plant does.*

| # | Title | Description | Figures |
|---|---|---|---|
| 01 | Solid & engineered flooring | End matchers, side matchers, pre-surfacers and truck flooring lines. | `7 MACHINES` `FROM 400 FPM` |
| 02 | Ripped products & rough mill | Gang ripsaws, scan/rip lines and strip saws built to lift yield. | `6 MACHINES` `UP TO 7,000 BD FT/HR` |
| 03 | Dimensional wood, furniture & cabinetry | Chopping, defect scanning and optimisation for components. | `5 MACHINES` `SCAN-DRIVEN YIELD` |
| 04 | Moulding & panelling | Matchers, planers and surfacers for architectural profiles. | `3 MACHINES` `HEAVY-BUILT ARBORS` |

**Behaviour.** Native `overflow-x` + `scroll-snap-type: x mandatory` — **works with JS disabled**. Progress rail beneath, real arrow buttons for keyboard. Hover scales the image `1.04` inside a fixed frame, arrow slides 4px. Mobile 1.2 cards wide so the next is visibly cut. Under reduced motion the rail becomes a static 2×2 grid.

### 04 · Machine finder — *closes 2.3, 3.3, 3.4, 3.6 · the core section*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ░░░ blueprint behind the filter rail, 6% ░░░                                               │
│  ( 02 ) -------- <MACHINES>                                                                │
│                                                                                            │
│  Find the machine that fits your line.                                                     │
│  Filter by what you run, not by what we call it.                                           │
│                                                                                            │
│  +--------------------------------------------------------+  <--                           │
│  | APPLICATION v  PROCESS v  WIDTH v  HP v   search...     |  stky                         │
│  +--------------------------------------------------------+                                │
│                                                                                            │
│  <SHOWING 21 OF 21 MACHINES>              [ ] Compare · Clear                              │
│                                                                                            │
│  +-----------------+ +-----------------+ +-----------------+                               │
│  | ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ |                               │
│  | ▓ seamless grey | | ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ | | ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ |                               │
│  +-----------------+ +-----------------+ +-----------------+                               │
│  | <BOARD RIP> [ ] | | <END MATCH> [ ] | | <PLANING>   [ ] |                               │
│  | <SR-36>         | | <MPEM-C>        | | <FSP-EF>        |                               │
│  | Gang Ripsaw     | | End Matcher     | | StripMaster     |                               │
│  | <36" · 150 HP · | | <9" BOARDS ·    | | <STRIP FEED ·   |                               │
│  |  400 FPM>       | |  LOCKING PROF.> | |  SCAN-READY>    |                               │
│  | High-speed      | | Squares and     | | Surfaces strips |                               │
│  | straight/curve  | | profiles board  | | ahead of scan   |                               │
│  | sawing.         | | ends.           | | and ripping.    |                               │
│  | View specs -> | | | View specs -> | | | View specs -> | |                               │
│  |          Quote  | |          Quote  | |          Quote  |                               │
│  +-----------------+ +-----------------+ +-----------------+                               │
│                                                                                            │
│  ... 18 more, 3 per row                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Zero result — never a dead end.** The current site's zero state is the sentence "No Results Found." with nothing else.

```
│  <SHOWING 0 OF 21 MACHINES>                                                                │
│  (x) Moulding   (x) 36"+   (x) 150+ HP            Clear all                                │
│                                                                                            │
│  +-------------------------------------------------------+                                 │
│  |  No machine matches all three filters.                 |                                │
│  |                                                        |                                │
│  |  The closest is the SR-36 Gang Ripsaw, 36" at 150 HP,  |                                │
│  |  built for ripped products rather than moulding.       |                                │
│  |                                                        |                                │
│  |  [ View the SR-36 -> ]   [ Talk to an engineer ]       |                                │
│  |                                                        |                                │
│  |  Or remove a filter: (x) Moulding (x) 36"+ (x) 150+ HP |                                │
│  +-------------------------------------------------------+                                 │
```

**H2** — *Find the machine that fits your line.*  **Supporting** — *Filter by what you run, not by what we call it.*

**Filters** — each already exists as taxonomy in Hasko's current markup, which is what makes this cheap:

| Group | Values |
|---|---|
| Application | Flooring · Ripped products · Dimensional wood · Moulding |
| Process | Ripping · Chopping · Matching · Planing · Scanning · Feeding · Material handling |
| Material width | `< 12"` · `12–24"` · `24–36"` · `36"+` |
| Horsepower | `< 50` · `50–100` · `100–150` · `150+` |

**Behaviour.** Instant client-side filtering, no reload. Count updates via `aria-live="polite"`. Active filters as removable chips with accessible names like *"Remove filter: material width 24–36 inches"*. Compare up to three, tray docks at two. **Filter state writes to the URL query string** so a filtered view is shareable. Reflow `--t-reflow`. Mobile: filters open as a bottom sheet, 90vh, Apply pinned.

### 05 · Integrated lines — *the offensive section, not an audit fix*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ DARK BAND                                       160px padding                              │
│  ( 03 ) -------- <INTEGRATED LINES>                                                        │
│                                                                                            │
│  One line. One number     Hasko and Mekanika build the whole                               │
│  to call.                 line, from the moment lumber enters                              │
│  H2, cols 1-5             the plant to the moment finished                                 │
│                           flooring leaves it.                                              │
│                                                                                            │
│   o------------o------------o------------o------------o                                    │
│   |            |            |            |            |                                    │
│  <01>         <02>         <03>         <04>         <05>                                  │
│  INFEED       OPTIMISE     SURFACE      PROFILE      HANDLE                                │
│                                                                                            │
│  Package      Scanning,    Pre-         End matching Automated                             │
│  breakdown &  defect       surfacing    & side       material                              │
│  unscrambling detection,   & planing    matching     handling                              │
│               ripping                                                                      │
│                                                                                            │
│  <HSBU>       <HSLS · SR>  <FSP-EF>     <MPEM·HSSM>  <MEKANIKA>                            │
│   ▓▓▓          ▓▓▓          ▓▓▓          ▓▓▓          ▓▓▓                                  │
│                                                                                            │
│            [ Talk to an engineer about your line  -> ]                                     │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**H2** — *One line. One number to call.*
**Stand** — *Hasko and Mekanika build the whole line, from the moment lumber enters the plant to the moment finished flooring leaves it. Scanning, ripping, matching, handling. Engineered to run together.*

Rail draws left→right over 900ms on entry, nodes stagger `--stagger`. Each model code links into that machine category. Mobile flips to a vertical timeline with the rail on the left.

*This is why a buyer chooses Hasko over a component supplier.*

### 06 · Proof — *closes 2.2, takes field gap +1*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│  ( 04 ) -------- <PROOF>                                                                   │
│                                                                                            │
│  What changes when a Hasko goes in.                                                        │
│                                                                                            │
│  +-----------------------------------------------------------+                             │
│  |                                                           |                             │
│  |  <+2,000>        <+0.5%>        <9">                      |                             │
│  |  BD FT/SHIFT     YIELD          BOARDS, CLEANLY           |                             │
│  |                                 counts up on entry        |                             │
│  |                                                           |                             │
│  |  "After installing our new Hasko MPEM-C, throughput       |                             │
│  |   increased by 2k per shift. Yield increased by .5%,      |                             │
│  |   added ability to cut 9" boards with a much better       |                             │
│  |   cut. Out of square boards are a non-issue."             |                             │
│  |                                   28px, cols 1-8          |                             │
│  |  -----                                                    |                             │
│  |  Roger Isaacs · Production Manager · SFL                  |                             │
│  |  <MACHINE: MPEM-C END MATCHER>  ->                        |                             │
│  |                                                           |                             │
│  |                        ▓▓▓▓▓▓▓▓▓ in-plant, cols 9-12      |                             │
│  +-----------------------------------------------------------+                             │
│                                                                                            │
│  +---------------------------+ +---------------------------+                               │
│  | awaiting attributed quote | | awaiting attributed quote |                               │
│  +---------------------------+ +---------------------------+                               │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**H2** — *What changes when a Hasko goes in.*

**The hero testimonial is real. Use it verbatim.**

> "After installing our new Hasko MPEM-C, through put increased by 2k per shift. Yield increased by .5%, added ability to cut 9″ boards (with a much better cut). Out of square boards are a non-issue."
> — **Roger Isaacs · Production Manager · SFL**

Metrics count up once on entry. The machine link is **two-way** — the MPEM-C page carries this quote too.

**The other two slots: do not invent quotes.** Render an awaiting-content state or omit the row. Fabricating a customer testimonial for a real company is not acceptable in a demo that may be shown to that company.

### 07 · Parts & service — *closes 2.4, the margin argument*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ░░░░ blueprint parts diagram, right half, 8% ░░░░                                          │
│  ( 05 ) -------- <PARTS & SERVICE>                                                         │
│                                                                                            │
│  +-----------------------------+  Your machine is 20 years old.                            │
│  | RAISED CARD, radius 20      |  We still have the drawings.                              │
│  |                             |  H2, cols 7-12                                            │
│  |  <STEP 1>                   |                                                           │
│  |  Machine model              |  Hasko keeps the model, serial                            │
│  |  +-----------------------+  |  number, parts list, drawings                             │
│  |  | Select a machine   v  |  |  and configuration for every                              │
│  |  +-----------------------+  |  machine we have built, for                               │
│  |                             |  its whole service life. Find                             │
│  |  <STEP 2>  optional         |  what you need without waiting                            │
│  |  Serial number              |  on a call.                                               │
│  |  +-----------------------+  |                                                           │
│  |  | e.g. SR36-1042        |  |  + Same-day quotes on stocked                             │
│  |  +-----------------------+  |    parts                                                  │
│  |                             |  + Field service and install                              │
│  |  [    Find parts  ->    ]>  |    support                                                │
│  |                             |  + Retrofits and upgrades for                             │
│  +-----------------------------+    machines already in-plant                              │
│                                                                                            │
│  After a model is chosen, revealed in place:                                               │
│  +-----------------------------+                                                           │
│  |  <SR-36 GANG RIPSAW> change |                                                           │
│  |  Parts list  <PDF 2.4MB> -> |                                                           │
│  |  Oper. manual<PDF 8.1MB> -> |                                                           │
│  |  Exploded dia<PDF 1.2MB> -> |                                                           │
│  |  [ Request a part ]>        |                                                           │
│  |  [ Call 423-225-5763 ]      |  <-- real tel: link, 44px                                 │
│  +-----------------------------+                                                           │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**H2** — *Your machine is 20 years old. We still have the drawings.*
**Stand** — *Hasko keeps the model, serial number, parts list, drawings and configuration for every machine we have built, for its whole service life. Find what you need without waiting on a call.*

`Request a part` opens the quote drawer in parts mode carrying machine + serial. The phone is a **real `tel:` link** — currently unlinked plain text inside a paragraph. Demo populates three machines with real data and labels it as a sample.

### 08 · Why heavy-built — *the conviction gap*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ░░░░░ blueprint line work, whole band, 8% ░░░░░                                            │
│                                                                                            │
│  +----------+                                   +----------+                               │
│  | <( 01 )> |    ( 06 ) ---- <WHY HASKO>        | <( 02 )> |                               │
│  | Fewer    |                                   | Direct-  |                               │
│  | wear     |  We spent decades rebuilding      | coupled  |                               │
│  | parts    |  other people's machines.         | arbors   |                               │
│  |          |  Then we built ours.              |          |                               │
│  | Design   |                                   | No belts |                               │
│  | out the  |  H2 pinned, cols 5-8              | to slip  |                               │
│  | gears,   |  position: sticky                 | or re-   |                               │
│  | chains   |                                   | tension. |                               │
│  | and      |  Hasko started in 1930 as a       | Power    |                               │
│  | sprockets|  rebuilder. Forty years of        | goes     |                               │
│  | that     |  pulling apart worn machines      | where it |                               │
│  | fail     |  taught us exactly which parts    | is meant |                               │
│  | first.   |  fail and why. Every machine we   | to go.   |                               │
│  | ▓▓▓▓▓▓▓▓ |  build now is designed around     | ▓▓▓▓▓▓▓▓ |                               │
│  +----------+  that.                            +----------+                               │
│                                                                                            │
│  +----------+                                   +----------+                               │
│  | <( 03 )> |                                   | <( 04 )> |                               │
│  | Heavy-   |                                   | Simple   |                               │
│  | built    |                                   | to set   |                               │
│  | frames   |                                   | up and   |                               │
│  |          |                                   | operate  |                               │
│  | Mass     |                                   |          |                               │
│  | absorbs  |                                   | A crew   |                               │
│  | vibra-   |                                   | that can |                               │
│  | tion.    |                                   | change   |                               │
│  | That is  |                                   | over     |                               │
│  | what     |                                   | fast is  |                               │
│  | costs    |                                   | a line   |                               │
│  | cut      |                                   | at rated |                               │
│  | quality. |                                   | capacity.|                               │
│  | ▓▓▓▓▓▓▓▓ |                                   | ▓▓▓▓▓▓▓▓ |                               │
│  +----------+                                   +----------+                               │
│   left col scrolls naturally    right col offset +180px                                    │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**H2** — *We spent decades rebuilding other people's machines. Then we built ours.*
**Body** — *Hasko started in 1930 as a rebuilder. Forty years of pulling apart worn machines taught us exactly which parts fail and why. Every machine we build now is designed around that.*

| # | Card | Body |
|---|---|---|
| 01 | Fewer wear parts | We design out the gears, chains and sprockets that fail first. Less to replace, less downtime, fewer parts to stock. |
| 02 | Direct-coupled arbors | No belts to slip or retension. Power goes where it is meant to go. |
| 03 | Heavy-built frames | Mass absorbs vibration. Vibration is what costs you cut quality and bearing life at high feed rates. |
| 04 | Simple to set up and operate | A machine your crew can change over quickly is a machine that actually runs at rated capacity. |

Centre `position: sticky; top: 30vh`, cols 5–8. Side cards cols 1–3 and 10–12, right column offset `+180px`. Mobile and reduced motion: flat single column.

### 09 · Automation — *closes 3.2*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│  ( 07 ) -------- <AUTOMATION>                                                              │
│                                                                                            │
│  Machines are half of it.    +------------------------------+                              │
│  Moving material is the      | ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ |                              │
│  other half.                 | ▒▒▒   > play    4:3      ▒▒▒ |                              │
│  H2, cols 1-5                | ▒▒▒ click to play, poster▒▒▒ |                              │
│                              | ▒▒▒ frame, never autoplay▒▒▒ |                              │
│  Through our alliance with   | ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ |                              │
│  Mekanika, Hasko designs     +------------------------------+                              │
│  and installs the handling                                                                 │
│  systems that connect the                                                                  │
│  machines, so a line runs                                                                  │
│  as one system, not six.                                                                   │
│                                                                                            │
│  + Solid wood flooring lines    + Pre-finish line handling                                 │
│  + Scanning & optimising        + Package breakdown                                        │
│  + Board scanning & ripping     + Custom material handling                                 │
│                                                                                            │
│  [ See automation systems -> ]  [MEKANIKA] -> English page                                 │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**H2** — *Machines are half of it. Moving material is the other half.* The partner link points at the **English** destination, not `/accueil/`.

### 10 · Resources — *closes 3.2*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│  ( 08 ) -------- <RESOURCES>                                                               │
│                                                                                            │
│  Everything downloadable, in one place.   Sort: <NEWEST> v                                 │
│                                                                                            │
│  +------------------+ +------------------+ +------------------+                            │
│  | Machine brochures| | Spec sheets      | | Operator manuals |                            │
│  | <21 DOCUMENTS>   | | <21 DOCUMENTS>   | | <18 DOCUMENTS>   |                            │
│  | Browse ->        | | Browse ->        | | Browse ->        |                            │
│  +------------------+ +------------------+ +------------------+                            │
│  +------------------+ +------------------+ +------------------+                            │
│  | Parts lists      | | Line layouts     | | Case studies     |                            │
│  +------------------+ +------------------+ +------------------+                            │
│                                                                                            │
│  Row inside a category:                                                                    │
│  +-------------------------------------------------------+                                 │
│  | SR Series brochure   <REV. 2016 · PDF · 3.1 MB>    v  |                                 │
│  +-------------------------------------------------------+                                 │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Every document shows its revision date and file size.** A 2016 brochure labelled `REV. 2016` is honest; the same file presented as current specification is not. Ungated — 3 of 3 competitors surface spec PDFs without a form.

### 11 · Contact — *closes 2.5*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│  ( 09 ) -------- <CONTACT>                                                                 │
│                                                                                            │
│  Who do you need?              HASKO Inc.                                                  │
│  H2, cols 1-6                  Soddy-Daisy, Tennessee                                      │
│                                <423.648.5200>  main office                                 │
│  +---------------------------+                                                             │
│  | I am looking at a machine |  +------------------------------+                           │
│  | <SALES · STEVE PUGH, VP>  |  | ▓▓▓▓ embedded map ▓▓▓▓▓▓▓▓▓▓ |                           │
│  +---------------------------+  | ▓▓ not two bulleted lists of |                           │
│  +---------------------------+  | ▓▓ driving directions        |                           │
│  | I need a part or service  |  +------------------------------+                           │
│  | <PARTS · 423-225-5763>    |                                                             │
│  +---------------------------+  <WHO YOU WILL TALK TO>                                     │
│  +---------------------------+  Steve Pugh · VP Sales                                      │
│  | I have a technical q.     |    <direct> · email ->                                      │
│  | <ENG · ROBERT HALL>       |  Robert Hall · Engineering Dir.                             │
│  +---------------------------+    <direct> · email ->                                      │
│                                 Joey Walker · Operations Dir.                              │
│  Selecting a route opens the      <direct> · email ->                                      │
│  quote drawer, pre-routed.                                                                 │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

Keep the people, add the hierarchy. Every named contact gets a `mailto:` — the current site has **zero**.

### 12 · Footer — *closes 3.1, 3.8*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ DARK BAND                                                                                  │
│                                                                                            │
│  [HASKO]      <HEAVY-BUILT PERFORMANCE · SINCE 1930>                                       │
│                                                                                            │
│  MACHINES        INDUSTRIES       COMPANY        SUPPORT                                   │
│  Board ripping   Flooring         About Hasko    Parts & Service                           │
│  End matching    Ripped products  Careers        Request a quote                           │
│  Side matching   Dimensional wood News           Resources                                 │
│  Planing         Moulding         Contract mfg.  Contact                                   │
│  Chopping                                                                                  │
│  Scanning                                                                                  │
│  Feeding systems                                                                           │
│  Material handling                                                                         │
│  Special machines                                                                          │
│  Used machinery                                                                            │
│  View all 21 ->                                                                            │
│                                                                                            │
├····························································································┤
│  HASKO Inc. · Soddy-Daisy, TN · <423.648.5200> · hello@hasko...                            │
│  [WMMA] [assoc]      in  ig  fb  yt      NO GOOGLE+                                        │
│  (c) 2026 HASKO Inc.   Privacy   Accessibility statement                                   │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7 · Supporting templates

The landing page alone will not prove the case. These carry the highest-value fixes.

### Template A · Machine detail page — *closes 1.3, 1.6, 2.8, 3.7*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│  Machines / Board Ripping / SR Series Gang Ripsaw   <- breadcrumb                          │
│                                                                                            │
│  <BOARD RIPPING · SR-36>        +----------------------------+                             │
│                                 | ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ |                             │
│  SR Series Gang Ripsaw          | ▓▓ machine on seamless  ▓▓ |                             │
│  H1, plain-language name        | ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ |                             │
│                                 +----------------------------+                             │
│  For high-speed straight or       [ ] [ ] [ ] [ ]  thumbnails                              │
│  curve sawing of kiln-dried                                                                │
│  hardwoods at up to 400 FPM.                                                               │
│  Rips more than 40,000 board                                                               │
│  feet per shift.                                                                           │
│                                                                                            │
│  +---------------------------+  +---------------------------+                              │
│  | SPECIFICATIONS            |  | STICKY PANEL              |                              │
│  | visible on load, no tab   |  |                           |                              │
│  | ------------------------- |  | Interested in the SR-36?  |                              │
│  | Material width <24/30/36">|  |                           |                              │
│  | Thickness  <1/2"-2 1/2">  |  | [ Request a quote ]>      |                              │
│  | Min length     <27">      |  | carries the machine       |                              │
│  | Arbor HP       <75 / 150> |  |                           |                              │
│  | Saw diameter   <14">      |  | Call <423.648.5200>       |                              │
│  | Saw sleeve     <3.5">     |  | Spec sheet <REV. 2026>    |                              │
│  | Feed rolls     <8" t & b> |  |                           |                              │
│  | Feed drive     <4 x 5 HP> |  +---------------------------+                              │
│  | Footprint      <->        |                                                             │
│  | Weight         <->        |   same field order on every                                 │
│  | Power          <->        |   machine, so a buyer compares                              │
│  +---------------------------+   straight down the page                                    │
│                                                                                            │
│  FEATURES                                                                                  │
│  · Direct-coupled arbors, 75 to 150 HP                                                     │
│  · Individual electric gear motors on each feed roll                                       │
│  · 8" chromed knurled hydraulic feed rolls, no chain to wear                               │
│                                                                                            │
│  +-------------------------------------------------------+                                 │
│  | <+2,000 BD FT PER SHIFT>                               |                                │
│  | "...throughput increased by 2k per shift..."           |                                │
│  | Roger Isaacs · Production Manager · SFL                |                                │
│  |        the testimonial that names THIS machine         |                                │
│  +-------------------------------------------------------+                                 │
│                                                                                            │
│  MACHINES THAT RUN WITH THIS ONE   <- related, currently absent                            │
│  +--------+ +--------+ +--------+                                                          │
│  | HSLS   | | HSRF   | | HSSS   |                                                          │
│  +--------+ +--------+ +--------+                                                          │
│                                                                                            │
│  USED IN   Ripped products ->    Dimensional wood ->                                       │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Template B · 404 — *closes 1.2*

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ░░░░ blueprint texture ░░░░                                                                │
│                                                                                            │
│  <ERROR 404>                                                                               │
│                                                                                            │
│  That page isn't here.                                                                     │
│  It may have moved, or the link may be old. Here is the way back.                          │
│                                                                                            │
│  +-------------------------------------------------------+                                 │
│  | search   Search machines, parts and documents...       |                                │
│  +-------------------------------------------------------+                                 │
│                                                                                            │
│  +----------+ +----------+ +------------+ +----------+                                     │
│  | Flooring | | Ripped   | | Dimensional| | Moulding |                                     │
│  +----------+ +----------+ +------------+ +----------+                                     │
│                                                                                            │
│  Looking for a part?  Machine model v  [ Find parts -> ]                                   │
│                                                                                            │
│  Or call us: <423.648.5200>                                                                │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

One hour of work, and the most visible sign that a site is maintained.

---

## 8 · The sixteen components

Build each once. Reuse before creating. Anatomy in the `hasko-design-system` skill.

| # | Component | Used in | Carries |
|---|---|---|---|
| 1 | Announcement bar | 00 | 3.9 |
| 2 | Header + mega-menu | header | 1.5, 2.1 |
| 3 | Quote drawer | everywhere | 1.3, 2.6 |
| 4 | Machine card | 04, template A | 2.3, 3.3, 3.6 |
| 5 | Spec table | template A | 1.6, 2.9 |
| 6 | Filter rail + chips | 04 | 2.3 |
| 7 | Compare tray | 04 | field gap +2 |
| 8 | Zero-result panel | 04 | 3.4 |
| 9 | Industry card | 03, header | 2.1 |
| 10 | Testimonial block | 06, template A | 2.2, field gap +1 |
| 11 | Parts lookup | 07 | 2.4 |
| 12 | Document row | 07, 10 | 3.2 |
| 13 | Process rail | 05 | — |
| 14 | Sticky-centre band | 08 | dimension 5 |
| 15 | Route selector | 11 | 2.5 |
| 16 | Footer | 12 | 3.1, 3.8 |

**Machine card — seven elements, always in this order:**
photo on seamless → category eyebrow (mono) → model code (mono) → plain-language name → **one capability figure** (mono) → one-line description → two actions (*View specs*, *Request quote*).

**Quote drawer fields:** machine of interest (pre-filled, editable) · what are you making · full name · company · email · phone · timeline · message. **Visible `<label>` above every one.**

**Spec table field order, identical on every machine:**
`Material width · Material thickness · Minimum length · Arbor HP · Saw diameter · Feed rate · Feed drive · Footprint · Weight · Power requirement`. Missing fields render `—`, never omitted.

---

## 9 · Hard rules

Not preferences. Breaking any of them fails the build.

### Never

- **No carousel.** Not in the hero, not anywhere. Audit finding 1.4.
- **Never `#62ACDA`.** 2.49:1 on white. There is no blue in this system at all.
- **Never `#FF0000` as text or as a fill behind text.** `--red-mark` is the logo only. Use `--red-action` for fills, `--red-deep` for text.
- **Never `--red` on a dark band.** 3.36:1. Dark bands carry `.on-dark`, which swaps in `--red-light`.
- **Never a red focus ring.** It disappears against red controls.
- **Never a placeholder as a form label.** WCAG 3.3.2 / 1.3.1.
- **Never an image without `alt`.** Decorative gets `alt=""`.
- **Never `role="tab"` without managing `aria-selected`.**
- **No lorem ipsum.** Real copy only — it is written above.
- **No invented machine specifications.** See §11.
- **No page builder, no jQuery, no carousel library.**

### Always

- Body 16.5px, never 14px.
- **Geist Mono for every number.**
- Minimum touch target 44×44px.
- Visible focus ring: `2px solid var(--focus)`, `2px` offset — ink on light, white on dark.
- Inline links underlined, never distinguished by colour alone.
- Status colour paired with an icon and a word, never colour alone.
- Honour `prefers-reduced-motion` — everything at final state, **visible**.
- Every filter, gallery and compare interaction works by keyboard.

---

## 10 · Tech stack

Plain **HTML + CSS + vanilla JS**. No framework.

The current site paints in ~1.75s and a redesign that loses that has traded down; the demo must open from a file or any static host with zero build; and a framework buys nothing for thirteen static sections.

```
index.html          the landing page
machine.html        machine detail template (SR-36 worked example)
404.html            error page
css/tokens.css      the only place values are defined
css/base.css        reset, type, layout primitives
css/components.css  the 16 components
css/sections.css    section-specific layout
js/finder.js        filter, compare, URL state
js/motion.js        scroll reveal, count-up, sticky nav
js/quote.js         quote drawer
data/machines.json  21 machines with taxonomy and specs
assets/             images, blueprint SVGs
```

**Progressive enhancement is required.** The industry gallery uses native `overflow-x` + `scroll-snap`, so it works with JS disabled. The finder degrades to a full unfiltered list.

---

## 11 · Placeholder data — read before touching specs

`data/machines.json` has all 21 real machines with real names, model codes and taxonomy. **The SR Series specifications are real**, taken from the live site. Every other machine is marked `"_status": "placeholder"`.

**Do not invent specifications for a real manufacturer's machines.** Placeholder values exist so the finder has something to filter, and every one is flagged. Hasko replaces them before anything goes public, and any UI showing them must render a `PLACEHOLDER` badge.

Same for testimonials: only the Roger Isaacs quote is real. Do not write fictional customer quotes.

Both rules exist because this demo may be shown to Hasko, and a client spotting invented data about their own machines costs more than an empty slot ever would.

---

## 12 · Copy rules

If you must write new copy:

- No negative parallelism — "it's not X, it's Y"
- No stacking three adjectives every time
- Em dashes sparingly, not as default punctuation
- Sentence case in headings, not Title Case
- Banned: delve, robust, crucial, seamless, showcase, leverage, enhance, foster, testament, pivotal, meticulous, vibrant, landscape (abstract), commitment to, boasts a
- Plain verbs. "Has" not "boasts". "Shows" not "showcases". "Improve" not "enhance".

---

## 13 · Acceptance criteria

Run the verifiers. Do not eyeball.

```bash
node .claude/skills/hasko-design-system/scripts/validate-tokens.mjs
node .claude/skills/accessibility-verify/scripts/a11y-check.mjs index.html
node .claude/skills/responsive-motion-verify/scripts/responsive-check.mjs index.html --shots
```

**Accessibility — WCAG 2.1 AA.** All text ≥ 4.5:1 (large ≥ 3:1) measured in-page · every image has appropriate `alt` · every field has a visible `<label>` · every ARIA widget reports state · complete keyboard path through filters, gallery, compare, drawer · visible focus everywhere · all targets ≥ 44×44 · `prefers-reduced-motion` fully honoured.

**Responsive.** No horizontal overflow at 390, 768, 1024, 1280, 1440 · hero fits `100svh` on mobile · readable at 200% zoom.

**Performance.** Total < 900KB · JS uncompressed < 120KB · LCP < 2.0s on 4G · CLS < 0.05 · fonts `woff2`, subset, `font-display: swap` · images AVIF with WebP fallback, lazy below fold, explicit dimensions.

**Audit coverage.** 23 in-scope findings closed — verify with the `audit-verifier` agent, and do not round up.

---

## 14 · Working process

1. Read the section spec above before building. Do not improvise structure.
2. Build one section at a time, complete, before starting the next.
3. After each section, run all three verifiers.
4. `section-builder` implements · `design-system-guardian` checks tokens · `accessibility-auditor` measures AA · `visual-qa` judges how it looks · `audit-verifier` confirms coverage.
5. Ask before deviating. The spec encodes audit findings; a deviation may reopen one.

### Build order

**Must** — hero (01) · industry paths (03) · machine finder (04) · proof (06) · machine detail page
**Should** — parts & service (07) · header · quote drawer · footer · trust strip (02) · announcement bar (00)
**Nice** — integrated lines (05) · why heavy-built (08) · automation (09) · resources (10) · contact (11) · 404