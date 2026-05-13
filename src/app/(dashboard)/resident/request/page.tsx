"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";

const STANDARD_PURPOSES = [
  "Employment Requirement",
  "Bank Requirement",
  "School/Scholarship Requirement",
  "Postal ID Application",
  "Medical Assistance",
  "Travel/Passport Requirement",
  "Others"
];

export default function RequestDocumentPage() {
  const router = useRouter();
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [purposeType, setPurposeType] = React.useState("");

  React.useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(() => toast.error("Failed to load documents"));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
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

      const payload = {
        documentId: data.documentId,
        purpose: finalPurpose,
      };
      
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Request a Document</h1>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="documentId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Document
            </label>
            <select 
              id="documentId" 
              name="documentId" 
              required
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Choose a document type...</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} (Fee: ₱{doc.fee})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="purposeType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Purpose of Request
            </label>
            <select 
              id="purposeType" 
              name="purposeType" 
              required
              value={purposeType}
              onChange={(e) => setPurposeType(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Select a purpose...</option>
              {STANDARD_PURPOSES.map(purpose => (
                <option key={purpose} value={purpose}>{purpose}</option>
              ))}
            </select>
          </div>

          {purposeType === "Others" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="customPurpose" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </div>
    </div>
  );
}
