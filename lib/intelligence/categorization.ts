// lib/intelligence/categorization.ts
// Categorizes applicants into buckets based on their risk score.
//
// Three categories:
// - "Strong Fit"   → riskScore <= STRONG_FIT_MAX_RISK (30)
// - "Needs Review" → riskScore <= NEEDS_REVIEW_MAX_RISK (65)
// - "Weak Fit"     → riskScore > 65
//
// These thresholds live in lib/config/thresholds.ts.

import { THRESHOLDS } from "@/lib/config/thresholds";
import type { Categorization } from "@/lib/types/assessment";

/**
 * Categorize the applicant based on their computed risk score.
 */
export function categorize(riskScore: number): Categorization {
  if (riskScore <= THRESHOLDS.STRONG_FIT_MAX_RISK) {
    return "Strong Fit";
  }
  if (riskScore <= THRESHOLDS.NEEDS_REVIEW_MAX_RISK) {
    return "Needs Review";
  }
  return "Weak Fit";
}

/**
 * Get the color class for a category (used in the confirmation screen).
 */
export function categoryColor(cat: Categorization): string {
  switch (cat) {
    case "Strong Fit":
      return "text-green-700 bg-green-100 border-green-200";
    case "Needs Review":
      return "text-amber-700 bg-amber-100 border-amber-200";
    case "Weak Fit":
      return "text-red-700 bg-red-100 border-red-200";
  }
}

/**
 * Get a short description of what the category means.
 */
export function categoryDescription(cat: Categorization): string {
  switch (cat) {
    case "Strong Fit":
      return "This applicant meets all criteria with minimal risk factors. Recommended for admission.";
    case "Needs Review":
      return "This applicant has some flagged items that require manual review before a decision.";
    case "Weak Fit":
      return "This applicant has significant risk factors. Admission requires special justification.";
  }
}
