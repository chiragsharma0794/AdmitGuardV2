// app/page.tsx
// Main page — multi-step form + confirmation screen.
//
// FLOW:
// 1. useFormState() holds all data across steps
// 2. On Submit → POST /api/applications → get full assessment
// 3. If success → show ConfirmationScreen with risk/categorization/quality
// 4. If error → show validation errors inline
// 5. "Submit Another" resets everything

"use client";

import { useState } from "react";
import { StepNav } from "@/components/ui/StepNav";
import { Button } from "@/components/ui/Button";
import { ApplicantStep } from "@/components/applicant/ApplicantStep";
import { EducationStep } from "@/components/education/EducationStep";
import { WorkStep } from "@/components/work/WorkStep";
import { ReviewStep } from "@/components/review/ReviewStep";
import { ConfirmationScreen } from "@/components/confirmation/ConfirmationScreen";
import { useFormState } from "@/lib/hooks/useFormState";

const STEPS = [
  { label: "Applicant", description: "Personal info" },
  { label: "Education", description: "Academic history" },
  { label: "Work", description: "Experience" },
  { label: "Review", description: "Verify & submit" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SubmitResultSuccess = any;

export default function HomePage() {
  const form = useFormState();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResultSuccess | null>(null);
  const [submitErrors, setSubmitErrors] = useState<Record<string, string> | null>(null);

  function goNext() {
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function handleNewApplication() {
    // Reset everything — form, step, results
    window.location.reload();
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitResult(null);
    setSubmitErrors(null);

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
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitResult(data);
      } else {
        setSubmitErrors(data.errors || { _general: "Submission failed." });
      }
    } catch {
      setSubmitErrors({ _general: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── If we have a successful result, show the confirmation screen ──
  if (submitResult?.success) {
    return (
      <main className="min-h-screen bg-slate-50">
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
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <ConfirmationScreen
            result={submitResult}
            onNewApplication={handleNewApplication}
          />
        </div>
      </main>
    );
  }

  // ── Normal form view ──
  return (
    <main className="min-h-screen bg-slate-50">
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

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <StepNav steps={STEPS} currentStep={currentStep} />

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

        {/* ── Validation Errors ── */}
        {submitErrors && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-800 mb-2">
              Validation Errors
            </h3>
            <ul className="space-y-1">
              {Object.entries(submitErrors).map(([field, msg]) => (
                <li key={field} className="text-sm text-red-700">
                  <span className="font-medium">{field}:</span> {msg}
                </li>
              ))}
            </ul>
          </div>
        )}

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
      </div>
    </main>
  );
}
