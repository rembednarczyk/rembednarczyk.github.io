/**
 * Judging a focus indicator from what it paints.
 *
 * The browser half lives in runFocusIndicator.ts; this half is the part
 * worth testing without one.
 */

export interface Stop {
  /** What the control is called, for the report. */
  name: string;
  /**
   * Pixels that change inside the control's box, plus a small margin, when
   * it takes focus. A control with no indicator changes nothing.
   */
  painted: number;
  /**
   * How many of those are this page's cyan.
   *
   * "Something painted" is not enough on its own, and finding that out cost
   * a round: with `focus-ring` stripped from every project link, all
   * twenty-eight stops still painted, because Chrome draws its own ring
   * when the page draws none. The gate written to catch that defect did not
   * catch it. The colour is what separates the page's indicator from the
   * browser's.
   */
  inPageColour: number;
  /** True when nothing could be measured: the box was empty or off-screen. */
  unmeasured?: boolean;
}

/**
 * A ring two pixels wide around even a small control covers hundreds of
 * pixels. The smallest measured on this page was 287, on a 24px icon link;
 * the largest with no indicator at all was 0. The gap is wide enough that
 * the threshold is not a judgement call.
 */
export const PAINTS_SOMETHING = 100;

/**
 * Of those pixels, how many must be the page's own colour. Chrome's default
 * ring contributed none on the controls that had no style of their own; the
 * cyan outline contributes most of what it paints.
 */
export const ENOUGH_IN_PAGE_COLOUR = 40;

/**
 * The one control whose indicator is deliberately not cyan: the skip link
 * turns cyan when focused, and a cyan ring on a cyan button shows nothing.
 * It is white, and it is named here so the exception is a decision rather
 * than a hole.
 */
export const PAINTS_ITS_OWN_COLOUR = ["Skip to main content"];

export interface Verdict {
  name: string;
  painted: number;
  ok: boolean;
  problem: string;
}

export function judgeFocus(stops: Stop[]): Verdict[] {
  return stops.map((stop) => {
    const base = { name: stop.name, painted: stop.painted };

    if (stop.unmeasured) {
      return {
        ...base,
        ok: false,
        problem:
          "nothing could be measured — it has no box on screen, or it sits outside the viewport when focused",
      };
    }

    if (stop.painted < PAINTS_SOMETHING) {
      return {
        ...base,
        ok: false,
        problem: `only ${stop.painted} pixels change when it takes focus, so a visitor tabbing through cannot see where they are`,
      };
    }

    if (PAINTS_ITS_OWN_COLOUR.includes(stop.name)) {
      return { ...base, ok: true, problem: "" };
    }

    return stop.inPageColour >= ENOUGH_IN_PAGE_COLOUR
      ? { ...base, ok: true, problem: "" }
      : {
          ...base,
          ok: false,
          problem: `it paints ${stop.painted} pixels on focus but only ${stop.inPageColour} of them are this page's cyan, which is what the browser's own ring looks like — the control is missing focus-ring`,
        };
  });
}

export function failures(verdicts: Verdict[]): Verdict[] {
  return verdicts.filter((v) => !v.ok);
}

/*
 * `firstRepeat` used to live here: a walk-termination helper with four tests
 * under the heading "walking the tab order", claiming to hold the sweep to
 * element identity.
 *
 * It held nothing. `runFocusIndicator` does its own dedupe inline and never
 * called this, so keying the real walk on a label — the historical defect,
 * which stopped it at 13 of 29 stops — left all four assertions green. It
 * was a control attached to nothing, and enriching it would only have made
 * the false sense of coverage stronger.
 *
 * What guards the walk now is knowing how many stops it should find, in
 * runFocusIndicator.
 *
 * Nothing yet guards against the next one. Both reachability ratchets work
 * at the level of a module, and this module is reached — by the runner and
 * by its own tests — so an export inside it that nobody calls is invisible
 * to them. A check for that is in the backlog; measured, 81 exports here
 * have no production consumer, and most of those are types and constants a
 * test legitimately pins, so it needs real type analysis rather than a
 * regex over imports.
 */

/**
 * A control, and what the consent banner does to it while it is showing.
 *
 * Three separate defects lived here, and only the first is a focus problem:
 *
 *  - two controls were *entirely* behind the banner's card when they took
 *    focus, which is WCAG 2.2 SC 2.4.11 Focus Not Obscured;
 *  - five were unclickable, including two the card did not visually cover at
 *    all — the banner's band runs the full width of the viewport while its
 *    card does not, and the transparent strip either side was swallowing
 *    clicks;
 *  - the scroll-to-top button took a third of the Accept button at 768px,
 *    and a tap on the right of Accept scrolled the page instead.
 */
export interface Overlaid {
  name: string;
  /** Share of the control the banner's visible card covers, 0 to 1. */
  coveredByCard: number;
  /** Whether a click reaches the control at all. */
  clickReaches: boolean;
  /** What the click lands on instead, when it does not. */
  blockedBy: string;
  /**
   * The banner's own buttons are checked differently: they are meant to be
   * in front, so what matters is whether anything is in front of *them*.
   * The centre alone missed it — the scroll-to-top button took the right
   * third of Accept and left its middle clickable, so a tap at 80% across
   * scrolled the page instead of recording a choice.
   */
  partOfTheBanner?: boolean;
  /** Where across the control the click stopped reaching it, 0 to 1. */
  failedAt?: number;
  /**
   * Whether the control, not the banner, is what a click lands on *inside
   * the part they share*. This is what tells "behind it" from "in front of
   * it", and neither geometry nor a hit test at the centre can: the
   * scroll-to-top button is entirely inside the band's box and paints over
   * it, while a control whose centre clears the card can still have its
   * lower half behind it.
   */
  inFrontWhereCovered?: boolean | undefined;
}

/**
 * SC 2.4.11 (AA) is failed by "entirely hidden". SC 2.4.12 (AAA) is failed
 * by any of it hidden, and that is what this page holds itself to, so the
 * threshold below is what counts as "any" rather than what counts as "all".
 *
 * It is not zero. A control resting a fraction of a pixel inside the band
 * is a rounding artefact of two rects, not something a visitor can see; the
 * real failures measured here were 7%, 47% and 100%.
 */
export const ENTIRELY = 0.999;

/** Anything above this counts as part of the control being hidden. */
export const ANY_OF_IT = 0.01;

export function judgeNotObscured(controls: Overlaid[]): Verdict[] {
  return controls.map((control) => {
    const base = { name: control.name, painted: 0 };

    // Overlapping the banner is only a problem when the banner is the one
    // in front. Asked inside the part they share, because that is the only
    // place the question means anything.
    const hidden =
      control.coveredByCard > ANY_OF_IT && control.inFrontWhereCovered === false;

    if (hidden) {
      return {
        ...base,
        ok: false,
        problem:
          control.coveredByCard >= ENTIRELY
            ? "it is entirely behind the consent banner when it takes focus, so a visitor tabbing to it cannot see where they are (WCAG 2.2 SC 2.4.11)"
            : `${Math.round(control.coveredByCard * 100)}% of it is behind the consent banner when it takes focus (WCAG 2.2 SC 2.4.12)`,
      };
    }

    if (!control.clickReaches && control.partOfTheBanner) {
      return {
        ...base,
        ok: false,
        problem: `a click ${Math.round((control.failedAt ?? 0) * 100)}% across it lands on ${control.blockedBy} instead — something is covering the banner's own control`,
      };
    }

    if (!control.clickReaches) {
      return {
        ...base,
        ok: false,
        problem: `a click at its centre lands on ${control.blockedBy} instead — the banner's band is wider than its card, and the transparent part still takes the click`,
      };
    }

    return { ...base, ok: true, problem: "" };
  });
}
