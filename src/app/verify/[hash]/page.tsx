import prisma from "@/lib/prisma";
import { CheckCircle, XCircle, FileText, Calendar, User, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default async function VerifyPage({ params }: { params: Promise<{ hash: string }> }) {
  const resolvedParams = await params;
  
  const document = await prisma.issuedDocument.findUnique({
    where: { qrCodeHash: resolvedParams.hash },
    include: {
      request: {
        include: {
          document: true,
          resident: {
            include: {
              user: true,
            }
          }
        }
      }
    }
  });

  if (!document) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
          <div className="bg-red-600 p-8 text-center">
            <XCircle className="w-20 h-20 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white tracking-tight">INVALID DOCUMENT</h1>
            <p className="text-red-100 mt-2 font-medium">Warning: Potential Forgery</p>
          </div>
          <div className="p-8 text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto opacity-50" />
            <p className="text-slate-600">
              The QR code scanned does not exist in the Barangay Nexus database. 
              This document is not authentic or has been tampered with.
            </p>
            <div className="pt-4">
              <Link href="/" className="text-blue-600 hover:underline font-medium">
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const resName = `${document.request.resident.user.firstName} ${document.request.resident.user.lastName}`;
  const docName = document.request.document.name;
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
        <div className="bg-green-500 p-8 text-center">
          <div className="relative">
             <div className="absolute inset-0 bg-green-400 animate-ping rounded-full opacity-20"></div>
             <CheckCircle className="w-20 h-20 text-white mx-auto mb-4 relative z-10" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AUTHENTIC</h1>
          <p className="text-green-100 mt-2 font-medium">Verified by Barangay Nexus</p>
        </div>
        
        <div className="p-8">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Document Type
              </p>
              <p className="text-lg font-semibold text-slate-900">{docName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                <User className="w-4 h-4 mr-2" /> Issued To
              </p>
              <p className="text-lg font-semibold text-slate-900">{resName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-2" /> Date of Issue
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {format(new Date(document.issuedDate), "MMMM d, yyyy")}
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">Tracking Number</p>
              <p className="text-sm font-mono text-slate-700">{document.documentNumber}</p>
            </div>
          </div>
          
          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
              Powered by BrgyNexus System
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
