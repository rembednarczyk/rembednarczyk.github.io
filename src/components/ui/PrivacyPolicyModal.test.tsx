import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POLICY_UPDATED, PrivacyPolicyModal } from "./PrivacyPolicyModal";

/**
 * The policy's "Last updated" is a date, not the clock.
 *
 * It read `new Date()` — so it said this month to every visitor in every
 * month, and nothing could tell, because a date that is always today is never
 * wrong on the day you look. Asserted by moving the clock five years and
 * finding the same month, the way the footer's year is proven to move: a
 * literal assertion against today's month would pass against `new Date()`
 * just as happily.
 */

afterEach(() => {
  vi.useRealTimers();
});

describe("the privacy policy's last-updated line", () => {
  it("names the day the policy changed, not the day it is read", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2031-12-31T12:00:00Z"));

    render(<PrivacyPolicyModal isOpen onClose={() => {}} />);

    const line = screen.getByText(/Last updated:/).textContent ?? "";
    expect(line).toContain("August 2026");
    expect(line).not.toContain("2031");
  });

  it("is dated by a real day, kept as one", () => {
    // The constant is what a reader of the policy is told; a placeholder or
    // a typo here would be shown to every visitor as fact.
    expect(POLICY_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(new Date(`${POLICY_UPDATED}T00:00:00Z`).getTime())).toBe(false);
  });
});
