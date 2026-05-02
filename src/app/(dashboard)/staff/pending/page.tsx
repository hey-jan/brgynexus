"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Check, X, FileText } from "lucide-react";
import { toast } from "sonner";

export default function PendingRequestsPage() {
  const [requests, setRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests?status=PENDING');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      toast.error("Failed to load pending requests");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, remarks: `Request ${newStatus.toLowerCase()} by staff.` })
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Request ${newStatus.toLowerCase()} successfully`);
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error("Failed to process request");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pending Requests</h1>
      <p className="text-slate-500 mb-6">Review and approve document requests from residents.</p>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Resident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Date Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Purpose</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Loading pending requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    <Check className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
                    All caught up! No pending requests at the moment.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs dark:bg-blue-900/50 dark:text-blue-400">
                          {req.resident?.user?.firstName?.[0]}{req.resident?.user?.lastName?.[0]}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {req.resident?.user?.firstName} {req.resident?.user?.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{req.resident?.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900 dark:text-slate-100">
                        <FileText className="w-4 h-4 mr-2 text-slate-400" />
                        {req.document?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(req.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate" title={req.purpose}>
                      {req.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleAction(req.id, "APPROVED")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction(req.id, "REJECTED")}
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        >
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
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