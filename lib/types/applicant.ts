// lib/types/applicant.ts
// Represents the core applicant identity fields captured in step 1 of the form.
// These are stable fields that don't depend on education path.

export type InterviewStatus =
  | "not_scheduled"
  | "scheduled"
  | "completed"
  | "no_show"
  | "cancelled";

export interface Applicant {
  applicantId: string;           // UUID generated at submission time
  fullName: string;
  email: string;
  phone: string;                 // 10-digit Indian mobile number
  dateOfBirth: string;           // ISO date string "YYYY-MM-DD"
  aadhaarNumber: string;         // 12-digit Aadhaar
  interviewStatus: InterviewStatus;
  offerLetterSent: boolean;      // flag only — does not imply offer issuance from this platform
  applicationTimestamp: string;  // ISO datetime string, set by server at submission
}
