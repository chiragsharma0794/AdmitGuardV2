// lib/types/work.ts
// Represents one work experience entry. An applicant can have zero or more.

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "freelance"
  | "self_employed";

export interface WorkExperience {
  companyName: string;
  designation: string;
  domain: string;              // e.g., "Software Engineering", "Finance", "Healthcare"
  startDate: string;           // ISO date "YYYY-MM-DD"
  endDate: string | null;      // null means currently employed
  isCurrent: boolean;
  employmentType: EmploymentType;
  keySkills: string[];         // list of skill strings e.g., ["Python", "AWS"]
  tenureMonths: number;        // computed: months between startDate and endDate (or today)
}

// Derived summary across all WorkExperience entries — computed server-side.
export interface WorkSummary {
  totalWorkExperienceMonths: number;
  relevantExperienceMonths: number;  // months in domains matching the target program
  careerGapsMonths: number[];        // list of gap durations between consecutive jobs
  currentlyEmployed: boolean;
  domainSwitchCount: number;         // number of times the domain changed between jobs
}
