"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Search, CheckCircle, XCircle, FileText, Calendar, User } from "lucide-react";
import { format } from "date-fns";

export default function VerifyDashboardPage() {
  const [docNumber, setDocNumber] = React.useState("");
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) return;
    
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/documents/verify?documentNumber=${encodeURIComponent(docNumber.trim())}`);
      if (!res.ok) {
        throw new Error("Document not found or invalid.");
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Manual Verification</h1>
      <p className="text-slate-500 mb-8">Enter the tracking number printed on the certificate to verify its authenticity.</p>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder="e.g. BRGY-2026-X8F2A"
            className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono uppercase"
          />
          <Button type="submit" disabled={isLoading} className="flex items-center">
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? "Searching..." : "Verify"}
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Invalid Document</h2>
          <p className="text-red-600 dark:text-red-300">
            The tracking number <strong>{docNumber}</strong> does not exist in our system. This document is not authentic.
          </p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Authentic Document</h2>
            <p className="text-green-600 dark:text-green-300 font-mono mt-2">Tracking No: {result.documentNumber}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-lg border border-green-100 dark:border-green-800/50">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Document Type
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {result.request.document.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                <User className="w-4 h-4 mr-2" /> Issued To
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {result.request.resident
                  ? `${result.request.resident.user.firstName} ${result.request.resident.user.lastName}`
                  : (result.request.guestName ?? "Unknown Guest")}
              </p>
            </div>
            <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-2" /> Date of Issue
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {format(new Date(result.issuedDate), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}