---
name: hasko-section-specs
description: The section-by-section build spec for the HASKO landing page — layout, real copy, behaviour and the audit finding each section closes. Load before building or modifying any section, when writing copy, when deciding what goes where, or when checking whether a change reopens an audit finding. Triggers on section, hero, industry paths, machine finder, proof, testimonial, parts lookup, footer, machine page, 404, wireframe, layout, or copy.
---

# HASKO section specs

Thirteen landing page sections plus two supporting templates. Every one closes a numbered audit finding.

- `references/audit-findings.md` — all 24 findings with severity and what closes each
- `references/sections.md` — the section-by-section spec with layout and real copy
- `../../../data/machines.json` — 21 machines with taxonomy and specs

## The build order

**Must** — hero (01) · industry paths (03) · machine finder (04) · proof (06) · machine detail page
**Should** — parts & service (07) · header · quote drawer · footer · trust strip (02) · announcement bar (00)
**Nice** — integrated lines (05) · why heavy-built (08) · automation (09) · resources (10) · contact (11) · 404

## Copy is not yours to rewrite

The copy in `references/sections.md` is final. Do not paraphrase it, do not "improve" it, do not substitute lorem. It was written against the client's own voice guardrails and several lines are quoted from Hasko's material.

If you must write new copy: no negative parallelism, no stacking three adjectives, em dashes sparingly, sentence case in headings. Banned words: delve, robust, crucial, seamless, showcase, leverage, enhance, foster, testament, pivotal, meticulous, vibrant, commitment to, boasts a.

## Two things that are real, and must stay real

**The Roger Isaacs testimonial** is a genuine, attributed customer quote from Hasko's own site:

> "After installing our new Hasko MPEM-C, through put increased by 2k per shift. Yield increased by .5%, added ability to cut 9″ boards (with a much better cut). Out of square boards are a non-issue."
> — Roger Isaacs, Production Manager, SFL

Use it verbatim. **Do not write fictional customer quotes** to fill the other two slots — mark them as awaiting content instead.

**The SR Series specifications** in `machines.json` are real, taken from the live site. Every other machine's specs are marked `"_status": "placeholder"`. Do not invent specifications for a real manufacturer's machines. Any UI showing placeholder specs must render the `PLACEHOLDER` badge.

## The two positions nobody in the category holds

These are why the page can beat Mereen-Johnson, WEINIG and Eagle rather than match them.

1. **Named customer outcomes on the homepage.** None of the three competitors does this. Hasko already owns the material.
2. **Specifications as data, not documents.** Every site in the category delivers specs as a PDF. None lets a buyer ask "which of your machines handles my material width at my throughput" without opening four documents.

Section 06 takes the first. Sections 04 and the spec table take the second. If either gets watered down, the page becomes a nicer version of the field rather than a better one.
