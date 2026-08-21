# The 24 audit findings

Measured on `haskomachines.com`, 19 August 2026, desktop 1440×900 and mobile 390×844. Contrast ratios, image counts, ARIA attributes and performance figures were computed in the live pages, not estimated.

**Severity**
`P1` breaks a journey or loses a qualified buyer · `P2` buyer can finish but pays for it · `P3` erodes credibility, cheap to fix

---

## P1 — Critical (6)

**1.1 · News archive renders with no styling at all**
`/news/` loads as raw unstyled HTML — default serif headings, blue underlined links, the contact form rendered above the news list. Reproduced across loads. Individual posts render correctly, so the fault is scoped to the archive template. Linked from the homepage.
→ *Out of scope for this build. Template fix.*

**1.2 · The 404 page is blank**
Header, empty white content area, footer. No heading, no explanation, no search, no links. `<title>` says "Page not found"; the body says nothing. Every mistyped URL and stale inbound link terminates here.
→ *Closes: `404.html`*

**1.3 · No way to request a quote from a product page**
21 machine pages, zero per-product conversion elements. The only routes are the header phone and a generic sidebar form. A buyer who has just read arbor HP and material width is at peak intent and the page offers nothing.
→ *Closes: quote drawer + machine detail page*

**1.4 · Homepage first viewport has no proposition and no action**
Auto-rotating carousel of a machine photo with the model name burned into the JPEG. No headline, no sentence about what Hasko makes, no CTA. **The `<h1>` is the string "Home".** The four industry tiles sit entirely below the fold.
→ *Closes: section 01*

**1.5 · Primary navigation fails colour contrast**

| Element | FG | BG | Size | Ratio | Needs |
|---|---|---|---|---|---|
| Primary nav | `#62ACDA` | `#FFFFFF` | 16px bold | **2.49:1** | 4.5:1 |
| Sidebar categories | `#62ACDA` | `#FFFFFF` | 14px | **2.49:1** | 4.5:1 |
| Product card titles | `#DB2128` | `#FFFFFF` | 20px | 4.93:1 | pass |
| Utility bar tagline | `#62ACDA` | `#333333` | 14px bold | 5.07:1 | pass |

The brand blue passes on the dark utility bar and fails everywhere it sits on white. One token, site-wide reach.
→ *Closes: `--blue: #1C5CAB` at 6.9:1*

**1.6 · Specifications hidden behind a tab that opens on a one-sentence panel**
Five tabs; the default is "Application", one sentence. The Specifications panel holds material width, arbor HP, saw diameter, sleeve, feed rolls and feed drive — the content a buyer came for, invisible on load.
→ *Closes: spec table visible on load*

---

## P2 — High (9)

**2.1 · The application-led buying path is orphaned**
A complete silo at `/why-hasko/` — Testimonials, Flooring, Ripped Products, Dimensional Wood, Moulding — with **no entry in the primary navigation**. Only reachable from four unlabelled tiles below the homepage carousel.
→ *Closes: Industries mega-menu + section 03*

**2.2 · The strongest proof is two levels deep and unnavigated**
Named, quantified testimonials sitting in that orphaned silo. Nowhere on the homepage, products index, or any product page. The only product-page proof is one anonymous pull-quote.
→ *Closes: section 06*

**2.3 · 21 machines on one flat page, no filtering**
Sidebar lists 12 categories as links that navigate away rather than filter. No sort, no compare, no in-catalogue search. Mobile is a single column, roughly 6,000px of scroll to the last machine. **The taxonomy already exists in the markup** — `category-flooring`, `category-side-matching` and ten more.
→ *Closes: section 04*

**2.4 · Parts & Service has no self-service**
No parts lookup, serial search, request form, manuals, diagrams or ordering. The parts number sits as **unlinked plain text inside a paragraph**. Zero `mailto:` links exist anywhere on the site.
→ *Closes: section 07*

**2.5 · Contact page has no routing**
Nine identically-weighted cards — eight phone and fax lines plus the address. No email addresses, no guidance. Naming individuals is a real differentiator, undercut by giving the VP of Sales the same weight as the fax number. Directions are two bulleted lists with no map.
→ *Closes: section 11*

**2.6 · The enquiry form cannot qualify a lead**
Fields: Name, Email, Subject, Message. No company, phone, application, machine or timeline. **Placeholder text is the only label**, so it disappears on typing. reCAPTCHA v2 adds friction and its own accessibility cost.
→ *Closes: quote drawer*

**2.7 · 71% of catalogue images have no alt text**
17 of 24 on `/products/`. 3 of 7 on the SR Series page.
→ *Closes: every `<img>` carries alt*

**2.8 · Tabs declare a role without state**
Five controls with `role="tab"` and `aria-controls`, but `aria-selected` is **null on all five** and all carry `tabindex="0"`. Assistive tech is told there are tabs and never told which is open.
→ *Closes: no tabs, or correct state*

**2.9 · The catalogue is built as blog posts**
Every machine is a WordPress `post` (`post-199 post type-post`), not a product. No structured specs, no `Product` schema. The only JSON-LD is a generic `WebPage` graph.
→ *Closes: `machines.json` structured spec model*

---

## P3 — Medium (9)

**3.1 · Dead Google+ link in the header of every page** — service closed April 2019.
**3.2 · Content and asset staleness** — SR Series brochure served from a `/2016/08/` path as current spec. Mekanika link resolves to `mekanika.net/accueil/`, a French page, from a US-facing English site. Four news posts, latest March 2026.
**3.3 · "View" is a CSS pseudo-element** — `::after { content: "View" }` on the card anchor. Not real text, not independently focusable.
**3.4 · Site search returns junk with no zero-state** — media-library attachment pages ("O15", "O14", "O13") appear as results. No thumbnails, snippets, counts or type labels. Zero results is the sentence "No Results Found." with nothing else.
**3.5 · Inconsistent product imagery** — finished photography on white, blue CAD renders, and raw multi-colour CAD assembly exports in the same grid.
**3.6 · Model codes lead product names** — "HSBU Package Breakdown and Unscrambler", "PF MPEM-C LP (Locking Profile)". Every card's CTA is the same word.
**3.7 · No breadcrumbs, related machines or next step** — the product page simply ends. Machines are bought as lines.
**3.8 · Footer carries no navigation** — five association badges and a copyright line. No address, phone, sitemap or links.
**3.9 · IWF presence absent** — Hasko/Mekanika is a listed IWF Atlanta exhibitor. The site never mentions it. Mereen-Johnson runs a sitewide bar with its booth number; Eagle lists booth and dates on the homepage.

---

## What is already working — do not break it

- **Performance.** 35 requests, ~199KB transferred, content painted ~1.75s, 287 DOM nodes. A redesign that loses this has traded down.
- **Mobile.** Working hamburger, clean single-column reflow, no horizontal overflow. The mobile problems are content and hierarchy, not layout.
- **The specifications themselves.** Specific, quantified, in mill units.
- **The testimonials themselves.** "Throughput increased by 2k per shift" is worth more than any headline.
- **Named people on the contact page.** Direct lines for the VP of Sales, Engineering Director and Operations Director. Needs routing, not removal.
- **On-page SEO basics.** Meta descriptions written, canonical tags present.

---

## Coverage target

**23 of 24 closed.** 1.1 is a template fix outside this build. Do not overstate the number — the `audit-verifier` agent checks it against the built artefact.
