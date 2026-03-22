// app/page.tsx
// Main application page — assembles all 4 steps with step navigation.
//
// HOW THIS WORKS:
// 1. useFormState() holds ALL form data across steps (state is "lifted" here)
// 2. useState for currentStep controls which step component renders
// 3. StepNav shows progress at the top
// 4. Back/Next buttons navigate between steps
// 5. On final Submit, the form data is POSTed to /api/applications (Milestone 2)
//
// Right now (M1), Submit just logs to console. The real backend comes in M2.

"use client";

import { useState } from "react";
import { StepNav } from "@/components/ui/StepNav";
import { Button } from "@/components/ui/Button";
import { ApplicantStep } from "@/components/applicant/ApplicantStep";
import { EducationStep } from "@/components/education/EducationStep";
import { WorkStep } from "@/components/work/WorkStep";
import { ReviewStep } from "@/components/review/ReviewStep";
import { useFormState } from "@/lib/hooks/useFormState";

const STEPS = [
  { label: "Applicant", description: "Personal info" },
  { label: "Education", description: "Academic history" },
  { label: "Work", description: "Experience" },
  { label: "Review", description: "Verify & submit" },
];

export default function HomePage() {
  const form = useFormState();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<Record<string, unknown> | null>(null);

  function goNext() {
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitResult(null);

    // Build the payload that matches our SubmissionSchema shape
    const payload = {
      applicant: {
        ...form.formState.applicant,
        offerLetterSent: form.formState.applicant.offerLetterSent,
      },
      education: form.formState.education.map((rec) => ({
        level: rec.level,
        boardUniversity: rec.boardUniversity,
        stream: rec.stream || "",
        yearOfPassing: parseInt(rec.yearOfPassing) || 0,
        scoreValue: parseFloat(rec.scoreValue) || 0,
        scoreScale: rec.scoreScale,
        backlogCount: parseInt(rec.backlogCount) || 0,
        gapAfterLevelMonths: parseInt(rec.gapAfterLevelMonths) || 0,
        pathTag: rec.pathTag,
      })),
      work: form.formState.work.map((entry) => ({
        companyName: entry.companyName,
        designation: entry.designation,
        domain: entry.domain,
        startDate: entry.startDate,
        endDate: entry.isCurrent ? null : entry.endDate || null,
        isCurrent: entry.isCurrent,
        employmentType: entry.employmentType,
        keySkills: entry.keySkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })),
    };

    try {
      // M2 will have a real /api/applications endpoint.
      // For now, log the payload so you can inspect it in the browser console.
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSubmitResult(data);
    } catch (err) {
      // If /api/applications doesn't exist yet (M1), show the payload directly
      console.log("Submission payload:", JSON.stringify(payload, null, 2));
      setSubmitResult({
        _note: "API endpoint not yet implemented (Milestone 2). Payload logged to console.",
        payload,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
              AG
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">AdmitGuard v2</h1>
              <p className="text-xs text-slate-400">Admission Validation Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Form Area ── */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <StepNav steps={STEPS} currentStep={currentStep} />

        {/* ── Step Content ── */}
        <div className="mb-8">
          {currentStep === 0 && (
            <ApplicantStep
              data={form.formState.applicant}
              onChange={form.updateApplicant}
            />
          )}
          {currentStep === 1 && (
            <EducationStep
              educationPath={form.formState.educationPath}
              education={form.formState.education}
              onPathChange={form.setEducationPath}
              onAdd={form.addEducation}
              onUpdate={form.updateEducation}
              onRemove={form.removeEducation}
            />
          )}
          {currentStep === 2 && (
            <WorkStep
              work={form.formState.work}
              onAdd={form.addWork}
              onUpdate={form.updateWork}
              onRemove={form.removeWork}
            />
          )}
          {currentStep === 3 && <ReviewStep formState={form.formState} />}
        </div>

        {/* ── Navigation Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <Button
            variant="secondary"
            onClick={goBack}
            disabled={currentStep === 0}
          >
            ← Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={goNext}>Next →</Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={submitting}>
              Submit Application
            </Button>
          )}
        </div>

        {/* ── Submit Result (temporary — replaced by proper UI in M3) ── */}
        {submitResult && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Submission Result
            </h3>
            <pre className="text-xs text-slate-600 overflow-auto max-h-96 bg-slate-50 rounded p-3">
              {JSON.stringify(submitResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
