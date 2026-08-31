#!/bin/bash
set -uo pipefail

# Shell edits, refused.
#
# CLAUDE.md, under Tools: prefer `Edit` and `Write` over shell redirection for
# file changes, and treat `git checkout <path>` as the destructive command it
# is. Both rules were written down after they had already cost work, and both
# went on being broken afterwards.
#
# The reason is worth recording, because it is not carelessness. The harness
# re-states the opposite preference — "make file changes with sed, heredocs,
# or short scripts, rather than using the dedicated Read, Edit, or Write
# tools" — at the top of every single turn, while CLAUDE.md is read once when
# a session starts. Repetition beats recall, and it will keep beating it.
#
# The deciding is done in Python, and that is a correction rather than a
# preference. Two sweeps found sixteen ways past the bash version between
# them, and most of them were the same mistake: a shell command was being
# taken apart with regular expressions and word splitting. `shlex` splits it
# the way a shell does, so a quoted path with a space in it is one token
# rather than two, which is what let `git checkout "src/My File.tsx"`
# through. Reading the payload with `json` rather than `jq` also removes the
# dependency whose absence used to make this hook allow everything.
#
# It fails closed. A guard that cannot read its input has to refuse: the
# alternative is what this file did until now, which is to allow every shell
# edit on a machine without `jq` and report nothing.

root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

if ! command -v python3 >/dev/null 2>&1; then
  # printf and not `cat`: this is the path taken when the environment is
  # broken, and it reached for an external command to say so. With an empty
  # PATH the message never printed and the hook exited 0 — the failure it
  # was written to report, in the code reporting it.
  printf '%s\n' \
    'Refused by .claude/hooks/no-shell-edits.sh.' \
    '' \
    'python3 is not on PATH, so this hook cannot read what it was asked to' \
    'judge. A guard that cannot see refuses rather than reporting that there' \
    'is nothing to see. Use Edit and Write for file changes, which is what' \
    'the rule asks for anyway.' >&2
  exit 2
fi

# Read with the shell's own redirection rather than `cat`, so that nothing
# outside bash is needed before the check above. A hook whose refusal path
# depends on an external command has the failure it is refusing.
IFS= read -r -d '' payload || true

PAYLOAD="$payload" ROOT="$root" python3 - <<'DECIDE'
import json
import os
import re
import shlex
import sys

ROOT = os.environ["ROOT"].rstrip("/")
REASON_TAIL = """
CLAUDE.md, under Tools: prefer Edit and Write over shell redirection for file
changes. A heredoc that rewrites a file leaves no reviewable diff of intent,
and twice in this repository's history it has clobbered work that Edit would
have refused. `git checkout <path>` discards uncommitted work and does
nothing at all for an untracked file; both have cost real edits here.

Use Read to see the file, then Edit or Write to change it. If the file is
genuinely outside the repository, or is build output, write it under /tmp or
the session scratchpad instead.
"""


def refuse(what: str) -> None:
    sys.stderr.write(
        f"Refused by .claude/hooks/no-shell-edits.sh.\n\n{what}\n{REASON_TAIL}"
    )
    sys.exit(2)


# Build output goes through the shell all the time and none of it is source.
IGNORED = (
    "dist",
    "node_modules",
    "storybook-static",
    "coverage",
    "playwright-report",
    "test-results",
    ".git",
)

GLOB = re.compile(r"[*?\[]")
HAS_EXTENSION = re.compile(r"\.[A-Za-z0-9]+$")


def absolute(path: str) -> str:
    if path.startswith(("/", "~")):
        return path
    return os.path.normpath(os.path.join(ROOT, path))


def protected(path: str) -> bool:
    """Whether this names a file of this repository's own."""
    if not path or path.startswith(("/dev/", "/tmp/", "/proc/", "/sys/", "/var/")):
        return False

    absolute_path = absolute(path)
    if not (absolute_path == ROOT or absolute_path.startswith(ROOT + "/")):
        return False

    relative = absolute_path[len(ROOT) + 1 :]
    return not any(relative == d or relative.startswith(d + "/") for d in IGNORED)


def names_a_file(token: str) -> bool:
    """
    Whether a token names a file rather than doing something else.

    An extension, a glob or a file that exists. Deliberately not "contains a
    slash": a sed script is `s/old/new/`, which has two, and accepting that
    made the refusal name the expression as the file being written — the
    same false precision this branch was fixed for once already. A glob does
    count, because `sed -i s/a/b/ src/*.tsx` is the ordinary way to run one
    substitution across a directory and no single file answers to it.
    """
    return (
        bool(HAS_EXTENSION.search(token))
        or bool(GLOB.search(token))
        or os.path.exists(absolute(token))
    )


def git_runs(text: str) -> list:
    """
    Each `git` invocation's own arguments, and nothing after it.

    This used to be every token following the first `git` anywhere in the
    command — across pipes, `&&` and newlines alike — so any path mentioned
    later in a compound command read as a path handed to `git checkout`.
    Registering the hook found it within seconds of the first run, on the
    command that was registering it: `git checkout -B claude/x origin/main`
    followed on the next line by a `cat` of a settings file was refused as
    discarding that file. The rule was right and its reach was not, which is
    a lesson this repository has now paid for in four separate checks.

    Newlines become separators before splitting, because a shell starts a new
    command at one and `shlex` treats it as plain whitespace. Inside quotes
    it turns into a literal semicolon, which changes a string this never
    reads and separates nothing.
    """
    lexer = shlex.shlex(text.replace("\n", " ; "), posix=True, punctuation_chars=True)
    lexer.whitespace_split = True

    try:
        parts = list(lexer)
    except ValueError:
        # The whole-command split above already refused an unbalanced quote.
        return []

    runs: list = []
    current = None

    for token in parts:
        if token and all(character in ";&|()" for character in token):
            current = None
        elif current is not None:
            current.append(token)
        elif token == "git":
            current = []
            runs.append(current)

    return runs


def looks_like_a_redirect_target(token: str) -> bool:
    """
    The same question for the right of a `>`, where a directory counts too.

    A bare word there is almost always prose rather than a target — the
    `b` in `echo "a > b"` — and requiring one of these is what keeps the
    guard off ordinary shell use.
    """
    return "/" in token or names_a_file(token)


try:
    payload = json.loads(os.environ["PAYLOAD"])
except Exception:
    refuse("The payload could not be read as JSON, so what this would do is unknown.")

if payload.get("tool_name") != "Bash":
    sys.exit(0)

command = (payload.get("tool_input") or {}).get("command") or ""
if not command.strip():
    sys.exit(0)

HEREDOC_BODY = re.compile(
    r"""(<<-?\s*(['"]?)(\w+)\2[^\n]*\n).*?^\s*\3\s*$""",
    re.S | re.M,
)


def without_heredoc_bodies(text: str) -> str:
    """
    The command with what a heredoc feeds it taken out.

    A heredoc's body is data. The shell does not parse it as shell, and
    neither should this — but `shlex` does, and the second thing registering
    this hook found was that it refused every commit message containing an
    apostrophe: one unbalanced quote inside prose, and a guard that fails
    closed refuses. Nearly every commit message in this repository has one.

    Nothing is lost by it. What the rules below look for on a heredoc line —
    the `>` of `cat > file <<EOF` — is on the line, not in the body, and a
    `> file` written inside a body is text that never runs.
    """
    return HEREDOC_BODY.sub(lambda match: match.group(1), text)


command = without_heredoc_bodies(command)

try:
    tokens = shlex.split(command, comments=False, posix=True)
except ValueError:
    refuse(
        "The command could not be split the way a shell would split it — an "
        "unbalanced quote, most likely — so what it would touch is unknown."
    )

# 1. A command that changes directory before writing, where the path cannot
# be resolved at all.
#
# Checked before anything else, because everything below judges a path
# against this repository's root and would name the wrong file. A command
# that cds first means the shell will resolve a relative path against
# somewhere else, and the hook has no way to know where. Refusing is the only
# honest answer, because the alternative is a guard that reports "nothing to
# see" precisely when it cannot see. An absolute path is still resolvable and
# is still judged on its merits above.
WRITES = re.compile(
    r"""(?:^|[^-=&|<>])[0-9]?>>?\|?[ \t]"""
    r"""|(?:^|\s)(sed\s+[^|;]*(-[a-zA-Z]*i|--in-place)"""
    r"""|perl\s+-[a-zA-Z]*i|tee|truncate|git\s+([^|;]*\s)?(checkout|restore))(\s|$)"""
)

if re.search(r"(?:^|[\s;&|(])cd\s", command) and WRITES.search(command):
    after_cd = tokens.index("cd") + 1 if "cd" in tokens else -1
    for index, token in enumerate(tokens):
        # Never the directory the cd was given: `cd src && … > /tmp/out.txt`
        # writes outside the repository and the cd target is not a write.
        if index == after_cd or token.startswith(("-", "/", "~")):
            continue
        if names_a_file(token):
            # Deliberately names no file. Splitting cannot tell App.tsx from
            # s/a/b/, and after a cd it cannot resolve either.
            refuse(
                "This changes directory and then writes to a relative path, "
                "which cannot be resolved from here — so whether it touches a "
                "file of this repository cannot be decided, and a guard that "
                "cannot see refuses rather than reporting nothing to see. An "
                "absolute path is judged on its merits."
            )

# 2. Redirection, which is the form the rule names.
#
# The `>` has to be a redirection rather than an arrow. Requiring a delimiter
# before it was the first answer and it was wrong twice over: it let
# `echo x>src/App.tsx` through, one character from a row in this hook's own
# test table. What actually separates them is the character immediately
# before: `-` and `=` make an arrow, anything else makes a redirection. A
# file descriptor may precede it, `>|` is the same write with the clobber
# override on, and `2>&1` is not a write because `&` cannot follow.
REDIRECT = re.compile(
    r"""(?:^|[^-=&|<>])[0-9]?>>?\|?[ \t]*("[^"]*"|'[^']*'|[^\s&|;<>()]+)"""
)

for match in REDIRECT.finditer(command):
    target = match.group(1).strip("\"'")
    if looks_like_a_redirect_target(target) and protected(target):
        refuse(f"This writes to {target} through the shell.")

# 3. In-place editors, which take the file as an argument instead.
#
# `-i` is looked for anywhere in the flags rather than only first, because
# `sed -e s/a/b/ -i src/App.tsx` rewrites the file just as thoroughly and
# went through untouched.
IN_PLACE_SED = re.compile(r"^(--in-place(=.*)?|-[a-zA-Z]*i[a-zA-Z]*)$")


def file_arguments() -> list:
    """
    The tokens that name files rather than flags or expressions.

    Splitting on spaces cannot tell `src/App.tsx` from `s/a/b/` — both are
    tokens with a slash in them — so a sed script is excluded by shape: it
    has no extension, matches no file, and carries no glob.
    """
    return [
        token
        for token in tokens[1:]
        if not token.startswith("-") and names_a_file(token) and protected(token)
    ]


def uses(program: str, flag: re.Pattern | None = None) -> bool:
    if program not in tokens:
        return False
    if flag is None:
        return True
    after = tokens[tokens.index(program) + 1 :]
    return any(flag.match(token) for token in after)


if uses("sed", IN_PLACE_SED) or uses("perl", re.compile(r"^-[a-zA-Z]*i[a-zA-Z]*$")):
    for path in file_arguments():
        refuse(f"This rewrites {path} in place.")

if uses("tee") or uses("truncate"):
    for path in file_arguments():
        refuse(f"This writes to {path} through the shell.")

# 4. The other command CLAUDE.md names, for the other reason: it destroys
# rather than writes. `git checkout main` and `git checkout -b <branch>` are
# how the work gets done and are left alone; a path argument is the case that
# has cost edits here. The subcommand is looked for anywhere after `git`,
# because `git -C . checkout src/App.tsx` is the same command.
for run in git_runs(command):
    if "checkout" in run or "restore" in run:
        for token in run:
            if token.startswith("-"):
                continue
            # Existence separates a path from a branch name: `claude/foo` and
            # `main` are not files, `src/App.tsx` is.
            if os.path.isfile(absolute(token)) and protected(token):
                refuse(f"This discards uncommitted changes to {token}.")

sys.exit(0)
DECIDE
