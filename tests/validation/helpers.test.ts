// tests/validation/helpers.test.ts
// Unit tests for the validation helper functions.

import {
  normalizeScore,
  isScoreInRange,
  calculateAge,
  tenureInMonths,
  datesOverlap,
  clamp,
} from "@/lib/validation/helpers";

describe("normalizeScore", () => {
  test("percentage passes through as-is", () => {
    expect(normalizeScore(85, "percentage")).toBe(85);
  });

  test("percentage clamped to 100", () => {
    expect(normalizeScore(105, "percentage")).toBe(100);
  });

  test("CGPA out of 10 converts correctly", () => {
    expect(normalizeScore(7.5, "cgpa_10")).toBe(75);
  });

  test("CGPA out of 4 converts correctly", () => {
    expect(normalizeScore(3.6, "cgpa_4")).toBe(90);
  });

  test("grade (value/10) converts correctly", () => {
    expect(normalizeScore(8, "grade")).toBe(80);
  });

  test("zero score returns 0", () => {
    expect(normalizeScore(0, "percentage")).toBe(0);
  });
});

describe("isScoreInRange", () => {
  test("percentage 85 is valid", () => {
    expect(isScoreInRange(85, "percentage")).toBe(true);
  });

  test("percentage 105 is invalid", () => {
    expect(isScoreInRange(105, "percentage")).toBe(false);
  });

  test("CGPA 11 out of 10 is invalid", () => {
    expect(isScoreInRange(11, "cgpa_10")).toBe(false);
  });

  test("CGPA 3.5 out of 4 is valid", () => {
    expect(isScoreInRange(3.5, "cgpa_4")).toBe(true);
  });

  test("CGPA 5 out of 4 is invalid", () => {
    expect(isScoreInRange(5, "cgpa_4")).toBe(false);
  });

  test("negative score is invalid", () => {
    expect(isScoreInRange(-1, "percentage")).toBe(false);
  });
});

describe("calculateAge", () => {
  test("age calculates correctly for a past date", () => {
    const now = new Date();
    const year = now.getFullYear() - 25;
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    expect(calculateAge(`${year}-${month}-${day}`)).toBe(25);
  });

  test("underage person detected", () => {
    const now = new Date();
    const year = now.getFullYear() - 16;
    expect(calculateAge(`${year}-01-01`)).toBeLessThan(18);
  });
});

describe("tenureInMonths", () => {
  test("calculates months between two dates", () => {
    expect(tenureInMonths("2020-01-01", "2022-01-01")).toBe(24);
  });

  test("same month returns 0", () => {
    expect(tenureInMonths("2020-06-01", "2020-06-15")).toBe(0);
  });

  test("null endDate uses today (returns positive)", () => {
    expect(tenureInMonths("2020-01-01", null)).toBeGreaterThan(0);
  });
});

describe("datesOverlap", () => {
  test("overlapping ranges detected", () => {
    expect(
      datesOverlap("2020-01-01", "2021-06-01", "2021-01-01", "2022-01-01")
    ).toBe(true);
  });

  test("non-overlapping ranges pass", () => {
    expect(
      datesOverlap("2020-01-01", "2020-12-31", "2021-01-01", "2022-01-01")
    ).toBe(false);
  });

  test("current job (null end) overlaps with future start", () => {
    expect(
      datesOverlap("2020-01-01", null, "2023-01-01", "2024-01-01")
    ).toBe(true);
  });
});

describe("clamp", () => {
  test("value within range unchanged", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  test("value below min clamped", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  test("value above max clamped", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });
});
