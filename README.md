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

Lighthouse score: [![Performance](https://img.shields.io/badge/Performance-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![Accessibility](https://img.shields.io/badge/Accessibility-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![Best Practices](https://img.shields.io/badge/Best%20Practices-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/) [![SEO](https://img.shields.io/badge/SEO-100-00CC66?logo=lighthouse&logoColor=white)](https://remigiuszbednarczyk.com/)

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
