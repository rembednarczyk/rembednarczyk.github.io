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
# This repository already knew that. It is why `session-start.sh` sets the
# commit author instead of asking anyone to remember who it should be. The
# same treatment applies here: the rule is enforced rather than recalled, so
# a blocked call comes back with the reason attached and no one has to hold
# anything in mind.

root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

payload=$(cat)
tool=$(printf '%s' "$payload" | jq -r '.tool_name // ""')
[ "$tool" = "Bash" ] || exit 0

command=$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')
[ -n "$command" ] || exit 0

# Build output goes through the shell all the time and none of it is source.
IGNORED_DIRECTORIES=(
  dist
  node_modules
  storybook-static
  coverage
  playwright-report
  test-results
  .git
)

# A path as written in the command, made absolute without requiring it to
# exist — the point is to judge a write before it happens.
absolute() {
  case "$1" in
    /* | ~*) printf '%s' "$1" ;;
    ./*) printf '%s/%s' "$root" "${1#./}" ;;
    *) printf '%s/%s' "$root" "$1" ;;
  esac
}

# Whether writing to this path is the thing the rule is about: a file of this
# repository's own, rather than a scratch file, a device or a build artefact.
protected() {
  local raw="$1"
  raw="${raw%\"}"; raw="${raw#\"}"
  raw="${raw%\'}"; raw="${raw#\'}"
  [ -n "$raw" ] || return 1

  case "$raw" in
    /dev/* | /tmp/* | /proc/* | /sys/* | /var/*) return 1 ;;
  esac

  # A bare word is almost always prose that happened to sit next to a `>`
  # ("echo a > b"), not a target. Requiring a directory, an extension or an
  # existing file keeps the guard off ordinary greps and echoes.
  case "$raw" in
    */*) ;;
    *.[A-Za-z0-9]*) ;;
    *) [ -e "$raw" ] || return 1 ;;
  esac

  local abs
  abs=$(absolute "$raw")
  case "$abs" in
    "$root"/*) ;;
    *) return 1 ;;
  esac

  local ignored
  for ignored in "${IGNORED_DIRECTORIES[@]}"; do
    case "$abs" in
      "$root/$ignored" | "$root/$ignored"/*) return 1 ;;
    esac
  done

  return 0
}

refuse() {
  cat >&2 <<REASON
Refused by .claude/hooks/no-shell-edits.sh.

$1

CLAUDE.md, under Tools: prefer Edit and Write over shell redirection for file
changes. A heredoc that rewrites a file leaves no reviewable diff of intent,
and twice in this repository's history it has clobbered work that Edit would
have refused. \`git checkout <path>\` discards uncommitted work and does
nothing at all for an untracked file; both have cost real edits here.

Use Read to see the file, then Edit or Write to change it. If the file is
genuinely outside the repository, or is build output, write it under /tmp or
the session scratchpad instead.
REASON
  exit 2
}

# Every token of the command, for the checks that take a file argument rather
# than a redirection.
read -r -a tokens <<<"$(printf '%s' "$command" | tr '\n' ' ')"

# The file argument, which has to be a file that exists. Splitting on spaces
# alone cannot tell `src/App.tsx` from `'s/a/b/'` — both are just tokens with
# a slash in them — and an in-place edit is by definition of something that
# is already there, so existence is what separates the two.
first_protected_token() {
  local token
  for token in "${tokens[@]}"; do
    case "$token" in
      -*) continue ;;
    esac
    token="${token%\"}"; token="${token#\"}"
    token="${token%\'}"; token="${token#\'}"
    if [ -f "$token" ] && protected "$token"; then
      printf '%s' "$token"
      return 0
    fi
  done
  return 1
}

# 1. Redirection, which is the form the rule names.
#
# The `>` has to be a redirection rather than an arrow: `->` and `=>` appear
# in every other grep run against this codebase, so the character before it
# decides. A file descriptor may precede it, and `2>&1` is not a write
# because `&` is excluded from what can follow.
targets=$(
  printf '%s' "$command" |
    grep -oE '(^|[[:space:];&|(])[0-9]?>>?[[:space:]]*[^[:space:]&|;<>()"'\'']+' |
    sed -E 's/^.*>>?[[:space:]]*//' || true
)

while IFS= read -r target; do
  [ -n "$target" ] || continue
  if protected "$target"; then
    refuse "This writes to $target through the shell."
  fi
done <<<"$targets"

# 2. In-place editors, which take the file as an argument instead.
if printf '%s' "$command" | grep -qE '(^|[[:space:]])sed[[:space:]]+(-[a-zA-Z]*i|--in-place)'; then
  if path=$(first_protected_token); then
    refuse "This rewrites $path in place with sed -i."
  fi
fi

if printf '%s' "$command" | grep -qE '(^|[[:space:]])perl[[:space:]]+-[a-zA-Z]*i'; then
  if path=$(first_protected_token); then
    refuse "This rewrites $path in place with perl -i."
  fi
fi

if printf '%s' "$command" | grep -qE '(^|[[:space:]])(tee|truncate)([[:space:]]|$)'; then
  if path=$(first_protected_token); then
    refuse "This writes to $path through the shell."
  fi
fi

# 3. The other command CLAUDE.md names, for the other reason: it destroys
# rather than writes. `git checkout main` and `git checkout -b <branch>` are
# how the work gets done and are left alone; a path argument is the case that
# has cost edits here.
if printf '%s' "$command" | grep -qE '(^|[[:space:]])git[[:space:]]+(checkout|restore)([[:space:]]|$)'; then
  for token in "${tokens[@]}"; do
    case "$token" in
      -*) continue ;;
    esac
    if [ -f "$token" ] && protected "$token"; then
      refuse "This discards uncommitted changes to $token."
    fi
  done
fi

exit 0
