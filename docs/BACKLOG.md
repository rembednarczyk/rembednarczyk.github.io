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
Two audits found fifteen ways past the hook between them and all are closed;
the deciding moved to Python for it, since nearly every one was a shell
command taken apart with regular expressions and word splitting. Registering
it is the only thing left, and it is the owner's.

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

## 1 and 2. Closed

The mobile menu showed zero of its seven items below 640px wide, where the
reservation added by the first audit ran to the whole height of a banner
that takes most of a short screen. It has a floor now, measured against the
banner's policy link rather than its Accept button — the first attempt used
Accept and the gate refused it — and the sweep runs at 568x320, 480x320 and
320x320, asserting the menu keeps rows as well as asking whether the
banner's buttons are covered.

The focus gate did not measure the scroll-to-top button, which exists only
past 300px of scrolling. An earlier fix for an unstable sweep had reloaded
to a state where it is absent, which steadied the sweep by leaving a control
out of it. It has its own pass now, and the gate refuses if it cannot find
it. 29 stops.

## 3 and 4. Closed

The hook failed open when `jq` was missing, and eight more commands walked
past it. Both are fixed: the deciding is done in Python, which reads the
payload with `json` and splits the command with `shlex`, and every path that
cannot see refuses. The one case that turned out not to be a bypass is
recorded in the tests — `git checkout "src/My File.tsx"` names a path this
repository does not have, and git refuses it on its own; what it really
showed was that splitting on spaces cannot see a quoted path with a space
in it, which is now covered against a file that exists.

Registering the hook is still the owner's, at the top of this file.

## 5 and 6. Partly closed

`scripts/withoutComments.ts` scans rather than substitutes now, so a doubled slash
inside a regex literal or a string no longer deletes the rest of the line.
`tests/storyCoverage.test.ts` uses it, which was the point of extracting it;
it was the one consumer that did not. `tests/documentedStructure.test.ts`
tracks the enclosing path at every depth, so a third level is placed under
what actually encloses it.

One part is left, and it is a judgement rather than a defect:

- [ ] `tests/repository-docs.test.ts` strips comments but not strings, so a
      name surviving only in an English sentence inside a test fixture counts
      as the repository having it — `PreToolUse` is found in exactly one
      place, the explanatory prose in `tests/hookRegistration.test.ts`.
      Stripping strings closes it and costs four false positives, measured:
      `domMax`, `PreToolUse`, `Bash` and one filename word are names the
      documents use legitimately that live only in strings or config. The
      honest fix is to strip strings and carry those four in a named list
      with reasons, the way the other exemption lists here work. Worth doing;
      not worth doing carelessly.

## 7. Closed

The print gate measured text and not ink. It compares both now, per sheet,
in both directions, counted rather than as a set, with the same emptiness
guard on each document. The mutation it was written for — `print:hidden`
moved from the dialog's shell to its panel — takes every word of the dialog
off paper and leaves its backdrop on: measured at 61% of all six sheets,
with not one string changed, which is why nothing saw it before.

The rasteriser reads the number back through `PLAUSIBLE_INK`, because a
comparison between two prints cannot report an instrument that has stopped
reading the page: the same wrong number on both sides is agreement, and the
log prints it as a passing figure.

## 8. Closed

The claim that the README lists every ratchet was made by two documents and
checked by none. Counted by file rather than by subject it was thirteen of
the twenty-eight in `tests/`, not the seven this entry first said — seven was
a count of missing *subjects*, and four of the thirteen were the fast halves
of browser gates whose story was told under the runner's name and whose file
was not.

All thirteen are written down now, and the claim is enforced in both
directions: a check in `tests/` that no document names fails the build, and
so does deleting an entry for one that still runs.

## 9. Closed

Numbers in prose that did not re-derive.

- [x] `README.md` said a section moves through "thirty-two" positions
      without reduced motion, in two places, in the present tense. Four runs
      of one build measured the same section at 24, 26, 23 and 26, and no
      section on any run reached 32. The figure for reduced motion, two,
      held everywhere, because the transform is gone rather than shortened
      — an exact number and a spread, in one sentence, and only one of them
      belonged in prose. Both sentences
      name `SLIDING` and `ARRIVING_AT_ONCE` now — the constants the gate
      actually holds the page to — and say why there is no figure between
      them. Naming a constant instead of quoting a number is only an
      improvement if the name is checked, so the README's symbol gate reads
      capitals as well as camelCase now; it did not, and all three of the
      capitalised names in that file were unverified.
- [x] One README bullet said the compression defect made the page "measure
      86 on mobile emulation where it actually scores 98", then said the
      same page "scores in the low eighties under Lighthouse's mobile
      emulation" — the second being the defect the first sentence diagnoses.
      The trailing sentence is gone; the badges are labelled as the desktop
      preset, which is what `scripts/runLighthouse.ts` measures.
- [x] The item below quoted a bolded count of exports with no method
      recorded. Rebuilding a plausible method landed near the figure and not
      on it, so neither is checkable; the number is gone and the argument it
      was carrying — that a text scan is the wrong instrument here — is
      stated without one.

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
      What is known before writing one: a regex over named imports reports
      most of this repository's exports as unconsumed, and nearly all of
      those are legitimate — prop types used as annotations rather than
      imported by name, component exports the entry point renders rather
      than imports by name, and constants a test pins on purpose
      (`scrollLockHolders` says so in its own doc comment). So it needs the
      TypeScript compiler's own view of references, not a text scan, and an
      exemption list with reasons.
      This bullet used to state that count in bold with no method recorded.
      Rebuilding a plausible one did not reproduce it — near it, not it —
      which is the whole argument for the rule against quoting a count in
      prose, made against this file. The number is gone rather than
      corrected: a second unverifiable figure is not an improvement on the
      first, and the sentence never needed one.
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
- [x] **`backdrop-blur`** — the prefix question is answered from the build
      and needed no device: Tailwind 4 emits `-webkit-backdrop-filter` five
      times alongside `backdrop-filter` five times in the built CSS. What
      remains is only the visual confirmation that the navbar is readable
      rather than transparent over moving particles, which is a matter of
      taste on a real screen rather than a suspected defect.

### Touch, motion and print

- [x] **Target sizes** — closed, and it never needed the handset: a tap area
      is geometry after layout, which Chromium reports as well as Safari
      does. `scripts/runTargetSize.ts` measures all 79 targets against SC
      2.5.5 and `check:targets` runs it in CI. The icon links were indeed
      among the failures, at 28×28 — but so were 50 others, including the
      control that opens the navigation on a phone and both consent
      buttons. All fixed with padding, so nothing on screen changed size.
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
