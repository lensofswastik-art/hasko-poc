# The sixteen components

Build each once. Reuse before creating. If a seventeenth seems necessary, ask first.

Every component below lists the audit finding it carries. That is why it exists.

---

## 1 · Announcement bar — *3.9*

Conditional. Renders only when an event is live; when there is none, it does not render and the header moves up. No empty state.

`--steel` background, 44px, centred, dismissible.

- Event label: mono `--fs-index`, `--tr-index`, `--red-light` — the bar is a dark band; `--red` is 3.36:1 on steel and fails
- Detail: 13px `--on-steel-2`
- Text link, not a whole-bar link
- Dismiss: 44×44, `sessionStorage` so it returns next visit

---

## 2 · Header + mega-menu — *1.5, 2.1*

Two rows collapsing to one past 120px scroll.

Utility row: `Since 1930` · `Made in the USA` · phone as real `tel:` · Parts · Contact
Primary row: logo · Industries ▾ · Machines ▾ · Automation · Parts & Service · About · search · **Request a Quote**

- Nav links `--ink`, 15px, `--fw-medium`. **Never `#62ACDA`.**
- Industries mega-menu is the fix for the orphaned `/why-hasko/` silo — four cards with thumbnail and one line
- Machines mega-menu: 12 categories in three columns, plus "View all 21"
- Opens on hover **and** click/Enter. `Esc` closes. Focus trapped while open.
- Mobile: full-screen panel, 48px rows, CTA pinned bottom

---

## 3 · Quote drawer — *1.3, 2.6*

One component, invoked from anywhere, always carrying context.

Fields, in order: machine of interest (pre-filled, editable) · what are you making · full name · company · email · phone · timeline · message (optional)

- **Visible `<label>` above every field.** Placeholder is never the label.
- Errors inline beside the field, text plus icon, `aria-live="polite"`
- Success names a person and a timeframe: *"Sent. Steve Pugh or someone on the sales team will come back to you within one business day."*
- Honeypot plus timing check, not reCAPTCHA
- Focus moves in on open, traps, returns to trigger on close. `Esc` closes.

---

## 4 · Machine card — *2.3, 3.3, 3.6*

Seven elements, always in this order:

1. Photo on `--surface-3` seamless, consistent angle
2. Category eyebrow — mono, uppercase, `--ink-3`
3. Model code — mono, `--ink`
4. Plain-language name — `--fs-h4`, `--fw-semi`
5. **One capability figure** — mono, e.g. `36" · 150 HP · 400 FPM`
6. One-line description
7. Two actions — *View specs* and *Request quote*

The current site's card is a photo, a model code, and the word "View" rendered as a CSS pseudo-element. Card CTAs here are **real text in real elements**.

Add the `PLACEHOLDER` badge when the machine's specs are unverified.

---

## 5 · Spec table — *1.6, 2.9*

Two-column definition list. Label `--ink-2` sentence case, value mono `--ink`. Rows striped at 2% ink.

**Same field order on every machine**, so a buyer compares straight down the page:

`Material width · Material thickness · Minimum length · Arbor HP · Saw diameter · Feed rate · Feed drive · Footprint · Weight · Power requirement`

Fields a machine does not have render `—`. Never omitted, so the shape stays comparable.

**Visible on load.** Not behind a tab, not `hidden`, not `display:none`.

---

## 6 · Filter rail + chips — *2.3*

Sticky below the header. Four groups, each a real `<fieldset>` with `<legend>`:

Application · Process · Material width · Horsepower

- Result count mono, `aria-live="polite"`
- Active filters render as removable chips, `--red-tint` fill, `--red-ink` text
- Chip accessible name: *"Remove filter: material width 24–36 inches"*
- Filter state writes to the URL query string — a filtered view is shareable
- Reflow `--t-reflow`
- Mobile: bottom sheet, 90vh, Apply pinned

---

## 7 · Compare tray — *field gap: nobody in the category offers this*

Checkbox on each card, max three. Tray docks to the viewport bottom at two selected. Opens a side-by-side spec table using the same field order.

---

## 8 · Zero-result panel — *3.4*

Never a dead end. The current site's zero state is the sentence "No Results Found." with no suggestion, no retry field and no links.

Must contain: what failed, the **closest actual machine** with its figures, a route to an engineer, and one-click removal of each active filter.

---

## 9 · Industry card — *2.1*

4:5, `--r-feature`, full-bleed photo, scrim `transparent → rgba(14,17,22,.85)`.

- Index mono top-left, white
- Title 24px `--fw-semi` white
- Two capability figures, mono, `--on-steel-2`
- Arrow: 44px circle, `--surface-2` fill, `--red` glyph, bottom-right
- Hover: image scales `1.04` inside a fixed frame, arrow slides 4px

Gallery uses native `overflow-x` + `scroll-snap-type: x mandatory`. **Works with JS disabled.**

---

## 10 · Testimonial block — *2.2, field gap +1*

Metric row, quote, attribution, machine link.

- Metric value mono `clamp(36px,5vw,56px)` `--red`, counts up once on entry
- Metric label mono `--fs-index` `--ink-3`
- Quote 28px `--fw-regular` lh 1.45. **No quotation-mark graphic** — the type carries it
- Attribution 14px `--ink-2`, preceded by a 32px rule
- Machine link — mono model code, `--ink` with a `--rule-strong` underline, going `--red-deep` with a `--red` underline on hover (inline link; colour is never the only distinguishing signal) — **two-way**, the machine page carries this quote too

Only attributed quotes. Anonymous praise reads as marketing copy.

---

## 11 · Parts lookup — *2.4*

Raised card, `--surface-2`, `--r-feature`, `--shadow-raised`.

Step 1 machine model (select) → Step 2 serial number (optional) → documents revealed in place, no navigation.

- Documents: parts list, operator manual, exploded diagram
- `Request a part` opens the quote drawer in parts mode carrying machine + serial
- Phone is a **real `tel:` link**, 44px target — currently unlinked plain text in a paragraph

---

## 12 · Document row — *3.2*

56px. Icon · name · mono file meta · arrow. Opens in a new tab.

**Always shows the revision date.** `REV. 2016 · PDF · 3.1 MB`. A 2016 brochure labelled as such is honest; the same file presented as current specification is not.

Never gated. Three of three competitors surface spec PDFs without a form.

---

## 13 · Process rail

Five nodes on a hairline. Rail draws left→right over 900ms on entry, nodes stagger `--stagger`. Model codes mono `--red-light` — this rail sits in section 05, a dark band — each linking into that machine category. Mobile flips to a vertical timeline.

---

## 14 · Sticky-centre band — *competitor audit dimension 5*

Centre column `position: sticky; top: 30vh`, cols 5–8. Side cards cols 1–3 and 10–12, right column offset `+180px`.

Under reduced motion or mobile: sticky released, single column.

---

## 15 · Route selector — *2.5*

Three large cards, each naming a person or a desk. Selecting one opens the quote drawer pre-routed.

Naming individuals is a real differentiator. The current problem is that the VP of Sales sits at the same visual weight as the fax number. Keep the people, add the hierarchy. Every named contact gets a `mailto:` — the current site has zero.

---

## 16 · Footer — *3.1, 3.8*

`--steel`, four column groups — Machines (12), Industries (4), Company, Support — then address, phone, email, social, association marks, copyright, privacy, accessibility statement.

**No Google+ link.** It has been broken in the header of every page since April 2019.
