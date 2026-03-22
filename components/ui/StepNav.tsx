// components/ui/StepNav.tsx
// The step progress indicator shown at the top of the form.
// It shows each step as a circle — completed (green check), active (blue), or upcoming (grey).
// This is purely a display component — it receives the current step and total step config.

"use client";

interface Step {
  label: string;
  description: string;
}

interface StepNavProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export function StepNav({ steps, currentStep }: StepNavProps) {
  return (
    <nav aria-label="Form progress" className="mb-8">
      <ol className="flex items-center gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <li key={step.label} className="flex flex-1 items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                    isCompleted
                      ? "border-blue-600 bg-blue-600 text-white"
                      : isActive
                      ? "border-blue-600 bg-white text-blue-600"
                      : "border-slate-300 bg-white text-slate-400",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    // Checkmark SVG
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-1.5 text-center">
                  <p
                    className={[
                      "text-xs font-medium",
                      isActive ? "text-blue-600" : isCompleted ? "text-slate-700" : "text-slate-400",
                    ].join(" ")}
                  >
                    {step.label}
                  </p>
                  <p className="hidden text-xs text-slate-400 sm:block">{step.description}</p>
                </div>
              </div>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={[
                    "mb-6 h-0.5 flex-1 transition-colors",
                    isCompleted ? "bg-blue-600" : "bg-slate-200",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
