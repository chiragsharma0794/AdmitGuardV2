// lib/validation/tier2.ts
// Tier 2: Soft Flag Validation
//
// These rules do NOT prevent saving. They flag the application for human review.
// The application will be saved with status "FLAGGED" and the flags listed.
//
// Returns an array of human-readable flag strings.
// An empty array means no flags were raised.

import type { SubmissionInput } from "@/lib/schemas/submission";
import { THRESHOLDS } from "@/lib/config/thresholds";
import { normalizeScore, tenureInMonths } from "./helpers";

/**
 * Run all Tier 2 soft-flag checks.
 * Called ONLY after Tier 1 has passed (no hard errors).
 *
 * @param data - the parsed submission
 * @returns array of human-readable flag descriptions
 */
export function runTier2(data: SubmissionInput): string[] {
  const flags: string[] = [];

  // ─── Education flags ────────────────────────────────────────────────────────
  checkEducationFlags(data, flags);

  // ─── Work flags ─────────────────────────────────────────────────────────────
  checkWorkFlags(data, flags);

  // ─── Profile staleness ──────────────────────────────────────────────────────
  checkStaleness(data, flags);

  return flags;
}

// ─── Education Flags ───────────────────────────────────────────────────────────

function checkEducationFlags(data: SubmissionInput, flags: string[]) {
  const { education } = data;

  // Total education gap
  const totalGapMonths = education.reduce(
    (sum, rec) => sum + (rec.gapAfterLevelMonths || 0),
    0
  );
  if (totalGapMonths > THRESHOLDS.EDUCATION_GAP_SOFT_FLAG_MONTHS) {
    flags.push(
      `Education gap exceeds ${THRESHOLDS.EDUCATION_GAP_SOFT_FLAG_MONTHS} months (total: ${totalGapMonths} months).`
    );
  }

  // Backlogs
  const totalBacklogs = education.reduce(
    (sum, rec) => sum + (rec.backlogCount || 0),
    0
  );
  if (totalBacklogs > THRESHOLDS.BACKLOG_SOFT_FLAG_COUNT) {
    flags.push(
      `Active backlogs detected (total: ${totalBacklogs}).`
    );
  }

  // Low scores
  for (const rec of education) {
    const normalized = normalizeScore(rec.scoreValue, rec.scoreScale);
    if (normalized < THRESHOLDS.SCORE_SOFT_FLAG_THRESHOLD) {
      flags.push(
        `Low score at ${rec.level} level: ${rec.scoreValue} (${rec.scoreScale}) = ${normalized.toFixed(1)}% normalized.`
      );
    }
  }
}

// ─── Work Flags ────────────────────────────────────────────────────────────────

function checkWorkFlags(data: SubmissionInput, flags: string[]) {
  const { work } = data;

  if (work.length === 0) return;

  // Sort by start date to compute gaps between consecutive jobs
  const sorted = [...work].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Career gaps between consecutive jobs
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = sorted[i - 1].isCurrent
      ? null
      : sorted[i - 1].endDate;
    const currentStart = sorted[i].startDate;

    if (prevEnd) {
      const gapMonths = tenureInMonths(prevEnd, currentStart);
      if (gapMonths > THRESHOLDS.CAREER_GAP_SOFT_FLAG_MONTHS) {
        flags.push(
          `Career gap of ${gapMonths} months between "${sorted[i - 1].companyName}" and "${sorted[i].companyName}".`
        );
      }
    }
  }

  // Domain switches
  const domains = work.map((w) => w.domain.toLowerCase().trim());
  const uniqueDomains = new Set(domains);
  const domainSwitchCount = uniqueDomains.size - 1;
  if (domainSwitchCount > THRESHOLDS.MAX_DOMAIN_SWITCHES) {
    flags.push(
      `More than ${THRESHOLDS.MAX_DOMAIN_SWITCHES} career domain switches (${domainSwitchCount} different domains).`
    );
  }
}

// ─── Profile Staleness ─────────────────────────────────────────────────────────

function checkStaleness(data: SubmissionInput, flags: string[]) {
  const { education, work } = data;

  // If no work experience and a long time since last education
  if (work.length === 0 && education.length > 0) {
    const latestYearOfPassing = Math.max(
      ...education.map((e) => e.yearOfPassing)
    );
    const yearsSince = new Date().getFullYear() - latestYearOfPassing;
    const monthsSince = yearsSince * 12;

    if (monthsSince > THRESHOLDS.STALE_PROFILE_MONTHS) {
      flags.push(
        `Stale profile: no work experience and ${yearsSince} years since last education (${latestYearOfPassing}).`
      );
    }
  }
}
