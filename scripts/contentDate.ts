import { execFileSync } from "node:child_process";

/**
 * When the content last changed, asked of git rather than the clock.
 *
 * The sitemap's `lastmod` was stamped with the build date, which is right
 * whenever a build follows a content change and wrong for every other build:
 * a code-only deploy re-dated every page as if its words had moved. The
 * closest thing the repository has to "when this content last changed" is
 * the last commit that touched `src/content` — the sixteen files the page is
 * built from and the editor writes to — so that is what is asked for.
 *
 * Two parts, because one of them can be tested and one of them cannot.
 * `resolveContentDate` is the decision: a git date wins, and anything else —
 * no git, a shallow clone whose history does not reach a content commit, a
 * line that is not a date — falls back to the build's own day rather than
 * failing a deploy over a timestamp. `lastContentChange` is the shell call,
 * kept to a single line that can only return a string or null.
 */

const ISO_DAY = /^(\d{4}-\d{2}-\d{2})/;

/** The date to stamp, as a Date at UTC midnight so `toISOString` gives the
 *  same day git named — the committer's own day, not that day shifted into
 *  the build machine's zone. */
export function resolveContentDate(gitDate: string | null | undefined, fallback: Date): Date {
  const day = gitDate?.trim().match(ISO_DAY)?.[1];
  if (day === undefined) return fallback;

  return new Date(`${day}T00:00:00Z`);
}

/** `git log -1 --format=%cI -- src/content`, or null when git cannot say. */
export function lastContentChange(cwd: string): string | null {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", "src/content"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    return out === "" ? null : out;
  } catch {
    return null;
  }
}
