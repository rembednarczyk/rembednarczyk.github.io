import { ReactNode } from "react";
import { m } from "motion/react";
import type { Transition } from "motion/react";

/**
 * Content that rises into place as it comes into view.
 *
 * Three callers wrote this out, and the part they agreed on was the part
 * that matters: `once: true`, so a section does not replay every time the
 * visitor scrolls back past it, and a `-100px` margin so it starts before
 * the edge rather than at it. Those two are a contract; the distance and
 * the duration are taste, and the pull quote's are deliberately its own.
 *
 * Nothing here mentions reduced motion. `MotionConfig reducedMotion="user"`
 * in App.tsx switches the transform off for the whole tree, which is why
 * this component does not have to remember to.
 */

/** The half the callers must not disagree about. */
const ONCE_AS_IT_ARRIVES = { once: true, margin: "-100px" } as const;

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** How far below its place it starts, in px. */
  distance?: number;
  duration?: number;
  /**
   * Left off, motion picks its own. Spelling it as `ease: undefined` is not
   * the same thing under exactOptionalPropertyTypes, so the transition below
   * is built without the key rather than with an empty one.
   */
  ease?: Transition["ease"];
}

export function Reveal({
  children,
  className,
  distance = 20,
  duration = 0.5,
  ease,
}: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={ONCE_AS_IT_ARRIVES}
      transition={ease === undefined ? { duration } : { duration, ease }}
    >
      {children}
    </m.div>
  );
}
