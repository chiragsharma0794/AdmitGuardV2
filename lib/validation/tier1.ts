// lib/validation/tier1.ts
// Tier 1: Hard Reject Validation
//
// These rules are NON-NEGOTIABLE. If any fail, the application is REJECTED
// and nothing is saved. The user must fix the errors and resubmit.
//
// Returns a map of field paths → error messages (e.g., "applicant.phone" → "Invalid number").
// An empty map means Tier 1 passed.

import type { SubmissionInput } from "@/lib/schemas/submission";
import { THRESHOLDS } from "@/lib/config/thresholds";
import { EDUCATION_PATH_RULES } from "@/lib/config/rules";
import { calculateAge, isScoreInRange, datesOverlap, tenureInMonths } from "./helpers";
import type { EducationLevel, EducationPath } from "@/lib/types/education";

type ErrorMap = Record<string, string>;

/**
 * Run all Tier 1 validations. Returns field-level error map.
 * Empty map = all passed.
 *
 * @param data - the parsed (Zod-validated) submission
 * @param existingEmails - set of emails already in the system (for duplicate check)
 * @param existingPhones - set of phones already in the system (for duplicate check)
 */
export function runTier1(
  data: SubmissionInput,
  existingEmails: Set<string> = new Set(),
  existingPhones: Set<string> = new Set()
): ErrorMap {
  const errors: ErrorMap = {};

  // ─── Applicant-level checks ─────────────────────────────────────────────────
  validateApplicant(data, existingEmails, existingPhones, errors);

  // ─── Education-level checks ─────────────────────────────────────────────────
  validateEducation(data, errors);

  // ─── Work-level checks ──────────────────────────────────────────────────────
  validateWork(data, errors);

  return errors;
}

// ─── Applicant Validators ──────────────────────────────────────────────────────

function validateApplicant(
  data: SubmissionInput,
  existingEmails: Set<string>,
  existingPhones: Set<string>,
  errors: ErrorMap
) {
  const { applicant } = data;

  // Age must be >= 18 at application time
  const age = calculateAge(applicant.dateOfBirth);
  if (age < THRESHOLDS.MIN_AGE_YEARS) {
    errors["applicant.dateOfBirth"] =
      `Applicant must be at least ${THRESHOLDS.MIN_AGE_YEARS} years old. Current age: ${age}.`;
  }

  // Duplicate email
  if (existingEmails.has(applicant.email.toLowerCase())) {
    errors["applicant.email"] = "An application with this email already exists.";
  }

  // Duplicate phone
  if (existingPhones.has(applicant.phone)) {
    errors["applicant.phone"] = "An application with this phone number already exists.";
  }
}

// ─── Education Validators ──────────────────────────────────────────────────────

function validateEducation(data: SubmissionInput, errors: ErrorMap) {
  const { education } = data;

  if (education.length === 0) {
    errors["education"] = "At least one education record (10th) is required.";
    return;
  }

  // Check that 10th exists (mandatory for all paths)
  const has10th = education.some((e) => e.level === "10th");
  if (!has10th) {
    errors["education"] = "10th standard record is mandatory for all education paths.";
  }

  // Determine the path from the first record's pathTag
  const path = education[0].pathTag as EducationPath;
  const pathRules = EDUCATION_PATH_RULES[path];

  // Check mandatory levels for the selected path
  for (const requiredLevel of pathRules.mandatory) {
    const hasLevel = education.some((e) => e.level === requiredLevel);
    if (!hasLevel) {
      errors[`education.path`] =
        `Path ${path} requires ${requiredLevel} records. Missing: ${requiredLevel}.`;
    }
  }

  // Per-record validation
  const levelYears: Partial<Record<EducationLevel, number>> = {};

  for (let i = 0; i < education.length; i++) {
    const rec = education[i];
    const prefix = `education[${i}]`;

    // Score range check
    if (!isScoreInRange(rec.scoreValue, rec.scoreScale)) {
      const maxVal =
        rec.scoreScale === "percentage" ? THRESHOLDS.PERCENTAGE_MAX :
        rec.scoreScale === "cgpa_10" ? THRESHOLDS.CGPA_10_MAX :
        rec.scoreScale === "cgpa_4" ? THRESHOLDS.CGPA_4_MAX : 10;
      errors[`${prefix}.scoreValue`] =
        `Score ${rec.scoreValue} is out of range for ${rec.scoreScale}. Max allowed: ${maxVal}.`;
    }

    // Year of passing: store for chronology check
    levelYears[rec.level as EducationLevel] = rec.yearOfPassing;
  }

  // Chronological order check between levels
  validateChronology(education, levelYears, errors);
}

/**
 * Chronology check: each education level's year must be >= the previous level's year.
 * E.g., 12th year must be >= 10th year, UG year >= 12th year, etc.
 */
function validateChronology(
  education: SubmissionInput["education"],
  levelYears: Partial<Record<EducationLevel, number>>,
  errors: ErrorMap
) {
  // Define expected order based on typical Indian education
  const orderMap: [EducationLevel, EducationLevel][] = [
    ["12th", "10th"],
    ["Diploma", "10th"],
    ["ITI", "10th"],
    ["UG", "12th"],
    ["UG", "Diploma"],
    ["UG", "ITI"],
    ["PG", "UG"],
    ["PhD", "PG"],
  ];

  for (const [later, earlier] of orderMap) {
    const laterYear = levelYears[later];
    const earlierYear = levelYears[earlier];
    if (laterYear !== undefined && earlierYear !== undefined) {
      if (laterYear < earlierYear) {
        // Find the index of the "later" record for proper error path
        const idx = education.findIndex((e) => e.level === later);
        errors[`education[${idx}].yearOfPassing`] =
          `${later} year of passing (${laterYear}) cannot be before ${earlier} year (${earlierYear}).`;
      }
    }
  }
}

// ─── Work Validators ───────────────────────────────────────────────────────────

function validateWork(data: SubmissionInput, errors: ErrorMap) {
  const { work } = data;

  for (let i = 0; i < work.length; i++) {
    const entry = work[i];
    const prefix = `work[${i}]`;

    // End date must be after start date (if not current)
    if (!entry.isCurrent && entry.endDate) {
      const tenure = tenureInMonths(entry.startDate, entry.endDate);
      if (new Date(entry.endDate) < new Date(entry.startDate)) {
        errors[`${prefix}.endDate`] =
          "End date cannot be before start date.";
      }
    }

    // Check for overlapping work entries
    for (let j = i + 1; j < work.length; j++) {
      const other = work[j];
      if (
        datesOverlap(
          entry.startDate,
          entry.isCurrent ? null : entry.endDate,
          other.startDate,
          other.isCurrent ? null : other.endDate
        )
      ) {
        errors[`work[${i}]-work[${j}].overlap`] =
          `Work entries "${entry.companyName}" and "${other.companyName}" have overlapping dates.`;
      }
    }
  }
}
