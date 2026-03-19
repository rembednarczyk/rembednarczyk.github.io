<div align="center">
<img width="1200" height="475" alt="Remigiusz Bednarczyk" src="https://remigiuszbednarczyk.com/img/og-image.png" />
</div>

# Remigiusz Bednarczyk | Quality Engineering Portfolio

Personal website of a **Quality Engineering Lead / Test Manager** specializing in **GxP-regulated environments, test strategy, and AI-assisted testing**.

**Live:** [remigiuszbednarczyk.com](https://remigiuszbednarczyk.com/)

Deployed: [![CI/CD Pipeline](https://github.com/rembednarczyk/rembednarczyk.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/rembednarczyk/rembednarczyk.github.io/actions/workflows/deploy.yml)

Using: [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## What Makes This Project Different

This is not just a portfolio.

It is a **production-grade, quality-driven frontend project** built to demonstrate how I approach:

- Quality as a system, not a phase
- Performance-first architecture
- Accessibility and UX consistency
- SEO and **LLM-ready content structure**

---

## Quality-Driven Approach

Even for a personal project, I applied engineering discipline:

- Semantic HTML & structured content
- Accessibility best practices (focus states, navigation, contrast)
- Print-ready layout (A4 optimized via `@media print`)
- SEO optimization + Open Graph + JSON-LD
- LLM-friendly structure (`llm.txt`, structured sections)

---

## Architecture & Key Decisions

### Data-Driven Design

All content is separated from UI (`portfolioData.tsx`).

→ Easy to maintain  
→ Scalable  
→ Clean separation of concerns

---

### Modern Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion

Chosen for **speed, maintainability, and developer experience**.

---

### UX & Interaction

- Custom ScrollSpy (viewport-based logic instead of default IntersectionObserver)
- Smooth navigation between sections
- Subtle animations supporting readability, not distracting

---

### Performance Optimization

- Lazy loading (`React.lazy`, `Suspense`)
- Above-the-fold prioritization
- Optimized initial load (fast FCP)

---

### CI/CD Pipeline (GitHub Actions)

- Quality Gates (CI): Every push and pull request triggers ESLint and TypeScript type checking (`tsc --noEmit`).
- Fail-Fast: The build process is aborted if any quality gate fails, preventing broken code from reaching production.
- Continuous Deployment (CD): Successful merges to `main` are automatically built and deployed to GitHub Pages.

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
