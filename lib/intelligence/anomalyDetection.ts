// lib/intelligence/anomalyDetection.ts
// Detects unusual patterns that might indicate data entry errors or fraud.
//
// Unlike Tier 2 soft flags (which are threshold-based), anomalies look at
// relationships between data points that "don't make sense together".
//
// Returns an array of anomaly description strings.

import type { SubmissionInput } from "@/lib/schemas/submission";
import { calculateAge, normalizeScore, tenureInMonths } from "@/lib/validation/helpers";

/**
 * Detect anomalies in the submission data.
 * Called after enrichment. Returns human-readable anomaly descriptions.
 */
export function detectAnomalies(data: SubmissionInput): string[] {
  const anomalies: string[] = [];

  anomalyAgeVsEducation(data, anomalies);
  anomalyScoreSpike(data, anomalies);
  anomalyWorkBeforeEducation(data, anomalies);
  anomalyExcessiveExperience(data, anomalies);
  anomalyDuplicateLevels(data, anomalies);

  return anomalies;
}

/**
 * Age vs education timeline: if someone is 22 but has UG completion in 2015,
 * they would have been ~11 at graduation — suspicious.
 */
function anomalyAgeVsEducation(data: SubmissionInput, anomalies: string[]) {
  const age = calculateAge(data.applicant.dateOfBirth);
  const birthYear = new Date(data.applicant.dateOfBirth).getFullYear();

  for (const rec of data.education) {
    const ageAtCompletion = rec.yearOfPassing - birthYear;

    // Minimum expected age at each level
    const minExpectedAge: Record<string, number> = {
      "10th": 14,
      "12th": 16,
      "Diploma": 16,
      "ITI": 16,
      "UG": 19,
      "PG": 22,
      "PhD": 25,
    };

    const minAge = minExpectedAge[rec.level];
    if (minAge && ageAtCompletion < minAge) {
      anomalies.push(
        `Age anomaly: applicant was ${ageAtCompletion} years old when completing ${rec.level} (expected ≥${minAge}).`
      );
    }
  }
}

/**
 * Score spike: if 10th score is very low but 12th/UG is very high,
 * or vice versa — unusual pattern worth flagging.
 */
function anomalyScoreSpike(data: SubmissionInput, anomalies: string[]) {
  if (data.education.length < 2) return;

  const normalized = data.education.map((rec) => ({
    level: rec.level,
    score: normalizeScore(
      rec.scoreValue,
      rec.scoreScale as "percentage" | "cgpa_10" | "cgpa_4" | "grade"
    ),
  }));

  for (let i = 1; i < normalized.length; i++) {
    const diff = Math.abs(normalized[i].score - normalized[i - 1].score);
    if (diff > 30) {
      anomalies.push(
        `Score spike: ${normalized[i - 1].level} (${normalized[i - 1].score.toFixed(0)}%) → ${normalized[i].level} (${normalized[i].score.toFixed(0)}%) — ${diff.toFixed(0)}% jump.`
      );
    }
  }
}

/**
 * Work starting before education finished: e.g., work start date is before
 * the latest education year of passing.
 */
function anomalyWorkBeforeEducation(data: SubmissionInput, anomalies: string[]) {
  if (data.work.length === 0 || data.education.length === 0) return;

  const latestEduYear = Math.max(...data.education.map((e) => e.yearOfPassing));
  const earliestWorkYear = Math.min(
    ...data.work.map((w) => new Date(w.startDate).getFullYear())
  );

  if (earliestWorkYear < latestEduYear - 1) {
    anomalies.push(
      `Timeline mismatch: earliest work start (${earliestWorkYear}) is before latest education completion (${latestEduYear}).`
    );
  }
}

/**
 * Excessive experience for age: a 22 year old with 10+ years experience
 * is clearly an error.
 */
function anomalyExcessiveExperience(data: SubmissionInput, anomalies: string[]) {
  if (data.work.length === 0) return;

  const age = calculateAge(data.applicant.dateOfBirth);
  const totalMonths = data.work.reduce((sum, w) => {
    return sum + tenureInMonths(w.startDate, w.isCurrent ? null : w.endDate);
  }, 0);

  const maxReasonableMonths = (age - 16) * 12; // Can't work before 16
  if (totalMonths > maxReasonableMonths && maxReasonableMonths > 0) {
    anomalies.push(
      `Experience anomaly: ${Math.round(totalMonths / 12)} years of work for a ${age}-year-old (max reasonable: ${Math.round(maxReasonableMonths / 12)} years).`
    );
  }
}

/**
 * Duplicate education levels: same level appearing twice (e.g., two 10th records).
 */
function anomalyDuplicateLevels(data: SubmissionInput, anomalies: string[]) {
  const seen = new Set<string>();
  for (const rec of data.education) {
    if (seen.has(rec.level)) {
      anomalies.push(
        `Duplicate education level: "${rec.level}" appears more than once.`
      );
    }
    seen.add(rec.level);
  }
}
