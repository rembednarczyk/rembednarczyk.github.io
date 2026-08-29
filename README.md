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

Lighthouse score: [![Performance](https://img.shields.io/badge/Performance-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![Accessibility](https://img.shields.io/badge/Accessibility-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![Best Practices](https://img.shields.io/badge/Best%20Practices-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![SEO](https://img.shields.io/badge/SEO-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/)

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

### Data-Driven Design and Domain Logic

All content lives outside the UI in `portfolioData.tsx`, including dynamic sections such as Core Expertise, Experience, and Certifications.
A domain logic layer (`src/utils/domain.ts`) holds pure functions independent of React, which keeps them directly testable.

The result is content that changes without touching components, and logic that can be verified without rendering anything.

---

### Component Decomposition and Custom Hooks

Large sections are decomposed into focused components such as `ExperienceItem`, `ProjectCard`, and `SkillCategoryCard`.
Custom hooks (`useActiveSection`, `useScrollToSection`, `useModalA11y`, `useCookieConsent`) hold side effects and DOM work, which keeps the components declarative.

---

### Software Engineering Practices

- **Single Responsibility Principle:** `ExperienceSection` handles layout and iteration; `ExperienceItem` renders one job entry.
- **Separation of Concerns:** data (`portfolioData.tsx`), domain logic (`utils/domain.ts`), side effects (`hooks/`), and UI (`components/`) stay isolated.
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

- Single bundle by design. `React.lazy` was tried and removed because the extra requests hurt LCP on HTTP/1.1 more than the smaller entry chunk helped.
- Passive scroll listeners so scrolling never waits on a handler
- Canvas background using a spatial hash for particle linking and batched path strokes, with the backing store scaled to `devicePixelRatio`
- Preconnect directives for the analytics origin
- ViteSingleFile was considered and rejected to avoid over-optimizing at the cost of future scalability

---

## Development Guidelines and Guardrails

Development follows two documents, both of which apply to human and AI contributors:

- [Engineering Principles](docs/guidelines/ENGINEERING_PRINCIPLES.md) governs how changes are made: what a test is for, which defect classes to aim at, how much process a change deserves, and what has to be recorded before a change counts as done. It is project-agnostic and takes precedence.
- [AI Instructions](docs/guidelines/AI_INSTRUCTIONS.md) covers this repository specifically: execution protocol, architecture rules, Lighthouse guardrails, and UI/UX conventions.

Rules that can be automated are automated, following the principle that a ratchet beats a checklist. Two of them run as tests:

- `tests/repository-docs.test.ts` re-derives every version and workflow badge in this README from `package.json` and `.github/workflows/`, so a stale claim here fails the build.
- `tests/module-reachability.test.ts` walks the import graph from the entry point and the stories, and fails on any module nothing imports. The repository previously carried ten duplicated section components that had drifted from the live ones while every check stayed green.

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

The `AiAssistedCard` story models how the UI behaves with unpredictable, AI-generated data: very long text, missing fields, and unexpected formatting.

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
