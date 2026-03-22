// lib/schemas/education.ts
// Zod schema for validating a single education record.

import { z } from "zod";

export const EducationRecordSchema = z.object({
  level: z.enum(["10th", "12th", "Diploma", "ITI", "UG", "PG", "PhD"]),
  boardUniversity: z.string().min(3, "Board/University name too short"),
  stream: z.string().optional().default(""),
  yearOfPassing: z
    .number()
    .int()
    .min(1980, "Year must be 1980 or later")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  scoreValue: z.number().positive("Score must be positive"),
  scoreScale: z.enum(["percentage", "cgpa_10", "cgpa_4", "grade"]),
  backlogCount: z.number().int().min(0).default(0),
  gapAfterLevelMonths: z.number().int().min(0).default(0),
  pathTag: z.enum(["A", "B", "C"]),
});

export type EducationRecordInput = z.infer<typeof EducationRecordSchema>;
