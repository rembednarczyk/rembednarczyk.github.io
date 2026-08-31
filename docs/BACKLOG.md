# Backlog

Work that is understood but not done, with enough detail that picking it up
costs nothing. An item leaves this file when it is finished or when it is
decided against — not when it is forgotten.

---

## Register the shell-edit hook

`.claude/hooks/no-shell-edits.sh` exists, carries its own test suite and was
mutation-tested. Nothing invokes it. A `PreToolUse` entry edits the agent's
own permission surface, and the permission classifier refuses to write one —
correctly, since that is not a thing an agent should be able to do to itself
unattended.

This paragraph said "tested twenty-one ways" until a later sweep counted
them: 43 today, 28 the day the sentence was written, never 21. The number
was invented and then repeated in three places. It says no number now,
because a count in prose is the thing Part 2 tells you not to write down —
and `npx vitest run tests/shellEditGuard.test.ts` prints the current one.

- [ ] Add to `.claude/settings.json`, beside the existing `SessionStart`
      array, a `PreToolUse` array with one entry: `matcher` `"Bash"`, and one
      hook of type `command` running
      `$CLAUDE_PROJECT_DIR/.claude/hooks/no-shell-edits.sh`.
- [ ] Then remove `no-shell-edits.sh` from `NOT_REGISTERED` in
      `tests/hookRegistration.test.ts`, and take the "not registered" caveat
      out of the README and CLAUDE.md. The test fails until all three agree,
      in both directions.
The holes the first audit found in the hook are closed: a quoted redirect
target, `>|`, a quoted path to `git checkout`, and a path relative to a
subdirectory after a `cd` were all measured passing and are all refused now.
A second sweep found eight more, listed below — the hook is worth
registering before they are all closed, because a guard with holes refuses
more than a guard that never runs, but it is not the finished thing the
first sweep left it looking like.

---

# What the second bughunt found

Four read-only passes over the ten commits that came out of the first one,
run the way *Ways of Working* Part 5 describes. Every line below was
measured, and re-measured by hand before it was written here.

The short version: the audit that fixed defects produced defects of the same
classes, including one regression a visitor can hit and two gates that state
something about themselves which is not true. That is not a reason to stop
auditing. It is the reason the ritual says to audit finished work rather
than trusting it.

## 1. The mobile menu is empty on a short, narrow screen

The fix that stopped the menu covering the consent banner subtracts the
banner's whole height with no floor, so where the banner is most of the
screen the menu gets nothing. First visit, menu open, items fully visible
out of seven:

| viewport | reserved | computed max-height | now | before the fix |
|---|---|---|---|---|
| 320×320 | 236px | `0px` | **0/7** | 4/7 |
| 480×320 | 191px | 33px | **0/7** | 4/7 |
| 568×320 | 191px | 33px | **0/7** | 4/7 |
| 560×360 | 191px | 73px | 1/7 | 5/7 |
| 812×375 | 136px | 143px | 2/7 | 5/7 |

What a visitor sees at 568×320 is an empty rounded box with half a word in
it. The commit's own comment says "the menu already scrolls internally, so
nothing becomes unreachable" — true at the three viewports it measured, all
of them 640px wide or more, and false below that.

The root cause is upstream of the menu: at 568×320 the banner claims 191 of
320 pixels, 60% of the screen, and at 320×320 it claims 74%.

- [ ] Give the menu a floor, and cap what the banner may claim on a short
      viewport so no fixed element takes most of the screen. The banner's
      buttons must stay visible whatever else scrolls.
- [ ] Add narrow **and** short viewports to the sweep in
      `scripts/runFocusIndicator.ts`. Its `SHORT_VIEWPORTS` are all 640px
      wide or wider, which is why this was invisible.
- [ ] The sweep asks only whether the banner's own buttons are covered. It
      needs to ask whether the menu survived being shortened.

## 2. The focus gate does not see the scroll-to-top button

Measured by mutation: strip `focus-ring` from `src/components/ui/ScrollToTop.tsx`
— leaving a control with no focus indicator at all — rebuild, and
`npm run check:focus` prints `28 keyboard stops; 28 show where the keyboard
is` and exits 0. The README says the gate checks every keyboard stop.

The button mounts only after a scroll event and a debounce, and renders
last, so when the walk reaches the end it is either absent or has no probe.
Both give 25 stops, and 3 + 25 = 28 — the recorded number agrees with a walk
that truncates on its last stop. The count cannot tell "finished" from
"stopped at the end", which is blind exactly where it was pointed.

- [ ] Make the sweep reach the button: scroll before stamping probes, or
      stamp again after the page has settled, and assert the walk ended at
      the document rather than at an element it could not identify.

## 3. The shell hook allows everything when `jq` is missing

`set -uo pipefail` has no `-e`, so a failed `jq` leaves the tool name empty
and the next line exits 0. Measured: the same command that is refused with
`jq` on the path is allowed without it.

The doc comment in `tests/shellEditGuard.test.ts` names this exact failure —
"a bad shebang, a missing `jq`, a payload that does not parse" — as the
reason the hook is tested as a process, and then asserts none of the three.

- [ ] Fail closed. A guard that cannot read its input must refuse, not
      allow, and the three cases its own comment names should be tests.

## 4. Eight more ways past the hook

All measured by running it:

| command | today |
|---|---|
| `echo x>src/App.tsx` (no space) | allowed |
| `echo x>>CLAUDE.md` | allowed |
| `sed -e s/a/b/ -i src/App.tsx` | allowed |
| `sed -i s/a/b/ src/*.tsx` (a glob is not an existing file) | allowed |
| `find src -name App.tsx -exec sed -i s/a/b/ {} \;` | allowed |
| `git -C . checkout src/App.tsx` | allowed |
| `git checkout "src/My File.tsx"` (a space defeats token splitting) | allowed |
| a redirect to a quoted path with a space | refusal names a truncated path |

The first is one character from a row in the hook's own test table. The
seventh reopens the quoted-path case the last sweep closed.

- [ ] Close them, and add each as a test. The `>` cases need care: the rule
      that keeps the guard off `->` and `=>` is what lets `x>` through.

## 5. Two text gates read prose as code — one of them added in the same arc

- [ ] `tests/storyCoverage.test.ts` matches `export const` over unstripped
      source, so a story that is commented out satisfies it. It was added in
      the same body of work that extracted `scripts/withoutComments.ts` for
      exactly this class, and is the one consumer that did not get it.
- [ ] `tests/repository-docs.test.ts` strips comments but not strings, so a
      name surviving only in an English sentence inside a test fixture
      counts as the repository having it. Measured: `PreToolUse` is found in
      exactly one place, the explanatory prose in `tests/hookRegistration.test.ts`.
- [ ] `scripts/withoutComments.ts` deletes the tail of any line where a
      doubled slash follows an ordinary character — inside a regex literal (`/x\//`) or a
      string (`"a//b"`). Live on four lines today; nothing is currently lost
      that matters, and the doc comment overclaims that a URL in a string is
      safe. Only `://` is.

## 6. The tree parser has the same defect one level down

`tests/documentedStructure.test.ts` was rewritten to compare paths instead
of bare names. It assigns the parent only at depth 0, so a third level is
recorded under the top-level directory: a tree drawing a layout directory
under `src/components/ui/`, which does not exist, is recorded as
`src/components/layout`, which does. Both directions pass.

- [ ] Track the parent at every depth, and test three levels.

## 7. The print gate measures text and not ink

`whatADialogAddedToThePrint` compares sets of strings per sheet. It has no
emptiness guard on the second document, so a print that came back textless
reports "the same document"; the check `readsAsACv` exists to prevent
exactly that and is applied only to the first. It is also one-sided — text
removed by an open dialog is invisible at equal sheet count — and set-based,
so a repeated string is invisible too.

Worse, the recorded defect had two halves and this measures one. Moving
`print:hidden` from the shell container to the panel leaves the text off
paper and the backdrop on it: 100% of the sheet dark, gate green.

- [ ] Guard the second document the way the first is guarded, and measure
      ink as well as text.

## 8. The claim that the README lists every ratchet is not true

`CLAUDE.md` and `docs/guidelines/AI_INSTRUCTIONS.md` both say the README
lists them all and that the list is current. Seven test files that hold a
shipped artifact against a source of truth appear in none of the three
documents, two of them guarding claims the README itself makes.

`CLAUDE.md` also casts that list as this repository's decisions log, so the
gap is a gap in the memory, not only in a README.

- [ ] List them, or stop claiming the list is complete. Listing them is
      better: an incomplete decisions log is the failure the log exists to
      prevent.

## 9. Numbers in prose that do not re-derive

- [ ] `README.md` says a section moves through "thirty-two" positions
      without reduced motion. Two runs measured 23 to 31; the figure for
      reduced motion, two, is exact and reproducible. The sentence is
      present tense.
- [ ] One README bullet says the compression defect made the page "measure
      86 on mobile emulation where it actually scores 98", then says the
      same page "scores in the low eighties under Lighthouse's mobile
      emulation". The second is the defect the first sentence diagnoses.
- [ ] The item below quotes a bolded count of exports with no method
      recorded, so it cannot be re-derived. Record the method or drop the
      number.

Two commit messages in the arc state test totals that were wrong when
written. Commit bodies cannot be corrected, and both are contradicted by
their own successors, which is how they were caught. Noted, not actionable.

---

## Catch an export nobody calls

A walk-termination helper lived in `scripts/focusIndicator.ts` with four
tests under the heading "walking the tab order", and the sweep that actually
runs never called it. Keying the real walk on a label — the historical
defect — left all four green. It has been deleted, which is why it is not
named here: this file is held to naming only things the code still has.

Both reachability ratchets work at the level of a module, and that module is
reached, by the runner and by its own tests. An export inside a reached
module that nobody calls is invisible to them.

- [ ] A check that an exported symbol has a consumer outside the tests.
      Measured before writing one: a regex over named imports reports **81**
      exports here with no production consumer, and most are legitimate —
      prop types used as annotations rather than imported by name, and
      constants a test pins on purpose (`scrollLockHolders` says so in its
      own doc comment). So it needs the TypeScript compiler's own view of
      references, not a text scan, and an exemption list with reasons.
- [ ] Until then this class is held by reading, which is what Ways of Working
      Part 5 means by being honest where only discipline holds.

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
      menu with a `calc` on `100vh`, minus whatever a fixed bar has reserved.
      On iOS Safari `100vh` is the *large* viewport, measured with the URL bar
      collapsed, so the menu can be taller than what is actually on screen.
      Open it with the URL bar showing and check the last item is reachable.
      If it is not, `100dvh` is the fix. (This item quoted the whole class
      until a sweep noticed the first commit of the audit had changed it and
      left the quote behind. It names the shape now, not the string, because
      no gate can check a Tailwind class against the code.)

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
