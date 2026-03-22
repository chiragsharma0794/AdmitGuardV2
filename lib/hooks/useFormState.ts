// lib/hooks/useFormState.ts
// Central form state hook for the multi-step application form.
// Holds all data across steps so navigating back and forth doesn't lose data.
//
// WHY A CUSTOM HOOK?
// React's useState is scoped to one component. A custom hook lets us declare
// the state once and pass it down to each step component — keeping state "lifted"
// to the page level and avoiding prop drilling through many layers.

"use client";

import { useState } from "react";
import type { EducationPath } from "@/lib/types/education";
import type { EmploymentType } from "@/lib/types/work";

// ─── Applicant Fields ──────────────────────────────────────────────────────────
export interface ApplicantFormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  aadhaarNumber: string;
  interviewStatus: string;
  offerLetterSent: boolean;
}

// ─── Education Record Fields ───────────────────────────────────────────────────
export interface EducationFormData {
  id: string; // client-only UUID for list key management
  level: string;
  boardUniversity: string;
  stream: string;
  yearOfPassing: string; // string in form, converted to number on submit
  scoreValue: string;
  scoreScale: string;
  backlogCount: string;
  gapAfterLevelMonths: string;
  pathTag: EducationPath;
}

// ─── Work Experience Fields ────────────────────────────────────────────────────
export interface WorkFormData {
  id: string; // client-only UUID for list key management
  companyName: string;
  designation: string;
  domain: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  employmentType: EmploymentType | "";
  keySkills: string; // comma-separated string in form, split to array on submit
}

// ─── Full Form State ───────────────────────────────────────────────────────────
export interface FormState {
  applicant: ApplicantFormData;
  educationPath: EducationPath;
  education: EducationFormData[];
  work: WorkFormData[];
}

// Default empty values for each education record
export function emptyEducation(path: EducationPath, level = ""): EducationFormData {
  return {
    id: crypto.randomUUID(),
    level,
    boardUniversity: "",
    stream: "",
    yearOfPassing: "",
    scoreValue: "",
    scoreScale: "percentage",
    backlogCount: "0",
    gapAfterLevelMonths: "0",
    pathTag: path,
  };
}

// Default empty values for a work experience entry
export function emptyWork(): WorkFormData {
  return {
    id: crypto.randomUUID(),
    companyName: "",
    designation: "",
    domain: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    employmentType: "",
    keySkills: "",
  };
}

const defaultApplicant: ApplicantFormData = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  aadhaarNumber: "",
  interviewStatus: "not_scheduled",
  offerLetterSent: false,
};

// The hook itself — call this in the page and pass down what each step needs.
export function useFormState() {
  const [formState, setFormState] = useState<FormState>({
    applicant: defaultApplicant,
    educationPath: "A",
    education: [],
    work: [],
  });

  // ─── Applicant updater ──────────────────────────────────────────────────────
  function updateApplicant(field: keyof ApplicantFormData, value: string | boolean) {
    setFormState((prev) => ({
      ...prev,
      applicant: { ...prev.applicant, [field]: value },
    }));
  }

  // ─── Education path selector ────────────────────────────────────────────────
  // When the path changes, reset education records to match the new path's mandatory levels.
  function setEducationPath(path: EducationPath) {
    setFormState((prev) => ({
      ...prev,
      educationPath: path,
      // Reset education when path changes — avoids stale records for wrong path
      education: [],
    }));
  }

  // ─── Education record updaters ──────────────────────────────────────────────
  function addEducation(record: EducationFormData) {
    setFormState((prev) => ({
      ...prev,
      education: [...prev.education, record],
    }));
  }

  function updateEducation(id: string, field: keyof EducationFormData, value: string) {
    setFormState((prev) => ({
      ...prev,
      education: prev.education.map((rec) =>
        rec.id === id ? { ...rec, [field]: value } : rec
      ),
    }));
  }

  function removeEducation(id: string) {
    setFormState((prev) => ({
      ...prev,
      education: prev.education.filter((rec) => rec.id !== id),
    }));
  }

  // ─── Work experience updaters ───────────────────────────────────────────────
  function addWork() {
    setFormState((prev) => ({
      ...prev,
      work: [...prev.work, emptyWork()],
    }));
  }

  function updateWork(id: string, field: keyof WorkFormData, value: string | boolean) {
    setFormState((prev) => ({
      ...prev,
      work: prev.work.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      ),
    }));
  }

  function removeWork(id: string) {
    setFormState((prev) => ({
      ...prev,
      work: prev.work.filter((entry) => entry.id !== id),
    }));
  }

  return {
    formState,
    updateApplicant,
    setEducationPath,
    addEducation,
    updateEducation,
    removeEducation,
    addWork,
    updateWork,
    removeWork,
  };
}
