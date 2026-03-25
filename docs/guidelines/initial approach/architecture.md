## Non-Negotiable Rules

The following rules MUST be followed in every implementation:

- NEVER place business data inside React components
- ALWAYS separate data into `data/portfolioData.ts`
- NEVER use global state unless absolutely necessary
- ALWAYS extract complex logic into custom hooks or utility functions

# Architecture and Tech Stack

This document describes the main architectural assumptions and the technology stack used in the portfolio project.

## Decision Rules

When adding a new feature:

1. If the feature contains static data → place it in `data/portfolioData.ts`
2. If logic is reusable → create a custom hook
3. If UI is reusable → place in `components/ui`
4. If unsure → prefer splitting into smaller components

## 1. Tech Stack

- **Framework:** React 18
- **Language:** TypeScript (Strict Mode)
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Testing:** Vitest + React Testing Library

## 2. Project Structure

The project relies on a modular architecture that promotes Separation of Concerns and code reusability.

```text
src/
├── components/       # UI Components
│   ├── sections/     # Main page sections (Hero, About, Experience, etc.)
│   └── ui/           # Reusable, small components (Button, Badge, Card)
├── hooks/            # Custom React hooks (e.g., useActiveSection)
├── data/             # Static data separated from UI (portfolioData.ts)
├── utils/            # Helper functions and domain logic (domain.ts)
├── types/            # TypeScript type definitions (index.ts)
└── assets/           # Static assets (images, icons)
```

## 3. Main Architectural Principles

### 3.1. Separation of Data from UI
All data displayed on the page (experience, skills, projects) must be located in the `data/portfolioData.ts` file. React components are used exclusively for rendering this data.

Bad:
```tsx
const Experience = () => {
  const jobs = [{ title: "Developer", company: "Google" }];
  return <div>{jobs[0].title}</div>;
}
```

Good:
```tsx
import { experienceData } from "../../data/portfolioData";

const Experience = () => {
  return <div>{experienceData[0].title}</div>;
}
```

### 3.2. Single Responsibility Principle (SRP)
Each component should do one thing. If a section becomes too large (e.g., `ExperienceSection`), it should be split into smaller components (e.g., `ExperienceItem`).

### 3.3. Domain Logic
Any logic not directly related to UI rendering (e.g., date formatting, data filtering) should be placed in the `utils/` directory and be testable independently of React.

### 3.4. Custom Hooks
Complex state logic and side effects (e.g., scroll listening, Intersection Observer) must be extracted into custom hooks in the `hooks/` directory. UI components should remain as declarative as possible.

## 4. State Management and Performance
- Avoid global state where it is not absolutely necessary.
- Use `IntersectionObserver` instead of listening to the `scroll` event to detect the active section, to avoid performance issues (forced reflows).
- Avoid `React.lazy` for key components to prevent LCP (Largest Contentful Paint) issues and HTTP request "waterfalls".
