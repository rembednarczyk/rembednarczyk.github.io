<div align="center">
<img width="1200" height="475" alt="Remigiusz Bednarczyk" src="https://remigiuszbednarczyk.com/img/og-image.png" />
</div>

# Remigiusz Bednarczyk | Quality Engineering Portfolio

Personal website of a **Quality Engineering Lead / Test Manager** specializing in **GxP-regulated environments, test strategy, and AI-assisted testing**.

**Live:** [remigiuszbednarczyk.com](https://remigiuszbednarczyk.com/)

Deployed: [![CI/CD Pipeline](https://github.com/rembednarczyk/rembednarczyk.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/rembednarczyk/rembednarczyk.github.io/actions/workflows/deploy.yml) [![Tests](https://img.shields.io/github/actions/workflow/status/rembednarczyk/rembednarczyk.github.io/deploy.yml?label=Tests)](https://github.com/rembednarczyk/rembednarczyk.github.io/actions/workflows/deploy.yml)

Using: [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

Lighthouse score: [![Performance](https://img.shields.io/badge/Performance-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![Accessibility](https://img.shields.io/badge/Accessibility-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![Best Practices](https://img.shields.io/badge/Best%20Practices-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![SEO](https://img.shields.io/badge/SEO-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/)

---

## What Makes This Project Different

This is not just a portfolio.

It is a **production-grade, quality-driven frontend project** built to demonstrate how I approach:

- Quality as a system, not a phase
- Performance-first architecture
- Accessibility and UX consistency
- SEO and **LLM-ready content structure**

> **Disclaimer:** This project is intentionally over-engineered for a simple portfolio website. The architectural decisions (strict component decomposition, domain logic separation, CI/CD quality gates, and unit testing) were implemented deliberately to showcase my approach to software quality, maintainability, and engineering standards in enterprise environments.

---

## Quality-Driven Approach

Even for a personal project, I applied engineering discipline:

- Semantic HTML & structured content
- Accessibility best practices (focus states, navigation, contrast)
- Print-ready layout (A4 optimized via `@media print`)
- SEO optimization + Open Graph + JSON-LD
- LLM-friendly structure (`llm.txt`, structured sections)
- Print-ready CV Template with comprehensive Certifications & Credentials tracking

---

## Architecture & Key Decisions

### Data-Driven Design & Domain Logic

All content is separated from UI (`portfolioData.tsx`), including dynamic sections like Core Expertise, Experience, and Certifications.
A dedicated domain logic layer (`src/utils/domain.ts`) handles pure functions independent of React, improving testability and separation of concerns.

→ Easy to maintain  
→ Scalable  
→ Clean separation of concerns

---

### Component Decomposition & Custom Hooks

The application follows a modular architecture where large monolithic sections are decomposed into smaller, focused components (e.g., `ExperienceItem`, `ProjectCard`, `SkillCategoryCard`).
Custom hooks (`useActiveSection`, `useScrollToSection`) encapsulate side effects and DOM manipulation, keeping UI components declarative and clean.

---

### Software Engineering Best Practices

The codebase strictly adheres to modern software engineering principles to ensure maintainability and testability:

- Single Responsibility Principle (SRP): Components are highly focused. For example, `ExperienceSection` only handles layout and iteration, while `ExperienceItem` handles the rendering of a specific job entry.
- Separation of Concerns: Data (`portfolioData.tsx`), domain logic (`utils/domain.ts`), side effects (`hooks/`), and UI (`components/`) are strictly isolated.
- DRY (Don't Repeat Yourself): Reusable UI elements (e.g., `SectionHeading`, `Badge`) are extracted into a shared `ui/` directory.
- Strong Typing: Comprehensive TypeScript interfaces (`src/types/index.ts`) enforce data contracts across the entire application, preventing runtime errors.

---

### Modern Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Vitest & React Testing Library (for unit and integration testing)

Chosen for **speed, maintainability, and developer experience**.

---

### UX & Interaction

- High-performance ScrollSpy using `IntersectionObserver` (eliminating forced reflows)
- Smooth navigation between sections
- Subtle animations supporting readability, not distracting

---

### Performance Optimization

- Bundle optimization (removed initially implemented `React.lazy` to eliminate HTTP/1.1 waterfall and improve LCP)
- Scroll event throttling and passive listeners to maintain 60fps
- Preconnect directives for third-party scripts (Google Tag Manager)
- Optimized initial load (fast FCP & LCP)
- ViteSingleFile was under consideration - to not over-optimize, the decision was made to not introduce this change and mitigate future scalability problems

---

## Why This Matters

As a Test Manager, I don’t just validate systems.

I design them to be:

- predictable
- testable
- scalable
- user-centered

This project reflects that mindset.

---

## Development Guidelines & Guardrails

To maintain the high quality, performance, and consistency of this project, all future development must adhere to the documented guidelines. These documents serve as strict guardrails for the AI and human contributors:

- [AI Instructions (Entry Point)](docs/guidelines/AI_INSTRUCTIONS.md) - The overarching master instruction file for all AI agents and contributors.
- [Architecture & Tech Stack](docs/guidelines/architecture.md) - React, Vite, TS, and component decomposition rules.
- [Lighthouse 100/100/100/100 Guardrails](docs/guidelines/quality.md) - Strict rules for Performance, Accessibility, Best Practices, and SEO.
- [UI/UX & Styling](docs/guidelines/ui.md) - Dark mode, glassmorphism, Tailwind conventions, and Framer Motion animations.
- [Workflow & Git](docs/guidelines/workflow.md) - CI/CD, asset management (including QR codes), and deployment processes.

---

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons
- GitHub Pages / Vercel

---

## Run Locally

```bash
git clone https://github.com/rembednarczyk/rembednarczyk.github.io.git
cd rembednarczyk.github.io
npm install
npm run dev
```

## Running Tests & Quality Checks

The project uses Vitest and React Testing Library for unit and integration testing, along with a strict ESLint configuration to enforce architecture and performance rules.

```bash
# Run the development server
npm run dev

# Run unit and integration tests
npm run test

# Run the strict linter (ESLint + TypeScript)
npm run lint

# Start Storybook (Component Driven Development & A11y Testing)
npm run storybook

# Run the full Quality Gate (Lint -> Test -> Build Storybook -> Test Storybook -> Build App)
npm run check:quality
```

---

## Component Driven Development & Storybook

This project uses **Storybook** not just as a component library, but as an **Automated Accessibility (A11y) Quality Gate**. 

### Use Cases and Edge Case: AI-Assisted Component Usage
To demonstrate UI engineering, the Storybook apart from basic coverage, includes an `AiAssistedCard` story. This story models how the UI behaves when handling unpredictable, AI-generated dynamic data (e.g., extremely long text, missing fields, unexpected formatting). 
Instead of simple "Primary/Secondary" states, stories are state-driven (`Loading`, `ErrorState`, `EmptyState`, `LongTextOverflow`) and include behavioral edge-case modeling.

Every story includes an assertion using `jest-axe`:
```tsx
expect(await axe(canvasElement)).toHaveNoViolations();
```
If a component fails contrast or ARIA checks, the CI pipeline fails.

---

## CI/CD Pipeline & Quality Gate (GitHub Actions)

- Quality Gate (CI): Every push and pull request to `main` triggers the `npm run check:quality` script.
- Strict Linting: Custom ESLint rules enforce the Single Responsibility Principle (preventing UI components from importing sections), prevent Layout Thrashing in Framer Motion, and ensure Lighthouse 100/100/100/100 compliance (e.g., enforcing `aria-label` and correct image loading attributes).
- Fail-Fast: The build process is aborted if any quality gate fails, preventing broken or suboptimal code from reaching production.
- Continuous Deployment (CD): Successful merges to `main` are automatically built and deployed.
