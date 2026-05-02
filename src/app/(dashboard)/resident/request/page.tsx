"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";

export default function RequestDocumentPage() {
  const router = useRouter();
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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
      
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
            <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Purpose of Request
            </label>
            <Textarea 
              id="purpose" 
              name="purpose" 
              rows={4} 
              required 
              placeholder="Please explain why you need this document..." 
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </div>
    </div>
  );
}
