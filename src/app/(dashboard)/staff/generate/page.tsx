"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { FileText } from "lucide-react";
import { toast } from "sonner";

export default function GenerateDocumentsPage() {
  const [requests, setRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState<string | null>(null);

  const fetchApprovedRequests = () => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        // Only show APPROVED requests
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
      
      // Download the PDF Blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docName.replace(/\s+/g, '_')}_${residentName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Document generated successfully!');
      fetchApprovedRequests(); // Refresh table
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Generate Documents</h1>
      <p className="text-slate-500 mb-6">The following requests have been APPROVED and are ready to be printed and released.</p>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Approved Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">Loading approved requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">No approved requests waiting for generation.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                      {req.resident?.user?.firstName} {req.resident?.user?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {req.document?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(req.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        onClick={() => handleGenerate(req.id, `${req.resident?.user?.firstName} ${req.resident?.user?.lastName}`, req.document?.name)}
                        disabled={isGenerating === req.id}
                        className="flex items-center space-x-2"
                      >
                        {isGenerating === req.id ? (
                          <>Generating...</>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate PDF
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}