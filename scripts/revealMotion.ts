/**
 * Judging a reveal from the positions it passed through.
 *
 * The browser half lives in runRevealMotion.ts; this half is the part worth
 * testing without one.
 */

export interface Slide {
  /** Which section was watched. */
  section: string;
  /** Every distinct vertical offset it held, in the order it held them. */
  positions: number[];
}

/**
 * A slide is a slide: it starts displaced and passes through the space in
 * between. Fewer than this and it is not animating, it is jumping.
 */
export const SLIDING = 5;

/**
 * With the preference set it may hold its start for a frame before arriving
 * — the initial style is applied before the animation is cancelled — so one
 * intermediate position is the most that counts as "not sliding".
 */
export const ARRIVING_AT_ONCE = 2;

export interface Verdict {
  section: string;
  positions: number;
  ok: boolean;
  /** Empty when ok. */
  problem: string;
}

function landsInPlace(slide: Slide): boolean {
  return slide.positions[slide.positions.length - 1] === 0;
}

/** Without the preference, every section should still slide as designed. */
export function judgeOrdinary(slides: Slide[]): Verdict[] {
  return slides.map((slide) => {
    const positions = slide.positions.length;

    if (!landsInPlace(slide)) {
      return {
        section: slide.section,
        positions,
        ok: false,
        problem: `it settles at y=${slide.positions[slide.positions.length - 1]} rather than in place`,
      };
    }

    return positions >= SLIDING
      ? { section: slide.section, positions, ok: true, problem: "" }
      : {
          section: slide.section,
          positions,
          ok: false,
          problem: `it moved through ${positions} positions, so nothing here is animating and the check below would pass on a page with no reveal at all`,
        };
  });
}

/**
 * With the preference set, it should arrive rather than travel — and still
 * arrive, not stay where it started. The fade is deliberately left alone.
 */
export function judgeReduced(slides: Slide[]): Verdict[] {
  return slides.map((slide) => {
    const positions = slide.positions.length;

    if (!landsInPlace(slide)) {
      return {
        section: slide.section,
        positions,
        ok: false,
        problem: `it settles at y=${slide.positions[slide.positions.length - 1]}, so it never arrives`,
      };
    }

    return positions <= ARRIVING_AT_ONCE
      ? { section: slide.section, positions, ok: true, problem: "" }
      : {
          section: slide.section,
          positions,
          ok: false,
          problem: `it slid through ${positions} positions for a visitor who asked for reduced motion`,
        };
  });
}

export interface Replay {
  section: string;
  /** Every distinct offset it held after being scrolled away from and back. */
  positions: number[];
}

/**
 * `viewport: { once: true }` is the half of the reveal that is not taste. A
 * copy that leaves it out animates identically the first time and replays
 * for the rest of the visit, which is why nothing notices.
 */
export function judgeDoesNotReplay(replays: Replay[]): Verdict[] {
  return replays.map((replay) => {
    const moved = replay.positions.filter((y) => y !== 0);

    return moved.length === 0
      ? { section: replay.section, positions: replay.positions.length, ok: true, problem: "" }
      : {
          section: replay.section,
          positions: replay.positions.length,
          ok: false,
          problem: `it slid again on the way back past it, through ${moved.join(", ")} — the reveal is not set to run once`,
        };
  });
}

export function failures(verdicts: Verdict[]): Verdict[] {
  return verdicts.filter((v) => !v.ok);
}
