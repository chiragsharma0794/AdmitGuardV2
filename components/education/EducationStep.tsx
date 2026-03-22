// components/education/EducationStep.tsx
// Step 2: Education path selector + dynamic education records.
//
// KEY DESIGN DECISION: The form adapts based on the selected path (A, B, or C).
// When a path is selected, we pre-populate the mandatory levels for that path
// so the applicant knows exactly which records are required.
//
// The LEVELS_WITH_BACKLOGS and LEVELS_WITH_STREAM config from lib/config/rules.ts
// controls which fields appear for each level — keeping the UI rules and backend
// rules in the same config rather than duplicating them.

"use client";

import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EDUCATION_PATH_RULES, LEVELS_WITH_BACKLOGS, LEVELS_WITH_STREAM } from "@/lib/config/rules";
import type { EducationPath } from "@/lib/types/education";
import type { EducationFormData } from "@/lib/hooks/useFormState";
import { emptyEducation } from "@/lib/hooks/useFormState";

interface EducationStepProps {
  educationPath: EducationPath;
  education: EducationFormData[];
  onPathChange: (path: EducationPath) => void;
  onAdd: (record: EducationFormData) => void;
  onUpdate: (id: string, field: keyof EducationFormData, value: string) => void;
  onRemove: (id: string) => void;
}

const PATH_OPTIONS = [
  { value: "A", label: "Path A — Standard (10th → 12th → UG)" },
  { value: "B", label: "Path B — Diploma (10th → Diploma → UG, 12th optional)" },
  { value: "C", label: "Path C — Vocational (10th → ITI → Diploma → UG)" },
];

const LEVEL_OPTIONS = [
  { value: "10th", label: "10th Standard" },
  { value: "12th", label: "12th / HSC" },
  { value: "Diploma", label: "Diploma" },
  { value: "ITI", label: "ITI / Vocational" },
  { value: "UG", label: "Undergraduate (UG)" },
  { value: "PG", label: "Postgraduate (PG)" },
  { value: "PhD", label: "PhD / Doctorate" },
];

const SCALE_OPTIONS = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "cgpa_10", label: "CGPA out of 10" },
  { value: "cgpa_4", label: "CGPA out of 4" },
  { value: "grade", label: "Grade (A/B/C...)" },
];

export function EducationStep({
  educationPath,
  education,
  onPathChange,
  onAdd,
  onUpdate,
  onRemove,
}: EducationStepProps) {
  const pathRules = EDUCATION_PATH_RULES[educationPath];

  function handlePathChange(newPath: EducationPath) {
    onPathChange(newPath);
  }

  function addRecord(level = "") {
    onAdd(emptyEducation(educationPath, level));
  }

  return (
    <div className="space-y-6">
      {/* ── Path Selector ── */}
      <Card
        title="Education Path"
        description="Select the path that best describes the applicant's education sequence. This determines which records are mandatory."
      >
        <Select
          label="Education Path"
          id="educationPath"
          required
          value={educationPath}
          onChange={(e) => handlePathChange(e.target.value as EducationPath)}
          options={PATH_OPTIONS}
        />

        {/* Show what this path requires */}
        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">
            {pathRules.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {pathRules.mandatory.map((lvl) => (
              <span
                key={lvl}
                className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white"
              >
                {lvl} (required)
              </span>
            ))}
            {pathRules.optional.map((lvl) => (
              <span
                key={lvl}
                className="rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-medium text-slate-600"
              >
                {lvl} (optional)
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Education Records ── */}
      {education.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500 mb-4">
            No education records added yet. Add at least 10th details to begin.
          </p>
          <Button variant="secondary" onClick={() => addRecord("10th")}>
            + Add 10th Record
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((rec, index) => (
            <EducationRecordCard
              key={rec.id}
              record={rec}
              index={index}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      {/* Add another level button */}
      {education.length > 0 && (
        <Button variant="secondary" onClick={() => addRecord()}>
          + Add Education Level
        </Button>
      )}
    </div>
  );
}

// ─── Sub-component: one education record card ──────────────────────────────────
interface EducationRecordCardProps {
  record: EducationFormData;
  index: number;
  onUpdate: (id: string, field: keyof EducationFormData, value: string) => void;
  onRemove: (id: string) => void;
}

function EducationRecordCard({ record, index, onUpdate, onRemove }: EducationRecordCardProps) {
  // Determine which optional fields to show based on the selected level
  const showBacklogs = LEVELS_WITH_BACKLOGS.includes(record.level as never);
  const showStream = LEVELS_WITH_STREAM.includes(record.level as never);

  function update(field: keyof EducationFormData, value: string) {
    onUpdate(record.id, field, value);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Education Record #{index + 1}
          {record.level && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {record.level}
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={() => onRemove(record.id)}
          className="text-xs text-red-500 hover:text-red-700 transition"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Education Level"
          required
          value={record.level}
          onChange={(e) => update("level", e.target.value)}
          options={LEVEL_OPTIONS}
          placeholder="Select level..."
        />

        <Input
          label="Board / University"
          required
          placeholder="e.g., CBSE, Mumbai University"
          value={record.boardUniversity}
          onChange={(e) => update("boardUniversity", e.target.value)}
        />

        {showStream && (
          <Input
            label="Stream / Specialization"
            placeholder="e.g., Science, Computer Science"
            value={record.stream}
            onChange={(e) => update("stream", e.target.value)}
          />
        )}

        <Input
          label="Year of Passing"
          required
          type="number"
          placeholder="2020"
          min={1980}
          max={new Date().getFullYear()}
          value={record.yearOfPassing}
          onChange={(e) => update("yearOfPassing", e.target.value)}
          hint="Must be between 1980 and current year"
        />

        <Input
          label="Score"
          required
          type="number"
          step="0.01"
          placeholder="85"
          value={record.scoreValue}
          onChange={(e) => update("scoreValue", e.target.value)}
        />

        <Select
          label="Score Scale"
          required
          value={record.scoreScale}
          onChange={(e) => update("scoreScale", e.target.value)}
          options={SCALE_OPTIONS}
        />

        {showBacklogs && (
          <Input
            label="Backlog Count"
            type="number"
            min={0}
            value={record.backlogCount}
            onChange={(e) => update("backlogCount", e.target.value)}
            hint="Enter 0 if no backlogs"
          />
        )}

        <Input
          label="Gap After This Level (months)"
          type="number"
          min={0}
          value={record.gapAfterLevelMonths}
          onChange={(e) => update("gapAfterLevelMonths", e.target.value)}
          hint="Months before the next education or job started"
        />
      </div>
    </Card>
  );
}
