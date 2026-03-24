## Non-Negotiable Rules

The following rules MUST be followed in every implementation:

- ALWAYS use semantic HTML tags
- NEVER introduce console.log in production code
- ALWAYS ensure Lighthouse score remains 100/100/100/100
- ALWAYS use `aria-label` for icon-only buttons/links
- NEVER use `loading="lazy"` on above-the-fold images

# Lighthouse 100/100/100/100 Guardrails

This project maintains a perfect score in the Google Lighthouse audit (Performance, Accessibility, Best Practices, SEO). Every new change **must** respect the following rules to avoid lowering this score.

## Decision Rules

When adding a new element:

1. If it's an image above the fold → use `fetchpriority="high"`
2. If it's an image below the fold → use `loading="lazy"`
3. If it's an icon-only button → add `aria-label`
4. If it's an external link → add `target="_blank" rel="noopener noreferrer"`

## 1. Performance (100)

- **Image Optimization:**
  - Always use the `loading="lazy"` attribute for images that are not visible on the first screen (below the fold).
  - Images in the Hero section (above the fold) **cannot** have `loading="lazy"`; use `fetchpriority="high"` for them.
  - Always define `width` and `height` attributes for `<img>` tags to prevent Cumulative Layout Shift (CLS).

Bad:
```html
<img src="hero.jpg" loading="lazy" />
```

Good:
```html
<img src="hero.jpg" fetchpriority="high" width="800" height="600" alt="Hero image" />
```

- **Render-blocking Resources:**
  - Avoid adding heavy, synchronous scripts in `<head>`.
  - Use `preconnect` for external domains (e.g., Google Fonts, Google Tag Manager).
- **Animations:**
  - Only animate `transform` and `opacity` properties. Avoid animating `width`, `height`, `top`, `left`, `margin`, or `padding`, as they cause expensive layout recalculations (Layout Thrashing).

## 2. Accessibility / A11y (100)

- **Aria Labels:**
  - Every button or link that contains only an icon (no text) **must** have an `aria-label` attribute clearly describing its action (e.g., `aria-label="Open navigation menu"`).

Bad:
```tsx
<button><MenuIcon /></button>
```

Good:
```tsx
<button aria-label="Open navigation menu"><MenuIcon /></button>
```

- **Contrast:**
  - Ensure adequate text-to-background contrast (minimum 4.5:1 for normal text). Be careful with gray text on dark backgrounds (use e.g., `text-slate-300` or `text-slate-400`, avoid `text-slate-600` on a `#020617` background).
- **Semantic HTML:**
  - Use appropriate tags: `<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`.
  - Maintain a logical heading hierarchy (`<h1>` -> `<h2>` -> `<h3>`). There can only be one `<h1>` tag on the page.

Bad:
```tsx
<div className="section-title">About</div>
```

Good:
```tsx
<h2>About</h2>
```

- **Keyboard Navigation:**
  - All interactive elements must be reachable using the Tab key.
  - Provide a clear focus state (e.g., using Tailwind classes: `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none`).

## 3. Best Practices (100)

- **Link Security:**
  - Every outbound link (`target="_blank"`) **must** have the `rel="noopener noreferrer"` attribute.
- **Console Cleanliness:**
  - Production code cannot contain `console.log`, `console.warn`, or `console.error` (unless they are intentionally handled errors in an Error Boundary).
- **Browser Errors:**
  - Ensure the application does not throw any errors in the browser console during rendering and interaction.

## 4. SEO (Search Engine Optimization - 100)

- **Meta Tags:**
  - Keep the `<title>` and `<meta name="description">` tags up to date in the `index.html` file.
  - Use Open Graph tags (`og:title`, `og:description`, `og:image`) for proper display on social media.
- **Alt Attributes:**
  - Every `<img>` tag **must** have an `alt` attribute. If the image is purely decorative, use an empty attribute `alt=""`.
- **Canonical URLs:**
  - Ensure the page has a `<link rel="canonical" href="..." />` tag.
- **Robots.txt and Sitemap:**
  - The project should provide `robots.txt` and `sitemap.xml` files in the `public/` directory.
