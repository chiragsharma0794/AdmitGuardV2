// components/review/ReviewStep.tsx
// Step 4: Read-only review of all entered data before submission.
// This step shows everything the user entered in a clean, organized summary
// so they can verify before hitting Submit.
//
// WHY A REVIEW STEP?
// In a multi-step form, users can forget what they entered in earlier steps.
// Showing a summary reduces submission errors and builds trust. It also maps
// cleanly to the "confirmation screen" requirement in the brief.

"use client";

import { Card } from "@/components/ui/Card";
import type { FormState } from "@/lib/hooks/useFormState";
import { EDUCATION_PATH_RULES } from "@/lib/config/rules";

interface ReviewStepProps {
  formState: FormState;
}

export function ReviewStep({ formState }: ReviewStepProps) {
  const { applicant, educationPath, education, work } = formState;

  return (
    <div className="space-y-6">
      {/* ── Applicant Summary ── */}
      <Card title="1. Applicant Details">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
          <ReviewField label="Full Name" value={applicant.fullName} />
          <ReviewField label="Email" value={applicant.email} />
          <ReviewField label="Phone" value={applicant.phone} />
          <ReviewField label="Date of Birth" value={applicant.dateOfBirth} />
          <ReviewField label="Aadhaar Number" value={maskAadhaar(applicant.aadhaarNumber)} />
          <ReviewField
            label="Interview Status"
            value={applicant.interviewStatus.replace(/_/g, " ")}
          />
          <ReviewField
            label="Offer Letter Sent"
            value={applicant.offerLetterSent ? "Yes" : "No"}
          />
        </dl>
      </Card>

      {/* ── Education Summary ── */}
      <Card
        title="2. Education History"
        description={`Path ${educationPath} — ${EDUCATION_PATH_RULES[educationPath].description}`}
      >
        {education.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No education records added.</p>
        ) : (
          <div className="space-y-3">
            {education.map((rec, i) => (
              <div
                key={rec.id}
                className="rounded-lg bg-slate-50 border border-slate-100 p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {rec.level || "—"}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    {rec.boardUniversity || "—"}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 sm:grid-cols-4">
                  {rec.stream && <ReviewFieldSmall label="Stream" value={rec.stream} />}
                  <ReviewFieldSmall label="Year" value={rec.yearOfPassing || "—"} />
                  <ReviewFieldSmall
                    label="Score"
                    value={`${rec.scoreValue || "—"} (${rec.scoreScale})`}
                  />
                  {parseInt(rec.backlogCount) > 0 && (
                    <ReviewFieldSmall label="Backlogs" value={rec.backlogCount} />
                  )}
                  {parseInt(rec.gapAfterLevelMonths) > 0 && (
                    <ReviewFieldSmall label="Gap" value={`${rec.gapAfterLevelMonths} mo`} />
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Work Experience Summary ── */}
      <Card title="3. Work Experience">
        {work.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No work experience (fresher).</p>
        ) : (
          <div className="space-y-3">
            {work.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg bg-slate-50 border border-slate-100 p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-800">
                    {entry.designation || "—"}{" "}
                    <span className="text-slate-500">at {entry.companyName || "—"}</span>
                  </span>
                  {entry.isCurrent && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Current
                    </span>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 sm:grid-cols-4">
                  <ReviewFieldSmall label="Domain" value={entry.domain || "—"} />
                  <ReviewFieldSmall label="Type" value={(entry.employmentType || "—").replace(/_/g, " ")} />
                  <ReviewFieldSmall label="From" value={entry.startDate || "—"} />
                  <ReviewFieldSmall label="To" value={entry.isCurrent ? "Present" : entry.endDate || "—"} />
                  {entry.keySkills && (
                    <div className="col-span-2 sm:col-span-4">
                      <ReviewFieldSmall label="Skills" value={entry.keySkills} />
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Submit notice ── */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Ready to submit?</strong>{" "}
        Click the Submit button below. The server will validate all data, compute risk
        scores and categorization, and save the record if validation passes.
      </div>
    </div>
  );
}

// ─── Helper components ──────────────────────────────────────────────────────
function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="text-slate-800">{value || <span className="text-slate-300">—</span>}</dd>
    </div>
  );
}

function ReviewFieldSmall({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-slate-400">{label}</dt>
      <dd className="text-slate-600">{value}</dd>
    </div>
  );
}

function maskAadhaar(value: string): string {
  if (value.length !== 12) return value || "—";
  return "XXXX XXXX " + value.slice(8);
}
