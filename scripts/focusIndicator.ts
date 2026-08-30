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

/**
 * The tab order is walked by element identity. Keying it on a label stopped
 * the sweep at 13 of 29 stops, because two project links share one; keying
 * it on a markup prefix stopped it at 3, because the nav buttons do.
 */
export function firstRepeat(ids: string[]): number {
  const seen = new Set<string>();
  for (let i = 0; i < ids.length; i += 1) {
    if (seen.has(ids[i])) return i;
    seen.add(ids[i]);
  }
  return -1;
}

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
}

/**
 * SC 2.4.11 is failed by "entirely hidden", not by "partly". A control the
 * banner half covers still shows where the keyboard is; one it covers
 * completely does not.
 */
export const ENTIRELY = 0.999;

export function judgeNotObscured(controls: Overlaid[]): Verdict[] {
  return controls.map((control) => {
    const base = { name: control.name, painted: 0 };

    // Geometry alone is not enough: a control can sit behind the card and
    // still paint over it, which is how the scroll-to-top button did.
    if (control.coveredByCard >= ENTIRELY && !control.clickReaches) {
      return {
        ...base,
        ok: false,
        problem:
          "it is entirely behind the consent banner when it takes focus, so a visitor tabbing to it cannot see where they are (WCAG 2.2 SC 2.4.11)",
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
