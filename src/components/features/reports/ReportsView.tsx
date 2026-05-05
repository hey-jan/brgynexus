"use client";

import * as React from "react";
import { 
  BarChart, 
  Download, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Printer, 
  ArrowRight,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";

export function ReportsView() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/reports")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Generating report...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load report data.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart className="h-8 w-8 text-blue-600" />
            System Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Insights and issuance summaries for Barangay Nexus.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex">
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            ₱{data.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-2">All-time collected document fees</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Documents Issued</p>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {data.totalIssued}
          </p>
          <p className="text-xs text-slate-400 mt-2">Total certificates released</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Current Period</p>
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {format(new Date(), "MMMM yyyy")}
          </p>
          <p className="text-xs text-slate-400 mt-2">Showing all-time data breakdown</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Document Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Issuance by Category</h3>
            <Button variant="ghost" size="sm" className="text-xs h-8">View All</Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.summary.map((item: any) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.count} Issued</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">₱{item.revenue.toLocaleString()}</p>
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${(item.revenue / (data.totalRevenue || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logs (Logbook Style) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Recent Issuance Log
              <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">Real-time</span>
            </h3>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Filter className="h-3 w-3 mr-1" /> Filter
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-left">
                  <th className="px-6 py-3 font-semibold">Resident</th>
                  <th className="px-6 py-3 font-semibold">Document</th>
                  <th className="px-6 py-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recentIssuances.map((iss: any) => (
                  <tr key={iss.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{iss.residentName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{iss.documentName}</td>
                    <td className="px-6 py-4 text-right text-slate-400 group-hover:text-blue-600 transition-colors">
                      {format(new Date(iss.date), "MMM d, h:mm a")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-center">
            <button className="text-sm text-blue-600 font-semibold hover:underline flex items-center justify-center gap-1 mx-auto">
              Open Full Logbook <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
