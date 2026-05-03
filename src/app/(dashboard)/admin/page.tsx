"use client";

import * as React from "react";
import { Users, Clock, CheckCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(() => toast.error("Failed to load analytics"));
  }, []);

  if (!data) return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Admin Overview</h1>
      <p className="text-slate-500">Loading data...</p>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Admin Overview</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Residents */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/50">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Residents</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.totalResidents}</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/50">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Requests</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.pendingCount}</p>
          </div>
        </div>

        {/* Documents Released */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/50">
            <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Released</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.releasedCount}</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/50">
            <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">₱{data.totalRevenue}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
