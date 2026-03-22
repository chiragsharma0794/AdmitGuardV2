export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 border border-blue-200">
          🎓 AdmitGuard v2
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Admission Validation Platform
        </h1>
        <p className="text-lg text-slate-500">
          Milestone 0 scaffold is ready. The application shell, domain types,
          validation config, and documentation are in place.
        </p>
        <p className="text-sm text-slate-400">
          Next: Milestone 1 — App Shell &amp; Input Layer
        </p>
      </div>
    </main>
  );
}
