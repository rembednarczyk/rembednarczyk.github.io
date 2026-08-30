<div align="center">
<img width="1200" height="475" alt="Remigiusz Bednarczyk" src="https://remigiuszbednarczyk.com/img/og-image.png" />
</div>

# Remigiusz Bednarczyk | Quality Engineering Portfolio

Personal website of a **Quality Engineering Lead / Test Manager** working in **GxP-regulated environments, test strategy, and AI-assisted testing**.

**Live:** [remigiuszbednarczyk.com](https://remigiuszbednarczyk.com/)

[![CI/CD Pipeline](https://github.com/rembednarczyk/rembednarczyk.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/rembednarczyk/rembednarczyk.github.io/actions/workflows/ci.yml)

Using: [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Lighthouse score, desktop preset, re-measured on every build by `npm run check:lighthouse`: [![Performance](https://img.shields.io/badge/Performance-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![Accessibility](https://img.shields.io/badge/Accessibility-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![Best Practices](https://img.shields.io/badge/Best%20Practices-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![SEO](https://img.shields.io/badge/SEO-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/)

---

## Scope and Intent

A production-grade frontend project that demonstrates how I approach:

- Quality treated as a system that runs on every commit
- Performance-first architecture
- Accessibility and UX consistency
- SEO and **LLM-ready content structure**

> **Disclaimer:** This project is deliberately over-engineered for a portfolio website. Strict component decomposition, domain logic separation, CI/CD quality gates, and automated testing are here to show how I work on software quality, maintainability, and engineering standards in enterprise environments.

---

## Quality-Driven Approach

Engineering discipline applied to a personal project:

- Semantic HTML and structured content
- Accessibility practices covering focus management, keyboard navigation, and contrast
- Print-ready layout (A4 optimized via `@media print`)
- SEO with Open Graph and JSON-LD
- LLM-friendly structure (`llm.txt`, structured sections)
- Print-ready CV template with certifications and credentials tracking
- Analytics gated behind explicit consent (Google Consent Mode v2)

---

## Architecture and Key Decisions

### Data-Driven Design

All content lives outside the UI in `portfolioData.tsx`, including dynamic sections such as Core Expertise, Experience, and Certifications. Sections read from it; nothing writes back. Content changes without touching a component, and the print template renders the same entries the page does.

`src/utils/domain.ts` holds pure helpers that run without React. `getYearsOfExperience` feeds the hero: the years figure is computed from a career start date on every page load, in both the headline metric and the description sentence, so it rolls over on its own instead of sitting there as a number someone has to remember to bump.

`src/lib/` holds logic that has no React in it at all. `particleField.ts` is the canvas simulation, handed a drawing context and a size; `contactForm.ts` is the contact form's transport, which reads the fields, builds the body and reports which of two things happened. Both used to live inside the components that render them, where the only way to reach them was to mount the component.

---

### Component Decomposition and Custom Hooks

Large sections are decomposed into focused components such as `ExperienceItem`, `ProjectCard`, and `SkillCategoryCard`.
Custom hooks (`useActiveSection`, `useScrollToSection`, `useModalA11y`, `useScrollLock`, `useContactForm`, `useCookieConsent`) hold side effects and DOM work, which keeps the components declarative.

---

### Software Engineering Practices

- **Single Responsibility Principle:** `ExperienceSection` handles layout and iteration; `ExperienceItem` renders one job entry.
- **Separation of Concerns:** data (`portfolioData.tsx`), pure helpers (`utils/domain.ts`), React-free logic (`lib/`), side effects (`hooks/`), and UI (`components/`) stay isolated.
- **DRY:** shared UI elements such as `SectionHeading` and `Button` live in `ui/`.
- **Strong typing:** TypeScript runs in `strict` mode with `@types/react` installed, so component props, hooks, and event handlers are all checked. Shared contracts live in `src/types/index.ts`.

---

### Stack

- React 19 with TypeScript 6
- Vite 8
- Tailwind CSS 4
- Motion (Framer Motion)
- Lucide icons
- Vitest with React Testing Library
- Storybook with the accessibility addon and test runner

Chosen for build speed, maintainability, and developer experience.

---

### UX and Interaction

- Scroll spy that maps sub-sections to their parent navigation entry
- Smooth navigation between sections
- Animations restricted to `transform` and `opacity`, which keeps them off the layout path
- Focus trapped inside open dialogs, and returned to the trigger on close
- Full `prefers-reduced-motion` alternative for the animated background

---

### Performance Optimization

- Single bundle by design. `React.lazy` was tried and removed because the extra requests hurt LCP on HTTP/1.1 more than the smaller entry chunk helped. The work went into making that one bundle smaller instead.
- Motion loads one feature set, `domAnimation`, once at the root through `LazyMotion`, and every animated element uses `m` rather than `motion`. The page animates with `initial`, `animate`, `exit`, `transition`, `whileInView` and `viewport`, and nothing else, so the drag, layout and gesture code never ships. `strict` mode makes a stray `motion` element throw rather than quietly restore the full bundle.
- The printed CV's QR code is drawn from committed path data. It encodes a constant, and generating it in the browser meant shipping a QR library to every visitor for a picture that only appears on paper.
- Passive scroll listeners so scrolling never waits on a handler
- Canvas background using a spatial hash for particle linking and batched path strokes, with the backing store scaled to `devicePixelRatio`
- No connection to the analytics origin until the visitor accepts. There was a preconnect here, and a tag beside it, both firing before anyone had answered the banner; the privacy policy said no measurement data was collected until acceptance, and that could not both be true.
- ViteSingleFile was considered and rejected to avoid over-optimizing at the cost of future scalability

---

## Development Guidelines and Guardrails

Development follows two documents, both of which apply to human and AI contributors:

- [Engineering Principles](docs/guidelines/ENGINEERING_PRINCIPLES.md) governs how changes are made: what a test is for, which defect classes to aim at, how much process a change deserves, and what has to be recorded before a change counts as done. It is project-agnostic and takes precedence.
- [AI Instructions](docs/guidelines/AI_INSTRUCTIONS.md) covers this repository specifically: execution protocol, architecture rules, Lighthouse guardrails, and UI/UX conventions.

Rules that can be automated are automated, following the principle that a ratchet beats a checklist. Several run as tests, each written after the repository had already broken the rule it now enforces:

- `tests/repository-docs.test.ts` re-derives every version and workflow badge in this README from `package.json` and `.github/workflows/`, and checks that every file and symbol this README names still exists. A README once described a helper that had been deleted.
- `tests/wiring.test.ts` fails on any module that no test reaches *through the code that uses it*. A unit can be correct, tested and connected to nothing: this repository lost the error boundary from its root, the contact dialog's reset on close, and the hook that honours a shared link to a section — three times, each caught only by hand, each with the whole suite green. Modules the graph legitimately cannot reach are listed with a reason, and the list may shrink and may not grow.
- `tests/module-reachability.test.ts` walks the import graph from the entry point and the stories, and fails on any module nothing imports. The repository previously carried ten duplicated section components that had drifted from the live ones while every check stayed green.
- `tests/dependencies.test.ts` fails when an installed package refuses the installed Storybook core, when the source imports a package it does not declare, or when the CI install step reaches for `--legacy-peer-deps`. That flag had been hiding a conflict which made `npm install` impossible for a whole major version.
- `tests/animationFeatures.test.ts` fails if the motion feature set widens back to `domMax`, which renders identically and costs the saving, so nothing at runtime would report it.
- `scripts/runLighthouse.ts` audits the built site and fails if any category scores below what the badge at the top of this README claims. It serves the built output compressed, as the host does; `tests/staticServer.test.ts` holds it to that. The first version did not, which put 380 kB of JavaScript on the wire instead of 118 kB and made the page measure 86 on mobile emulation where it actually scores 98 — a defect that looked like it was in the site and was in the measurement. The badges are not duplicated as thresholds; they are read out of this file and used as them, so lowering one to pass a build is a visible edit to the claim. They had stood at 100 since before any of this work, backed by nothing — and the first run showed why that matters: unlabelled, they were the desktop numbers, and the same page scores in the low eighties under Lighthouse's mobile emulation.
- `tests/sourceMaps.test.ts` builds the site and reads the output, failing if a script ships without a map, without a `sourceMappingURL`, or with the map inlined into what every visitor downloads. Error reports carry a position inside the minified bundle, which is exact with a map beside it and worthless without one, and nothing at runtime would report the difference.
- `src/components/ErrorBoundary.test.tsx` reads `src/main.tsx` and fails if the error boundary is not mounted around the app. The component keeps passing its own tests and its own story while wired to nothing, so removing it from the root was previously invisible.

---

## Run Locally

```bash
git clone https://github.com/rembednarczyk/rembednarczyk.github.io.git
cd rembednarczyk.github.io
npm install
npm run dev
```

## Running Tests and Quality Checks

```bash
# Development server
npm run dev

# Unit and integration tests
npm run test

# Linter and type check
npm run lint

# Storybook (component driven development and a11y testing)
npm run storybook

# Full quality gate: lint, test, build Storybook, test Storybook, build app
npm run check:quality
```

Test coverage spans three layers:

- **Unit and integration** through Vitest: navigation targets resolving to real sections, the scroll spy mapping, data from `portfolioData` reaching the page, and heading structure.
- **Component behaviour** through Storybook interaction tests: focus trapping, keyboard operation, and consent flows.
- **Accessibility** through `jest-axe` assertions inside every story.

---

## Component Driven Development and Storybook

Storybook serves as an automated accessibility gate. Every reusable component in `src/components/ui/` is required to have a matching `.stories.tsx` file.

Stories are state-driven, covering `Loading`, `ErrorState`, `EmptyState`, and `LongTextOverflow` alongside behavioural cases such as `FocusIsTrapped` and `EscapeRestoresFocus`.

### Edge Case: AI-Assisted Component Usage

The `ProjectCard` stories model how the UI behaves with unpredictable, AI-generated data: very long text, single words with nothing to break on, missing fields, and the same content at 320px. They assert that nothing reaches past the card's own edge, which is what the earlier version of this claimed and never checked — and they run against the card the site actually renders, rather than against components no page used.

Every story asserts accessibility:

```tsx
expect(await axe(canvasElement)).toHaveNoViolations();
```

A component that fails a contrast or ARIA check fails the pipeline.

---

## CI/CD Pipeline and Quality Gate (GitHub Actions)

One workflow, [`ci.yml`](.github/workflows/ci.yml), handles both verification and deployment.

- **Quality gate:** every push and pull request against `main` runs `npm run check:quality`.
- **Strict linting:** custom ESLint rules enforce the Single Responsibility Principle by preventing UI components from importing sections, block animation of layout properties in Motion, and hold the conditions for a 100/100/100/100 Lighthouse score such as `aria-label` presence and correct image loading attributes.
- **Fail-fast:** a failed gate aborts the run before anything reaches production.
- **Continuous deployment:** merges to `main` build and deploy to GitHub Pages. Only the deploy job holds the Pages credentials.
