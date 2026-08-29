# Engineering Principles

A project-agnostic distillation of how to keep a codebase correct and cheap to
hand off. It is written to be dropped into any repository; nothing here is tied
to a language, framework, or domain.

The one-line version: **code is only as good as its memory and its red tests.**
One tells the next person WHY a choice is what it is; the other will not let them
undo it by accident.

---

## 1. The repository is the memory

- **A change is not done until the memory is updated.** The commit body carries
  the rationale (what broke, why this fix, what was rejected); an open-work list
  carries what is still pending; a decisions log carries why the non-obvious
  choices are what they are; the owning doc is corrected in the same change. The
  test of it: clearing all working context should cost nothing.
- **Record rejected approaches with their reason.** Otherwise the next person
  relitigates them. A large share of wasted work is "fixing" something that was
  already decided against on purpose.
- **Never trust a version, a count, or a status quoted in prose.** Re-derive it
  from the source of truth. Prose goes stale the moment the code moves.
- **Correcting a doc includes deleting a claim a later change falsified**, not
  only adding the new one. A doc that overclaims is a lie the next reader trusts.

## 2. Tests falsify, they do not confirm

- **A test exists to try to prove the code wrong**, not to turn the build green.
  A green run that was never at risk of being red proves nothing.
- **Build the oracle from the specification, not from the code's own output.**
  Do not freeze whatever the program happened to print. The one exception is a
  characterization test for a verbatim refactor, written before the code moves.
- **Every fixed bug earns a test that fails on the old code.** Prove it by
  reverting the fix and watching the test go red. A guard whose removal turns
  nothing red is unguarded.
- **Pick an instrument that can actually see the defect before writing the
  test.** A wiring bug (a caller forgot an argument, or reads the wrong field) is
  pinned at the caller, not with another test of the already-correct callee. Grep
  the call sites, not the signature.
- **Iterate the set you asked for, not the set that arrived.** A fetched
  collection is allowed to come back short, so a loop over what arrived silently
  covers a subset and reports it as whole. Test with a fixture that has a hole:
  ask for N, deliver N-1, and assert the code names the difference. A fixture
  built from the same list as the assertion can never fail on a missing element.
- **No greenwashing.** Never weaken an assertion, widen a tolerance, skip a case,
  or delete a test to make a red run green. Prefer one test that could refute the
  system to five that re-confirm the happy path.
- **A mock standing where a real dependency should be becomes the thing under
  test.** Verify anything load-bearing against reality, not against a fixture you
  also wrote.
- **A relationship is a first-class assertion.** When an exact value is
  impractical, pin an invariant: conservation, monotonicity, a pure input
  yielding a neutral result, two independent paths agreeing.

## 3. The defect classes to aim at

These are shapes, not specific bugs. They recur in every project, so point your
tests at them by name.

- **What is stored is not what is rendered.** Any search, sort, or comparison
  that reads the raw value while the user reads the formatted cell will disagree
  with them.
- **One field means two things, read by one rule.** Worst when the reader is a
  diagnostic: it then reports a defect that does not exist, convincingly, and
  sends someone looking in the wrong place.
- **A breakdown that does not add up to the number it explains.** The parts and
  the whole came from different sources, so they never had to reconcile, and a
  breakdown printed under a total reads as an explanation of it.
- **A value from a guarded parse (a NaN or a sentinel) flowing on as a number.**
  It passes every type check and most guards, and every comparison against it is
  false, so a filter meant to "keep what is in range" silently keeps nothing.
- **The set that arrived is iterated; the set that was asked for is not**, and
  nobody names the difference.
- **An optional parameter no caller passes.** It compiles everywhere and stays
  silent exactly where it was forgotten.
- **Failure is not emptiness.** A failed fetch reported as "no data" is a
  different statement from "there is no data". Never let an error state silently
  replace a value the system already holds.

## 4. Change and code discipline

- **Match effort to the change.** The full process is the ceiling for a
  substantial feature, not the floor for a one-line edit. Over-ceremony is a real
  and measurable tax.
- **Flag, do not alter.** Surface an honesty metric (how much is missing, how
  stale, how uncertain) rather than silently clamping or discarding the number.
  And the caveat must appear on every surface that shows the figure, not only the
  one you edited.
- **No magic numbers.** Every threshold, rate, or limit lives in configuration,
  named, in one place.
- **Business logic trapped in a render body, an effect, or a god-function moves
  to a tested unit**, verbatim, pinned first. Do this only for logic where a
  wrong value would mislead; extracting a thin facade or trivial formatting is
  churn.
- **A shared primitive before the third hand-rolled copy.** A hand-rolled copy of
  a shared rule is a finding in itself, whether or not it currently agrees; the
  next one to change is the one that diverges.
- **A control attached to nothing is deleted, not wired up.** And a feature has
  exactly one home; placement is information.

## 5. Verification and process

- **Run the whole gate before claiming done**, not a convenient subset. Verify at
  the layer where things actually break, in an environment that can see the break
  (the real browser for layout, a running service for a security gate), not only
  in a unit test on a synthetic substitute.
- **Report the outcome faithfully.** If a check failed, say so with the output.
  If a step was skipped, say that. Claim "done and verified" plainly only when it
  is true.
- **A ratchet beats a checklist.** A checklist does not run; a test that stays red
  on regression does. Convert every rule you can into a ratchet.
- **Sweep every instance, not a sample.** If a shared mechanism is wrong, every
  use of it is wrong, and a sampled check passes on the instances it never
  visited.
- **Batch related work.** A trickle of tiny changes each pays the full cost of
  the pipeline.

## 6. Judgment

- **A reported smell is a hypothesis, not a verdict.** Verify it against the
  source before churning. Of several flagged suspicions, often only one is real.
- **A red test is a hypothesis about a bug** until you disprove it. "Flaky" is a
  verdict you earn with evidence, not a reflex.
- **Prove absence against the source before proposing a feature.** Do not reason
  from a memory of the code; the thing you are about to build may already exist.
- **Write down a conscious trade-off and its reason** instead of leaving it as an
  unexplained gap. An accepted difference that nobody recorded is how cost
  accumulates for years.

---

Reduced to a single sentence: code is only as good as its memory and its red
tests. One tells the next person why a choice is what it is; the other will not
let them undo it by accident.
