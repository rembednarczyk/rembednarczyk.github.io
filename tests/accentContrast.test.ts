import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ACCENTS } from "../src/data/icons";
import { TONES } from "../src/components/sections/Recognition/awardTones";

/**
 * Every accent and every award tone, as text on the card it colours, at
 * 4.5:1 or better.
 *
 * The axe run in Storybook measures contrast, but only on what a story
 * draws, and a story draws what content uses. An accent on offer to the
 * editor that no card wears yet is drawn by nothing, so the one check that
 * would refuse it never sees it — and the owner who picks it in the editor
 * is the first to find out. This measures the palette itself: the colour
 * behind each `text-<hue>-<shade>` class, taken from Tailwind's own theme,
 * against the ground the cards sit on — `#0a1128` at 80% over the page's
 * `#020617` — the way WCAG 2 computes it.
 *
 * Measured when it was written: every 400 shade Tailwind ships clears the
 * bar here by a wide margin, the lowest, indigo, at 6.1:1, because the
 * ground is nearly black. The bar is still worth holding: a 500 shade of
 * violet or indigo is under it, and a shade is one keystroke from another.
 */

const theme = readFileSync(resolve(__dirname, "../node_modules/tailwindcss/theme.css"), "utf8");

/** Tailwind's colour for `text-<hue>-<shade>`, as sRGB in 0..1. */
function colorOf(className: string): [number, number, number] {
  const name = className.replace(/^text-/, "");
  const match = theme.match(new RegExp(`--color-${name}: oklch\\(([\\d.]+)% ([\\d.]+) ([\\d.]+)\\)`));
  if (match === null) throw new Error(`${className} is not a colour Tailwind's theme has`);

  const L = Number(match[1]) / 100;
  const C = Number(match[2]);
  const h = (Number(match[3]) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map((channel) => Math.min(1, Math.max(0, channel))) as [number, number, number];
}

/** WCAG relative luminance of a linear-light sRGB colour. */
const luminance = (rgb: readonly number[]): number =>
  0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;

const linear = (channel: number): number =>
  channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const hex = (value: string): number[] =>
  [1, 3, 5].map((at) => linear(parseInt(value.slice(at, at + 2), 16) / 255));

/** The card's ground: `bg-[#0a1128]/80` over the page's `#020617`. */
const page = hex("#020617");
const card = hex("#0a1128");
const ground = luminance(card.map((channel, at) => 0.8 * channel + 0.2 * page[at]!));

const ratio = (text: number): number => (Math.max(text, ground) + 0.05) / (Math.min(text, ground) + 0.05);

describe("every colour a card may be given, as text on the card", () => {
  it.each(Object.entries(ACCENTS))("accent %s reads at 4.5:1 or better", (_name, className) => {
    expect(ratio(luminance(colorOf(className)))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.entries(TONES).map(([name, tone]) => [name, tone.text]))(
    "award tone %s reads at 4.5:1 or better",
    (_name, className) => {
      expect(ratio(luminance(colorOf(className)))).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("measures something that can fail, so the above is not vacuous", () => {
    expect(ratio(luminance(colorOf("text-violet-500")))).toBeLessThan(4.5);
    expect(ratio(luminance(colorOf("text-cyan-400")))).toBeGreaterThan(10);
    expect(() => colorOf("text-chartreuse-400")).toThrow(/not a colour/);
  });
});
