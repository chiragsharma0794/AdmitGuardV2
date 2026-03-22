// lib/persistence/localStore.ts
// Simple JSON-file-based local storage for development.
// This is the fallback when Google Sheets is not configured.
//
// WHY: During development, you don't want to require Google credentials
// just to test validation. This writes to data/applications.json.
// In production, the persistence layer switches to Google Sheets.

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "applications.json");

interface StoredApplication {
  applicantId: string;
  email: string;
  phone: string;
  submittedAt: string;
  data: unknown;
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAll(): StoredApplication[] {
  ensureDir();
  if (!fs.existsSync(FILE_PATH)) return [];
  const raw = fs.readFileSync(FILE_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(records: StoredApplication[]) {
  ensureDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify(records, null, 2), "utf-8");
}

/** Get all existing emails (for duplicate check in Tier 1) */
export function getExistingEmails(): Set<string> {
  return new Set(readAll().map((r) => r.email.toLowerCase()));
}

/** Get all existing phones (for duplicate check in Tier 1) */
export function getExistingPhones(): Set<string> {
  return new Set(readAll().map((r) => r.phone));
}

/** Save a new validated application to local storage */
export function saveApplication(record: StoredApplication): void {
  const all = readAll();
  all.push(record);
  writeAll(all);
}

/** Get all stored applications (for reporting) */
export function getAllApplications(): StoredApplication[] {
  return readAll();
}
