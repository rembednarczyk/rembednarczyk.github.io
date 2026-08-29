import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The hero used to state "12+" as a literal in two places, which is correct
 * only until it silently is not.
 *
 * Asserting today's number would pass against a hardcoded string just as
 * happily, so it would prove nothing. These tests move the clock instead:
 * a derived value follows it, a literal cannot.
 */

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
});

async function heroAt(now: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(now));
  vi.resetModules();
  return import("./portfolioFacts");
}

describe("years of experience", () => {
  it("counts from the career start rather than a fixed number", async () => {
    const { yearsOfExperience, CAREER_START } = await heroAt(
      "2030-06-01T00:00:00Z",
    );

    expect(CAREER_START.getUTCFullYear()).toBe(2014);
    expect(yearsOfExperience).toBe(16);
  });

  it("reaches both places the hero states it", async () => {
    const { heroData, yearsOfExperience } = await heroAt(
      "2030-06-01T00:00:00Z",
    );

    expect(yearsOfExperience).toBe(16);
    expect(heroData.metrics[0]).toMatchObject({
      value: "16+",
      label: "Years Experience",
    });
    expect(heroData.description).toContain("16+ years of experience");
  });

  it("moves with the clock", async () => {
    const early = await heroAt("2027-03-01T00:00:00Z");
    const earlyValue = early.yearsOfExperience;

    const later = await heroAt("2035-03-01T00:00:00Z");

    expect(later.yearsOfExperience).toBeGreaterThan(earlyValue);
    expect(later.yearsOfExperience - earlyValue).toBe(8);
  });
});
