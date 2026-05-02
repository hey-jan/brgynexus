import { Button } from "@/components/ui/Button";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function ResidentDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Dashboard</h1>
      
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 dark:bg-blue-900/50">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Need a document?</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          Request barangay clearances, indigency certificates, and more directly from your dashboard.
        </p>
        <Link href="/resident/request">
          <Button>Request Document Now</Button>
        </Link>
      </div>
    </div>
  );
}
