// lib/validation/helpers.ts
// Shared utility functions used by Tier 1 and Tier 2 validators.
// These are pure functions — no side effects, no state. Easy to test.

import { THRESHOLDS } from "@/lib/config/thresholds";
import type { ScoreScale } from "@/lib/types/education";

/**
 * Normalize any score to a 0–100 percentage scale.
 *
 * WHY: Different boards use different scales (percentage, CGPA/10, CGPA/4, grade).
 * To compare scores fairly and compute risk, we need a single scale.
 *
 * Conversion rules:
 * - percentage → as-is (clamp 0–100)
 * - cgpa_10   → (score / 10) * 100
 * - cgpa_4    → (score / 4) * 100
 * - grade     → mapped via lookup table
 */
export function normalizeScore(value: number, scale: ScoreScale): number {
  switch (scale) {
    case "percentage":
      return clamp(value, 0, 100);
    case "cgpa_10":
      return clamp((value / THRESHOLDS.CGPA_10_MAX) * 100, 0, 100);
    case "cgpa_4":
      return clamp((value / THRESHOLDS.CGPA_4_MAX) * 100, 0, 100);
    case "grade":
      return gradeToPercentage(value);
    default:
      return 0;
  }
}

/**
 * Grade scale: we treat the numeric value as a grade point where
 * higher is better. This is a simple linear mapping.
 * In practice, you might use a lookup table for letter grades.
 */
function gradeToPercentage(gradeValue: number): number {
  // Assume grade is on a 1-10 scale where 10 is best
  return clamp((gradeValue / 10) * 100, 0, 100);
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Check if a score is within the valid range for its scale.
 * Used by Tier 1 to reject impossible scores.
 */
export function isScoreInRange(value: number, scale: ScoreScale): boolean {
  switch (scale) {
    case "percentage":
      return value >= 0 && value <= THRESHOLDS.PERCENTAGE_MAX;
    case "cgpa_10":
      return value >= 0 && value <= THRESHOLDS.CGPA_10_MAX;
    case "cgpa_4":
      return value >= 0 && value <= THRESHOLDS.CGPA_4_MAX;
    case "grade":
      return value >= 0 && value <= 10;
    default:
      return false;
  }
}

/**
 * Calculate age in years from a date of birth string.
 * Returns the age as of today.
 */
export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculate tenure in months between two dates.
 * If endDate is null, uses today.
 */
export function tenureInMonths(startDate: string, endDate: string | null): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}

/**
 * Check if two date ranges overlap.
 * Used to detect overlapping work experience entries.
 */
export function datesOverlap(
  start1: string,
  end1: string | null,
  start2: string,
  end2: string | null
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = end1 ? new Date(end1).getTime() : Date.now();
  const s2 = new Date(start2).getTime();
  const e2 = end2 ? new Date(end2).getTime() : Date.now();
  return s1 < e2 && s2 < e1;
}
