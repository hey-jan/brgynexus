export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Admin Overview</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 animate-pulse" />
            <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
