# AdmitGuard v2 — Learning Log

This file is updated after each milestone. Its purpose is to record what was built, what concepts you should understand, and what to experiment with.

---

## Milestone 0 — Design & Scaffolding

### What was built
- Next.js 15 project with TypeScript and Tailwind CSS
- Core domain types in `lib/types/`
- Zod validation schemas in `lib/schemas/`
- Business rule config in `lib/config/`
- Documentation skeleton

### Concept: Why separate types from schemas?

TypeScript **types** (in `lib/types/`) describe the shape of data *after* it has been processed.
Zod **schemas** (in `lib/schemas/`) describe how to *parse and validate* incoming raw data.

They look similar but serve different purposes:
- Types are erased at compile time — they only exist in your editor and the TypeScript compiler.
- Zod schemas exist at runtime — they actually run code to check the incoming value.

This is why we have both. You use Zod schemas at the API boundary, and TypeScript types everywhere inside the system.

### Concept: Why centralize thresholds?

If the rule "flag education gaps > 24 months" is hardcoded in the validator file, you have to hunt through code to change it. By putting all thresholds in `lib/config/thresholds.ts`, you can change any business rule in one place and the entire system updates.

This is called **configuration-driven design** — separating the *what* (the rule values) from the *how* (the logic that applies them).

### Concept: Why use education paths instead of one form?

Indian education has multiple valid sequences. A student who did a Diploma doesn't need a 12th standard. A student who did ITI before a Diploma has a different path. If you showed the same rigid form to all applicants, either:
- you'd ask for fields that don't apply (confusing), or
- you'd miss required fields for some applicants (incorrect).

Path-aware forms solve this cleanly.

### Common mistakes to avoid
- Don't put validation logic directly in UI components. Keep it server-side.
- Don't scatter rule values through multiple files. Always use `lib/config/thresholds.ts`.
- Don't skip the `normalizedPercentage` step. CGPA 8/10 ≠ 80% in all scoring systems.

### What to try yourself
- Open `lib/config/thresholds.ts` and change `SCORE_SOFT_FLAG_THRESHOLD` from 50 to 40. Understand which part of the system this will affect in Milestone 2.
- Read `lib/config/rules.ts` and trace what happens for a Path B applicant who has a 12th record. Is it mandatory? Optional? Rejected?

---

## Milestone 1 — App Shell & Input Layer

### What was built
- Multi-step form with 4 steps: Applicant → Education → Work → Review
- Reusable UI primitives: `Input`, `Select`, `Button`, `Card`, `StepNav`
- Central form state hook: `useFormState.ts`
- Path-adaptive education records (fields change based on level)
- Dynamic add/remove for education and work entries
- Read-only review step with masked Aadhaar

### Concept: Lifting State Up

In React, each component manages its own state. In a multi-step form, if each step had its own state, navigating back would lose data. The solution is **lifting state up**: declare all state in the parent (`app/page.tsx`) via a custom hook (`useFormState`), then pass down only what each step needs.

This pattern is core React — understand it well before moving on.

### Concept: Config-Driven UI

The `EducationStep` component reads `LEVELS_WITH_BACKLOGS` and `LEVELS_WITH_STREAM` from `lib/config/rules.ts` to decide which fields to show. This means:
- The UI and the backend validation use the **same config**.
- If you add a new level later, you update the config once and both layers adapt.

### Concept: Form Data ≠ API Data

In the form, `yearOfPassing` is a *string* (because `<input>` values are always strings). At submission time, we convert it to a *number* before sending it to the API. This conversion happens in `handleSubmit()` in `page.tsx`. The Zod schema on the server expects numbers, so this step is critical.

### Lesson learned: Tailwind v3 vs v4

We discovered that `npm install tailwindcss` installs v3.4.x, but `@tailwindcss/postcss` requires v4. Mixing them causes build failures. Stick with one version — we're using **v3** with the classic `@tailwind base/components/utilities` directives.

### What to try yourself
- Open `lib/config/rules.ts` and add `"12th"` to `LEVELS_WITH_BACKLOGS`. Refresh the Education step and see if the backlog field appears for 12th records.
- Try selecting Path B and adding a 10th + Diploma record. Notice that 12th is marked optional.

---

### What was built
- `POST /api/applications` route — the main submission endpoint
- 3-tier validation pipeline: Zod parsing → Tier 1 hard reject → Tier 2 soft flags → Tier 3 enrichment
- Score normalization (percentage/CGPA/grade → 0–100)
- Local JSON persistence (`data/applications.json`) with duplicate detection
- 40 unit tests across 3 test suites (helpers, tier1, tier2)

### Concept: Tiered Validation

Validation happens in layers, each with a different purpose:

| Tier | Purpose | Failure Behavior |
|------|---------|-----------------|
| Zod Schema | Structural — missing fields, wrong types | 422, reject |
| Tier 1 | Business rules — age, duplicates, chronology | 422, reject |
| Tier 2 | Advisory — gaps, low scores, staleness | Save with FLAGGED status |
| Tier 3 | Enrichment — normalize scores, compute metrics | Always runs (after T1) |

**Why not one big validator?** Because each tier has different failure behavior. Separating them makes the code easier to reason about and test independently.

### Concept: Field-Level Error Paths

Instead of returning a generic "validation failed" message, the API returns a map of `field.path → error message`. For example:
```json
{ "applicant.dateOfBirth": "Applicant must be at least 18 years old. Current age: 16." }
```
This lets the frontend highlight the exact field that failed — much better UX than a single error banner.

### Concept: Score Normalization

CGPA 8.0/10 and 80% are the same thing. But CGPA 3.2/4 = 80% too. The `normalizeScore()` function converts all scales to a 0–100 percentage. This is used for:
- Fair comparison across education records
- Risk score computation (Milestone 3)
- Soft flag thresholds (`SCORE_SOFT_FLAG_THRESHOLD: 50`)

### What to try yourself
- Run `npm test` and read the test output. Each test name describes a business rule.
- Try changing `THRESHOLDS.MIN_AGE_YEARS` to 21 and run tests — which ones break?
- Open `data/applications.json` after submitting a form and study the saved structure.

---

## Milestone 3 — Intelligence Layer

> *To be filled after Milestone 3 is complete.*

---

## Milestone 4 — Persistence & Reporting

> *To be filled after Milestone 4 is complete.*

---

## Milestone 5 — Polish & Deployment

> *To be filled after Milestone 5 is complete.*
