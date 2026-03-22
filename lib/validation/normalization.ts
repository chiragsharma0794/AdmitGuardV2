// lib/validation/normalization.ts
// Tier 3: Enrichment — compute derived fields before persistence.
// This runs AFTER Tier 1 and Tier 2 and attaches computed metadata to the record.
//
// This file computes:
// - normalizedPercentage for each education record
// - total education gap
// - total/relevant work experience
// - experience bucket
// - application completeness %

import type { SubmissionInput } from "@/lib/schemas/submission";
import type { ExperienceBucket } from "@/lib/types/assessment";
import type { EducationRecord } from "@/lib/types/education";
import { THRESHOLDS } from "@/lib/config/thresholds";
import { normalizeScore, tenureInMonths } from "./helpers";

export interface EnrichedData {
  normalizedEducation: EducationRecord[];
  totalEducationGapMonths: number;
  totalWorkExperienceMonths: number;
  relevantExperienceMonths: number;
  experienceBucket: ExperienceBucket;
  applicationCompletenessPercent: number;
  domainSwitchCount: number;
  careerGapsMonths: number[];
  currentlyEmployed: boolean;
}

/**
 * Enrich the raw submission data with normalized and derived values.
 */
export function enrichSubmission(data: SubmissionInput): EnrichedData {
  // ─── Education normalization ──────────────────────────────────────────────
  const normalizedEducation: EducationRecord[] = data.education.map((rec) => ({
    level: rec.level as EducationRecord["level"],
    boardUniversity: rec.boardUniversity,
    stream: rec.stream || "",
    yearOfPassing: rec.yearOfPassing,
    scoreValue: rec.scoreValue,
    scoreScale: rec.scoreScale as EducationRecord["scoreScale"],
    normalizedPercentage: normalizeScore(rec.scoreValue, rec.scoreScale as EducationRecord["scoreScale"]),
    backlogCount: rec.backlogCount || 0,
    gapAfterLevelMonths: rec.gapAfterLevelMonths || 0,
    pathTag: rec.pathTag as EducationRecord["pathTag"],
  }));

  const totalEducationGapMonths = normalizedEducation.reduce(
    (sum, rec) => sum + rec.gapAfterLevelMonths,
    0
  );

  // ─── Work experience computation ──────────────────────────────────────────
  let totalWorkExperienceMonths = 0;
  const careerGapsMonths: number[] = [];
  let currentlyEmployed = false;

  const workWithTenure = data.work.map((entry) => {
    const tenure = tenureInMonths(entry.startDate, entry.isCurrent ? null : entry.endDate);
    totalWorkExperienceMonths += tenure;
    if (entry.isCurrent) currentlyEmployed = true;
    return { ...entry, tenure };
  });

  // Sort work by start date and compute career gaps
  const sorted = [...workWithTenure].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = sorted[i - 1].isCurrent ? null : sorted[i - 1].endDate;
    if (prevEnd) {
      const gap = tenureInMonths(prevEnd, sorted[i].startDate);
      if (gap > 0) careerGapsMonths.push(gap);
    }
  }

  // Domain switches
  const domains = data.work.map((w) => w.domain.toLowerCase().trim());
  const uniqueDomains = new Set(domains);
  const domainSwitchCount = Math.max(0, uniqueDomains.size - 1);

  // Relevant experience: for a simple prototype, we count the most common domain
  // as "relevant". In production, this would match against the target program.
  let relevantExperienceMonths = 0;
  if (data.work.length > 0) {
    const domainCounts: Record<string, number> = {};
    for (const entry of workWithTenure) {
      const d = entry.domain.toLowerCase().trim();
      domainCounts[d] = (domainCounts[d] || 0) + entry.tenure;
    }
    relevantExperienceMonths = Math.max(...Object.values(domainCounts));
  }

  // ─── Experience bucket ────────────────────────────────────────────────────
  const experienceBucket = computeExperienceBucket(totalWorkExperienceMonths);

  // ─── Application completeness ─────────────────────────────────────────────
  const applicationCompletenessPercent = computeCompleteness(data);

  return {
    normalizedEducation,
    totalEducationGapMonths,
    totalWorkExperienceMonths,
    relevantExperienceMonths,
    experienceBucket,
    applicationCompletenessPercent,
    domainSwitchCount,
    careerGapsMonths,
    currentlyEmployed,
  };
}

function computeExperienceBucket(months: number): ExperienceBucket {
  if (months === 0) return "fresher";
  if (months <= THRESHOLDS.EXPERIENCE_BUCKET_ENTRY_MAX) return "entry";
  if (months <= THRESHOLDS.EXPERIENCE_BUCKET_MID_MAX) return "mid";
  if (months <= THRESHOLDS.EXPERIENCE_BUCKET_SENIOR_MAX) return "senior";
  return "expert";
}

/**
 * Compute how "complete" the application is on a 0–100 scale.
 * Based on how many optional-but-useful fields are filled.
 */
function computeCompleteness(data: SubmissionInput): number {
  let total = 0;
  let filled = 0;

  // Applicant fields (all mandatory, but count them)
  const applicantFields = [
    data.applicant.fullName,
    data.applicant.email,
    data.applicant.phone,
    data.applicant.dateOfBirth,
    data.applicant.aadhaarNumber,
  ];
  total += applicantFields.length;
  filled += applicantFields.filter(Boolean).length;

  // Education completeness
  for (const rec of data.education) {
    total += 4; // board, stream, year, score
    if (rec.boardUniversity) filled++;
    if (rec.stream) filled++;
    if (rec.yearOfPassing) filled++;
    if (rec.scoreValue) filled++;
  }

  // Work completeness
  for (const entry of data.work) {
    total += 5; // company, designation, domain, dates, skills
    if (entry.companyName) filled++;
    if (entry.designation) filled++;
    if (entry.domain) filled++;
    if (entry.startDate) filled++;
    if (entry.keySkills && entry.keySkills.length > 0) filled++;
  }

  // If no work entries, add a small penalty (optional field not filled)
  if (data.work.length === 0) {
    total += 1;
  }

  return total > 0 ? Math.round((filled / total) * 100) : 0;
}
