# AdmitGuard v2

> An admission validation platform with backend validation, risk scoring, and Google Sheets reporting.

## What is this?

AdmitGuard v2 is a full-stack admission screening platform built with:
- **Next.js 15 + TypeScript** — one repo, one deployment surface
- **Zod** — explicit schema-based server-side validation
- **Tailwind CSS** — responsive UI
- **Google Sheets API** — persistent reporting sink
- **Vercel** — deployment target

It validates applicant data through three tiers (hard reject → soft flag → enrichment), computes a risk score and categorization, and writes records to Google Sheets.

---

## Project Structure

```
AdmitGuardV2/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/
│   │   └── applications/   # POST /api/applications — main submission endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/             # UI components (added in Milestone 1)
│   ├── applicant/
│   ├── education/
│   ├── work/
│   └── ui/
├── lib/
│   ├── config/             # Business rules and thresholds (edit here, not in logic)
│   │   ├── rules.ts        # Education path rules
│   │   └── thresholds.ts   # All numeric business thresholds
│   ├── schemas/            # Zod validation schemas
│   │   ├── applicant.ts
│   │   ├── education.ts
│   │   ├── work.ts
│   │   └── submission.ts
│   ├── types/              # TypeScript domain types
│   │   ├── applicant.ts
│   │   ├── education.ts
│   │   ├── work.ts
│   │   └── assessment.ts
│   ├── validation/         # Tier 1 and Tier 2 validation logic (Milestone 2)
│   ├── intelligence/       # Risk scoring, categorization, anomaly detection (Milestone 3)
│   └── persistence/        # Sheets connector and local fallback (Milestone 4)
├── docs/
│   ├── architecture.md
│   ├── learning-log.md
│   ├── test-cases.md
│   └── api-contract.md
├── .env.example
└── README.md
```

---

## Setup (under 5 minutes)

### Prerequisites
- Node.js 18+
- npm 9+

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/AdmitGuardV2.git
cd AdmitGuardV2

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Google Sheets credentials

# 4. Start development server
npm run dev
# App runs at http://localhost:3000
```

---

## Environment Variables

See `.env.example` for the full list. The critical ones are:

| Variable | Purpose |
|---|---|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | The ID of your Google Sheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | Service account private key |

---

## Milestones

| Milestone | Status |
|---|---|
| M0: Design & Scaffolding | ✅ Complete |
| M1: App Shell & Input Layer | 🔜 Next |
| M2: Backend Validation Engine | ⏳ Planned |
| M3: Intelligence Layer | ⏳ Planned |
| M4: Persistence & Reporting | ⏳ Planned |
| M5: Polish & Deployment | ⏳ Planned |

---

## Docs

- [Architecture](docs/architecture.md)
- [Learning Log](docs/learning-log.md)
- [Test Cases](docs/test-cases.md)
- [API Contract](docs/api-contract.md)
