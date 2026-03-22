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

> *To be filled after Milestone 1 is complete.*

---

## Milestone 2 — Backend Validation Engine

> *To be filled after Milestone 2 is complete.*

---

## Milestone 3 — Intelligence Layer

> *To be filled after Milestone 3 is complete.*

---

## Milestone 4 — Persistence & Reporting

> *To be filled after Milestone 4 is complete.*

---

## Milestone 5 — Polish & Deployment

> *To be filled after Milestone 5 is complete.*
