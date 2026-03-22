// lib/schemas/submission.ts
// The top-level schema for the full application submission.
// This is what the POST /api/applications endpoint expects.

import { z } from "zod";
import { ApplicantSchema } from "./applicant";
import { EducationRecordSchema } from "./education";
import { WorkExperienceSchema } from "./work";

export const SubmissionSchema = z.object({
  applicant: ApplicantSchema,

  // Must include at least one education record (10th is mandatory for all paths)
  education: z
    .array(EducationRecordSchema)
    .min(1, "At least one education record (10th) is required"),

  // Work experience is optional globally; path-specific rules may require/flag it
  work: z.array(WorkExperienceSchema).default([]),
});

export type SubmissionInput = z.infer<typeof SubmissionSchema>;
