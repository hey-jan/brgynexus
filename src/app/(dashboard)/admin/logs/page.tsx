"use client";

import * as React from "react";
import { format } from "date-fns";
import { ShieldAlert, User, Clock, FileText, CheckCircle2, XCircle, Info } from "lucide-react";

import { useQuery } from '@tanstack/react-query';

export default function LogsPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const res = await fetch('/api/logs');
      if (!res.ok) throw new Error('Failed to fetch logs');
      return res.json();
    }
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'APPROVED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'RELEASED': return <Info className="w-5 h-5 text-blue-500" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
          <ShieldAlert className="h-6 w-6 mr-2 text-red-600" />
          System Audit Logs
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Track all status changes and administrative actions in the system.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No logs found.</div>
          ) : (
            logs.map((log: any) => (
              <div key={log.id} className="p-6 flex items-start space-x-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="mt-1">
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {log.request?.document?.name} request for <span className="text-blue-600 dark:text-blue-400">{log.request?.resident?.user?.firstName} {log.request?.resident?.user?.lastName}</span> was marked as <span className="font-bold">{log.status}</span>
                    </p>
                    <span className="text-xs text-slate-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-slate-500 space-x-4">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      Changed by: {log.changedBy?.firstName} {log.changedBy?.lastName || 'System'}
                    </span>
                    {log.remarks && (
                      <span className="flex items-center italic">
                        <Info className="h-3 w-3 mr-1" />
                        "{log.remarks}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}