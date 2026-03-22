// tests/validation/tier2.test.ts
// Unit tests for Tier 2 soft-flag validation.

import { runTier2 } from "@/lib/validation/tier2";
import type { SubmissionInput } from "@/lib/schemas/submission";

function cleanSubmission(): SubmissionInput {
  return {
    applicant: {
      fullName: "Priya Sharma",
      email: "priya@example.com",
      phone: "9876543210",
      dateOfBirth: "2000-06-15",
      aadhaarNumber: "123456789012",
      interviewStatus: "not_scheduled",
      offerLetterSent: false,
    },
    education: [
      {
        level: "10th",
        boardUniversity: "CBSE",
        stream: "General",
        yearOfPassing: 2016,
        scoreValue: 85,
        scoreScale: "percentage",
        backlogCount: 0,
        gapAfterLevelMonths: 0,
        pathTag: "A",
      },
      {
        level: "12th",
        boardUniversity: "CBSE",
        stream: "Science",
        yearOfPassing: 2018,
        scoreValue: 78,
        scoreScale: "percentage",
        backlogCount: 0,
        gapAfterLevelMonths: 0,
        pathTag: "A",
      },
      {
        level: "UG",
        boardUniversity: "Mumbai University",
        stream: "Computer Science",
        yearOfPassing: 2022,
        scoreValue: 7.5,
        scoreScale: "cgpa_10",
        backlogCount: 0,
        gapAfterLevelMonths: 0,
        pathTag: "A",
      },
    ],
    work: [
      {
        companyName: "Tech Corp",
        designation: "Software Engineer",
        domain: "IT",
        startDate: "2022-07-01",
        endDate: null,
        isCurrent: true,
        employmentType: "full_time",
        keySkills: ["React"],
      },
    ],
  };
}

describe("Tier 2: Soft Flag Validation", () => {
  test("clean submission produces no flags", () => {
    const flags = runTier2(cleanSubmission());
    expect(flags).toHaveLength(0);
  });

  test("flags education gap > 24 months", () => {
    const data = cleanSubmission();
    data.education[0].gapAfterLevelMonths = 30;
    const flags = runTier2(data);
    expect(flags.some((f) => f.toLowerCase().includes("education gap"))).toBe(true);
  });

  test("flags active backlogs", () => {
    const data = cleanSubmission();
    data.education[2].backlogCount = 3;
    const flags = runTier2(data);
    expect(flags.some((f) => f.toLowerCase().includes("backlog"))).toBe(true);
  });

  test("flags low normalized score (< 50%)", () => {
    const data = cleanSubmission();
    data.education[0].scoreValue = 35;
    const flags = runTier2(data);
    expect(flags.some((f) => f.toLowerCase().includes("low score"))).toBe(true);
  });

  test("flags career gap > 6 months", () => {
    const data = cleanSubmission();
    data.work = [
      {
        companyName: "Company A",
        designation: "Dev",
        domain: "IT",
        startDate: "2018-01-01",
        endDate: "2020-01-01",
        isCurrent: false,
        employmentType: "full_time",
        keySkills: [],
      },
      {
        companyName: "Company B",
        designation: "Dev",
        domain: "IT",
        startDate: "2021-06-01",  // 17-month gap
        endDate: null,
        isCurrent: true,
        employmentType: "full_time",
        keySkills: [],
      },
    ];
    const flags = runTier2(data);
    expect(flags.some((f) => f.toLowerCase().includes("career gap"))).toBe(true);
  });

  test("flags stale profile (no work, old graduation)", () => {
    const data = cleanSubmission();
    data.education[2].yearOfPassing = 2018; // graduated 8+ years ago
    data.work = []; // no work at all
    const flags = runTier2(data);
    expect(flags.some((f) => f.toLowerCase().includes("stale"))).toBe(true);
  });

  test("flags too many domain switches (> 3)", () => {
    const data = cleanSubmission();
    data.work = [
      { companyName: "A", designation: "D", domain: "IT", startDate: "2018-01-01", endDate: "2019-01-01", isCurrent: false, employmentType: "full_time", keySkills: [] },
      { companyName: "B", designation: "D", domain: "Finance", startDate: "2019-02-01", endDate: "2020-01-01", isCurrent: false, employmentType: "full_time", keySkills: [] },
      { companyName: "C", designation: "D", domain: "Healthcare", startDate: "2020-02-01", endDate: "2021-01-01", isCurrent: false, employmentType: "full_time", keySkills: [] },
      { companyName: "D", designation: "D", domain: "Education", startDate: "2021-02-01", endDate: "2022-01-01", isCurrent: false, employmentType: "full_time", keySkills: [] },
      { companyName: "E", designation: "D", domain: "Retail", startDate: "2022-02-01", endDate: null, isCurrent: true, employmentType: "full_time", keySkills: [] },
    ];
    const flags = runTier2(data);
    expect(flags.some((f) => f.toLowerCase().includes("domain switch"))).toBe(true);
  });
});
