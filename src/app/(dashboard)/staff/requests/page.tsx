"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function StaffRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<any>(null);
  const [translatedPurpose, setTranslatedPurpose] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchRequests = () => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setIsLoading(false);
      });
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
    if (translatedPurpose !== selectedRequest.translatedPurpose) {
      const saved = await saveTranslatedPurpose(false);
      if (!saved) return;
    }
    updateStatus(selectedRequest.id, 'APPROVED');
    closeReviewModal();
  };

  const handleReject = async () => {
    if (translatedPurpose !== selectedRequest.translatedPurpose) {
      const saved = await saveTranslatedPurpose(false);
      if (!saved) return;
    }
    updateStatus(selectedRequest.id, 'REJECTED');
    closeReviewModal();
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks: `Status updated to ${status} by staff.` })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Request marked as ${status}`);
      fetchRequests(); // Refresh table
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'RELEASED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">All Resident Requests</h1>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Loading requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">No requests found.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {req.resident?.user?.firstName} {req.resident?.user?.lastName}
                      {req.source === 'KIOSK' && (
                        <span className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-md font-black border border-blue-200">
                          KIOSK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {req.document?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(req.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 mr-2" onClick={() => openReviewModal(req)}>
                        {req.status === 'PENDING' ? 'Review & Process' : 'View Details'}
                      </Button>
                      {req.status === 'APPROVED' && (
                        <Button size="sm" variant="default" onClick={() => router.push('/staff/generate')}>Generate PDF</Button>
                      )}
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
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <Button variant="outline" onClick={closeReviewModal}>Cancel</Button>
              <div className="space-x-2 flex">
                {(selectedRequest.status === 'PENDING' || selectedRequest.status === 'APPROVED') && (
                  <Button variant="outline" onClick={() => { saveTranslatedPurpose(); closeReviewModal(); }} disabled={isSubmitting}>
                    Save Draft
                  </Button>
                )}
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={handleReject} disabled={isSubmitting}>
                      Reject
                    </Button>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white border-green-600" onClick={handleApprove} disabled={isSubmitting}>
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
