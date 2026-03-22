// lib/types/education.ts
// Represents one education record in the applicant's academic history.
// An applicant can have multiple EducationRecord entries (one per level completed).

export type EducationLevel =
  | "10th"
  | "12th"
  | "Diploma"
  | "ITI"
  | "UG"
  | "PG"
  | "PhD";

// Education path determines which levels are mandatory or optional.
// Path A: 10th → 12th → UG → PG/Work (standard)
// Path B: 10th → Diploma → UG (lateral possible) → PG/Work
// Path C: 10th → ITI/Vocational → Diploma → UG → PG/Work
export type EducationPath = "A" | "B" | "C";

export type ScoreScale = "percentage" | "cgpa_10" | "cgpa_4" | "grade";

export interface EducationRecord {
  level: EducationLevel;
  boardUniversity: string;
  stream: string;              // e.g., "Science", "Computer Science"
  yearOfPassing: number;
  scoreValue: number;          // raw score as entered
  scoreScale: ScoreScale;
  normalizedPercentage: number; // computed server-side: converts any scale to 0–100
  backlogCount: number;        // 0 if no backlogs; only relevant for UG/PG/Diploma
  gapAfterLevelMonths: number; // months between this level and the next one
  pathTag: EducationPath;      // which path this record belongs to
}
