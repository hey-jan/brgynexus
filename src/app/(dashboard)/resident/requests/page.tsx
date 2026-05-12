"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { CreditCard, Download } from "lucide-react";

export default function MyRequestsPage() {
  const [requests, setRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [processingId, setProcessingId] = React.useState<string | null>(null);

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

  const handlePayment = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/requests/${id}/pay`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Payment failed');
      }
      toast.success('Payment successful! Document is now ready for download.');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
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
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Requests</h1>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Date Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Instructions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">Loading requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">You haven't made any requests yet.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                      <div>{req.document?.name}</div>
                      <div className="text-xs text-slate-500 font-normal truncate max-w-[200px]">{req.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(req.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {req.status === 'PENDING' && <span className="text-yellow-600 dark:text-yellow-500 text-xs font-medium">Waiting for staff review</span>}
                      {req.status === 'APPROVED' && (
                        <div className="space-y-2">
                          <span className="text-blue-600 dark:text-blue-400 text-xs font-medium block">Approved. Pending payment.</span>
                          <Button 
                            size="sm" 
                            onClick={() => handlePayment(req.id)}
                            disabled={processingId === req.id}
                            className="w-full text-xs"
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            {processingId === req.id ? 'Processing...' : 'Pay Online (Simulated)'}
                          </Button>
                        </div>
                      )}
                      {req.status === 'RELEASED' && (
                        <div className="space-y-2">
                          <span className="text-green-600 dark:text-green-400 text-xs font-medium block">Ready for Download!</span>
                          {req.issuedDocument?.qrCodeHash ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full text-xs border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-900/30"
                              onClick={() => window.open(`/api/documents/${req.issuedDocument.qrCodeHash}/pdf`, '_blank')}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download E-Document
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-500">Pick up at Barangay Hall</span>
                          )}
                        </div>
                      )}
                      {req.status === 'REJECTED' && <span className="text-red-600 dark:text-red-400 text-xs font-medium">Request denied. Contact Barangay.</span>}
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
