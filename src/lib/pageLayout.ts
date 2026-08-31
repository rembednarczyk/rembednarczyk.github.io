/**
 * One band of the page, as src/content/pageLayout.json declares it.
 *
 * A union rather than two optional keys, so that having a heading and
 * having an anchor cannot come apart: a band is either one of the numbered
 * run, with both, or it is not, with neither. Optional keys would have let
 * a heading arrive without the anchor the navigation scrolls to, which is a
 * link that silently goes nowhere.
 */
export type PageBand =
  /** The hero, the quote band, the contact form: their own element, no heading. */
  | { body: string }
  /** One of the numbered run, wrapped by PageSection. */
  | { body: string; id: string; title: string };

/**
 * The page's bands, each numbered band paired with the number it shows.
 *
 * The number is computed from position and is deliberately not in content.
 * It used to be typed out — `number="01"` through `number="10"`, in ten
 * separate component files — and nothing held the ten to each other:
 * measured, two sections could carry `03` at once, or one could carry `14`
 * out of a run of ten, and tsc passed and all 602 tests passed. Inserting a
 * band meant renumbering by hand every band below it.
 *
 * Guarding that would have been the obvious answer and the weaker one. A
 * number that is read off the position cannot disagree with the position,
 * so the defect stops being caught and starts being unsayable — which is
 * worth more than a check, and is the only reason this function exists
 * rather than a `number` key in the JSON.
 */
export function numbered(
  bands: readonly PageBand[],
): { section: PageBand; number: string }[] {
  let seen = 0;

  return bands.map((section) => {
    if (!("title" in section)) return { section, number: "" };

    seen += 1;
    return { section, number: String(seen).padStart(2, "0") };
  });
}
