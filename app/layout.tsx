import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdmitGuard v2 — Admission Validation Platform",
  description:
    "A production-grade admission screening platform with backend validation, risk scoring, and Google Sheets reporting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
