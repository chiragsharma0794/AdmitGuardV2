// components/ui/Card.tsx
// A simple white card container used to wrap each form section.

import React from "react";

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
        className ?? "",
      ].join(" ")}
    >
      {title && (
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
