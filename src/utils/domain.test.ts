import { describe, it, expect } from "vitest";
import { getYearsOfExperience } from "./domain";

describe("domain logic", () => {
  describe("getYearsOfExperience", () => {
    it("should calculate correct years of experience", () => {
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 5);
      expect(getYearsOfExperience(startDate)).toBe(5);
    });
  });
});
