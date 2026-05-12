import { Button } from "@/components/ui/Button";
import { FileText, Megaphone, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export default async function ResidentDashboard() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Barangay Announcements
            </h2>
          </div>
          
          {announcements.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <p className="text-slate-500">No new announcements from the barangay.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className={`bg-white rounded-xl border p-6 shadow-sm dark:bg-slate-900 ${
                    announcement.priority === 'EMERGENCY' ? 'border-red-300 dark:border-red-800/50 relative overflow-hidden' : 
                    announcement.priority === 'HIGH' ? 'border-orange-300 dark:border-orange-800/50 relative overflow-hidden' : 
                    'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {(announcement.priority === 'EMERGENCY' || announcement.priority === 'HIGH') && (
                    <div className={`absolute top-0 left-0 w-1 h-full ${announcement.priority === 'EMERGENCY' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      {announcement.priority === 'EMERGENCY' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                      {announcement.priority === 'HIGH' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                      {announcement.priority === 'NORMAL' && <Info className="w-5 h-5 text-blue-500" />}
                      {announcement.title}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed mb-4">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                    Posted by {announcement.author.firstName} {announcement.author.lastName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center sticky top-6">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 dark:bg-blue-900/50">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Need a document?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Request barangay clearances, indigency certificates, and more directly from your dashboard.
            </p>
            <Link href="/resident/request" className="w-full">
              <Button className="w-full">Request Document Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
