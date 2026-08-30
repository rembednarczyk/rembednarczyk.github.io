import { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

/**
 * Everything the animated components need from motion, in one place.
 *
 * `m` carries no features of its own, so nothing renders without the
 * LazyMotion wrapper. `strict` makes that a loud failure rather than a
 * silent one: a `motion.div` left behind anywhere inside throws instead of
 * quietly pulling the full bundle back in, which is the whole saving.
 *
 * domAnimation rather than domMax: the page uses initial, animate, exit,
 * transition, whileInView and viewport, and no drag, layout or gesture
 * props at all. domMax exists for those.
 *
 * `reducedMotion="user"` switches transform animations off for a visitor
 * who asked their system for reduced motion, and leaves opacity alone —
 * a fade is not what makes motion unbearable. Measured on the built page:
 * a section revealing moved through 32 distinct positions and now moves
 * through two. Twelve animations across nine files had ignored the setting
 * while the particle canvas and the 404 view honoured it, so the page
 * disagreed with itself; this one line reaches all twelve, the modals and
 * the cookie bar included.
 *
 * It is one component rather than a line in App.tsx because the page was
 * not the only place that set motion up. The Storybook preview and the 404
 * tests each wrote out their own LazyMotion, so answering the preference in
 * App alone would have left stories and tests animating differently from
 * the page — which is how the disagreement started.
 */

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
