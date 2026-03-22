// lib/schemas/applicant.ts
// Zod schema for validating incoming applicant fields.
// This is the single source of truth for what a valid applicant looks like.
// The API route uses this schema to parse and validate the request body server-side.

import { z } from "zod";

// Indian mobile: 10 digits, starts with 6-9
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
// Aadhaar: exactly 12 digits
const AADHAAR_REGEX = /^\d{12}$/;
// Full name: only letters and spaces, no numbers
const FULL_NAME_REGEX = /^[a-zA-Z\s'-]+$/;

export const ApplicantSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .regex(FULL_NAME_REGEX, "Full name must not contain numbers or special characters"),

  email: z
    .string()
    .email("Must be a valid email address"),

  phone: z
    .string()
    .regex(INDIAN_MOBILE_REGEX, "Must be a valid 10-digit Indian mobile number starting with 6–9"),

  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),

  aadhaarNumber: z
    .string()
    .regex(AADHAAR_REGEX, "Aadhaar must be exactly 12 digits"),

  interviewStatus: z.enum([
    "not_scheduled",
    "scheduled",
    "completed",
    "no_show",
    "cancelled",
  ]),

  offerLetterSent: z.boolean(),
});

export type ApplicantInput = z.infer<typeof ApplicantSchema>;
