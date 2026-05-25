"use client";

import * as React from "react";
import { format } from "date-fns";
import { Bell, CheckCircle2, Clock, Info, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['resident-notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    }
  });

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'APPROVED': return { 
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, 
        title: "Request Approved",
        desc: "Your document has been approved and is now being processed."
      };
      case 'RELEASED': return { 
        icon: <FileText className="h-5 w-5 text-blue-500" />, 
        title: "Ready for Pickup",
        desc: "Your document is ready! Please visit the Barangay Hall to claim it."
      };
      case 'REJECTED': return { 
        icon: <Info className="h-5 w-5 text-red-500" />, 
        title: "Request Rejected",
        desc: "Your request was not approved. Check the remarks for more details."
      };
      default: return { 
        icon: <Clock className="h-5 w-5 text-yellow-500" />, 
        title: "Status Updated",
        desc: `Your request status changed to ${status}.`
      };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
          <Bell className="h-6 w-6 mr-2 text-blue-600" />
          Notifications
        </h1>
        <span className="text-sm text-slate-500">{notifications.length} Total</span>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-500">Fetching your updates...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Bell className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No notifications yet</h3>
            <p className="text-slate-500 mt-1">We'll notify you here when the status of your requests changes.</p>
          </div>
        ) : (
          notifications.map((notif: any) => {
            const info = getStatusInfo(notif.status);
            return (
              <div key={notif.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-300 transition-all group">
                <div className="flex gap-4">
                  <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-white">{info.title}</h3>
                      <span className="text-xs text-slate-400 font-medium">{format(new Date(notif.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      The status of your <span className="font-bold text-slate-900 dark:text-slate-200">{notif.request?.document?.name}</span> request has changed.
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border-l-4 border-blue-500">
                      {info.desc}
                    </p>
                    {notif.remarks && (
                      <p className="text-xs italic text-slate-400 mt-3 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Staff Remarks: "{notif.remarks}"
                      </p>
                    )}
                    <div className="mt-4 flex justify-end">
                      <Link href="/resident/requests">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center group-hover:translate-x-1 transition-all uppercase tracking-wider">
                          View My Requests
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}