// lib/intelligence/riskScore.ts
// Computes a 0–100 risk score based on weighted penalties.
//
// HOW IT WORKS:
// Start at 0 (no risk). Add penalty points for each risk factor.
// Higher score = higher risk. Capped at 100.
//
// All penalty values come from lib/config/thresholds.ts, so changing
// a single number there updates the scoring globally.

import { THRESHOLDS } from "@/lib/config/thresholds";
import { normalizeScore } from "@/lib/validation/helpers";
import type { SubmissionInput } from "@/lib/schemas/submission";
import type { EnrichedData } from "@/lib/validation/normalization";

export interface RiskBreakdown {
  score: number;
  penalties: { reason: string; points: number }[];
}

/**
 * Compute the risk score from enriched submission data.
 *
 * @param data - raw submission input
 * @param enriched - enrichment output from normalization.ts
 * @returns { score, penalties } — score is 0–100, penalties explain why
 */
export function computeRiskScore(
  data: SubmissionInput,
  enriched: EnrichedData
): RiskBreakdown {
  const penalties: { reason: string; points: number }[] = [];

  // ─── Education gap penalty ──────────────────────────────────────────────
  if (
    enriched.totalEducationGapMonths >
    THRESHOLDS.EDUCATION_GAP_SOFT_FLAG_MONTHS
  ) {
    penalties.push({
      reason: `Education gap: ${enriched.totalEducationGapMonths} months (threshold: ${THRESHOLDS.EDUCATION_GAP_SOFT_FLAG_MONTHS})`,
      points: THRESHOLDS.RISK_PENALTY_LARGE_EDU_GAP,
    });
  }

  // ─── Backlog penalties ──────────────────────────────────────────────────
  const totalBacklogs = data.education.reduce(
    (sum, rec) => sum + (rec.backlogCount || 0),
    0
  );
  if (totalBacklogs > 0) {
    const backlogPenalty =
      totalBacklogs * THRESHOLDS.RISK_PENALTY_PER_ACTIVE_BACKLOG;
    penalties.push({
      reason: `Active backlogs: ${totalBacklogs} × ${THRESHOLDS.RISK_PENALTY_PER_ACTIVE_BACKLOG} points`,
      points: backlogPenalty,
    });
  }

  // ─── Low score penalties ────────────────────────────────────────────────
  for (const rec of data.education) {
    const normalized = normalizeScore(
      rec.scoreValue,
      rec.scoreScale as "percentage" | "cgpa_10" | "cgpa_4" | "grade"
    );
    if (normalized < THRESHOLDS.SCORE_SOFT_FLAG_THRESHOLD) {
      penalties.push({
        reason: `Low score at ${rec.level}: ${normalized.toFixed(1)}% (threshold: ${THRESHOLDS.SCORE_SOFT_FLAG_THRESHOLD}%)`,
        points: THRESHOLDS.RISK_PENALTY_LOW_SCORE,
      });
    }
  }

  // ─── Career gap penalties ───────────────────────────────────────────────
  for (const gap of enriched.careerGapsMonths) {
    if (gap > THRESHOLDS.CAREER_GAP_SOFT_FLAG_MONTHS) {
      penalties.push({
        reason: `Career gap: ${gap} months (threshold: ${THRESHOLDS.CAREER_GAP_SOFT_FLAG_MONTHS})`,
        points: THRESHOLDS.RISK_PENALTY_LARGE_CAREER_GAP,
      });
    }
  }

  // ─── Domain switch penalties ────────────────────────────────────────────
  if (enriched.domainSwitchCount > 1) {
    const switchPenalty =
      (enriched.domainSwitchCount - 1) *
      THRESHOLDS.RISK_PENALTY_PER_DOMAIN_SWITCH;
    penalties.push({
      reason: `Domain switches: ${enriched.domainSwitchCount} (${enriched.domainSwitchCount - 1} × ${THRESHOLDS.RISK_PENALTY_PER_DOMAIN_SWITCH} points)`,
      points: switchPenalty,
    });
  }

  // ─── Stale profile penalty ──────────────────────────────────────────────
  if (
    data.work.length === 0 &&
    data.education.length > 0
  ) {
    const latestYear = Math.max(...data.education.map((e) => e.yearOfPassing));
    const monthsSince = (new Date().getFullYear() - latestYear) * 12;
    if (monthsSince > THRESHOLDS.STALE_PROFILE_MONTHS) {
      penalties.push({
        reason: `Stale profile: ${Math.round(monthsSince / 12)} years since graduation, no work`,
        points: THRESHOLDS.RISK_PENALTY_STALE_PROFILE,
      });
    }
  }

  // ─── Weak work relevance ────────────────────────────────────────────────
  if (
    enriched.totalWorkExperienceMonths > 0 &&
    enriched.relevantExperienceMonths <
      enriched.totalWorkExperienceMonths * 0.2
  ) {
    penalties.push({
      reason: `Weak work relevance: ${enriched.relevantExperienceMonths} of ${enriched.totalWorkExperienceMonths} months relevant (<20%)`,
      points: THRESHOLDS.RISK_PENALTY_WEAK_WORK_RELEVANCE,
    });
  }

  // ─── Total ──────────────────────────────────────────────────────────────
  const rawScore = penalties.reduce((sum, p) => sum + p.points, 0);
  const score = Math.min(100, rawScore);

  return { score, penalties };
}
