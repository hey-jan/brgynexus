"use client";

import * as React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";
import { TrendingUp, FileBarChart2, Users, DollarSign } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING:  "#f59e0b",
  APPROVED: "#10b981",
  RELEASED: "#3b82f6",
  REJECTED: "#ef4444",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];

const CustomTooltipStyle = {
  borderRadius: "10px",
  border: "none",
  boxShadow: "0 4px 20px -2px rgb(0 0 0 / 0.12)",
  fontSize: "13px",
};

import { useQuery } from '@tanstack/react-query';

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-analytics-reports'],
    queryFn: async () => {
      const [analyticsRes, reportsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/reports")
      ]);
      if (!analyticsRes.ok || !reportsRes.ok) throw new Error("Failed to load analytics data");
      return {
        analytics: await analyticsRes.json(),
        reports: await reportsRes.json()
      };
    }
  });

  React.useEffect(() => {
    if (isError) toast.error("Failed to load analytics data");
  }, [isError]);

  const analytics = data?.analytics;
  const reports = data?.reports;

  // Enrich status chart with colors
  const statusChart = analytics?.statusChart?.map((s: any) => ({
    ...s,
    fill: STATUS_COLORS[s.name] ?? "#94a3b8",
  })) ?? [];

  // Document type breakdown (from reports)
  const docChart = reports?.summary
    ?.filter((d: any) => d.count > 0)
    ?.sort((a: any, b: any) => b.count - a.count) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileBarChart2 className="h-7 w-7 text-blue-600" />
          Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          In-depth breakdown of requests, revenue, and document trends.
        </p>
      </div>

      {/* Summary KPIs */}
      {!isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Residents",
              value: analytics.totalResidents,
              icon: Users,
              color: "text-blue-600",
              bg: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              label: "Docs Released",
              value: analytics.releasedCount,
              icon: FileBarChart2,
              color: "text-emerald-600",
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
            },
            {
              label: "Pending",
              value: analytics.pendingCount,
              icon: TrendingUp,
              color: "text-amber-600",
              bg: "bg-amber-50 dark:bg-amber-900/20",
            },
            {
              label: "Total Revenue",
              value: `₱${analytics.totalRevenue.toLocaleString()}`,
              icon: DollarSign,
              color: "text-purple-600",
              bg: "bg-purple-50 dark:bg-purple-900/20",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm"
            >
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {kpi.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Request Volume — 7 Days */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Request Volume
            </h2>
            <p className="text-xs text-slate-400 mb-5">New requests over the last 7 days</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.volumeChart} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Requests"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Request Status Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Request Status Distribution
            </h2>
            <p className="text-xs text-slate-400 mb-5">Breakdown of all request statuses</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChart} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                    {statusChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Document Types — by issuance count */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Most Requested Documents
            </h2>
            <p className="text-xs text-slate-400 mb-5">Total released count per document type</p>
            {docChart.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                No released documents yet.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={docChart}
                    margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={140} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Bar dataKey="count" name="Issued" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Revenue by Document Type — Pie */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Revenue by Document Type
            </h2>
            <p className="text-xs text-slate-400 mb-5">Fee collection per document category</p>
            {docChart.filter((d: any) => d.revenue > 0).length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                No revenue data yet.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={docChart.filter((d: any) => d.revenue > 0)}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {docChart
                        .filter((d: any) => d.revenue > 0)
                        .map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                      contentStyle={CustomTooltipStyle}
                      formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}