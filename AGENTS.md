Read CLAUDE.md, then build section 01 (hero) using the section-builder agent.
```

## The five agents

| Agent | Use it when |
|---|---|
| `section-builder` | Implementing any numbered section, the machine page or the 404 |
| `design-system-guardian` | After a section — finds hardcoded values, off-scale spacing, motion drift |
| `accessibility-auditor` | After a section and before done — measured WCAG AA |
| `visual-qa` | Screenshots at every breakpoint, then a critique with observable causes |
| `audit-verifier` | Before a demo — checks which of the 24 findings are *actually* closed |

## The four skills

| Skill | Carries |
|---|---|
| `hasko-design-system` | Tokens, type, motion, the 16 components + `validate-tokens.mjs` |
| `hasko-section-specs` | All 24 audit findings, section specs with final copy |
| `accessibility-verify` | `a11y-check.mjs` — computed contrast, alt, labels, ARIA, targets, reduced motion |
| `responsive-motion-verify` | `responsive-check.mjs` — overflow, viewport fit, targets, motion, `--shots` |

## Suggested loop

```
1. build a section          → section-builder
2. node .../validate-tokens.mjs
3. node .../a11y-check.mjs index.html
4. node .../responsive-check.mjs index.html --shots
5. review the screenshots   → visual-qa
6. next section
...
last. audit-verifier
```

## Two honesty rules baked in

**Machine specs.** Only the SR Series is real. Twenty machines carry placeholder specs so the finder has something to filter, and every one is flagged `"_status": "placeholder"`. Hasko replaces them before anything goes public, and any UI showing them renders a `PLACEHOLDER` badge. Do not invent specifications for a real manufacturer's machines.

**Testimonials.** Only the Roger Isaacs quote is real and attributed. Do not write fictional customer quotes — mark the other slots as awaiting content.

Both rules exist because this demo may be shown to Hasko, and a client spotting invented data about their own machines costs more than an empty slot ever would.

## What the build has to beat

The audit scored Hasko at **3 of 8** category conventions against Mereen-Johnson, WEINIG and Eagle. The build must meet all eight and take the two gaps nobody in the field fills: named customer outcomes on the homepage, and specifications as filterable data rather than PDFs.

Coverage target is **23 of 24 findings**. The unstyled `/news/` archive is a template fix outside this build. `audit-verifier` checks the claim against the built artefact — do not round up.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
