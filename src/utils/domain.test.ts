import { describe, it, expect } from "vitest";
import { getYearsOfExperience, formatProjectTags } from "./domain";

describe("domain logic", () => {
  describe("getYearsOfExperience", () => {
    it("should calculate correct years of experience", () => {
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 5);
      expect(getYearsOfExperience(startDate)).toBe(5);
    });
  });

  describe("formatProjectTags", () => {
    it("should format tags correctly", () => {
      const tags = ["React", "TypeScript", "Tailwind"];
      expect(formatProjectTags(tags)).toBe("React • TypeScript • Tailwind");
    });

    it("should handle empty array", () => {
      expect(formatProjectTags([])).toBe("");
    });
  });
});
