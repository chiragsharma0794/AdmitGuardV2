// components/ui/Input.tsx
// A reusable labeled input component. Accepts a label, error message, and any
// native input props. Keeps form fields consistent across all steps.

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className, ...rest }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
        {rest.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={inputId}
        className={[
          "rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition",
          "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          error
            ? "border-red-400 bg-red-50"
            : "border-slate-300 bg-white hover:border-slate-400",
          className ?? "",
        ].join(" ")}
        {...rest}
      />
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
