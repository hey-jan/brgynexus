"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { CreditCard, Loader2, FileText, AlertTriangle, CheckCircle, Clock, XCircle, FileBadge } from "lucide-react";
import Link from "next/link";

import { useQuery } from '@tanstack/react-query';

export default function MyRequestsPage() {
  const { data: requests = [], isLoading, refetch: fetchRequests } = useQuery({
    queryKey: ['resident-requests'],
    queryFn: async () => {
      const res = await fetch('/api/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    }
  });

  const { data: profile } = useQuery({
    queryKey: ['resident-profile-check'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    }
  });

  const profileIncomplete = React.useMemo(() => {
    if (!profile) return false;
    const addr = profile?.residentProfile?.address;
    const phone = profile?.phone;
    return (!phone || addr === "Pending Update" || !addr);
  }, [profile]);

  const [processingId, setProcessingId] = React.useState<string | null>(null);



  const handlePayment = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/requests/${id}/pay`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Payment failed');
      }
      toast.success('Payment successful! Document is now ready for pickup at the Barangay Hall.');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        );
      case 'RELEASED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <FileBadge className="h-3 w-3" /> Released
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="h-7 w-7 text-blue-600" />
          My Requests
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track the status of all your document requests.</p>
      </div>

      {/* Incomplete profile banner */}
      {profileIncomplete && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 animate-in fade-in duration-300">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Your profile is incomplete</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Please update your address and phone number so your documents are issued correctly.
            </p>
          </div>
          <Link href="/resident/profile">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 shrink-0">
              Update Profile
            </Button>
          </Link>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Document</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Date Requested</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Next Step</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading your requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <FileText className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500">No requests yet</p>
                    <p className="text-xs text-slate-400 mt-1">Your document requests will appear here once submitted.</p>
                    <Link href="/resident/request" className="inline-block mt-4">
                      <Button size="sm">Request a Document</Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{req.document?.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">{req.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(req.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {req.status === 'PENDING' && (
                        <span className="text-yellow-600 dark:text-yellow-500 text-xs font-medium">
                          Waiting for staff review
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <div className="space-y-2">
                          <span className="text-green-600 dark:text-green-400 text-xs font-medium block">
                            Approved — proceed to payment
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handlePayment(req.id)}
                            disabled={processingId === req.id}
                            className="flex items-center gap-1.5"
                          >
                            {processingId === req.id ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</>
                            ) : (
                              <><CreditCard className="w-3 h-3" /> Pay Online (Simulated)</>
                            )}
                          </Button>
                        </div>
                      )}
                      {req.status === 'RELEASED' && (
                        <div>
                          <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold block">✓ Ready for Pickup</span>
                          <span className="text-xs text-slate-500 mt-0.5 block">Claim at the Barangay Hall</span>
                        </div>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="text-red-600 dark:text-red-400 text-xs font-medium">
                          Request denied. Contact the Barangay.
                        </span>
                      )}
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
