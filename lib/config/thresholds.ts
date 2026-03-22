// lib/config/thresholds.ts
// Central configuration for all numeric thresholds used in validation and intelligence.
// EDIT THIS FILE to change business rules without touching validation logic code.

export const THRESHOLDS = {
  // ─── Applicant ───────────────────────────────────────────────
  MIN_AGE_YEARS: 18,
  FULL_NAME_MIN_LENGTH: 2,

  // ─── Education Gap ────────────────────────────────────────────
  // Soft flag if total education gap exceeds this value
  EDUCATION_GAP_SOFT_FLAG_MONTHS: 24,

  // ─── Score ────────────────────────────────────────────────────
  // Normalized percentage below which a soft flag is raised
  SCORE_SOFT_FLAG_THRESHOLD: 50,
  // CGPA scales supported
  CGPA_10_MAX: 10,
  CGPA_4_MAX: 4,
  PERCENTAGE_MAX: 100,

  // ─── Backlogs ────────────────────────────────────────────────
  // Any backlog > 0 triggers a soft flag
  BACKLOG_SOFT_FLAG_COUNT: 0,

  // ─── Work Experience ─────────────────────────────────────────
  // Soft flag if a single career gap exceeds this
  CAREER_GAP_SOFT_FLAG_MONTHS: 6,
  // Soft flag if no work and graduation was this long ago
  STALE_PROFILE_MONTHS: 36,
  // Soft flag if more than N domain switches
  MAX_DOMAIN_SWITCHES: 3,

  // ─── Risk Score Penalties ────────────────────────────────────
  // These add to the risk score (0–100)
  RISK_PENALTY_LARGE_EDU_GAP: 15,       // education gap > EDUCATION_GAP_SOFT_FLAG_MONTHS
  RISK_PENALTY_PER_ACTIVE_BACKLOG: 8,   // per backlog unit
  RISK_PENALTY_LOW_SCORE: 10,           // normalized score below SCORE_SOFT_FLAG_THRESHOLD
  RISK_PENALTY_LARGE_CAREER_GAP: 12,    // career gap > CAREER_GAP_SOFT_FLAG_MONTHS
  RISK_PENALTY_PER_DOMAIN_SWITCH: 5,    // per domain switch beyond 1
  RISK_PENALTY_STALE_PROFILE: 10,       // no recent education or work
  RISK_PENALTY_WEAK_WORK_RELEVANCE: 8,  // relevantExperienceMonths < 20% of total

  // ─── Categorization Thresholds ───────────────────────────────
  STRONG_FIT_MAX_RISK: 30,   // riskScore <= this → Strong Fit
  NEEDS_REVIEW_MAX_RISK: 65, // riskScore <= this → Needs Review (else Weak Fit)

  // ─── Data Quality Deductions ─────────────────────────────────
  DQ_DEDUCTION_MISSING_PHONE: 10,
  DQ_DEDUCTION_MISSING_STREAM: 5,
  DQ_DEDUCTION_MISSING_SKILLS: 5,
  DQ_DEDUCTION_BOARD_TOO_SHORT: 5,   // board/university name < 3 chars

  // ─── Experience Buckets ───────────────────────────────────────
  EXPERIENCE_BUCKET_ENTRY_MAX: 24,   // months: 1–24 = entry
  EXPERIENCE_BUCKET_MID_MAX: 60,     // months: 25–60 = mid
  EXPERIENCE_BUCKET_SENIOR_MAX: 120, // months: 61–120 = senior
} as const;
