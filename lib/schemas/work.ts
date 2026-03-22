// lib/schemas/work.ts
// Zod schema for a single work experience entry.

import { z } from "zod";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const WorkExperienceSchema = z.object({
  companyName: z.string().min(2, "Company name too short"),
  designation: z.string().min(2, "Designation too short"),
  domain: z.string().min(2, "Domain too short"),
  startDate: z
    .string()
    .regex(ISO_DATE_REGEX, "Start date must be YYYY-MM-DD"),
  endDate: z
    .string()
    .regex(ISO_DATE_REGEX, "End date must be YYYY-MM-DD")
    .nullable(),
  isCurrent: z.boolean(),
  employmentType: z.enum([
    "full_time",
    "part_time",
    "contract",
    "internship",
    "freelance",
    "self_employed",
  ]),
  keySkills: z.array(z.string()).default([]),
});

export type WorkExperienceInput = z.infer<typeof WorkExperienceSchema>;
