# Section specs

Layout, real copy, behaviour. Build one section at a time, complete.

Superseded by CLAUDE.md §6 for copy and token names — this file's layout/behaviour notes still apply.

---

## 00 · Announcement bar — *closes 3.9*

`--steel`, 44px, centred, dismissible. **Renders only when an event is live.** No empty state.

```
<IWF ATLANTA 2026>  Booth #XXXX · 25–28 Aug · Georgia World Congress Center
                    Book a meeting at the show  →                        [×]
```

Event label mono `--fs-index` `--red-light` — the bar is a dark band; `--red` is 3.36:1 on steel and fails. Detail 13px `--on-steel-2`. Text link, not a whole-bar link. Dismiss 44×44, `sessionStorage` so it returns next visit.

---

## Header — *closes 1.5, 2.1*

Two rows → one past 120px scroll.

- Utility: `Since 1930` · `Made in the USA` · phone as real `tel:` · Parts & Service · Contact
- Primary: logo · Industries ▾ · Machines ▾ · Automation · Parts & Service · About · search · **Request a Quote**

Industries mega-menu carries four cards with thumbnail and one line each — this is the fix for the orphaned silo. Machines mega-menu: 12 categories in three columns plus "View all 21 machines".

Opens on hover **and** click/Enter. `Esc` closes. Focus trapped. Mobile: full-screen panel, 48px rows, CTA pinned bottom.

---

## 01 · Hero — *closes 1.4*

Full-bleed, `88vh` desktop with a hard `720px` minimum, `--steel` with a warm gradient. Content cols 1–6, machine imagery cols 7–12 bleeding off the right. Blueprint at 6% lower right.

**Copy, final:**

- Eyebrow — `HEAVY-BUILT PERFORMANCE · SINCE 1930`
- H1 — **Machines that are still running in 25 years.**
- Standfirst — *Hasko builds heavy-duty machinery for solid and engineered flooring, rough mills, moulding and dimensional wood. Designed to be simple to set up, simple to operate, and simple to keep running.*
- Primary — `Find machines for my application ▾`
- Secondary — `Browse all 21 machines →`
- Proof strip — `96 YEARS` · `21 MACHINES` · `25-YEAR SERVICE LIFE` · `MADE IN SODDY-DAISY, TN`

The headline states the product promise as an outcome. "Heavy-built" is a claim; "still running in 25 years" is the same claim a buyer can act on.

**Behaviour.** No carousel — one composed frame. The primary button expands a four-way selector inline below the fold line, no page load, jumping to section 04 pre-filtered. Proof numbers count up once, 900ms, static under reduced motion. Machine image gets `4%` parallax drift only.

**Mobile.** Everything above stays within `100svh`. Eyebrow, H1 at `clamp(34px, 9vw, 44px)`, standfirst, both buttons full width, proof strip as 2×2, machine image as a 16:9 band below.

---

## 02 · Trust strip — *convention 7*

`--surface-2`, 96px, five items with vertical rules.

`EST. 1930` · `MADE IN THE USA` · `WMMA` · `MEKANIKA` · `USNR`

Logo marks monochrome `--ink-3`, full colour on hover, real `<img>` with alt. USNR appears on Hasko's IWF exhibitor listing; the current site mentions only Mekanika.

---

## 03 · Industry paths — *closes 2.1*

Index `( 01 ) ———— INDUSTRIES`. H2 left, supporting line right. Four 4:5 cards in a horizontal gallery advancing on vertical scroll.

**H2** — *What are you making?*
**Supporting** — *Four production lines, one engineering approach. Start where your plant does.*

| # | Title | Description | Figures |
|---|---|---|---|
| 01 | Solid & engineered flooring | End matchers, side matchers, pre-surfacers and truck flooring lines. | `7 MACHINES` `FROM 400 FPM` |
| 02 | Ripped products & rough mill | Gang ripsaws, scan/rip lines and strip saws built to lift yield. | `6 MACHINES` `UP TO 7,000 BD FT/HR` |
| 03 | Dimensional wood, furniture & cabinetry | Chopping, defect scanning and optimisation for components. | `5 MACHINES` `SCAN-DRIVEN YIELD` |
| 04 | Moulding & panelling | Matchers, planers and surfacers for architectural profiles. | `3 MACHINES` `HEAVY-BUILT ARBORS` |

**Behaviour.** Native `overflow-x` + `scroll-snap-type: x mandatory` — **works with JS disabled**. Progress rail beneath, real arrow buttons for keyboard. Hover scales the image `1.04` inside a fixed frame, arrow slides 4px. Mobile 1.2 cards wide so the next is visibly cut. Under reduced motion the rail becomes a static 2×2 grid.

---

## 04 · Machine finder — *closes 2.3, 3.3, 3.4, 3.6*

Index `( 02 ) ———— MACHINES`. Blueprint at 6% behind the filter rail. Sticky filter rail, three-column card grid.

**H2** — *Find the machine that fits your line.*
**Supporting** — *Filter by what you run, not by what we call it.*

**Filters** — each already exists as taxonomy in Hasko's current markup:

| Group | Values |
|---|---|
| Application | Flooring · Ripped products · Dimensional wood · Moulding |
| Process | Ripping · Chopping · Matching · Planing · Scanning · Feeding · Material handling |
| Material width | `< 12"` · `12–24"` · `24–36"` · `36"+` |
| Horsepower | `< 50` · `50–100` · `100–150` · `150+` |

**Behaviour.** Instant client-side filtering, no reload. Count updates via `aria-live="polite"`. Active filters as removable chips. Compare up to three, tray docks at two. Filter state writes to the URL query string so a filtered view is shareable. Reflow `--t-reflow`.

**Zero result — never a dead end:**

> No machine matches all three filters.
> The closest is the SR-36 Gang Ripsaw, 36″ at 150 HP, built for ripped products rather than moulding.
> `[ View the SR-36 → ]` `[ Talk to an engineer ]`
> Or remove a filter: ⊗ Moulding ⊗ 36″+ ⊗ 150+ HP

Mobile: filters open as a bottom sheet, 90vh, Apply pinned.

---

## 05 · Integrated lines

`--steel` band, 160px padding. Index `( 03 ) ———— INTEGRATED LINES`. Five-stage horizontal rail.

**H2** — *One line. One number to call.*
**Stand** — *Hasko and Mekanika build the whole line, from the moment lumber enters the plant to the moment finished flooring leaves it. Scanning, ripping, matching, handling. Engineered to run together.*

| # | Stage | Description | Codes |
|---|---|---|---|
| 01 | INFEED | Package breakdown & unscrambling | `HSBU` |
| 02 | OPTIMISE | Scanning, defect detection, ripping | `HSLS · SR Series` |
| 03 | SURFACE | Pre-surfacing & planing | `FSP-EF` |
| 04 | PROFILE | End matching & side matching | `MPEM · HSSM` |
| 05 | HANDLE | Automated material handling | `Mekanika systems` |

CTA — `Talk to an engineer about your line →`

Rail draws left→right over 900ms on entry, nodes stagger `--stagger`. Each code links into that machine category. Mobile flips to a vertical timeline.

*Not an audit fix. This is the offensive section — the reason to choose Hasko over a component supplier.*

---

## 06 · Proof — *closes 2.2, takes field gap +1*

Index `( 04 ) ———— PROOF`. One hero testimonial at scale, two supporting below.

**H2** — *What changes when a Hasko goes in.*

**Hero testimonial — real, use verbatim:**

- Metrics: `+2,000` BD FT PER SHIFT · `+0.5%` YIELD · `9"` BOARDS, CLEANLY
- Quote: *"After installing our new Hasko MPEM-C, through put increased by 2k per shift. Yield increased by .5%, added ability to cut 9″ boards (with a much better cut). Out of square boards are a non-issue."*
- Attribution: **Roger Isaacs · Production Manager · SFL**
- Machine link: `MPEM-C END MATCHER →`

Metrics count up once on entry. The machine link is **two-way** — the MPEM-C page carries this quote too.

**The other two slots.** Do not invent quotes. Render them as an awaiting-content state, or omit the row. Anonymous praise reads as marketing copy, and fabricating a customer testimonial for a real company is not acceptable in a demo that may be shown to that company.

---

## 07 · Parts & service — *closes 2.4*

Index `( 05 ) ———— PARTS & SERVICE`. Split: raised lookup card left, copy right over a blueprint parts diagram at 8%.

**H2** — *Your machine is 20 years old. We still have the drawings.*
**Stand** — *Hasko keeps the model, serial number, parts list, drawings and configuration for every machine we have built, for its whole service life. Find what you need without waiting on a call.*

**Lookup:** Step 1 machine model (select, all 21) → Step 2 serial number (optional) → documents revealed in place, no navigation.

Documents: `Parts list · PDF · 2.4 MB` · `Operator manual · PDF · 8.1 MB` · `Exploded diagram · PDF · 1.2 MB`

Actions: `[ Request a part ]` opens the quote drawer in parts mode carrying machine + serial · `[ Call the parts desk: 423-225-5763 ]` as a **real `tel:` link**, 44px target.

**Support row:** Same-day quotes on stocked parts · Field service and installation support · Retrofits and upgrades for machines already in your plant

*Demo populates three machines with real data and labels it as a sample.*

---

## 08 · Why heavy-built — *competitor audit dimension 5*

Sticky centre column, four numbered cards passing on either side. Blueprint at 8% behind the band.

**Index** `( 06 ) ———— WHY HASKO`
**H2** — *We spent decades rebuilding other people's machines. Then we built ours.*
**Body** — *Hasko started in 1930 as a rebuilder. Forty years of pulling apart worn machines taught us exactly which parts fail and why. Every machine we build now is designed around that.*

| # | Card | Body |
|---|---|---|
| 01 | Fewer wear parts | We design out the gears, chains and sprockets that fail first. Less to replace, less downtime, fewer parts to stock. |
| 02 | Direct-coupled arbors | No belts to slip or retension. Power goes where it is meant to go. |
| 03 | Heavy-built frames | Mass absorbs vibration. Vibration is what costs you cut quality and bearing life at high feed rates. |
| 04 | Simple to set up and operate | A machine your crew can change over quickly is a machine that actually runs at rated capacity. |

Centre `position: sticky; top: 30vh`, cols 5–8. Side cards cols 1–3 and 10–12, right column offset `+180px`. Mobile and reduced motion: flat single column.

---

## 09 · Automation — *closes 3.2*

Index `( 07 ) ———— AUTOMATION`. Copy left, 4:3 video right.

**H2** — *Machines are half of it. Moving material is the other half.*
**Stand** — *Through our alliance with Mekanika, Hasko designs and installs the handling systems that connect the machines, so a line runs as one system instead of six.*

Capabilities: Solid wood flooring lines · Scanning & optimising systems · Board scanning & ripping · Pre-finish line handling · Package breakdown · Custom material handling

CTA `See automation systems →`. Video is click-to-play with a poster frame, never autoplay with sound. **Partner link points at the English destination**, not `/accueil/`.

---

## 10 · Resources — *closes 3.2*

Index `( 08 ) ———— RESOURCES`. Three-column card grid on `--surface-2`.

**H2** — *Everything downloadable, in one place.*

Categories: Machine brochures (21) · Spec sheets · Operator manuals · Parts lists · Line layout drawings · Case studies

**Every document shows its revision date and file size**: `REV. 2016 · PDF · 3.1 MB`. A 2016 brochure labelled as such is honest; the same file presented as current specification is not. Sort newest first. Ungated — three of three competitors surface spec PDFs without a form.

---

## 11 · Contact — *closes 2.5*

Index `( 09 ) ———— CONTACT`. Route selector left, plant and people right.

**H2** — *Who do you need?*

| Route | Goes to |
|---|---|
| I'm looking at a machine | Sales · Steve Pugh, VP Sales |
| I need a part or service | Parts desk · 423-225-5763 |
| I have a technical question | Engineering · Robert Hall, Director |

Selecting a route opens the quote drawer pre-routed.

Right column: HASKO Inc., Soddy-Daisy, Tennessee · main office `423.648.5200` · **embedded map**, not two bulleted lists of driving directions · named contacts with direct lines **and `mailto:` addresses** — the current site has zero.

---

## 12 · Footer — *closes 3.1, 3.8*

`--steel`, four column groups.

- **Machines** — 12 categories, then `View all 21 →`
- **Industries** — the four
- **Company** — About Hasko, Careers, News, Contract Manufacturing
- **Support** — Parts & Service, Request a quote, Resources, Contact

Base row: address · phone · email · social (**no Google+**) · association marks · copyright · privacy · accessibility statement.

---

## Template A · Machine detail page — *closes 1.3, 1.6, 2.8, 3.7*

Breadcrumb `Machines / Board Ripping / SR Series Gang Ripsaw`. Model code as mono eyebrow, plain-language name as H1.

- **Specifications visible on load** — not behind a tab, not `hidden`. Same field order on every machine so a buyer compares down the page. Missing fields render `—`.
- **Quote request in the first viewport**, sticky, carrying the machine.
- Current, dated spec sheet, ungated.
- The testimonial that names this machine.
- Related machines in the same line.
- Applications this machine serves, linking back to the industry pages.

Real SR Series copy: *For high-speed straight or curve sawing of kiln-dried hardwoods at speeds up to 400 FPM, the HASKO SR-Series consistently rips more than 40,000 board feet per shift.*

Features: Direct-coupled arbors, 75 to 150 HP · Individual electric gear motors on each feed roll · 8″ chromed and knurled hydraulic feed rolls with no chain to wear

---

## Template B · 404 — *closes 1.2*

**H1** — *That page isn't here.*
**Body** — *It may have moved, or the link may be old. Here's the way back.*

Search field · the four industry paths · the parts lookup (machine model + Find parts) · `Or call us: 423.648.5200`

One hour of work, and the most visible sign that a site is maintained.
