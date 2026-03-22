// tests/validation/tier1.test.ts
// Unit tests for Tier 1 hard-reject validation.

import { runTier1 } from "@/lib/validation/tier1";
import type { SubmissionInput } from "@/lib/schemas/submission";

// Helper to build a valid base submission that passes all Tier 1 checks.
// Tests then modify specific fields to trigger failures.
function validSubmission(): SubmissionInput {
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
    work: [],
  };
}

describe("Tier 1: Hard Reject Validation", () => {
  test("valid submission passes with no errors", () => {
    const errors = runTier1(validSubmission());
    expect(Object.keys(errors)).toHaveLength(0);
  });

  // ── Age check ──
  test("rejects underage applicant (< 18)", () => {
    const data = validSubmission();
    const year = new Date().getFullYear() - 16;
    data.applicant.dateOfBirth = `${year}-06-15`;
    const errors = runTier1(data);
    expect(errors["applicant.dateOfBirth"]).toContain("at least 18");
  });

  // ── Duplicate email ──
  test("rejects duplicate email", () => {
    const data = validSubmission();
    const existing = new Set(["priya@example.com"]);
    const errors = runTier1(data, existing);
    expect(errors["applicant.email"]).toContain("already exists");
  });

  // ── Duplicate phone ──
  test("rejects duplicate phone", () => {
    const data = validSubmission();
    const errors = runTier1(data, new Set(), new Set(["9876543210"]));
    expect(errors["applicant.phone"]).toContain("already exists");
  });

  // ── Score out of range ──
  test("rejects percentage > 100", () => {
    const data = validSubmission();
    data.education[0].scoreValue = 105;
    const errors = runTier1(data);
    expect(errors["education[0].scoreValue"]).toContain("out of range");
  });

  test("rejects CGPA > 10", () => {
    const data = validSubmission();
    data.education[2].scoreValue = 11;
    const errors = runTier1(data);
    expect(errors["education[2].scoreValue"]).toContain("out of range");
  });

  // ── Chronology violation ──
  test("rejects 12th year before 10th year", () => {
    const data = validSubmission();
    data.education[1].yearOfPassing = 2014; // 12th before 10th (2016)
    const errors = runTier1(data);
    expect(errors["education[1].yearOfPassing"]).toBeDefined();
    expect(errors["education[1].yearOfPassing"]).toContain("cannot be before");
  });

  // ── Missing mandatory education ──
  test("rejects missing 10th record", () => {
    const data = validSubmission();
    data.education = data.education.filter((e) => e.level !== "10th");
    const errors = runTier1(data);
    expect(
      errors["education"] || errors["education.path"]
    ).toBeDefined();
  });

  // ── Work overlap ──
  test("rejects overlapping work entries", () => {
    const data = validSubmission();
    data.work = [
      {
        companyName: "Company A",
        designation: "Dev",
        domain: "IT",
        startDate: "2020-01-01",
        endDate: "2022-06-01",
        isCurrent: false,
        employmentType: "full_time",
        keySkills: [],
      },
      {
        companyName: "Company B",
        designation: "Dev",
        domain: "IT",
        startDate: "2021-06-01",
        endDate: "2023-01-01",
        isCurrent: false,
        employmentType: "full_time",
        keySkills: [],
      },
    ];
    const errors = runTier1(data);
    const overlapKey = Object.keys(errors).find((k) => k.includes("overlap"));
    expect(overlapKey).toBeDefined();
  });

  // ── Work end date before start date ──
  test("rejects work with end date before start date", () => {
    const data = validSubmission();
    data.work = [
      {
        companyName: "Company A",
        designation: "Dev",
        domain: "IT",
        startDate: "2022-06-01",
        endDate: "2020-01-01",
        isCurrent: false,
        employmentType: "full_time",
        keySkills: [],
      },
    ];
    const errors = runTier1(data);
    expect(errors["work[0].endDate"]).toContain("before start date");
  });
});
