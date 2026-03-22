// lib/config/rules.ts
// Defines the structural education path rules — which levels are mandatory or optional
// for each education path. The validation engine reads this config, not the UI.

import type { EducationLevel, EducationPath } from "@/lib/types/education";

export interface PathRuleSet {
  // levels that MUST be present for this path
  mandatory: EducationLevel[];
  // levels that are allowed but not required
  optional: EducationLevel[];
  // levels that are NOT allowed for this path (e.g. 12th in Diploma path is optional skippable)
  description: string;
}

// Education path rule definitions
// Path A: Standard — 10th → 12th → UG → (PG optional)
// Path B: Diploma — 10th → Diploma → UG (lateral) → (PG optional); 12th skippable
// Path C: Vocational — 10th → ITI → Diploma → UG → (PG optional)
export const EDUCATION_PATH_RULES: Record<EducationPath, PathRuleSet> = {
  A: {
    mandatory: ["10th", "12th", "UG"],
    optional: ["PG", "PhD"],
    description:
      "Standard path: 10th → 12th → UG. PG and PhD are optional but must follow in order.",
  },
  B: {
    mandatory: ["10th", "Diploma"],
    optional: ["12th", "UG", "PG", "PhD"],
    description:
      "Diploma path: 10th → Diploma. 12th is optional (can be skipped). Lateral entry to UG allowed.",
  },
  C: {
    mandatory: ["10th", "ITI", "Diploma"],
    optional: ["UG", "PG", "PhD"],
    description:
      "Vocational path: 10th → ITI → Diploma. UG and above are optional.",
  },
};

// Levels where backlog count is a meaningful field to capture
export const LEVELS_WITH_BACKLOGS: EducationLevel[] = [
  "Diploma",
  "UG",
  "PG",
  "PhD",
];

// Levels where stream/specialization is relevant
export const LEVELS_WITH_STREAM: EducationLevel[] = [
  "12th",
  "Diploma",
  "ITI",
  "UG",
  "PG",
  "PhD",
];

// Chronological order enforcement: a level's year of passing must be >= the year
// of the previous level. This map defines what the "previous" level is for each.
export const CHRONOLOGICAL_ORDER: Partial<Record<EducationLevel, EducationLevel>> =
  {
    "12th": "10th",
    Diploma: "10th",
    ITI: "10th",
    UG: "12th", // or Diploma in path B/C — the validator handles path-specific logic
    PG: "UG",
    PhD: "PG",
  };
