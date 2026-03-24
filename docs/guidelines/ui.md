## Non-Negotiable Rules

The following rules MUST be followed in every implementation:

- ALWAYS use Dark Mode theme (`#020617` background)
- NEVER animate properties that cause layout thrashing (margin, padding, width)
- ALWAYS start styling from the mobile view (Mobile-First)
- NEVER use inline styles for standard UI elements

# UI/UX and Styling Guidelines

This document defines the visual and interactive principles of the project, ensuring user interface consistency.

## Decision Rules

When adding new UI elements:

1. If it's a floating element/card → use Glassmorphism classes
2. If it's a heading → use bold typography, consider gradient text
3. If it's a list of items → stagger their entrance animations
4. If it's a hover effect → use subtle transform (`-translate-y-1`)

## 1. Color Palette

The project uses a Dark Mode theme as the default and only theme.

- **Main Background:** Dark navy/black (`bg-slate-950` / `#020617`).
- **Card/Section Backgrounds:** Semi-transparent, slightly lighter shades (e.g., `bg-slate-900/50`).
- **Accents (Gradients):** Transitions from cyan to purple.
  - Tailwind classes: `from-cyan-400 to-purple-600` or `from-cyan-500 to-purple-500`.
- **Main Text:** Light gray/white (`text-slate-200`, `text-slate-300`).
- **Secondary Text (Muted):** Medium gray (`text-slate-400`). *Note: do not go below slate-400 due to contrast (Lighthouse).*

Bad:
```tsx
<p className="text-slate-600">Muted text</p>
```

Good:
```tsx
<p className="text-slate-400">Muted text</p>
```

## 2. Typography

- **Main Font:** Inter (or system sans-serif).
- **Headings:** Bold (`font-bold`, `font-semibold`), often with a gradient effect (`bg-clip-text text-transparent bg-gradient-to-r ...`).
- **Line Height:** Loose for readability (`leading-relaxed` for paragraphs).

## 3. Glassmorphism and Depth

The project uses a "frosted glass" effect (Glassmorphism) for floating elements (e.g., navigation, cards).

- **Tailwind Classes for Glassmorphism:** `bg-slate-900/80 backdrop-blur-md border border-slate-800`.
- **Shadows:** Subtle shadows for depth (`shadow-lg`, `shadow-cyan-500/10`).

## 4. Animations (Framer Motion)

Animations should be smooth, subtle, and not interfere with reading.

- **Appearances (Fade In / Slide Up):** Elements should gently slide up from the bottom and smoothly appear while scrolling.
- **Staggering:** Lists of elements (e.g., skills, projects) should appear in a cascade (one after another), not all at once.
- **Hover Effects:** Buttons and cards should gently lift (`hover:-translate-y-1`) and change brightness/border on hover.
- **Performance:** Animate ONLY `opacity` and `transform` (e.g., `y`, `x`, `scale`).

Bad:
```tsx
<motion.div animate={{ marginTop: 20 }} />
```

Good:
```tsx
<motion.div animate={{ y: 20 }} />
```

## 5. Responsiveness (Mobile-First)

- Always start styling from the mobile view (without prefixes, e.g., `flex-col`, `p-4`).
- Add styles for larger screens using `md:` (tablet) and `lg:` (desktop) prefixes.
- Ensure that on mobile devices, paddings are smaller and texts are appropriately scaled.
- Mobile navigation should hide in a "Hamburger" menu.

## 6. Print Version (Print CSS)

The portfolio also serves as a CV.
- Use `print:hidden` classes for elements that should not be printed (e.g., navigation, action buttons, video backgrounds).
- Use `print:text-black` and `print:bg-white` to ensure readability on paper.
- Ensure proper page breaks (`break-inside-avoid` for experience cards).
