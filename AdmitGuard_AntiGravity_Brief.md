# AdmitGuard — AntiGravity Build Brief

## What this document is for
This file is the single handoff brief for AntiGravity to start building **AdmitGuard v2**.

It combines:
1. the original Week 1 AdmitGuard prototype scope, and
2. the v2 sprint enhancement brief.

The goal is **not** to ask AntiGravity for a one-shot full code dump.
The goal is to make AntiGravity work like a strong pair programmer and tutor so I can **learn by building this project myself**.

---

## Operating mode for AntiGravity
You are not just a code generator.
You are acting as:
- a senior full stack engineer,
- a systems designer,
- a backend validation engineer,
- and a mentor who explains decisions clearly.

### How you must work
1. **Work incrementally, not all at once.**
   Do not generate the full app in one response.
2. **Start with a plan and architecture.**
   Before heavy coding, propose the repo structure, stack, data flow, and milestones.
3. **Teach while building.**
   Every major change must include:
   - what changed,
   - why it was needed,
   - what alternatives were considered,
   - and what I should understand from it.
4. **Prefer clean, readable code over clever code.**
5. **Keep business rules explicit and traceable.**
   Validation rules must live in a dedicated config/rules layer, not be scattered across the UI.
6. **Server-side validation is mandatory.**
   Client-side validation is only for UX.
7. **Do not hide important logic in magic abstractions.**
   Keep the project understandable for a learner.
8. **After each milestone, stop and summarize.**
   Tell me:
   - which files were added or changed,
   - how to run the project,
   - what to test manually,
   - and what I learned in that milestone.
9. **Use comments sparingly but meaningfully.**
   Add comments only where they improve understanding.
10. **If you make assumptions, state them clearly.**

### Development workflow expected from you
For every milestone:
1. explain the plan,
2. make the code changes,
3. run or suggest validation steps,
4. list edge cases covered,
5. show known limitations,
6. suggest the next milestone.

---

## Project context

### v1 problem statement
The original AdmitGuard project was a lightweight admission data validation and compliance system meant to replace unstructured Excel or Google Sheet entry with a form-based workflow.

Core v1 ideas:
- validate candidate data during entry,
- enforce strict and soft rules,
- support exception rationales,
- maintain an audit trail,
- keep rules configurable,
- keep the prototype lightweight and easy to share.

### Why v2 exists
The feedback on v1 was that it behaved too much like a front-end form and not enough like a real admission validation platform.

v2 must therefore become a **real data platform** with four layers:
1. **Input Layer**
2. **Validation Engine**
3. **Intelligence Layer**
4. **Persistent Storage and Reporting Layer**

This project is now closer to a production-grade admission screening platform than a UI prototype.

---

## Final product goal
Build **AdmitGuard v2**, a deployable admission validation platform that:
- captures applicant data through a contextual front end,
- validates it on the backend,
- computes intelligence outputs like risk score and categorization,
- writes validated records to persistent storage,
- and is understandable enough that I can explain the full system in a review or viva.

---

## Primary success criteria
The system should let a reviewer do this:
1. open a live URL,
2. submit an application,
3. see dynamic education path handling,
4. have invalid data rejected by backend rules,
5. have valid-but-risky data flagged,
6. receive risk scoring and categorization,
7. and see the record appear in Google Sheets or equivalent reporting storage.

---

## Learning-first constraints
This is extremely important.

I do **not** want a black box build.
I want to learn by working on it.

### Therefore you must
- explain architecture before implementation,
- explain each module in plain language,
- keep business rules visible and easy to edit,
- show validation logic in a way I can trace end to end,
- use a project structure that teaches good engineering habits,
- and leave the project in a state where I can extend it myself.

### For every major file you create, explain
- what the file is responsible for,
- what inputs it takes,
- what outputs it produces,
- and how it interacts with the rest of the system.

### Also maintain learner-facing docs during the build
Create and keep updated:
- `README.md`
- `docs/architecture.md`
- `docs/learning-log.md`
- `docs/test-cases.md`
- `.env.example`

`docs/learning-log.md` should be updated after each milestone with:
- what was built,
- what concept I should understand,
- what common mistakes to avoid,
- and what to try changing myself.

---

## Recommended implementation approach
Unless there is a strong reason to do otherwise, use this stack.

### Preferred stack
- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Backend:** Next.js server actions or API routes for server-side validation
- **Validation:** Zod or a similarly explicit schema-based approach
- **Storage:** Google Sheets integration as primary reporting sink
- **Optional local persistence for development:** JSON or SQLite
- **Deployment:** Vercel for app deployment

### Why this stack
- one repo,
- one deployment surface,
- clean separation between UI and backend logic,
- easy server-side validation,
- strong TypeScript learning value,
- deployable without managing multiple services early.

### Acceptable fallback
If Google Sheets API setup becomes too heavy early in the sprint, use a staged approach:
1. local persistence for development,
2. Google Sheets integration next,
3. then deploy the final connected version.

But the final target should still include live reporting to Google Sheets or an equivalent shared reporting destination.

---

## Product scope

### In scope
1. Context-aware applicant intake form
2. Indian education path handling
3. Work experience module
4. Backend validation engine
5. Risk scoring and categorization
6. Data quality or anomaly scoring
7. Persistent storage to Google Sheets
8. Audit and reporting views
9. Deployment to a public URL
10. Documentation good enough for evaluator review

### Out of scope for now
- full authentication and role-based access control,
- multi-tenant institutional rule administration UI,
- actual offer letter generation,
- advanced ML training on historical data,
- production-grade observability,
- enterprise security hardening beyond sensible prototype standards.

---

## Functional requirements to implement

### 1. Input Layer
Build a contextual applicant intake system.

#### Core applicant fields
- Full Name
- Email
- Phone
- Date of Birth
- Aadhaar Number
- Interview Status
- Offer Letter Sent flag should **not** imply offer issuance from this platform

#### Education history module
Support these levels:
- 10th
- 12th
- Diploma
- ITI
- UG
- PG
- PhD

Each education entry should capture:
- level,
- board or university,
- stream or specialization,
- year of passing,
- score,
- score scale,
- backlog count where applicable,
- gap after this level in months.

#### Education path behavior
Support at least:
- **Path A:** 10th -> 12th -> UG -> PG/Work
- **Path B:** 10th -> Diploma -> UG (lateral possible) -> PG/Work
- **Path C:** 10th -> ITI/Vocational -> Diploma -> UG -> PG/Work

The form must adapt based on the path selected.
Examples:
- if Diploma path is chosen, 12th may become optional,
- if standard path is chosen, 12th is mandatory before UG,
- backlog fields should only appear for relevant levels,
- stream/specialization should only appear where relevant.

### 2. Work Experience Module
Capture one or more work experience entries.

Each entry should include:
- company name,
- designation,
- domain or industry,
- start date,
- end date or present,
- employment type,
- key skills used.

Derived values should include:
- total work experience in months,
- domain-relevant experience in months,
- career gap between jobs,
- current employment status.

### 3. Validation Engine
This is the heart of the platform.
All validation must happen **server-side**.

#### Tier 1: hard reject
Reject and do not save if any of these fail:
- missing mandatory applicant fields,
- missing 10th details,
- duplicate application by email or phone,
- impossible chronology,
- age < 18 at application time,
- score outside allowed range,
- invalid phone or Aadhaar,
- invalid education path rules,
- impossible work dates.

#### Tier 2: soft flag
Allow save, but mark for review if any of these occur:
- total education gap > 24 months,
- backlog count > 0,
- score below threshold,
- more than 3 career transitions across unrelated domains,
- no work experience and more than 3 years since last education,
- career gap > 6 months,
- data inconsistencies that are not fatal.

#### Tier 3: enrichment
Attach computed metadata before persistence:
- normalized scores,
- total experience,
- experience bucket,
- application completeness percentage,
- risk score,
- categorization,
- anomaly flags,
- validation status.

### 4. Intelligence Layer
Implement at least **two** intelligence features that generate quantitative or explicit outputs.

#### Required intelligence feature 1: applicant risk score
Create a programmatic risk score from 0 to 100.

Suggested starting logic:
- start at 0,
- add penalty points for:
  - large education gap,
  - active backlogs,
  - low normalized score,
  - large career gaps,
  - many domain switches,
  - weak work relevance,
  - stale profile with no recent education or work evidence,
- clamp between 0 and 100.

Document the scoring formula clearly so I can explain why a candidate got a given score.

#### Required intelligence feature 2: applicant categorization
Categorize into one of:
- `Strong Fit`
- `Needs Review`
- `Weak Fit`

This must be computed from validation flags, normalized scores, experience, and/or risk score.
Do not hardcode arbitrary labels without logic.

#### Preferred intelligence feature 3: data quality score
Compute a data quality score based on:
- completeness,
- consistency,
- field normalization success,
- missing optional but important information,
- mismatch patterns.

#### Preferred intelligence feature 4: anomaly flags
Examples:
- overqualified profile for entry-level track,
- too many short job stints,
- too many unrelated transitions,
- suspicious chronology pattern.

### 5. Reporting and persistence
Persist validated records to a shared reporting layer.

#### Preferred implementation
Use Google Sheets as the reporting sink.

#### Sheet must include
- raw applicant fields,
- normalized and derived fields,
- validation status,
- flag list,
- risk score,
- categorization,
- submission timestamp.

#### Bonus
A summary sheet with:
- total applications,
- risk distribution,
- applications per day,
- average normalized scores,
- education path distribution.

---

## Business rules to preserve from v1 where still relevant
These should still exist where applicable, but now as part of the backend validation strategy.

### Strict rules from v1
- full name required, min length 2, no numbers,
- valid and unique email,
- valid unique Indian mobile number,
- valid Aadhaar format,
- interview status rules,
- offer letter state logic should remain consistent with business meaning,
- rejected candidates should not move through enrollment workflow.

### Soft-rule idea from v1
v1 allowed exception handling with rationale.

For v2, do **not** center the product around a front-end only exception toggle system.
Instead:
- retain the concept of soft review conditions,
- record the reason for flags and manual review needs,
- and keep the platform enterprise-oriented rather than form-gimmick oriented.

If a manual override or review rationale is added later, design the backend so it can support it cleanly.

---

## Suggested data model
Use a clear domain model.

### Applicant
- applicantId
- fullName
- email
- phone
- dateOfBirth
- aadhaarNumber
- interviewStatus
- applicationTimestamp

### EducationRecord[]
- level
- boardUniversity
- stream
- yearOfPassing
- scoreValue
- scoreScale
- normalizedPercentage
- backlogCount
- gapAfterLevelMonths
- pathTag

### WorkExperience[]
- companyName
- designation
- domain
- startDate
- endDate
- isCurrent
- employmentType
- keySkills[]
- tenureMonths

### DerivedAssessment
- totalEducationGapMonths
- totalWorkExperienceMonths
- relevantExperienceMonths
- experienceBucket
- applicationCompletenessPercent
- riskScore
- dataQualityScore
- categorization
- anomalyFlags[]
- softFlags[]
- validationStatus

---

## Suggested repo structure
Use something close to this unless you have a stronger proposal.

```text
admitguard-v2/
├── app/
│   ├── page.tsx
│   ├── api/
│   │   ├── applications/route.ts
│   │   └── health/route.ts
├── components/
│   ├── applicant/
│   ├── education/
│   ├── work/
│   ├── review/
│   └── ui/
├── lib/
│   ├── config/
│   │   ├── rules.ts
│   │   └── thresholds.ts
│   ├── schemas/
│   │   ├── applicant.ts
│   │   ├── education.ts
│   │   ├── work.ts
│   │   └── submission.ts
│   ├── validation/
│   │   ├── tier1.ts
│   │   ├── tier2.ts
│   │   ├── normalization.ts
│   │   └── helpers.ts
│   ├── intelligence/
│   │   ├── riskScore.ts
│   │   ├── categorization.ts
│   │   ├── dataQuality.ts
│   │   └── anomalyDetection.ts
│   ├── persistence/
│   │   ├── sheets.ts
│   │   └── localStore.ts
│   └── types/
├── docs/
│   ├── architecture.md
│   ├── learning-log.md
│   ├── test-cases.md
│   └── api-contract.md
├── tests/
│   ├── validation/
│   ├── intelligence/
│   └── integration/
├── public/
├── README.md
├── .env.example
└── package.json
```

---

## Non-functional requirements
- deployable to a public URL,
- mobile usable,
- loading states present,
- helpful error handling,
- no hardcoded secrets,
- clear README with setup in under 5 minutes,
- modular code,
- no fake backend behavior in the final version.

---

## Build strategy AntiGravity should follow

### Milestone 0: design before build
Before writing feature code, do these first:
1. propose final stack and justify it,
2. generate repo structure,
3. write `README.md` skeleton,
4. write `docs/architecture.md`,
5. define core domain types,
6. define validation config and thresholds,
7. define API contract for submission payload and response shape.

**Do not skip this milestone.**

### Milestone 1: app shell and input layer
Build:
- home page,
- applicant details section,
- education path selector,
- dynamic education records section,
- work experience section,
- review/submit step.

At this stage focus on UI structure and payload shape.
Do not pretend the platform is complete.

### Milestone 2: backend validation engine
Implement:
- submission endpoint,
- tier 1 validation,
- tier 2 flagging,
- score normalization,
- structured field-level error responses.

Also add unit tests for core validators.

### Milestone 3: intelligence layer
Implement:
- risk scoring,
- categorization,
- data quality or anomaly detection,
- confirmation screen showing derived outputs.

### Milestone 4: persistence and reporting
Implement:
- Google Sheets connector,
- row mapping,
- fallback local persistence for development,
- reporting or audit view,
- summary analytics if time permits.

### Milestone 5: polish and deployment
Implement:
- mobile responsiveness,
- loading and error states,
- health route,
- environment variable safety,
- deployment,
- final README,
- test cases and screenshots.

---

## Testing expectations
AntiGravity must generate and/or suggest concrete tests.

### Minimum manual personas
1. **Diploma-path student**
   - 10th + Diploma + UG
   - no 12th
   - should validate correctly if chronology is valid

2. **Experienced professional**
   - UG + 5 years work experience
   - includes one 8-month job gap
   - should save with flags where appropriate

3. **Fresher with weak profile**
   - recent UG
   - low score
   - no work experience
   - should be categorized appropriately

### Minimum edge cases
- duplicate email,
- duplicate phone,
- age < 18,
- percentage > 100,
- CGPA out of allowed range,
- 12th year earlier than 10th year,
- overlapping work entries,
- negative tenure,
- Aadhaar invalid,
- phone invalid,
- too many unrelated domain switches.

### Expected backend response shape
For failed validation, return structured JSON like:

```json
{
  "success": false,
  "errors": {
    "education[1].yearOfPassing": "Year of passing must be later than the previous education level.",
    "phone": "Phone number must be a valid 10-digit Indian mobile number."
  },
  "flags": []
}
```

For accepted but flagged validation:

```json
{
  "success": true,
  "status": "FLAGGED",
  "flags": [
    "Education gap exceeds 24 months",
    "Career gap exceeds 6 months"
  ],
  "derived": {
    "riskScore": 68,
    "categorization": "Needs Review"
  }
}
```

---

## How I want explanations from you
When you complete a milestone, summarize using exactly this format:

### What we built
- ...

### Why this matters
- ...

### Files added or changed
- ...

### How the flow works now
- ...

### What I should understand
- ...

### What to test manually
- ...

### Known limitations
- ...

### Next recommended step
- ...

---

## Code quality expectations
- use descriptive names,
- separate business rules from rendering logic,
- keep helpers small,
- avoid giant components,
- avoid giant route handlers,
- write reusable validators,
- centralize thresholds and rule config,
- keep data mapping to Sheets explicit and auditable.

---

## Documentation requirements
By the end, the repo must include:
- architecture diagram or architecture markdown,
- setup instructions,
- environment variables list,
- deployment steps,
- test cases,
- screenshots,
- explanation of intelligence scoring,
- explanation of validation layers,
- known limitations and next steps.

---

## Suggested first output from AntiGravity
Start by doing only the following:
1. propose the final stack,
2. propose the repo structure,
3. define the domain model,
4. define the validation architecture,
5. define the intelligence strategy,
6. generate the initial scaffolding,
7. create the documentation skeleton,
8. then stop and explain everything before moving to the next milestone.

Do **not** jump straight into full feature implementation in the first pass.

---

## Suggested first prompt I can paste into AntiGravity
Use the text below as the starting instruction if needed.

```md
You are my senior full stack pair programmer and mentor.
We are building AdmitGuard v2, an admission validation platform.
I want to learn by building this, so do not behave like a black box code generator.
Work incrementally and explain each major decision.

Read the project brief in this repository and then do only Milestone 0 first:
1. propose the stack with reasoning,
2. propose the repo structure,
3. define the domain model,
4. define validation tiers,
5. define the intelligence layer strategy,
6. scaffold the initial project,
7. create README.md, docs/architecture.md, docs/learning-log.md, docs/test-cases.md, and .env.example,
8. then stop and explain what you created, why, and what I should understand before we move on.

Important constraints:
- server-side validation is mandatory,
- rules must be centralized and easy to edit,
- code must be readable and modular,
- the system must support Indian education pathways,
- the system must include work experience,
- the system must compute at least two intelligence outputs,
- the final version must persist validated applications to Google Sheets,
- no hardcoded secrets,
- explain every major file you create.
```

---

## Definition of done
This project is done when:
- the app is deployed,
- a reviewer can submit multiple applicant types,
- the backend correctly rejects invalid data,
- the backend flags risky but acceptable data,
- intelligence outputs are visible and explainable,
- records persist to Google Sheets,
- and I can confidently explain the architecture, validation flow, and scoring logic.

---

## Final instruction to AntiGravity
Optimize for **clarity, correctness, modularity, and learning value**.
Treat this project like a real product, but teach me as we build it.
