import { describe, expect, it } from "vitest";
import { fillPlaceholders } from "./placeholders";

/**
 * The substitution is small, and the reason it is tested here rather than
 * through the page is that the page can only show it working. What matters
 * is what it does when the content is wrong, and content that is wrong
 * never reaches a rendered page in this repository — it reaches an editor
 * outside it, which is the whole point of the split.
 */

const VALUES = { yearsOfExperience: "12" };

describe("filling a placeholder", () => {
  it("replaces the name with the value", () => {
    expect(fillPlaceholders("{{yearsOfExperience}}+ years", VALUES)).toBe("12+ years");
  });

  it("replaces every occurrence, not just the first", () => {
    // The hero says it twice. A non-global regex would have filled the
    // description and left the metric reading "{{yearsOfExperience}}+".
    expect(fillPlaceholders("{{yearsOfExperience}} and {{yearsOfExperience}}", VALUES)).toBe(
      "12 and 12",
    );
  });

  it("tolerates the spacing an editor might type", () => {
    expect(fillPlaceholders("{{ yearsOfExperience }}", VALUES)).toBe("12");
  });

  it("leaves text with no placeholder exactly as it was", () => {
    const kept = "Quality engineering for high-risk systems. {not a placeholder} $notone";

    expect(fillPlaceholders(kept, VALUES)).toBe(kept);
  });
});

describe("where it reaches", () => {
  it("goes into arrays, objects and both at once", () => {
    // The two the hero needs are one level deep and three levels deep, and
    // a substitution that stopped at the top would have filled the
    // description and quietly missed the metric.
    expect(
      fillPlaceholders(
        { metrics: [{ value: "{{yearsOfExperience}}+", label: "Years" }] },
        VALUES,
      ),
    ).toEqual({ metrics: [{ value: "12+", label: "Years" }] });
  });

  it("leaves everything that is not a string alone", () => {
    // about.json carries the portrait's pixel dimensions, and a walk that
    // stringified what it touched would hand the browser "773" where a
    // number is declared.
    const filled = fillPlaceholders(
      { imageWidth: 773, imageHeight: 1200, missing: null, on: true },
      VALUES,
    );

    expect(filled).toEqual({ imageWidth: 773, imageHeight: 1200, missing: null, on: true });
    expect(typeof filled.imageWidth).toBe("number");
  });
});

describe("a name nothing offers", () => {
  it("throws rather than rendering the braces to a visitor", () => {
    // The failure this exists for: a typo in content that no type system
    // sees, shipped to the page and to every crawler, correct-looking in
    // the JSON and wrong on the screen.
    expect(() => fillPlaceholders("{{yearsOfExperiance}}+", VALUES)).toThrow(
      /yearsOfExperiance/,
    );
  });

  it("says what it could have filled in instead", () => {
    expect(() => fillPlaceholders("{{nope}}", VALUES)).toThrow(/yearsOfExperience/);
  });

  it("throws from inside a nested structure too", () => {
    expect(() => fillPlaceholders({ a: [{ b: "{{nope}}" }] }, VALUES)).toThrow(/nope/);
  });
});
