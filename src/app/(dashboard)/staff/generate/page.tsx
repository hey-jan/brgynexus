"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { FileText, Printer, Loader2, FileBadge } from "lucide-react";
import { toast } from "sonner";

export default function GenerateDocumentsPage() {
  const [requests, setRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState<string | null>(null);

  const fetchApprovedRequests = () => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data.filter((req: any) => req.status === 'APPROVED'));
        setIsLoading(false);
      });
  };

  React.useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const handleGenerate = async (id: string, residentName: string, docName: string) => {
    setIsGenerating(id);
    try {
      const res = await fetch(`/api/documents/generate/${id}`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate document');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docName.replace(/\s+/g, '_')}_${residentName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Document generated and downloaded!');
      fetchApprovedRequests();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Printer className="h-7 w-7 text-blue-600" />
          Generate Documents
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          These requests have been approved and are ready to be printed and released.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Resident</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Document</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Approved Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading approved requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <FileBadge className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500">No approved requests</p>
                    <p className="text-xs text-slate-400 mt-1">Approved requests will appear here once staff reviews them.</p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const residentName = req.residentId
                    ? `${req.resident?.user?.firstName ?? ""} ${req.resident?.user?.lastName ?? ""}`.trim()
                    : (req.guestName ?? "Guest");
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                            {residentName[0] ?? "?"}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{residentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <FileText className="w-4 h-4 mr-2 text-slate-400" />
                          {req.document?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {format(new Date(req.updatedAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          onClick={() => handleGenerate(req.id, residentName, req.document?.name ?? "document")}
                          disabled={isGenerating === req.id}
                          className="flex items-center gap-2 ml-auto"
                        >
                          {isGenerating === req.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Printer className="w-4 h-4" />
                              Generate PDF
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}