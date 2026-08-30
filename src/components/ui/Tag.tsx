import { ReactNode } from "react";

/**
 * The cyan pill the page uses for a technology, a skill or a label.
 *
 * It was written out three times — in the hero, on a project card and on a
 * job entry — in three spellings, and the copies had already stopped
 * agreeing. A long unbroken tag pushed the page sideways on a phone; that
 * was found and fixed on the project card, and the other two kept the
 * defect, because nothing connected them.
 *
 * The size varies by where it sits and always did, so it is a prop rather
 * than a difference smuggled into a class string.
 */

export interface TagProps {
  children: ReactNode;
  /** `sm` in the hero, `xs` in the denser lists. */
  size?: "xs" | "sm";
}

const SIZES = {
  xs: "text-xs",
  sm: "text-sm",
} as const;

/**
 * min-w-0 with overflow-wrap:anywhere, not break-words.
 *
 * These are flex items, and a flex item's minimum width is the widest thing
 * inside it, so a word with nothing to break on refuses to shrink and runs
 * past the edge. `break-words` does not change that minimum; `anywhere`
 * does.
 */
const SHARED =
  "font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20 min-w-0 [overflow-wrap:anywhere]";

export function Tag({ children, size = "xs" }: TagProps) {
  return <span className={`${SIZES[size]} ${SHARED}`}>{children}</span>;
}
