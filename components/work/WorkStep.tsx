// components/work/WorkStep.tsx
// Step 3: Work experience entries (zero or more).
// Each entry captures company, role, domain, dates, employment type, and skills.
//
// WHY THIS IS OPTIONAL BUT IMPORTANT:
// Work experience is not required for all applicants (e.g. freshers).
// But when present, the backend uses it to compute:
// - total experience → experience bucket
// - career gaps → soft flags
// - domain switches → anomaly flags
// - relevance → risk scoring
//
// The form allows adding/removing entries dynamically.

"use client";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { WorkFormData } from "@/lib/hooks/useFormState";

interface WorkStepProps {
  work: WorkFormData[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof WorkFormData, value: string | boolean) => void;
  onRemove: (id: string) => void;
}

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
  { value: "self_employed", label: "Self-employed" },
];

export function WorkStep({ work, onAdd, onUpdate, onRemove }: WorkStepProps) {
  return (
    <div className="space-y-6">
      {work.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 mb-1">No work experience added.</p>
          <p className="text-xs text-slate-400 mb-4">
            This is optional for freshers. Add entries if the applicant has work history.
          </p>
          <Button variant="secondary" onClick={onAdd}>
            + Add Work Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {work.map((entry, index) => (
            <WorkEntryCard
              key={entry.id}
              entry={entry}
              index={index}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      {work.length > 0 && (
        <Button variant="secondary" onClick={onAdd}>
          + Add Another Position
        </Button>
      )}
    </div>
  );
}

// ─── Sub-component: one work experience card ─────────────────────────────────
interface WorkEntryCardProps {
  entry: WorkFormData;
  index: number;
  onUpdate: (id: string, field: keyof WorkFormData, value: string | boolean) => void;
  onRemove: (id: string) => void;
}

function WorkEntryCard({ entry, index, onUpdate, onRemove }: WorkEntryCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Position #{index + 1}
          {entry.companyName && (
            <span className="ml-2 text-slate-500 font-normal">— {entry.companyName}</span>
          )}
        </h3>
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          className="text-xs text-red-500 hover:text-red-700 transition"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Company Name"
          required
          placeholder="e.g., Infosys"
          value={entry.companyName}
          onChange={(e) => onUpdate(entry.id, "companyName", e.target.value)}
        />

        <Input
          label="Designation / Role"
          required
          placeholder="e.g., Software Engineer"
          value={entry.designation}
          onChange={(e) => onUpdate(entry.id, "designation", e.target.value)}
        />

        <Input
          label="Domain / Industry"
          required
          placeholder="e.g., IT, Finance, Healthcare"
          value={entry.domain}
          onChange={(e) => onUpdate(entry.id, "domain", e.target.value)}
          hint="Used for domain-switch analysis and relevance scoring"
        />

        <Select
          label="Employment Type"
          required
          value={entry.employmentType}
          onChange={(e) => onUpdate(entry.id, "employmentType", e.target.value)}
          options={EMPLOYMENT_TYPE_OPTIONS}
          placeholder="Select type..."
        />

        <Input
          label="Start Date"
          type="date"
          required
          value={entry.startDate}
          onChange={(e) => onUpdate(entry.id, "startDate", e.target.value)}
        />

        <div className="space-y-2">
          <Input
            label="End Date"
            type="date"
            value={entry.endDate}
            onChange={(e) => onUpdate(entry.id, "endDate", e.target.value)}
            disabled={entry.isCurrent}
            hint={entry.isCurrent ? "Disabled — currently employed here" : ""}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={entry.isCurrent}
              onChange={(e) => {
                onUpdate(entry.id, "isCurrent", e.target.checked);
                if (e.target.checked) {
                  onUpdate(entry.id, "endDate", "");
                }
              }}
            />
            <span className="text-sm text-slate-600">Currently working here</span>
          </label>
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Key Skills"
            placeholder="e.g., Python, AWS, React (comma-separated)"
            value={entry.keySkills}
            onChange={(e) => onUpdate(entry.id, "keySkills", e.target.value)}
            hint="Comma-separated list of skills used in this role"
          />
        </div>
      </div>
    </Card>
  );
}
