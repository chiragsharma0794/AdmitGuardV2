// lib/intelligence/dataQuality.ts
// Computes a data quality score (0–100) measuring how complete and well-formed the data is.
//
// Starts at 100% and deducts points for missing or weak data.
// This is different from risk: you can have high quality data about a risky applicant.
//
// All deduction amounts come from lib/config/thresholds.ts.

import { THRESHOLDS } from "@/lib/config/thresholds";
import type { SubmissionInput } from "@/lib/schemas/submission";

export interface DataQualityBreakdown {
  score: number;
  deductions: { reason: string; points: number }[];
}

/**
 * Compute data quality score.
 * Starts at 100, deducts for missing or weak data points.
 */
export function computeDataQuality(
  data: SubmissionInput
): DataQualityBreakdown {
  const deductions: { reason: string; points: number }[] = [];

  // ─── Applicant completeness ─────────────────────────────────────────────

  // Phone format check (should be 10 digits starting with 6–9)
  if (!/^[6-9]\d{9}$/.test(data.applicant.phone)) {
    deductions.push({
      reason: "Phone number format incomplete or invalid",
      points: THRESHOLDS.DQ_DEDUCTION_MISSING_PHONE,
    });
  }

  // ─── Education completeness ─────────────────────────────────────────────

  for (const rec of data.education) {
    // Stream missing for levels that typically have one
    if (!rec.stream && ["12th", "UG", "PG", "PhD"].includes(rec.level)) {
      deductions.push({
        reason: `Missing stream/specialization for ${rec.level}`,
        points: THRESHOLDS.DQ_DEDUCTION_MISSING_STREAM,
      });
    }

    // Board/university name too short (likely abbreviated or placeholder)
    if (rec.boardUniversity.trim().length < 3) {
      deductions.push({
        reason: `Board/university name very short for ${rec.level}: "${rec.boardUniversity}"`,
        points: THRESHOLDS.DQ_DEDUCTION_BOARD_TOO_SHORT,
      });
    }
  }

  // ─── Work completeness ──────────────────────────────────────────────────

  for (const entry of data.work) {
    // Key skills missing (helps with relevance analysis)
    if (!entry.keySkills || entry.keySkills.length === 0) {
      deductions.push({
        reason: `Missing key skills for position at "${entry.companyName}"`,
        points: THRESHOLDS.DQ_DEDUCTION_MISSING_SKILLS,
      });
    }
  }

  // ─── Total ──────────────────────────────────────────────────────────────

  const totalDeduction = deductions.reduce((sum, d) => sum + d.points, 0);
  const score = Math.max(0, 100 - totalDeduction);

  return { score, deductions };
}
