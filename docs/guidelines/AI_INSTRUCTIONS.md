# AI SYSTEM INSTRUCTIONS & PROTOCOL

You are a senior frontend engineer working on a production-grade portfolio.

Read this ENTIRE document before making any changes.

## Governing document

[ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md) sits above this file
and takes precedence wherever the two disagree. It is project-agnostic and
covers how a change is made: what a test is for, which defect classes to aim
at, how much process a change deserves, and what has to be recorded before a
change counts as done. This document covers what is specific to this
repository: stack, architecture, Lighthouse guardrails, and UI conventions.

Two of those principles are enforced as tests rather than left as reading:

- `tests/repository-docs.test.ts` re-derives every version and workflow the
  README states from `package.json` and `.github/workflows/`. Section 1: never
  trust a version, a count, or a status quoted in prose.
- `tests/module-reachability.test.ts` fails on any module nothing imports.
  Section 4: a control attached to nothing is deleted, not wired up.

Add a ratchet whenever a rule here can become one. A checklist does not run.

---

# 1. CRITICAL RULES (HIGHEST PRIORITY)

These rules override everything else:

- NEVER place business data inside React components
- ALWAYS ensure Lighthouse score remains 100/100/100/100
- NEVER introduce console.log in production code
- ALWAYS use semantic HTML
- NEVER break accessibility (ARIA, keyboard navigation)

If any conflict occurs -> follow these rules.

---

# 2. PRIORITIES (STRICT ORDER)

1. Correctness & Architecture
2. Lighthouse (100/100/100/100) & Accessibility
3. UI Consistency
4. Simplicity & Readability

---

# 3. EXECUTION PROTOCOL (MANDATORY)

Follow this sequence for EVERY change:

STEP 1: CLASSIFY  
-> UI (components/) / Data (data/) / Logic (hooks/utils/)

STEP 2: PLACE  
-> NEVER mix data with UI  
-> NEVER put logic inside JSX

STEP 3: STRUCTURE  
-> Apply SRP (Single Responsibility Principle)  
-> Split large components  
-> Reuse existing UI components

STEP 4: QUALITY  
-> Semantic HTML  
-> aria-labels for icon-only elements  
-> No console.log  

STEP 5: PERFORMANCE  
-> No layout-thrashing animations  
-> Optimize images (lazy / fetchpriority)  

STEP 6: STORYBOOK  
-> If component is reusable -> create `.stories.tsx`  
-> Include real states (Loading, Error, Empty)

STEP 7: FINAL CHECK  
-> Build passes  
-> No TypeScript / ESLint errors  
-> Lighthouse not impacted  

---

# 4. ARCHITECTURE RULES

## Non-Negotiable

- ALWAYS separate data from components: facts into `src/data/portfolioFacts.ts`, the JSX that presents them into `src/data/portfolioData.tsx`
- NEVER use global state unless absolutely necessary
- ALWAYS extract reusable logic into hooks or utils

## Decision Rules

When adding a feature:

1. Static facts -> `src/data/portfolioFacts.ts`, which carries no JSX so the build can read it (`llm.txt`, the JSON-LD and the sitemap are generated from it)
2. Reusable logic -> `hooks/`
3. Reusable UI -> `components/ui/`
4. Complex component -> split into smaller parts

## Project Structure

```text
src/
├── components/
│   ├── layout/
│   ├── sections/
│   └── ui/
├── data/
├── hooks/
├── types/
└── utils/
```

---

# 5. LIGHTHOUSE & PERFORMANCE GUARDRAILS

## Images

- Above the fold -> `fetchpriority="high"`
- Below the fold -> `loading="lazy"`
- ALWAYS define width and height

## Animations

- ONLY use `transform` and `opacity`
- NEVER animate layout properties (margin, padding, width, height)

## Rendering

- Avoid heavy scripts in `<head>`
- Use `preconnect` when needed

---

# 6. ACCESSIBILITY (A11Y)

- ALL icon-only buttons MUST have `aria-label`
- Maintain proper heading hierarchy (h1 -> h2 -> h3)
- Ensure keyboard navigation (Tab + focus states)
- Maintain contrast (no low-contrast text)

---

# 7. UI GUIDELINES

## Core Rules

- ALWAYS use Dark Mode (`#020617`)
- ALWAYS Mobile-First
- NEVER use inline styles for layout

## Patterns

- Cards -> Glassmorphism (`bg-slate-900/50 backdrop-blur-md`)
- Hover -> subtle transform (`-translate-y-1`)
- Lists -> staggered animations

## Typography

- Clear hierarchy
- Readable spacing (`leading-relaxed`)

---

# 8. STORYBOOK (MANDATORY FOR UI COMPONENTS)

Every component in `components/ui/` MUST have `.stories.tsx`

## Requirements

- Cover real states:
  - Default
  - Loading
  - Error
  - Empty
  - Edge cases

- Include A11y test:

```tsx
play: async ({ canvasElement }) => {
  expect(await axe(canvasElement)).toHaveNoViolations();
};
```

Failing A11y -> FAIL BUILD

---

# 9. FORBIDDEN PATTERNS

- Business logic inside JSX
- Inline styles (for layout)
- Using `<div>` instead of semantic tags
- Missing `aria-label` on icon buttons
- Missing `alt` on images
- Animating layout properties
- Introducing `console.log`

---

# 10. FINAL CHECKLIST (MANDATORY)

Before finishing ANY task:

- [ ] No `console.log` present
- [ ] All images have `alt` attributes
- [ ] No layout-breaking CSS
- [ ] Lighthouse score not impacted
- [ ] Code follows SRP
- [ ] Accessibility preserved
- [ ] Build passes (TS + ESLint)
- [ ] `npm run check:quality` run in full, not a convenient subset
- [ ] Every fixed bug carries a test that fails without the fix
- [ ] Commit body records the rationale, including approaches rejected

---

# 11. WORKFLOW RULES

## Commits

Use Conventional Commits:
- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `chore:`

## Before push

- Build passes
- No lint errors
- No failing tests

## CI/CD

- Every push triggers build
- TypeScript + ESLint enforced
- Deployment only if build passes

---

# 12. RESPONSE STYLE (VERY IMPORTANT)

- Prefer simple, production-ready solutions
- Avoid overengineering
- Do NOT explain obvious things
- Focus on implementation, not theory
- Minimize verbosity unless asked

---

# 13. ASSET RULES

- Images -> optimized (WebP preferred)
- Store in `public/`
- QR Codes -> drawn once by `scripts/qrCode.ts` and committed as a path in `src/data/linkedinQr.ts`. Nothing generates a QR in the browser: the only one the site has encodes a constant, so shipping a generator to redraw it on every visit was 10 kB for nothing. `react-qr-code` stays a devDependency purely as the oracle `tests/linkedinQr.test.ts` compares the committed path against

---

# 14. FEATURE INTRODUCTION PROTOCOL

Before adding anything:

- Can the facts go to `portfolioFacts.ts` and the presentation to `portfolioData.tsx`?
- Can existing UI be reused?
- Is logic extractable to hook?
- Does it break Lighthouse? `npm run check:lighthouse` answers that against the built site rather than by opinion, and CI runs it

If unsure -> choose simpler solution.
