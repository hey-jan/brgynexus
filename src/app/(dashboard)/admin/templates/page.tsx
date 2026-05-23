"use client";

import * as React from "react";
import { FileCode, Save, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";

export default function AdminTemplatesPage() {
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
  const [templateContent, setTemplateContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const fetchDocuments = () => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setIsLoading(false);
        if (data.length > 0 && !selectedDocId) {
          handleSelect(data[0]);
        }
      });
  };

  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSelect = (doc: any) => {
    setSelectedDocId(doc.id);
    setTemplateContent(doc.templateContent || "This is to certify that Mr./Ms. {{residentName}}, of legal age, is a bonafide resident of {{address}}, Barangay Sambag I, Cebu City.\n\nBased on the records of this office, the above-named individual has no derogatory record or pending case filed against him/her in this barangay as of this date.\n\nThis certification is being issued upon the request of the interested party for the following purpose:\n{{purpose}}");
  };

  const handleSave = async () => {
    if (!selectedDocId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/templates/${selectedDocId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateContent })
      });
      if (!res.ok) throw new Error('Failed to save template');
      toast.success("Template saved successfully!");
      fetchDocuments(); // refresh to sync state
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading templates...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
          <FileCode className="h-6 w-6 mr-2 text-blue-600" />
          Document Templates
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Customize the textual content and variables for each document type.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Document List */}
        <div className="w-full lg:w-1/3 space-y-2">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select Document</h3>
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleSelect(doc)}
              className={`w-full text-left flex items-center px-4 py-4 rounded-xl border transition-all ${
                selectedDocId === doc.id
                  ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                  : "bg-white border-slate-200 text-slate-700 hover:border-blue-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <FileText className="h-5 w-5 mr-3 opacity-70" />
              <div>
                <p className="font-semibold">{doc.name}</p>
                <p className="text-xs opacity-70 mt-1">{doc.fee > 0 ? `₱${doc.fee.toFixed(2)}` : 'Free'}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center">
            <h3 className="font-bold">Template Editor</h3>
            <Button size="sm" onClick={handleSave} disabled={isSaving || !selectedDocId}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Available Variables</p>
                <p className="mb-2 opacity-90">Use these placeholders to dynamically insert resident data when generating the PDF:</p>
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-blue-100 dark:border-blue-700">{"{{residentName}}"}</span>
                  <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-blue-100 dark:border-blue-700">{"{{address}}"}</span>
                  <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-blue-100 dark:border-blue-700">{"{{purpose}}"}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="text-sm font-semibold mb-2 block">Document Body Text</label>
              <Textarea 
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                className="flex-1 min-h-[300px] font-mono text-sm leading-relaxed p-4"
                placeholder="Write the document content here..."
                disabled={!selectedDocId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
