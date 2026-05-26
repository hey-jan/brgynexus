"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";
import { FileText, Clock, DollarSign, Loader2, ChevronRight, ChevronDown, X, Check } from "lucide-react";

const STANDARD_PURPOSES = [
  "Employment Requirement",
  "Bank Requirement",
  "School/Scholarship Requirement",
  "Postal ID Application",
  "Medical Assistance",
  "Travel/Passport Requirement",
  "Others"
];

import { useQuery } from '@tanstack/react-query';

export default function RequestDocumentPage() {
  const router = useRouter();
  
  const { data: documents = [] } = useQuery({
    queryKey: ['resident-documents'],
    queryFn: async () => {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to load documents');
      return res.json();
    }
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [purposeType, setPurposeType] = React.useState("");
  const [selectedDocId, setSelectedDocId] = React.useState("");
  const [isDocModalOpen, setIsDocModalOpen] = React.useState(false);

  const selectedDoc = documents.find((d: any) => d.id === selectedDocId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedDocId) {
      toast.error("Please select a document type.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      let finalPurpose = data.purposeType;
      if (data.purposeType === "Others") {
        finalPurpose = data.customPurpose;
      }

      if (!finalPurpose || finalPurpose.toString().trim() === "") {
        toast.error("Please specify a purpose for your request.");
        setIsSubmitting(false);
        return;
      }

      const payload = { documentId: selectedDocId, purpose: finalPurpose };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit request");

      toast.success("Request submitted successfully!");
      router.push("/resident/requests");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="h-7 w-7 text-blue-600" />
          Request a Document
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Fill out the form below and our staff will review your request within 1–3 business days.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Document selector */}
          <div className="space-y-2">
            <label htmlFor="documentId" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Select Document Type
            </label>
            
            {/* Desktop Select */}
            <select
              id="documentId"
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="hidden md:block mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Choose a document type...</option>
              {documents.map((doc: any) => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>

            {/* Mobile Button Trigger */}
            <button
              type="button"
              onClick={() => setIsDocModalOpen(true)}
              className="md:hidden mt-1 w-full flex items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 text-left"
            >
              <span className={selectedDocId ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}>
                {selectedDocId ? documents.find((d: any) => d.id === selectedDocId)?.name : "Choose a document type..."}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Dynamic document info card */}
          {selectedDoc && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 p-4 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Fee</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedDoc.fee === 0 ? "Free" : `₱${selectedDoc.fee}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Processing</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedDoc.processingDays} {selectedDoc.processingDays === 1 ? "day" : "days"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Type</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Official</p>
                </div>
              </div>
              {selectedDoc.description && (
                <p className="col-span-3 text-xs text-blue-600 dark:text-blue-400 border-t border-blue-100 dark:border-blue-800/40 pt-3 mt-1">
                  {selectedDoc.description}
                </p>
              )}
            </div>
          )}

          {/* Purpose selector */}
          <div className="space-y-2">
            <label htmlFor="purposeType" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Purpose of Request
            </label>
            <select
              id="purposeType"
              name="purposeType"
              required
              value={purposeType}
              onChange={(e) => setPurposeType(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Select a purpose...</option>
              {STANDARD_PURPOSES.map(purpose => (
                <option key={purpose} value={purpose}>{purpose}</option>
              ))}
            </select>
          </div>

          {purposeType === "Others" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
              <label htmlFor="customPurpose" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Please specify your purpose
              </label>
              <Textarea
                id="customPurpose"
                name="customPurpose"
                rows={3}
                required
                placeholder="Briefly explain why you need this document..."
              />
            </div>
          )}

          <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Request
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Mobile Modal for Document Selection */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:hidden">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-full duration-300">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Select Document</h3>
              <button 
                type="button" 
                onClick={() => setIsDocModalOpen(false)} 
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1">
              {documents.map((doc: any) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setIsDocModalOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${
                    selectedDocId === doc.id 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {doc.name}
                  {selectedDocId === doc.id && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

