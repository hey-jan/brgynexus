"use client";

import * as React from "react";
import { Clock, CheckCircle, FileBadge, QrCode, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function StaffDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["staff-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  const statCards = [
    {
      label: "Pending Review",
      value: stats?.pendingCount || 0,
      icon: Clock,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
      href: "/staff/pending",
    },
    {
      label: "Ready to Print",
      value: stats?.statusChart?.find((s: any) => s.name === 'APPROVED')?.value || 0,
      icon: FileBadge,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
      href: "/staff/generate",
    },
    {
      label: "Released Today",
      value: stats?.releasedCount || 0,
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
      href: "/staff/requests",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Staff Overview</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Welcome back! Here is what's happening in the Barangay today.</p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link 
            key={stat.label} 
            href={stat.href}
            className="group p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">Quick Verification</h2>
          <p className="text-slate-400 mb-6 max-w-md">
            Instantly verify a document's authenticity by scanning its QR code or entering the tracking number.
          </p>
          <Link href="/staff/verify">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center transition-all">
              <QrCode className="h-5 w-5 mr-2" />
              Open Scanner
            </button>
          </Link>
        </div>
        <QrCode className="absolute -right-12 -bottom-12 h-64 w-64 text-white/5 rotate-12" />
      </div>
    </div>
  );
}
