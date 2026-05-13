"use client";

import React, { useState, useEffect } from "react";
import { KioskButton } from "@/components/ui/KioskButton";
import { FileText, User, Calendar, ClipboardCheck, ArrowRight, CheckCircle2, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Step = "search" | "document" | "purpose" | "success";

interface Document {
  id: string;
  name: string;
  description: string;
  fee: number;
}

interface Resident {
  id: string;
  name: string;
  address: string;
}

const STANDARD_PURPOSES = [
  "Employment Requirement",
  "Bank Requirement",
  "School/Scholarship Requirement",
  "Postal ID Application",
  "Medical Assistance",
  "Travel/Passport Requirement",
];

export default function RequestFlow() {
  const [step, setStep] = useState<Step>("search");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Form State
  const [searchData, setSearchData] = useState({ firstName: "", lastName: "" });
  const [resident, setResident] = useState<Resident | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [purposeType, setPurposeType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [referenceNo, setReferenceNo] = useState("");

  const router = useRouter();

  // Fetch documents on mount
  useEffect(() => {
    fetch("/api/documents")
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(err => console.error("Failed to fetch documents", err));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/kiosk/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchData),
      });
      const data = await res.json();
      if (res.ok) {
        setResident(data);
        setStep("document");
      } else {
        toast.error(data.error || "Resident not found");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDocSelect = (doc: Document) => {
    setSelectedDoc(doc);
    setStep("purpose");
  };

  const handleSubmit = async () => {
    let finalPurpose = purposeType;
    if (purposeType === "Others") {
      finalPurpose = purpose;
    }
    
    if (!resident || !selectedDoc || !finalPurpose) {
      toast.error("Please specify a purpose");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId: resident.id,
          documentId: selectedDoc.id,
          purpose: finalPurpose,
          source: "kiosk" // Tagging the source
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setReferenceNo(data.id.substring(0, 8).toUpperCase());
        setStep("success");
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "search":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl mx-auto space-y-12"
          >
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-white/10 text-blue-300 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/20">
                <User size={48} />
              </div>
              <h2 className="text-5xl font-black text-white drop-shadow-md">Identity Verification</h2>
              <p className="text-xl text-blue-200 font-medium drop-shadow-sm">Please enter your details exactly as they appear on your records.</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-6 bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] shadow-xl border border-white/20">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-blue-300 ml-2">First Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full text-2xl p-6 rounded-2xl border-2 border-white/10 bg-white/5 text-white placeholder-blue-300/50 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(96,165,250,0.3)] outline-none transition-all font-bold"
                    placeholder="e.g. JUAN"
                    value={searchData.firstName}
                    onChange={e => setSearchData({...searchData, firstName: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-blue-300 ml-2">Last Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full text-2xl p-6 rounded-2xl border-2 border-white/10 bg-white/5 text-white placeholder-blue-300/50 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(96,165,250,0.3)] outline-none transition-all font-bold"
                    placeholder="e.g. DELA CRUZ"
                    value={searchData.lastName}
                    onChange={e => setSearchData({...searchData, lastName: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>
              


              <KioskButton type="submit" disabled={loading} className="mt-12 h-24 text-4xl">
                {loading ? <Loader2 className="animate-spin" size={48} /> : "Search Profile"}
              </KioskButton>
            </form>
          </motion.div>
        );

      case "document":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-5xl mx-auto space-y-12"
          >
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-4xl font-black text-white drop-shadow-md">Welcome, {resident?.name}</h2>
              <p className="text-xl text-blue-200 font-medium drop-shadow-sm">Please select the document you require.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {documents.map(doc => (
                <KioskButton 
                  key={doc.id}
                  variant="secondary"
                  size="lg"
                  className="h-auto p-8 flex-col items-start gap-4 text-left rounded-[2rem] border-transparent hover:border-blue-400/50 group"
                  onClick={() => handleDocSelect(doc)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl font-black text-white">{doc.name}</span>
                    <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors shadow-inner">
                      <FileText size={36} className="text-blue-300 group-hover:text-white" />
                    </div>
                  </div>
                  <p className="text-base text-blue-100/80 font-medium">{doc.description}</p>
                  <div className="mt-2 px-4 py-2 bg-white/5 text-blue-200 rounded-lg font-bold text-sm tracking-wider border border-white/10 group-hover:bg-blue-500/20 group-hover:text-white transition-colors">
                    FEE: ₱{doc.fee.toFixed(2)}
                  </div>
                </KioskButton>
              ))}
            </div>
          </motion.div>
        );

      case "purpose":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-3xl mx-auto space-y-12"
          >
            <div className="text-center space-y-4 mb-8 relative z-10">
              <div className="flex items-center justify-center gap-6 text-blue-300 mb-6">
                <div className="p-4 bg-white/10 rounded-2xl shadow-inner border border-white/20 text-blue-200"><FileText size={40} /></div>
                <ArrowRight size={24} />
                <div className="p-4 bg-white/10 rounded-2xl shadow-inner border border-white/20 text-blue-200"><ClipboardCheck size={40} /></div>
              </div>
              <h2 className="text-4xl font-black text-white drop-shadow-md">Purpose of Request</h2>
              <p className="text-xl text-blue-200 font-medium drop-shadow-sm">Why do you need a {selectedDoc?.name}?</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 relative z-10">
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {STANDARD_PURPOSES.map(p => (
                  <KioskButton
                    key={p}
                    variant={purposeType === p ? "primary" : "secondary"}
                    onClick={() => setPurposeType(p)}
                    className="h-auto p-4 text-lg min-h-[100px]"
                  >
                    {p}
                  </KioskButton>
                ))}
                <KioskButton
                  variant={purposeType === "Others" ? "primary" : "secondary"}
                  onClick={() => setPurposeType("Others")}
                  className="h-auto p-4 text-lg min-h-[100px]"
                >
                  Others (Type manually)
                </KioskButton>
              </div>

              {purposeType === "Others" && (
                <motion.textarea 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="w-full text-2xl p-6 rounded-2xl border-2 border-white/10 bg-white/5 text-white placeholder-blue-300/50 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(96,165,250,0.3)] outline-none transition-all font-medium min-h-[200px] resize-none mb-4"
                  placeholder="Type your specific purpose here..."
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                />
              )}

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <KioskButton 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => setStep("document")}
                  className="h-24 text-2xl"
                >
                  Go Back
                </KioskButton>
                <KioskButton 
                  disabled={!purposeType || (purposeType === "Others" && !purpose) || loading} 
                  onClick={handleSubmit}
                  className="h-24 text-2xl"
                >
                  {loading ? <Loader2 className="animate-spin" size={40} /> : "Submit Request"}
                </KioskButton>
              </div>
            </div>
          </motion.div>
        );

      case "success":
        return (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl mx-auto text-center space-y-12 py-10 relative z-10"
          >
            <div className="w-32 h-32 bg-white/10 text-emerald-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-400/30 backdrop-blur-md">
              <CheckCircle2 size={80} className="drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            </div>
            
            <div className="space-y-3 mb-10">
              <h2 className="text-5xl font-black text-white drop-shadow-md">Transaction Successful</h2>
              <p className="text-xl text-blue-200 font-medium drop-shadow-sm">
                Your request for <span className="text-white font-bold">{selectedDoc?.name}</span> has been logged.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-10 rounded-[3rem] shadow-xl border border-white/20 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
              
              <div className="space-y-2">
                <p className="text-sm font-bold text-blue-300 uppercase tracking-[0.2em]">Reference Number</p>
                <div className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">{referenceNo}</div>
              </div>
              
              <div className="h-px w-full bg-white/10 mx-auto" />
              
              <div className="space-y-3 bg-amber-500/10 border border-amber-400/30 p-6 rounded-2xl flex items-start gap-4 text-left">
                <div className="mt-1 text-amber-400"><ArrowRight size={32} /></div>
                <div>
                  <p className="text-lg font-bold text-amber-300">
                    Next Step: Physical Verification
                  </p>
                  <p className="text-base text-amber-200/80 font-medium">
                    Please proceed to the Staff Window and present a Valid ID to confirm this request.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-10">
              <KioskButton 
                variant="primary" 
                size="lg" 
                onClick={() => router.push("/kiosk")}
                className="h-20 px-16 text-xl rounded-2xl mx-auto w-auto"
              >
                Finish Transaction
              </KioskButton>
              <p className="mt-6 text-blue-300/60 font-medium text-sm">Session will auto-reset in 2 minutes.</p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
