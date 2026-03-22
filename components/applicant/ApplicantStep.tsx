// components/applicant/ApplicantStep.tsx
// Step 1 of the form: collects core applicant identity fields.
// All fields here map directly to the ApplicantSchema in lib/schemas/applicant.ts.
//
// Client-side validation here is ONLY for UX (instant feedback).
// The server will re-validate everything in Milestone 2 — never trust client-only validation.

"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import type { ApplicantFormData } from "@/lib/hooks/useFormState";

interface ApplicantStepProps {
  data: ApplicantFormData;
  onChange: (field: keyof ApplicantFormData, value: string | boolean) => void;
}

const INTERVIEW_STATUS_OPTIONS = [
  { value: "not_scheduled", label: "Not Scheduled" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No Show" },
  { value: "cancelled", label: "Cancelled" },
];

export function ApplicantStep({ data, onChange }: ApplicantStepProps) {
  return (
    <div className="space-y-6">
      <Card
        title="Personal Information"
        description="Basic identity details for the applicant."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Full Name"
              id="fullName"
              required
              placeholder="Priya Sharma"
              value={data.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              hint="Letters and spaces only, minimum 2 characters"
            />
          </div>

          <Input
            label="Email Address"
            id="email"
            type="email"
            required
            placeholder="priya@example.com"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
          />

          <Input
            label="Mobile Number"
            id="phone"
            type="tel"
            required
            placeholder="9876543210"
            maxLength={10}
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            hint="10-digit Indian mobile, starts with 6–9"
          />

          <Input
            label="Date of Birth"
            id="dateOfBirth"
            type="date"
            required
            min="1940-01-01"
            max={`${new Date().getFullYear() - 15}-12-31`}
            value={data.dateOfBirth}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
            hint="Applicant must be at least 15 years old"
          />

          <Input
            label="Aadhaar Number"
            id="aadhaarNumber"
            required
            placeholder="1234 5678 9012"
            maxLength={12}
            value={data.aadhaarNumber}
            onChange={(e) =>
              onChange("aadhaarNumber", e.target.value.replace(/\s/g, ""))
            }
            hint="12-digit Aadhaar number, no spaces"
          />
        </div>
      </Card>

      <Card
        title="Application Status"
        description="Current state of this application in the admissions workflow."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Interview Status"
            id="interviewStatus"
            required
            value={data.interviewStatus}
            onChange={(e) => onChange("interviewStatus", e.target.value)}
            options={INTERVIEW_STATUS_OPTIONS}
          />

          <div className="flex flex-col gap-2 justify-end">
            <label className="text-sm font-medium text-slate-700">
              Offer Letter Sent
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="offerLetterSent"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={data.offerLetterSent}
                onChange={(e) => onChange("offerLetterSent", e.target.checked)}
              />
              <span className="text-sm text-slate-600">
                Yes — offer letter has been sent
              </span>
            </label>
            <p className="text-xs text-slate-400">
              This flag records that a letter was sent. It does not issue an offer from this platform.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
