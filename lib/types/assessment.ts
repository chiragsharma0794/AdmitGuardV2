// lib/types/assessment.ts
// The DerivedAssessment holds all computed outputs from the Validation Engine
// and Intelligence Layer. This is attached to the application after server-side processing.

export type ValidationStatus = "ACCEPTED" | "FLAGGED" | "REJECTED";

export type Categorization = "Strong Fit" | "Needs Review" | "Weak Fit";

export type ExperienceBucket =
  | "fresher"         // 0 months
  | "entry"           // 1–24 months
  | "mid"             // 25–60 months
  | "senior"          // 61–120 months
  | "expert";         // > 120 months

export interface DerivedAssessment {
  // --- Education metrics ---
  totalEducationGapMonths: number;

  // --- Work metrics ---
  totalWorkExperienceMonths: number;
  relevantExperienceMonths: number;
  experienceBucket: ExperienceBucket;

  // --- Completeness ---
  applicationCompletenessPercent: number; // 0–100: how many optional fields were filled

  // --- Intelligence outputs ---
  riskScore: number;          // 0–100: higher = more risk. Documented formula in docs/architecture.md
  dataQualityScore: number;   // 0–100: higher = better data quality
  categorization: Categorization;

  // --- Flags ---
  anomalyFlags: string[];     // e.g., ["overqualified_for_track", "too_many_short_stints"]
  softFlags: string[];        // e.g., ["Education gap exceeds 24 months", "Career gap > 6 months"]

  // --- Final status ---
  validationStatus: ValidationStatus;
}

// The full application payload stored in persistence layer
export interface ApplicationRecord {
  applicantId: string;
  applicant: import("./applicant").Applicant;
  education: import("./education").EducationRecord[];
  work: import("./work").WorkExperience[];
  assessment: DerivedAssessment;
  submittedAt: string;  // ISO datetime
}
