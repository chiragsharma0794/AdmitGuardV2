// components/confirmation/ConfirmationScreen.tsx
// Shows the full assessment result after a successful submission.
//
// Displays: categorization badge, risk score gauge, data quality score,
// experience bucket, flags, anomalies, and risk penalty breakdown.
//
// This replaces the raw JSON view from M2 with a human-readable dashboard.

"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ConfirmationProps {
  result: {
    success: boolean;
    status: string;
    applicantId: string;
    flags: string[];
    derived: {
      totalEducationGapMonths: number;
      totalWorkExperienceMonths: number;
      relevantExperienceMonths: number;
      experienceBucket: string;
      applicationCompletenessPercent: number;
      domainSwitchCount: number;
      riskScore: number;
      riskPenalties: { reason: string; points: number }[];
      dataQualityScore: number;
      dataQualityDeductions: { reason: string; points: number }[];
      categorization: string;
      anomalyFlags: string[];
      softFlags: string[];
      validationStatus: string;
    };
  };
  onNewApplication: () => void;
}

export function ConfirmationScreen({ result, onNewApplication }: ConfirmationProps) {
  const { derived } = result;

  return (
    <div className="space-y-6">
      {/* ── Header Banner ── */}
      <div className={`rounded-xl p-6 border ${getCategoryStyle(derived.categorization)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-70 mb-1">
              Assessment Result
            </p>
            <h2 className="text-2xl font-bold">{derived.categorization}</h2>
            <p className="text-sm opacity-80 mt-1">
              {getCategoryDescription(derived.categorization)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-60 mb-1">Application ID</p>
            <code className="text-xs font-mono">{result.applicantId.slice(0, 8)}…</code>
          </div>
        </div>
      </div>

      {/* ── Score Cards Row ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScoreCard
          label="Risk Score"
          value={derived.riskScore}
          max={100}
          colorFn={riskColor}
          description="Higher = more risk"
        />
        <ScoreCard
          label="Data Quality"
          value={derived.dataQualityScore}
          max={100}
          colorFn={qualityColor}
          description="Higher = more complete"
        />
        <ScoreCard
          label="Completeness"
          value={derived.applicationCompletenessPercent}
          max={100}
          colorFn={qualityColor}
          description="Fields filled"
        />
      </div>

      {/* ── Experience Summary ── */}
      <Card title="Experience Summary">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
          <Stat label="Experience Bucket" value={derived.experienceBucket} />
          <Stat label="Total Work" value={`${derived.totalWorkExperienceMonths} months`} />
          <Stat label="Relevant Work" value={`${derived.relevantExperienceMonths} months`} />
          <Stat label="Education Gap" value={`${derived.totalEducationGapMonths} months`} />
        </div>
      </Card>

      {/* ── Risk Breakdown ── */}
      {derived.riskPenalties.length > 0 && (
        <Card title="Risk Score Breakdown">
          <div className="space-y-2">
            {derived.riskPenalties.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm rounded-lg bg-red-50 px-3 py-2">
                <span className="text-slate-700">{p.reason}</span>
                <span className="font-semibold text-red-600">+{p.points}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm font-bold border-t border-slate-200 pt-2 mt-2">
              <span>Total Risk Score</span>
              <span className={riskColor(derived.riskScore)}>{derived.riskScore}/100</span>
            </div>
          </div>
        </Card>
      )}

      {/* ── Data Quality Deductions ── */}
      {derived.dataQualityDeductions.length > 0 && (
        <Card title="Data Quality Deductions">
          <div className="space-y-2">
            {derived.dataQualityDeductions.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm rounded-lg bg-amber-50 px-3 py-2">
                <span className="text-slate-700">{d.reason}</span>
                <span className="font-semibold text-amber-600">−{d.points}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm font-bold border-t border-slate-200 pt-2 mt-2">
              <span>Final Data Quality</span>
              <span className={qualityColor(derived.dataQualityScore)}>{derived.dataQualityScore}/100</span>
            </div>
          </div>
        </Card>
      )}

      {/* ── Flags & Anomalies ── */}
      {(derived.softFlags.length > 0 || derived.anomalyFlags.length > 0) && (
        <Card title="Flags & Anomalies">
          <div className="space-y-2">
            {derived.softFlags.map((f, i) => (
              <div key={`sf-${i}`} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 shrink-0">
                  Flag
                </span>
                <span className="text-slate-700">{f}</span>
              </div>
            ))}
            {derived.anomalyFlags.map((a, i) => (
              <div key={`an-${i}`} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 shrink-0">
                  Anomaly
                </span>
                <span className="text-slate-700">{a}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex justify-center pt-4">
        <Button onClick={onNewApplication}>
          ← Submit Another Application
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreCard({
  label,
  value,
  max,
  colorFn,
  description,
}: {
  label: string;
  value: number;
  max: number;
  colorFn: (v: number) => string;
  description: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-xs font-medium text-slate-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorFn(value)}`}>{value}</p>
      <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(colorFn(value))}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 capitalize">{value}</p>
    </div>
  );
}

// ─── Color utilities ─────────────────────────────────────────────────────────

function riskColor(score: number): string {
  if (score <= 30) return "text-green-600";
  if (score <= 65) return "text-amber-600";
  return "text-red-600";
}

function qualityColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getBarColor(textColor: string): string {
  if (textColor.includes("green")) return "bg-green-500";
  if (textColor.includes("amber")) return "bg-amber-500";
  return "bg-red-500";
}

function getCategoryStyle(cat: string): string {
  switch (cat) {
    case "Strong Fit":
      return "bg-green-50 border-green-200 text-green-800";
    case "Needs Review":
      return "bg-amber-50 border-amber-200 text-amber-800";
    case "Weak Fit":
      return "bg-red-50 border-red-200 text-red-800";
    default:
      return "bg-slate-50 border-slate-200 text-slate-800";
  }
}

function getCategoryDescription(cat: string): string {
  switch (cat) {
    case "Strong Fit":
      return "Minimal risk factors detected. Recommended for admission.";
    case "Needs Review":
      return "Some concerns flagged. Manual review recommended.";
    case "Weak Fit":
      return "Significant risk factors. Requires special justification.";
    default:
      return "";
  }
}
