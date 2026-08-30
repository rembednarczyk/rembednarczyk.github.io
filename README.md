<div align="center">
<img width="1200" height="630" alt="Remigiusz Bednarczyk" src="https://remigiuszbednarczyk.com/img/og-image.png" />
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
Custom hooks (`useActiveSection`, `useScrollToSection`, `useHashTarget`, `useAutoPrint`, `useModalA11y`, `useScrollLock`, `useContactForm`, `useCookieConsent`) hold side effects and DOM work, which keeps the components declarative.

---

### Software Engineering Practices

- **Single Responsibility Principle:** `ExperienceSection` handles layout and iteration; `ExperienceItem` renders one job entry.
- **Separation of Concerns:** data (`portfolioData.tsx`), pure helpers (`utils/domain.ts`), React-free logic (`lib/`), side effects (`hooks/`), and UI (`components/`) stay isolated.
- **DRY:** shared UI lives in `ui/` — the leaf elements (`SectionHeading`, `Button`, `Tag`) and the shells the page is assembled from (`PageSection`, `Reveal`, `IconCard`, `IconListItem`, `Modal`).
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
- `prefers-reduced-motion` honoured across the whole page, not only the animated background: `MotionProvider` sets `reducedMotion="user"`, which drops the transform from every entrance and leaves the fade alone. Measured on the built page, a section arriving moves through two positions instead of thirty-two

---

### Performance Optimization

- Single bundle by design. `React.lazy` was tried and removed because the extra requests hurt LCP on HTTP/1.1 more than the smaller entry chunk helped. The work went into making that one bundle smaller instead.
- Motion is set up once at the root by `MotionProvider`, which loads one feature set, `domAnimation`, through `LazyMotion`; every animated element uses `m` rather than `motion`. The page animates with `initial`, `animate`, `exit`, `transition`, `whileInView` and `viewport`, and nothing else, so the drag, layout and gesture code never ships. `strict` mode makes a stray `motion` element throw rather than quietly restore the full bundle.
- The printed CV's QR code is drawn from committed path data. It encodes a constant, and generating it in the browser meant shipping a QR library to every visitor for a picture that only appears on paper.
- Passive scroll listeners so scrolling never waits on a handler
- Canvas background using a spatial hash for particle linking and batched path strokes, with the backing store scaled to `devicePixelRatio`
- No connection to the analytics origin until the visitor accepts. There was a preconnect here, and a tag beside it, both firing before anyone had answered the banner; the privacy policy said no measurement data was collected until acceptance, and that could not both be true.
- ViteSingleFile was considered and rejected to avoid over-optimizing at the cost of future scalability

---

## Development Guidelines and Guardrails

Development follows two documents, both of which apply to human and AI contributors:

- [Ways of Working](docs/guidelines/WAYS_OF_WORKING.md) governs how changes are made: the operating loop of a change, how the project's memory is structured, what a test is for, which defect classes to aim at, how much process a change deserves, and what has to be recorded before a change counts as done. It is project-agnostic and takes precedence. Two of its rules decide most of what is in this repository: *a rule you cannot enforce automatically is a wish*, and the tier of a change is set by whether its defect could be seen at all without a gate — not only by what a silent error would cost. This project has no money, auth or data integrity on its critical path, and that second axis is why it has a gate for the printed CV's page breaks and one for what a keyboard focus ring paints.
- [AI Instructions](docs/guidelines/AI_INSTRUCTIONS.md) covers this repository specifically: execution protocol, architecture rules, Lighthouse guardrails, and UI/UX conventions.
- [CLAUDE.md](CLAUDE.md) is the working agreement read at the start of a session: authorship, the branch and pull request flow, and the habits that catch a wrong measurement. It restates neither of the above, and points at both.

`.claude/hooks/session-start.sh` runs at session start and sets the repository's git identity, because the container's global one is not the owner's and a rule that depends on remembering is not a rule. `.claude/hooks/no-shell-edits.sh` refuses the two things CLAUDE.md names and that carried on happening anyway: changing a repository file through a redirect, a heredoc or `sed -i`, and discarding uncommitted work with `git checkout <path>`. Reading and searching through the shell are untouched. **It is not registered**, so it does not run: a `PreToolUse` entry edits the agent's own permission surface and the permission classifier refuses to write one, so the owner adds it by hand. Until that entry exists the rule is held by discipline alone, which is what `tests/hookRegistration.test.ts` makes the documents say out loud. To turn it on, add to `.claude/settings.json` a `PreToolUse` array whose one entry matches `Bash` and runs `$CLAUDE_PROJECT_DIR/.claude/hooks/no-shell-edits.sh`. All three documents are held to naming only files that exist by `tests/repository-docs.test.ts`.

[Backlog](docs/BACKLOG.md) holds the work that is understood but not done, with enough detail that picking it up costs nothing.

Rules that can be automated are automated, following the principle that a ratchet beats a checklist. Several run as tests, each written after the repository had already broken the rule it now enforces:

- `tests/repository-docs.test.ts` re-derives every version and workflow badge in this README from `package.json` and `.github/workflows/`, and checks that every file and symbol this README names still exists. A README once described a helper that had been deleted.
- `scripts/runPrintCheck.ts` prints the site to PDF, reads the sheets back and reports when the layout stops matching the one recorded in `scripts/printedCv.ts`. Sections and job entries carry `break-inside-avoid` so that an entry is never split across two sheets; the cost is that a block too tall for the space left moves to the next page whole, which is why the CV runs to six sheets with 38% of the first and 58% of the fourth blank. That is a deliberate trade, so the check records the shape rather than judging it. Nothing on a screen shows any of this. It also prints a second time with the privacy dialog open and fails if that document differs from the first: the dialog shell portals into `document.body`, which puts it outside the `print:hidden` wrapper the screen page sits in, and a fixed element repeats on every printed page — so printing while reading the policy put its text on all six sheets and left 96% of each one dark. Stated as a relationship rather than a list of forbidden words, because a word list would have to be kept in step with the dialog's prose and the first edit to it would quietly empty the check.
- `tests/wiring.test.ts` fails on any module that no test reaches *through the code that uses it*. A unit can be correct, tested and connected to nothing: this repository lost the error boundary from its root, the contact dialog's reset on close, and the hook that honours a shared link to a section — three times, each caught only by hand, each with the whole suite green. Modules the graph legitimately cannot reach are listed with a reason, and the list may shrink and may not grow.
- `tests/module-reachability.test.ts` walks the import graph from the entry point and the stories, and fails on any module nothing imports. The repository previously carried ten duplicated section components that had drifted from the live ones while every check stayed green.
- `tests/sectionWrappers.test.ts` fails on a page section that writes out its own wrapper instead of using `src/components/ui/PageSection.tsx`. Ten sections each carried the same anchor, reveal and heading — twenty-three lines with four words changed — and one of the ten had already drifted to a longer slide and a slower easing with nothing to notice. Copying a neighbour is how that happened, so the exemption list is named with reasons and may shrink but not grow. It started at four entries and is now one: the component the others use.
- `tests/dependencies.test.ts` fails when an installed package refuses the installed Storybook core, when the source imports a package it does not declare, or when the CI install step reaches for `--legacy-peer-deps`. That flag had been hiding a conflict which made `npm install` impossible for a whole major version.
- `tests/animationFeatures.test.ts` fails if the motion feature set widens back to `domMax`, which renders identically and costs the saving, so nothing at runtime would report it.
- `scripts/runLighthouse.ts` audits the built site and fails if any category scores below what the badge at the top of this README claims. It serves the built output compressed, as the host does; `tests/staticServer.test.ts` holds it to that. The first version did not, which put 380 kB of JavaScript on the wire instead of 118 kB and made the page measure 86 on mobile emulation where it actually scores 98 — a defect that looked like it was in the site and was in the measurement. The badges are not duplicated as thresholds; they are read out of this file and used as them, so lowering one to pass a build is a visible edit to the claim. They had stood at 100 since before any of this work, backed by nothing — and the first run showed why that matters: unlabelled, they were the desktop numbers, and the same page scores in the low eighties under Lighthouse's mobile emulation.
- `scripts/runRevealMotion.ts` drives the built page in a browser and counts the distinct positions a section passes through as it arrives, with and without `prefers-reduced-motion`. Twelve entrance animations across nine files ignored the setting while the particle canvas and the 404 view honoured it, so the page disagreed with itself: a section moved through 32 positions either way, and now moves through two when the preference is set. The fade is deliberately left alone — a fade is not what makes motion unbearable. This needs a real browser, because motion reads the preference through `matchMedia` at load and under jsdom both settings animate identically, so a test there passes whether or not the page honours anything.
- `scripts/runFocusIndicator.ts` tabs the built page and checks, in pixels, that every keyboard stop shows where the keyboard is. Twenty controls spelled out their own focus ring in two variants and eight — every link on a project card — declared nothing at all and fell back to the browser's own, so twenty-nine stops carried four different indicators. There is now one, `focus-ring` in `src/index.css`. It has to be a browser and it has to be pixels: a computed style reports a colour Chrome does not paint, and a control mid-transition reports a ring it is still fading in. It also walks the page at two widths with the consent banner showing, because a banner pinned to the foot of the viewport hides whatever the browser scrolls under it and the browser has no idea it is there: two controls were entirely behind it when they took focus (WCAG 2.2 SC 2.4.11), five were unclickable — including two the banner did not visually cover at all, since its band runs the full width of the viewport while its card does not — and the scroll-to-top button took a third of the Accept button at 768px, so a tap on the right of Accept scrolled the page instead of recording a choice. The first version of this gate checked only that *something* was painted and passed the very defect it was written for — Chrome draws a ring where the page draws none — so it checks the colour too. It also samples the banner's own buttons on three short viewports with the navigation's mobile menu open, because two widths at one comfortable height proved nothing about a short one: that menu grows downward until 16px from the foot of the screen, so at 812×375, 740×360 and 768×500 it covered Accept and Decline whole, and a tap on Accept reached a nav button — the page scrolled away and no choice was recorded. That is the second pair of things pinned to the same corner to find each other here, so the menu now subtracts `--fixed-bar-space` from its height, the same property the body's padding spends.
- `tests/cvSections.test.ts` fails on a headed section of the printed CV written by hand instead of through `src/components/CvSection.tsx`. Seven of them carried the same two print rules and the same nine-class heading, all seven identical — which is the fragile case, because the next hand to touch one makes it six and one, on the page nobody sees on a screen. `print:break-inside-avoid` is what the printed layout is made of, so the check above would catch it losing that rule, but only after the layout had already changed.
- `tests/storyCoverage.test.ts` fails on a component in `src/components/ui/` with no `.stories.tsx`. Both guideline documents already required one and neither said it to anything that runs, so four components were added without one and the documents went on claiming otherwise for two pull requests. The rule is not paperwork: `.storybook/preview.ts` sets the accessibility addon to `test: 'error'`, so a story is an axe run that fails the build, and a component with no story is one that scan never sees on its own.
- `tests/documentedStructure.test.ts` re-derives the project tree drawn in `AI_INSTRUCTIONS.md` from `src/`, in both directions — a directory missing from the tree and a directory the tree invents both fail. `src/lib/` and `src/test/` had existed for some time without appearing in it, so a document telling a contributor where things go was silent about two of the places they go.
- `tests/dialogShell.test.ts` fails on a dialog that builds its own shell instead of using `src/components/ui/Modal.tsx`. The keyboard and focus behaviour was already shared, and that is the half where a mistake is obvious; the markup around it is the half where a mistake is silent. A dialog that forgets `aria-modal`, or labels itself with an id that resolves to nothing, still opens and still looks right.
- `tests/sourceMaps.test.ts` builds the site and reads the output, failing if a script ships without a map, without a `sourceMappingURL`, or with the map inlined into what every visitor downloads. Error reports carry a position inside the minified bundle, which is exact with a map beside it and worthless without one, and nothing at runtime would report the difference.
- `src/components/ErrorBoundary.test.tsx` reads `src/main.tsx` and fails if the error boundary is not mounted around the app. The component keeps passing its own tests and its own story while wired to nothing, so removing it from the root was previously invisible.
- `tests/repository-docs.test.ts` also fails on a comment citing a governing document by a name nothing goes by any more. Renaming the governing document left four such citations behind — in `scripts/lighthouse.ts`, `tests/dependencies.test.ts`, `tests/module-reachability.test.ts` and the docs test itself — and nothing turned red, because the path check only sees a backticked path and the symbol check only sees an identifier. A document named in prose is neither, so the rename read as complete while four comments pointed at a file that no longer existed.
- `tests/hookRegistration.test.ts` holds three things together: the hooks on disk, the commands `.claude/settings.json` actually invokes, and what these documents claim about them. `no-shell-edits.sh` was written, tested twenty-one ways, mutation-tested six ways and merged — and never registered, so it has never run, while this README said it ran before every shell command and CLAUDE.md said it enforced both rules. Its own tests could not see it: they run the script directly, which is the right way to test a hook and says nothing about whether anything invokes it. An unregistered hook may stay, named with its reason in a list that may shrink and not grow, but the documents then have to say it does not run — and the moment someone registers it, the list entry and the caveat both fail until they are removed.
- `tests/shellEditGuard.test.ts` runs `.claude/hooks/no-shell-edits.sh` as a process and checks it refuses a shell file edit and allows ordinary shell use. It tests the hook rather than a function inside it, because what goes wrong with a hook is that it never fires — a bad shebang, a missing `jq`, a payload that does not parse — and a unit test of the patterns passes through all three. This is the one ratchet aimed at how the work is done rather than at the code, and it exists because writing the rule down in two documents did not stop it being broken: the harness re-states the opposite preference every turn, and repetition beats recall.

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

# The four checks that need a browser, and run as their own CI steps.
# Each needs `npm run build` first; check:quality ends with one.
npm run check:lighthouse   # scores the built site against the badges above
npm run check:print        # prints the CV to PDF and reads the sheets back
npm run check:motion       # watches the sections arrive, with and without
                           # prefers-reduced-motion
npm run check:focus        # tabs the page and checks every stop shows focus
```

Test coverage spans three layers:

- **Unit and integration** through Vitest: navigation targets resolving to real sections, the scroll spy mapping, data from `portfolioData` reaching the page, and heading structure.
- **Component behaviour** through Storybook interaction tests: focus trapping, keyboard operation, and consent flows.
- **Accessibility** through the Storybook addon, which runs axe on every story and fails the build; the dialogs add a `jest-axe` assertion of their own, since they render through a portal the addon's scan does not reach.

---

## Component Driven Development and Storybook

Storybook serves as an automated accessibility gate. Every reusable component in `src/components/ui/` is required to have a matching `.stories.tsx` file.

Stories are state-driven, covering `Loading`, `MissingFields`, `UnreachableService` and `LongTextOverflow` alongside behavioural cases such as `FocusIsTrapped`, `EscapeRestoresFocus` and `ReopeningAfterAHungSubmission`.

### Edge Case: AI-Assisted Component Usage

The `ProjectCard` stories model how the UI behaves with unpredictable, AI-generated data: very long text, single words with nothing to break on, missing fields, and the same content at 320px. They assert that nothing reaches past the card's own edge, which is what the earlier version of this claimed and never checked — and they run against the card the site actually renders, rather than against components no page used.

Accessibility is checked on every story by the addon, which `.storybook/preview.ts` sets to `test: 'error'` so a violation fails the pipeline rather than appearing in a panel nobody opens. `tests/storyCoverage.test.ts` holds every component in `src/components/ui/` to having one, because a component with no story is a component that scan never sees on its own.

Stories that render through a portal assert it themselves as well:

```tsx
expect(await axe(dialog)).toHaveNoViolations();
```

The addon scans the story's own root, and a dialog is not inside it — so the dialogs name the node to scan.

---

## CI/CD Pipeline and Quality Gate (GitHub Actions)

One workflow, [`ci.yml`](.github/workflows/ci.yml), handles both verification and deployment.

- **Quality gate:** every push and pull request against `main` runs `npm run check:quality`.
- **Strict linting:** custom ESLint rules enforce the Single Responsibility Principle by preventing UI components from importing sections, block animation of layout properties in Motion, and hold the conditions for a 100/100/100/100 Lighthouse score such as `aria-label` presence and correct image loading attributes.
- **Fail-fast:** a failed gate aborts the run before anything reaches production.
- **Continuous deployment:** merges to `main` build and deploy to GitHub Pages. Only the deploy job holds the Pages credentials.
