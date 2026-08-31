/**
 * How big the things you tap are.
 *
 * WCAG 2.2 SC 2.5.5 Target Size (Enhanced) asks for 44 by 44 CSS pixels.
 * That is the AAA level, and the reason it is the bar here rather than the
 * AA minimum of 24 is not ambition: this page already holds itself to AAA
 * on focus, SC 2.4.12, with a browser gate that measures it in pixels. A
 * page that is AAA for the keyboard and AA for the thumb has picked its
 * level twice and by accident.
 *
 * Nothing measured this. Eight icon links on the certification cards were
 * 28x28, the control that opens the whole navigation on a phone was 32x32,
 * and the two buttons a visitor has to hit to answer the consent banner
 * were 32 tall — on the one surface where a miss costs the most, since the
 * banner sits in the corner an iPhone reserves for its home indicator.
 */

/** SC 2.5.5, in CSS pixels. */
export const ENHANCED = 44;

export interface Target {
  /** What a person would call it: the accessible name. */
  label: string;
  /** Which element it is, for the report. */
  tag: string;
  /** Where the file is, so a failure names something to open. */
  where: string;
  width: number;
  height: number;
  /**
   * Whether it sits inside a run of text.
   *
   * SC 2.5.5 exempts a target "in a sentence or block of text", because
   * enlarging a link inside a paragraph would break the paragraph. Derived
   * from the page rather than listed: an inline element whose parent
   * carries substantially more text than it does is in a sentence. A list
   * would have to be maintained, and this cannot fall behind the markup.
   */
  inline: boolean;
}

export interface Verdict {
  label: string;
  where: string;
  width: number;
  height: number;
  ok: boolean;
  /** Empty when ok. */
  problem: string;
}

/**
 * Targets this page keeps below the bar on purpose, with the reason.
 *
 * An unexplained exemption is how a rule stops meaning anything, so the
 * check below fails on an entry that no longer matches anything: a list
 * that can only be added to is a list that grows.
 */
export const DELIBERATELY_SMALL: Record<string, string> = {};

export function judgeTargetSize(
  targets: Target[],
  exempt: Record<string, string> = DELIBERATELY_SMALL,
): Verdict[] {
  return targets.map((target) => {
    const { label, where, width, height } = target;
    const reason = exempt[label];

    if (target.inline) {
      return { label, where, width, height, ok: true, problem: "" };
    }

    if (reason !== undefined) {
      return { label, where, width, height, ok: true, problem: "" };
    }

    // Rounded to a tenth before comparing. A control laid out at 43.98px by
    // a percentage width is not a target-size failure, it is arithmetic,
    // and a gate that reports one would be spent on being argued with.
    const short = Math.round(Math.min(width, height) * 10) / 10;

    if (short >= ENHANCED) {
      return { label, where, width, height, ok: true, problem: "" };
    }

    return {
      label,
      where,
      width,
      height,
      ok: false,
      problem: `${Math.round(width)}x${Math.round(height)}, and ${ENHANCED}x${ENHANCED} is the bar`,
    };
  });
}

export function tooSmall(verdicts: Verdict[]): Verdict[] {
  return verdicts.filter((verdict) => !verdict.ok);
}

/** Entries in the exemption list that no longer match any target. */
export function staleExemptions(
  targets: Target[],
  exempt: Record<string, string> = DELIBERATELY_SMALL,
): string[] {
  const present = new Set(targets.map((target) => target.label));
  return Object.keys(exempt).filter((label) => !present.has(label));
}
