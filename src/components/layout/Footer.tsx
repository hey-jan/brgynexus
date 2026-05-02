export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 dark:bg-slate-950 dark:border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-xl font-bold text-blue-600 tracking-tight">BrgyNexus</span>
          <p className="text-sm text-slate-500 mt-2 text-center md:text-left max-w-xs">
            Automating barangay services for a connected community.
          </p>
        </div>
        <div className="text-sm text-slate-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} BrgyNexus. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
