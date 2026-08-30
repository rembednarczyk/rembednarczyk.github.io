# Ways of Working

A portable, project-agnostic account of a way of building software that stays
correct and cheap to hand off. It captures the whole method in one place: the
operating loop of a change, how the project's memory is structured, how work is
tested and verified, the recurring defect shapes, and the posture behind the
decisions. Nothing here is tied to a language, framework, or domain.

Most of the leverage comes from three ideas applied relentlessly, not from a long
list of tricks. If you adopt nothing else, adopt Part 0.

The one-line version: **a codebase is only as good as its memory and its red
tests.** One tells the next person WHY a choice is what it is; the other will not
let them undo it by accident.

---

## Part 0. The three load-bearing ideas

Everything else is a consequence of these.

1. **The repository is the memory.** A change is not finished when the code
   works; it is finished when the reasoning, the open items, and the rejected
   alternatives are written where the next person will find them. The test: any
   contributor (or a fresh session) should be able to resume cold, from the repo
   alone, at no cost.

2. **A rule you cannot enforce automatically is a wish.** Turn every rule you can
   into a ratchet: a check that stays red when the rule is broken. A checklist
   does not run; a ratchet does. Where only discipline can hold a rule, say so
   out loud rather than pretending the rule is safe.

3. **Tests exist to falsify, not to confirm.** A test's job is to try to prove
   the code wrong. A green run that was never at risk of being red proves
   nothing. Prefer one test that could refute the system to five that re-confirm
   the happy path.

---

## Part 1. The operating loop

The cadence of a single change, end to end. Skipping steps is fine when the tier
is small (see proportionality below), but the order does not change.

1. **Orient before touching code.** A fresh start answers five questions from the
   repo, in order, before writing anything:
   - What is open right now, and who can act on it?
   - Why is anything odd the way it is, and what was already tried and rejected?
   - What state is the tree in (branch, recent history, current version, test
     posture)?
   - What are the rules for the area I am about to touch?
   - What has been consciously accepted as-is here, so I do not re-litigate it?
   If any question has no answer in the repo, that gap is the first thing to
   write down.

2. **Verify the problem is real, against the source.** Before fixing a bug,
   reproduce its mechanism in the code. Before proposing a feature, prove its
   absence by reading the specific place it would live. Do not reason from a
   memory of the codebase; the thing you are about to build may already exist,
   and the bug you are about to fix may be a misreading.

3. **Pick the tier (match effort to the change).** A one-line or docs-only edit,
   a normal feature, and a change to critical-path code are three different
   definitions of done. The full ceremony is the ceiling for a substantial or
   high-risk change, not the floor for every edit. Over-process is a real and
   measurable tax; under-process on critical code is how silent errors ship.

   **Two axes decide the tier, not one.** The first is what a silent error would
   cost: money, safety, data integrity, auth. The second is whether the defect
   could be seen at all without a gate. They are independent, and the second is
   the one usually missed. A defect with trivial stakes that nothing on any
   screen would ever reveal earns a ratchet on those grounds alone, because the
   alternative is not a cheaper check — it is no check, forever. A project with
   no critical path in the first sense still has plenty in the second: printed
   output, generated files, build artifacts, anything whose only reader is a
   machine.

4. **Implement so the change stays reviewable.** One concern per change. Move
   logic to where it is testable, verbatim, and leave the call site as thin
   wiring. Resist bundling an opportunistic refactor into a fix.

5. **Pin it red-by-design.** Every fixed bug earns a test that fails on the old
   code and passes on the new. Prove it: revert the fix and watch the test go
   red, then restore it. A guard whose removal turns nothing red is unguarded.

6. **Run the whole gate for the tier.** Not a convenient subset. Verify at the
   layer where things actually break, in an environment that can see the break.

7. **Batch, then ship as a reviewable unit.** A trickle of tiny commits each pays
   the full cost of the pipeline and fragments the record. Group related work,
   finish the memory, then push.

8. **Update the memory in the right places** (Part 2). This is part of the
   change, not a follow-up.

9. **Reset to a clean baseline.** After a change lands, return the working line to
   a known-good state so the next change starts from certainty, not from
   leftovers.

---

## Part 2. The memory architecture

Memory rots when one store becomes a dump for everything. Separate it by the
question each part answers.

- **Four stores, four roles.** Keep distinct homes for: what is still OPEN and who
  can act (a backlog); WHY the non-obvious choices are what they are, and what was
  rejected (a decisions log); what SHIPPED, as a durable record (the version
  control history is this, if commit messages carry real content); and closed,
  multi-step INVESTIGATIONS worth a post-mortem. An item moves between stores as
  its state changes; it never sits in two.

  **A store is a role, not a file.** A document that already answers one of these
  questions completely *is* that store, whatever it happens to be called: a list
  of every guard in the project, each entry saying what broke and why the guard
  exists, is a decisions log indexed by subject instead of by date. Adding a
  second home for a role already filled is not adoption of this section — it is
  the drift Part 6 warns about, and the two copies start disagreeing
  immediately. Count the roles that are answered, not the files that exist.

- **The commit body is the primary record.** It carries what broke, why this fix,
  and what was rejected. Everything else indexes into it. A one-line commit
  message on a non-trivial change throws away the most valuable artifact of the
  work.

- **Record rejected approaches with their reason, and a reopen trigger.** An
  accepted trade-off gets written down as accepted, with the condition that would
  reopen it. A difference nobody recorded is how cost accumulates for years, and
  a rejected idea nobody explained is re-proposed on schedule.

- **Never quote a version, a count, or a status from prose.** Re-derive it from
  the source of truth. Prose goes stale the moment the code moves.

- **Correcting a document includes deleting a claim a later change falsified,**
  not only adding the new one. A doc that overclaims is a lie the next reader
  trusts. An approach that was shipped and then reverted must be described by its
  current state everywhere it appears.

- **A review or audit is a dated snapshot, not a living truth.** When a later
  change overturns its conclusion, mark the row overturned in place; do not leave
  a superseded verdict reading as current.

- **Write the memory so it stays legible.** Direct, concrete, expert prose. No
  marketing language, no filler, no ceremony that adds words without adding
  information. The memory is only worth what the next person can reconstruct from
  it quickly.

---

## Part 3. Testing as falsification

The doctrine that makes the tests worth having.

- **Build the oracle from the specification, not from the code's own output.** Do
  not freeze whatever the program happened to print. The one licensed exception
  is a characterization test for a verbatim refactor, written before the code
  moves, proving byte-identical output.

- **Assert the value at the layer that owns it.** Exact results are pinned against
  the function that computes them; higher layers (UI, integration) check
  structure and "a real value rendered, no garbage leaked", and must not
  re-derive the computation.

- **Pick an instrument that can actually see the defect, before writing the
  test.** Ask what would have to be true for the test to fail, then confirm your
  harness can observe it. A test environment has blind spots: a headless DOM
  cannot measure layout or virtualized content, a simulated tap can hit a target
  too small to touch on a real device, a form control silently ignores a value it
  has no option for. Point the test at a layer that can see the behavior.

- **A mock standing where a real dependency should be becomes the thing under
  test.** A gate can pass its whole life while admitting nobody, because every
  test exercised the mock, not the gate. Verify anything load-bearing against
  reality at least once.

- **Pin a wiring bug at the caller.** When the defect is "a caller forgot an
  argument" or "read the wrong field", the callee is already correct and its
  tests stay green however long the bug lives. Grep the call sites, not the
  signature, and pin one layer up.

- **Iterate the set you asked for, not the set that arrived.** A fetched
  collection is allowed to come back short, so a loop over what arrived silently
  covers a subset and reports it as whole. Test with a fixture that has a HOLE:
  ask for N, deliver N-1, and assert the code names the difference. A fixture
  built from the same list as the assertion can never fail on a missing element.

- **A relationship is a first-class assertion.** When an exact value is
  impractical, pin an invariant: conservation (parts sum to the whole),
  monotonicity, a neutral input yielding a neutral result, two independent paths
  agreeing.

- **No greenwashing.** Never weaken an assertion, widen a tolerance, skip a case,
  or delete a test to make a red run green. A precondition (`is not null`) is not
  the payoff for a value-bearing test; pin the value.

- **Disbelieve a convenient result.** A measurement that hands you a clean sweep,
  or a finding exactly the size you expected, is the one to re-run against a
  second instrument before you report it. A check that finds zero of something
  deserves the same suspicion as one that finds far too many: both are what a
  broken instrument looks like from the inside. Confirm the harness can see a
  known-present case before trusting it on an absent one.

- **Audit the test suite itself with a mutation sweep.** Reading a test tells you
  what it claims to check; the only thing that tells you what it CAN check is
  perturbing the source and watching. Change one token in a guard, run the tests,
  and record what survives. Then classify each survivor: a real gap (the mutation
  changed behavior and nothing caught it) versus an equivalent mutant (the
  mutation changed no observable behavior, for instance a defensive clamp in front
  of a consumer that guards the same boundary). A real gap is a missing test; an
  equivalent mutant is not, and filing it as one is a fabricated finding. Two
  traps: replace every occurrence of the guard, not the first, or a second copy
  hides the mutation; and a mutation that barely moves behavior tells you nothing,
  so make the perturbation sharp.

---

## Part 4. The defect classes to aim at

These are shapes, not specific bugs. They recur in every project, so point tests
at them by name.

### In the data

- **What is stored is not what is rendered.** Any search, sort, or comparison that
  reads the raw value while a person reads the formatted one will disagree with
  them.
- **One field means two things, read by one rule.** Worst when the reader is a
  diagnostic: it reports a defect that does not exist, convincingly, and sends
  someone looking in the wrong place.
- **A breakdown that does not add up to the number it explains.** The parts and
  the whole came from different sources, so they never had to reconcile, and a
  breakdown printed under a total reads as an explanation of it.
- **A value from a guarded parse (a NaN or a sentinel) flowing on as a number.**
  It passes every type check and most guards, and every comparison against it is
  false, so a filter meant to keep what is in range silently keeps nothing. The
  sharpest version is a cursor that advances on a comparison: a bad value in the
  middle stops it dead, and everything after silently reuses the last good value.
- **The set that arrived is iterated; the set that was asked for is not,** and
  nobody names the difference.
- **An optional parameter no caller passes.** It compiles everywhere and stays
  silent exactly where it was forgotten.
- **A substring test where one term contains another.** The longer term is
  unreachable if the shorter is tested first.
- **A "do we have this value" guard that a zero passes.** Coercing an empty or
  null input to a number yields a finite zero, so a guard written as "is this
  finite" only catches the undefined case.
- **A value in a persisted payload the store refuses.** An absent optional field
  written as an explicit empty can be rejected by the storage layer, failing the
  whole record, sometimes synchronously so the failure escapes a catch.
- **Failure is not emptiness.** A failed fetch reported as "no data" is a
  different statement from "there is no data". Never let an error state silently
  replace a value the system already holds, and name the degraded input rather
  than hiding it.
- **A caveat that renders on one surface and not another.** The same number looks
  trustworthy in one place and suspect in another. Grep every consumer of a
  metric, not only the one you edited.
- **Two different states that render the same thing.** "Nothing chosen yet" and
  "this choice has no matches" collapse to one empty result and get reported under
  one misleading message.

### In the checks themselves

A gate is code, and it fails in its own characteristic ways. These are worse than
the shapes above, because each one converts an open problem into a closed one.

- **A gate that passes the very defect it was written for.** It measures a proxy
  for the property instead of the property: "something changed" rather than "the
  right thing changed". Prove every new guard by running it against the unfixed
  code, before the fix lands. A guard first seen green has never been seen work.
- **A walk keyed on something that is not unique.** Any sweep over a collection —
  tab order, routes, rows, files — that identifies items by label, prefix or
  position will stop early or loop the moment two of them collide, and will
  report the truncated pass as a complete one. Key on identity, and assert the
  count you expected.
- **A text assertion that matches the prose about the code rather than the code.**
  A search for a name or a rule finds it in a comment, a doc block, or the note
  recording its removal, and passes. Strip comments before searching, or anchor
  the match to the syntax that carries the meaning rather than to the word.
- **An instrument reading a format the system no longer emits.** A dependency
  upgrade changes a colour to a different notation, a timestamp to a different
  precision, a path to a different separator — and the check looking for the old
  form reports a clean sweep by matching nothing at all.

### In the composition

- **Several identical copies, one of which has quietly diverged.** Duplication is
  a cost; the copy that changed is the defect. Nobody notices, because each copy
  passes its own tests and reads correctly on its own. Assert that the copies are
  the same thing, not that each one works.
- **Two components, each correct alone, competing for one resource.** A screen
  region, a lock, a port, a scroll position. Neither is wrong in isolation and
  neither knows the other exists, so no test of either can find it. The test has
  to be of the composition.

---

## Part 5. Verification and enforcement

How "done" is proven, and how the rules are held without relying on memory.

- **Run the whole gate before claiming done.** Verify at the layer where things
  break, in an environment that can see the break: the real rendering engine for
  layout, a running service for a security or transport gate, not only a unit
  test on a synthetic substitute. A local pass with a dependency stubbed is
  weaker than one where the dependency is real, and the difference is exactly the
  bugs that only appear when it is real.

- **Report the outcome faithfully.** If a check failed, say so with the output. If
  a step was skipped, say that. Claim "done and verified" plainly only when it is
  true. Faithful reporting of a partial result is worth more than a confident
  claim that hides a gap.

- **Automate the ratchet; be honest where only discipline holds.** Every rule that
  can be a red test should be one. Where the enforcement is not automated (a
  reviewer's attention, a convention nobody checks), state that plainly so the
  team knows the rule is only as strong as someone remembering it.

- **Sweep every instance, not a sample.** If a shared mechanism is wrong, every
  use of it is wrong, and a sampled check passes on the instances it never
  visited. A hand-rolled copy of a shared rule is a finding in itself, whether or
  not it currently agrees.

- **Re-verify critical claims independently.** Correctness claims on the parts of
  the system where a mistake is expensive are not self-certified. Have a second
  pass (a different person, a fresh session, an independent reviewer) confirm
  them, against the source.

- **The adversarial bughunt is a repeatable ritual, not an ad-hoc panic.** To
  audit a recent body of work: run several independent read-only passes in
  parallel, each over a slice, each with one job: try to prove the code wrong and
  verify every finding against the source. Require each pass to reject its own
  false positives explicitly (a flagged smell is a hypothesis, not a verdict).
  Collect the findings, rank by severity, fix the real ones red-by-design, and
  record what was checked and found clean so it is not re-hunted. Two clean lanes
  and one real finding is a good, honest outcome, not a failure.

---

## Part 6. Change and code discipline

The craft rules that keep the code itself honest.

- **Flag, do not alter.** When an input is degraded, surface an honesty metric
  (how much is missing, how stale, how uncertain) rather than silently clamping or
  discarding the number. And the caveat must appear on every surface that shows
  the figure, not only the one you edited.

- **No magic numbers.** Every threshold, rate, or limit lives in configuration,
  named, in one place. A number inlined in logic is a rule nobody can find or
  change safely.

- **Trapped logic moves to a tested unit.** Business logic hidden in a render
  body, an effect, or a god-function moves out to where it can be tested, verbatim
  and pinned first. Do this only for logic where a wrong value would mislead;
  extracting a thin facade or trivial formatting is churn dressed as rigor.

- **A shared primitive before the third hand-rolled copy.** The second copy is a
  warning; the third is a mandate to extract. The one that changes next is the one
  that diverges.

- **A control attached to nothing is deleted, not wired up.** A dead switch, an
  unused flag, an option that enforces nothing: remove it. Enriching it gives a
  false sense that something is guarded.

- **One home per feature; placement is information.** A section of the system is a
  promise about what lives there. Keep a feature where its promise fits, and give
  it exactly one home. Cross-links are fine; two homes drift apart.

- **The strictest tier gets the strictest discipline.** Code on the critical path
  (money, safety, data integrity, auth) always carries its tests, is verified
  against a running system, and is re-verified independently. The cost is
  proportionate to what a silent error there would do. So does anything whose
  failure would be invisible: an output nobody looks at, a format only a machine
  reads, a guard never proven to fire. Invisibility is its own critical path, and
  it is the one a project without money or auth still has.

---

## Part 7. Judgment and posture

The attitude that the rules assume.

- **A reported smell is a hypothesis, not a verdict.** Verify it against the
  source before churning. Of several flagged suspicions, often only one is real,
  and churning the others adds fragility for no coverage.

- **A red test is a hypothesis about a bug** until you disprove it. Investigate the
  code first, the test second. "Flaky" is a verdict you earn with evidence, not a
  reflex that silences a real signal.

- **Prove absence before proposing.** Cite what you checked. A proposal that says
  "this does not exist, verified by reading X" is worth more than one reasoned
  from a recollection, and it is how a backlog stays free of duplicates of things
  already built.

- **For a material or irreversible change, argue against it once.** A concrete
  pre-mortem (a specific mechanism by which this decision goes wrong) tests the
  decision's robustness better than any amount of agreement. Address a mechanism,
  not a generality.

- **Admit when new information changes an earlier assessment,** and show exactly
  what changed. The goal is accuracy, not being right the first time. The person
  proposing and the person reviewing are both sometimes wrong; the method is what
  raises the odds, not either party's confidence.

- **Accept a trade-off explicitly, with its reopen trigger.** "We are living with
  this, because X, and it becomes worth fixing when Y" is a finished decision. An
  undocumented gap is an unfinished one that costs later.

---

## Minimum viable adoption

If a team cannot adopt all of this at once, these three give most of the lift, in
order:

1. **Write real commit bodies, and keep a decisions log.** The single highest-
   return change: capture WHY, and what was rejected, where the next person looks.
   Most of the compounding cost of a codebase is rediscovering reasoning that was
   never written down.

2. **Red-by-design for every fix.** Prove each guard by reverting it and watching
   the test fail. This one habit converts "we fixed it" into "it cannot silently
   come back", which is the difference between a suite that decorates and one that
   defends.

3. **Match effort to the change, and run the whole gate for the tier.** Stop
   paying feature-sized process for one-line edits, and stop shipping critical
   changes on a partial check. Proportionality is what makes the rest sustainable
   rather than a tax people quietly skip.

The rest is depth on these three: the memory architecture is depth on (1), the
defect classes and the mutation sweep are depth on (2), and the operating loop
and the bughunt ritual are depth on (3).
