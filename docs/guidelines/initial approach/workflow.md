## Non-Negotiable Rules

The following rules MUST be followed in every implementation:

- ALWAYS verify Lighthouse score after adding new features
- NEVER commit code with failing tests or linter errors
- ALWAYS use Conventional Commits naming convention
- NEVER push directly to main without local verification

# Workflow and Development Process

## Decision Rules

When preparing a commit or PR:

1. If it's a new feature → use `feat:` prefix
2. If it's a bug fix → use `fix:` prefix
3. If it's a documentation update → use `docs:` prefix
4. If it's a refactor → use `refactor:` prefix

## 1. Git Workflow

- **Small, atomic commits:** Each commit should represent one logical change (e.g., "feat: add certifications section", "fix: improve footer contrast").
- **Naming convention:** Use the Conventional Commits convention (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).

Bad:
```text
git commit -m "added some stuff and fixed bugs"
```

Good:
```text
git commit -m "feat: add certifications section"
```

- **Pre-push verification:** Ensure the project builds successfully (`npm run build`) and passes linters/tests.

## 2. CI/CD (GitHub Actions)

The project has a configured CI/CD pipeline.
- Every push to the `main` branch triggers the build process.
- TypeScript types (`tsc --noEmit`) and ESLint rules are verified.
- If the build is successful, the application is automatically deployed to GitHub Pages / Vercel.

## 3. Asset Management

- **Images:** All static images should be located in the `public/` folder (if they don't require processing) or `src/assets/` (if imported in code).
- **Optimization:** Compress images before adding them (e.g., using WebP format).
- **QR Codes:** We use the `react-qr-code` component to generate dynamic SVG QR codes directly in the React application (e.g., in the CV template). This ensures high quality and scalability without needing external generation scripts.

## 4. Introducing New Features

Before adding a new section or feature:
1. Consider whether the data can be extracted to `portfolioData.ts`.
2. Check if a reusable UI component (e.g., `Card`, `Badge`) already exists and can be used.
3. After implementation, run the server locally and test the page using Lighthouse in Chrome DevTools to ensure the 100/100/100/100 scores are maintained.
