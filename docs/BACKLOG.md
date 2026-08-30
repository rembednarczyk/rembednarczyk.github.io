# Backlog

Work that is understood but not done, with enough detail that picking it up
costs nothing. An item leaves this file when it is finished or when it is
decided against — not when it is forgotten.

---

## Verify the page on a real iPhone and in Safari

**Why this and nothing else.** Five gates run on every push and between them
they cover accessibility, performance, the printed CV, reduced motion and
keyboard focus to AAA. Every one of them measures in Chromium, on a desktop
viewport, over a synthetic network. Safari on a real handset is the only
remaining surface where a visitor can hit something none of them can see, so
it is the last thing standing between this page and "done".

**How to know it is finished.** Every box below is either ticked or has turned
into its own ratchet. Anything found here follows the repository's usual rule:
the fix comes with a gate, so the same defect cannot come back.

### The two things pinned to the bottom of the screen

Nothing in this repository mentions `env(safe-area-inset-bottom)`, and two
controls sit in the region an iPhone reserves for the home indicator.

- [ ] **Consent banner** — `src/components/ui/CookieConsent.tsx` pins the band
      with `fixed bottom-0`. On a handset with a home indicator, does the
      Accept/Decline row sit above the gesture bar, or under it? Tap both at
      their lowest few pixels, not at their centres.
- [ ] **Scroll-to-top button** — `src/components/ui/ScrollToTop.tsx` sits at
      `bottom-4` (16px) below 640px. The home indicator is taller than that.
      Is the button fully tappable?
- [ ] **The space it reserves** — `useSpaceForFixedBar` measures the band and
      spends it as `--fixed-bar-space`. On iOS the visual viewport changes
      height as the URL bar collapses. Scroll to the foot of the page with the
      banner up and confirm the last of the footer is still reachable.

### The viewport unit

- [ ] **Mobile menu height** — `src/components/layout/Navbar.tsx` caps the open
      menu at `max-h-[calc(100vh-6rem)]`. On iOS Safari `100vh` is the *large*
      viewport, measured with the URL bar collapsed, so the menu can be taller
      than what is actually on screen. Open it with the URL bar showing and
      check the last item is reachable. If it is not, `100dvh` is the fix.

### The modals

- [ ] **Background scroll** — `src/hooks/useScrollLock.ts` holds the page still
      with `body { overflow: hidden }`, which iOS Safari has never honoured the
      way other browsers do. Open the contact modal, drag on the backdrop, and
      see whether the page behind it moves. Check the scroll position is where
      it was after closing.
- [ ] **Both of them** — `ContactModal` and `PrivacyPolicyModal` share the same
      shell, so whatever is true of one is true of the other. Confirm rather
      than assume.

### Colour and blur

- [ ] **`oklch`** — Tailwind 4 emits colours in `oklch`, which Safari has
      supported since 15.4. On anything older the palette has no fallback.
      Confirm the page is not monochrome on the oldest iOS worth supporting.
- [ ] **`backdrop-blur`** — used thirteen times, including the navbar over the
      particle canvas and both modal panels. Safari needs
      `-webkit-backdrop-filter`; Tailwind should emit it. Confirm the navbar is
      readable rather than transparent over moving particles.

### Touch, motion and print

- [ ] **Target sizes** — the page holds itself to AAA on focus (SC 2.4.12), so
      the consistent bar for targets is SC 2.5.5 Target Size (Enhanced) at
      44×44 CSS pixels, not the AA minimum of 24×24. Nothing measures this
      today. The icon links on project and certification cards are the likely
      failures.
- [ ] **Reduce Motion** — turn it on in iOS Settings and confirm
      `MotionProvider`'s `reducedMotion="user"` reaches the reveals and the
      particle canvas. `check:motion` proves this in Chromium only.
- [ ] **Particles** — `ParticleBackground` runs an animation loop for the whole
      visit. Watch for heat and for scroll jank on an older handset; there is
      no gate for either and no way to write one that does not need a device.
- [ ] **The CV** — `useAutoPrint` drives the print path. iOS printing goes
      through the share sheet rather than a print dialog. Confirm the six-sheet
      layout `check:print` guards actually survives it.

### If it is all clean

Say so in the README, and the audit is closed: the page is as finished as
measurement can show it to be.
