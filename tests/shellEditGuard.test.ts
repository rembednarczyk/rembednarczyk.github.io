import { spawnSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The guard that keeps file changes on Edit and Write.
 *
 * Tested by running the hook, not by importing a function out of it. What
 * can go wrong here is not the matching — it is the hook never firing at
 * all: a bad shebang, a missing `jq`, a payload shape that does not parse.
 * A unit test of the patterns would pass through every one of those.
 */

const root = resolve(__dirname, "..");
const hook = resolve(root, ".claude/hooks/no-shell-edits.sh");

const BLOCKED = 2;
const ALLOWED = 0;

function run(command: string, toolName = "Bash") {
  const result = spawnSync(hook, {
    input: JSON.stringify({ tool_name: toolName, tool_input: { command } }),
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
  });

  return { status: result.status, reason: result.stderr };
}

describe("the hook itself", () => {
  it("is executable, or it never runs and every case below passes vacuously", () => {
    expect(() => accessSync(hook, constants.X_OK)).not.toThrow();
  });

  it("leaves every other tool alone", () => {
    // It is registered against Bash, but a hook that judged an Edit call by
    // its `command` field would block on a payload that has none.
    expect(run("anything at all", "Edit").status).toBe(ALLOWED);
  });
});

describe("writing to a file of this repository through the shell", () => {
  it.each([
    ["a heredoc rewriting a component", "cat > src/App.tsx <<'EOF'\nx\nEOF"],
    ["a truncating redirect", "echo x > CLAUDE.md"],
    ["an appending redirect", "echo x >> README.md"],
    ["a redirect into a nested path", "npm run build > docs/guidelines/AI_INSTRUCTIONS.md"],
    ["sed in place", "sed -i 's/a/b/' src/App.tsx"],
    ["sed in place, long flag", "sed --in-place 's/a/b/' src/index.css"],
    ["perl in place", "perl -pi -e 's/a/b/' src/App.tsx"],
    ["tee", "echo x | tee src/App.tsx"],
  ])("refuses %s", (_case, command) => {
    expect(run(command).status).toBe(BLOCKED);
  });

  it("says which file and what to do instead", () => {
    const { reason } = run("echo x > src/App.tsx");

    expect(reason).toContain("src/App.tsx");
    expect(reason).toContain("Edit");
  });

  it("names the file being edited rather than the expression doing it", () => {
    // Splitting a command on spaces cannot tell a path from a sed script:
    // both `src/App.tsx` and `'s/a/b/'` are tokens with a slash in them.
    const { reason } = run("sed -i 's/old/new/' src/App.tsx");

    expect(reason).toContain("src/App.tsx");
    expect(reason).not.toContain("s/old/new/");
  });
});

describe("what it has to keep out of the way of", () => {
  it.each([
    ["reading a file", "cat src/App.tsx"],
    ["searching, where -> and => are everywhere", "grep -rn 'a -> b' src/"],
    ["a printed arrow", "echo 'value => result'"],
    ["sed without -i", "sed -n '1,5p' src/App.tsx"],
    ["stderr redirection", "npm run test 2>&1 | tail -5"],
    ["discarding output", "npm run lint > /dev/null"],
    ["writing to the scratchpad", "node scripts/x.ts > /tmp/out.txt"],
    ["writing build output", "npm run build > dist/build.log"],
    ["installing", "npm install"],
    ["switching branch", "git checkout main"],
    ["starting a branch", "git checkout -b claude/something"],
  ])("allows %s", (_case, command) => {
    expect(run(command).status).toBe(ALLOWED);
  });

  it("does not read prose next to a redirect as a filename", () => {
    // `echo "a > b"` extracts `b`, which is a word and not a path. Requiring
    // a directory, an extension or an existing file is what keeps the guard
    // off ordinary shell use.
    expect(run('echo "a > b"').status).toBe(ALLOWED);
  });
});

describe("discarding uncommitted work", () => {
  /**
   * The other command CLAUDE.md names, for the other reason. It cost an edit
   * in this repository during the focus-ring work: `git checkout` on
   * ScrollToTop.tsx reverted it to main's version mid-measurement and took
   * the focus-ring change with it.
   */
  it("refuses a path argument", () => {
    expect(run("git checkout src/components/ui/ScrollToTop.tsx").status).toBe(BLOCKED);
  });

  it("refuses one behind a separator", () => {
    expect(run("git checkout -- src/App.tsx").status).toBe(BLOCKED);
  });

  it("refuses git restore", () => {
    expect(run("git restore src/App.tsx").status).toBe(BLOCKED);
  });

  it("explains what would have been lost", () => {
    expect(run("git checkout -- src/App.tsx").reason).toContain("discards uncommitted");
  });
});
