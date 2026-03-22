# AdmitGuard v2 — Architecture

## System Overview

AdmitGuard v2 is a four-layer admission validation platform:

```
[Browser] → [Next.js Frontend] → [POST /api/applications] → [Validation Engine]
                                                                    ↓
                                                          [Intelligence Layer]
                                                                    ↓
                                                         [Persistence Layer]
                                                               ↓         ↓
                                                       [Google Sheets]  [Local JSON]
```

---

## Stack Decisions

| Choice | Reason |
|---|---|
| Next.js 15 | One repo for frontend and backend API routes; no separate server to manage |
| TypeScript | Strong typing prevents runtime errors in a data-heavy system |
| Zod | Schemas are readable and serve as documentation + runtime validators |
| Tailwind CSS | Utility-first keeps styling co-located with components |
| Google Sheets | Shared, human-readable reporting without setting up a database |
| Vercel | Zero-config deployment, environment variables UI, no ops overhead |

---

## Validation Architecture

### Tier 1 — Hard Reject
**Where:** `lib/validation/tier1.ts`  
**When:** Before the record is saved — ever.  
**Effect:** Returns HTTP 422 with field-level errors. Nothing is written.

Rules include:
- Missing mandatory fields
- Age < 18 at submission time
- Invalid phone or Aadhaar format
- Duplicate email or phone
- Impossible chronology (e.g. 12th year < 10th year)
- Score outside allowed range for the stated scale
- Invalid education path rules

### Tier 2 — Soft Flags
**Where:** `lib/validation/tier2.ts`  
**When:** After Tier 1 passes. Record is saved but marked `FLAGGED`.  
**Effect:** Returns HTTP 200 with `status: "FLAGGED"` and a list of flags.

Rules include:
- Education gap > 24 months
- Backlog count > 0
- Normalized score < 50%
- Career gap > 6 months
- More than 3 domain switches
- Stale profile (no work or education in 3+ years)

### Tier 3 — Enrichment
**Where:** `lib/intelligence/` modules  
**When:** After Tier 2. Computed before persistence.  
**Effect:** Adds derived metadata to the saved record.

Outputs:
- Normalized score (all scales → percentage)
- Total experience + experience bucket
- Completeness percentage
- Risk score
- Categorization
- Anomaly flags

---

## Intelligence Layer

### Risk Score (0–100)

Starts at 0. Penalties are added for risk factors. Clamped to [0, 100].

| Factor | Penalty |
|---|---|
| Education gap > 24 months | +15 |
| Per active backlog | +8 |
| Normalized score < 50% | +10 |
| Career gap > 6 months | +12 |
| Per domain switch beyond 1 | +5 |
| Stale profile | +10 |
| Weak work relevance | +8 |

All penalty values are in `lib/config/thresholds.ts`.

### Categorization

| Risk Score Range | Category |
|---|---|
| 0–30 | Strong Fit |
| 31–65 | Needs Review |
| 66–100 | Weak Fit |

### Data Quality Score (0–100)

Starts at 100. Deductions for missing or thin data:
- Missing stream: -5
- Board name too short: -5
- Missing key skills in work entries: -5
- etc.

### Anomaly Flags (string list)

Detected patterns:
- `overqualified_for_track` — PhD applying to entry-level program
- `too_many_short_stints` — 3+ jobs each < 6 months
- `too_many_domain_switches` — domain changed more than 3 times
- `suspicious_chronology` — dates that technically pass but look unusual

---

## Data Model

See `lib/types/` for full TypeScript interfaces.

```
Applicant
  │
  ├── EducationRecord[]   (one per level: 10th, 12th, Diploma, etc.)
  │
  ├── WorkExperience[]    (zero or more)
  │
  └── DerivedAssessment   (computed server-side after submission)
```

---

## Education Paths

| Path | Sequence | Notes |
|---|---|---|
| A | 10th → 12th → UG → (PG) | Standard. 12th is mandatory before UG. |
| B | 10th → Diploma → (UG lateral) → (PG) | 12th optional/skippable. |
| C | 10th → ITI → Diploma → (UG) → (PG) | Vocational track. |

---

## API Contract

See `docs/api-contract.md` for full request/response shapes.

---

## File Responsibility Map

| File | Responsible For |
|---|---|
| `lib/config/thresholds.ts` | All numeric rule values — edit here to change business rules |
| `lib/config/rules.ts` | Education path rules and chronological order constraints |
| `lib/schemas/submission.ts` | Zod parsing of the full request body |
| `lib/validation/tier1.ts` | Hard reject logic |
| `lib/validation/tier2.ts` | Soft flag logic |
| `lib/intelligence/riskScore.ts` | Risk score formula |
| `lib/intelligence/categorization.ts` | Category assignment |
| `lib/persistence/sheets.ts` | Google Sheets row writes |
| `app/api/applications/route.ts` | Main submission endpoint — orchestrates the above |
