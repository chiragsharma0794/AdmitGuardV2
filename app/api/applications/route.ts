// app/api/applications/route.ts
// POST /api/applications — the main submission endpoint.
//
// This is the heart of the backend. It orchestrates:
// 1. Zod schema parsing (structural validation)
// 2. Tier 1 hard-reject validation (business rules → reject if fail)
// 3. Tier 2 soft-flag validation (advisory → save with flags)
// 4. Tier 3 enrichment (normalize scores, compute derived fields)
// 5. Persistence (save to local store or Google Sheets)
//
// Returns structured JSON responses as defined in docs/api-contract.md.

import { NextRequest, NextResponse } from "next/server";
import { SubmissionSchema } from "@/lib/schemas/submission";
import { runTier1 } from "@/lib/validation/tier1";
import { runTier2 } from "@/lib/validation/tier2";
import { enrichSubmission } from "@/lib/validation/normalization";
import { computeRiskScore } from "@/lib/intelligence/riskScore";
import { categorize } from "@/lib/intelligence/categorization";
import { computeDataQuality } from "@/lib/intelligence/dataQuality";
import { detectAnomalies } from "@/lib/intelligence/anomalyDetection";
import {
  getExistingEmails,
  getExistingPhones,
  saveApplication,
} from "@/lib/persistence/localStore";

export async function POST(request: NextRequest) {
  try {
    // ── Step 1: Parse request body ──────────────────────────────────────────
    const body = await request.json();

    // ── Step 2: Zod schema validation ───────────────────────────────────────
    // This catches structural issues: missing fields, wrong types, invalid formats.
    const parsed = SubmissionSchema.safeParse(body);

    if (!parsed.success) {
      // Convert Zod errors into our field-path → message format
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      }
      return NextResponse.json(
        { success: false, errors, flags: [] },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // ── Step 3: Tier 1 — Hard Reject ────────────────────────────────────────
    // Business rule validation. If any fail, respond 422 and do NOT save.
    const existingEmails = getExistingEmails();
    const existingPhones = getExistingPhones();
    const tier1Errors = runTier1(data, existingEmails, existingPhones);

    if (Object.keys(tier1Errors).length > 0) {
      return NextResponse.json(
        { success: false, errors: tier1Errors, flags: [] },
        { status: 422 }
      );
    }

    // ── Step 4: Tier 2 — Soft Flags ─────────────────────────────────────────
    // Advisory checks. If any trigger, we still save but mark as FLAGGED.
    const softFlags = runTier2(data);

    // ── Step 5: Tier 3 — Enrichment ─────────────────────────────────────────
    // Compute normalized scores, experience metrics, completeness, etc.
    const enriched = enrichSubmission(data);

    // ── Step 5b: Intelligence Layer ─────────────────────────────────────────
    // Compute risk score, categorization, data quality, and anomaly detection.
    const risk = computeRiskScore(data, enriched);
    const dq = computeDataQuality(data);
    const anomalyFlags = detectAnomalies(data);
    const cat = categorize(risk.score);

    // Combine soft flags + anomalies for validation status
    const allFlags = [...softFlags, ...anomalyFlags.map(a => `[Anomaly] ${a}`)];

    // Determine validation status
    const validationStatus = allFlags.length > 0 ? "FLAGGED" : "ACCEPTED";

    // Generate applicant ID
    const applicantId = crypto.randomUUID();

    // Build the derived assessment — now with real intelligence data
    const derived = {
      totalEducationGapMonths: enriched.totalEducationGapMonths,
      totalWorkExperienceMonths: enriched.totalWorkExperienceMonths,
      relevantExperienceMonths: enriched.relevantExperienceMonths,
      experienceBucket: enriched.experienceBucket,
      applicationCompletenessPercent: enriched.applicationCompletenessPercent,
      domainSwitchCount: enriched.domainSwitchCount,
      riskScore: risk.score,
      riskPenalties: risk.penalties,
      dataQualityScore: dq.score,
      dataQualityDeductions: dq.deductions,
      categorization: cat,
      anomalyFlags,
      softFlags,
      validationStatus,
    };

    // ── Step 6: Persist ─────────────────────────────────────────────────────
    const submittedAt = new Date().toISOString();

    saveApplication({
      applicantId,
      email: data.applicant.email.toLowerCase(),
      phone: data.applicant.phone,
      submittedAt,
      data: {
        applicant: { ...data.applicant, applicantId, applicationTimestamp: submittedAt },
        education: enriched.normalizedEducation,
        work: data.work,
        assessment: derived,
      },
    });

    // ── Step 7: Respond ─────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      status: validationStatus,
      applicantId,
      flags: softFlags,
      derived,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      {
        success: false,
        errors: { _server: "Internal server error. Please try again." },
        flags: [],
      },
      { status: 500 }
    );
  }
}
