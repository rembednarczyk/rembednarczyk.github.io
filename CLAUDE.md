# Working agreement

How to work in this repository. Read it before the first change of a session.

## Where the rules already live

This file does not restate them. Two documents govern the work, and a second
copy of a rule is a second thing to go stale:

- [Engineering Principles](docs/guidelines/ENGINEERING_PRINCIPLES.md) — how a
  change is made. Section 1 is the point of this file: *the repository is the
  memory, and clearing all working context should cost nothing.*
- [AI Instructions](docs/guidelines/AI_INSTRUCTIONS.md) — this repository
  specifically: architecture, Lighthouse guardrails, UI conventions, and the
  commit format.

The README lists every ratchet, under *Development Guidelines and Guardrails*.
That list is the current one.

## What is only written here

### Authorship

Commits are authored by the repository's owner:

```
rembednarczyk <remuerte@gmail.com>
```

`.claude/hooks/session-start.sh` sets this on the repository at session start,
because the container's global identity is `Claude <noreply@anthropic.com>`
and a rule that depends on remembering is not a rule. Do not pass
`-c user.name` / `-c user.email` per commit; if the identity is wrong, the
hook is what to fix.

Worth knowing: a squash merge replaces the author with the pull request
author's GitHub identity and the committer with `GitHub`, so what reaches
`main` is decided by GitHub, not by the commit. The setting above governs the
branch, which is where it is visible during review.

### Branch and pull request flow

- Work on a `claude/<short-name>` branch, never directly on `main`.
- Open a pull request. Do not merge it without being asked.
- The pull request body carries the evidence: what was measured, what the
  mutations did, what was proven unchanged.

### Tools

Prefer `Edit` and `Write` over shell redirection for file changes. A heredoc
that rewrites a file leaves no reviewable diff of intent and has twice in this
repository's history clobbered work that `Edit` would have refused.

`git checkout <path>` discards uncommitted work and silently does nothing for
an untracked file. Both have cost real edits here.

Reading is a different question, and this rule does not touch it: `cat`,
`grep`, `sed -n` and `find` are the right tools for finding things and always
were. What is refused is *changing* a file through the shell.

`.claude/hooks/no-shell-edits.sh` enforces both rules, because writing them
down did not. The reason is worth knowing, since it is not carelessness and
it will not go away: the harness re-states the opposite preference — make
file changes with sed, heredocs or short scripts rather than the dedicated
tools — at the top of every turn, while this file is read once when a session
starts. Repetition beats recall. Anything here that depends on someone
remembering it across a hundred turns against a per-turn instruction is not a
rule yet; it is a wish. The hook is the same answer the authorship problem
got, for the same reason. Copy the file aside first.

## The habit that matters more than any of the above

Measure before claiming, and mutate to prove the guard.

Every finding in this repository is a number taken from the built page, the
printed PDF or the bundle — not a reading of the source. Several times a
measurement was wrong in a way that looked like a defect: a tab-order sweep
keyed on labels stopped at 13 of 29 stops; a colour matcher looking for `rgb`
reported every focus ring on the page as absent, because Tailwind 4 emits
`oklch`; a `toContain` assertion passed on a comment while the code it named
had been stripped. Each was caught by disbelieving a convenient result.

A guard whose removal turns nothing red is not a guard. Every ratchet in the
README was mutation-tested, and three of them failed that test on the first
attempt and had to be fixed rather than accepted.
