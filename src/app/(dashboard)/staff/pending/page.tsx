"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Check, X, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";

const STANDARD_PURPOSES = [
  "Employment Requirement",
  "Bank Requirement",
  "School/Scholarship Requirement",
  "Postal ID Application",
  "Medical Assistance",
  "Travel/Passport Requirement",
];

export default function PendingRequestsPage() {
  const [requests, setRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<any>(null);
  const [translatedPurpose, setTranslatedPurpose] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isCustomPurpose = selectedRequest ? !STANDARD_PURPOSES.includes(selectedRequest.purpose) : false;

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

  const openReviewModal = (req: any) => {
    setSelectedRequest(req);
    setTranslatedPurpose(req.translatedPurpose || '');
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedRequest(null);
    setTranslatedPurpose('');
  };

  const saveTranslatedPurpose = async (showToast = true) => {
    if (!selectedRequest) return false;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translatedPurpose })
      });
      if (!res.ok) throw new Error('Failed to save official purpose');
      if (showToast) toast.success('Official purpose saved successfully');
      fetchRequests();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (isCustomPurpose && translatedPurpose !== selectedRequest.translatedPurpose) {
      const saved = await saveTranslatedPurpose(false);
      if (!saved) return;
    }
    handleAction(selectedRequest.id, 'APPROVED');
    closeReviewModal();
  };

  const handleReject = async () => {
    if (isCustomPurpose && translatedPurpose !== selectedRequest.translatedPurpose) {
      const saved = await saveTranslatedPurpose(false);
      if (!saved) return;
    }
    handleAction(selectedRequest.id, 'REJECTED');
    closeReviewModal();
  };

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
                          {req.residentId ? (
                            `${req.resident?.user?.firstName?.[0] || ""}${req.resident?.user?.lastName?.[0] || ""}`
                          ) : (
                            req.guestName?.[0] || "G"
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {req.residentId ? `${req.resident?.user?.firstName} ${req.resident?.user?.lastName}` : req.guestName}
                            </span>
                            {req.resident?.residentType === 'PERMANENT' ? (
                              <span className="px-1.5 py-0.5 text-[9px] bg-green-100 text-green-700 rounded font-black border border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-900">
                                REGISTERED
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[9px] bg-rose-100 text-rose-700 rounded font-black border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900">
                                NON-REGISTERED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {req.residentId ? req.resident?.address : req.guestAddress}
                          </p>
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
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate" title={req.translatedPurpose || req.purpose}>
                      {req.translatedPurpose || req.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openReviewModal(req)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        Review & Process
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Request</h2>
              <p className="text-sm text-slate-500 mt-1">Review the resident's purpose and write the official purpose.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resident's Stated Purpose</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 min-h-[80px] whitespace-pre-wrap">
                  {selectedRequest.purpose}
                </div>
              </div>
              {isCustomPurpose && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Official Purpose</label>
                  <Textarea 
                    value={translatedPurpose}
                    onChange={(e) => setTranslatedPurpose(e.target.value)}
                    placeholder="Translate or formalize the purpose here..."
                    className="w-full min-h-[100px]"
                    disabled={isSubmitting || (selectedRequest.status !== 'PENDING' && selectedRequest.status !== 'APPROVED')}
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <Button variant="outline" onClick={closeReviewModal}>Cancel</Button>
              <div className="space-x-2 flex">
                {isCustomPurpose && (
                  <Button variant="outline" onClick={() => { saveTranslatedPurpose(); closeReviewModal(); }} disabled={isSubmitting}>
                    Save Draft
                  </Button>
                )}
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={handleReject} disabled={isSubmitting}>
                  Reject
                </Button>
                <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white border-green-600" onClick={handleApprove} disabled={isSubmitting}>
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}