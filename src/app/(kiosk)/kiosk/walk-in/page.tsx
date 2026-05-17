"use client";

import React, { useState, useEffect } from "react";
import { KioskButton } from "@/components/ui/KioskButton";
import { FileText, User, ClipboardCheck, ArrowRight, CheckCircle2, Loader2, MapPin, Phone, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { VirtualKeyboard } from "@/components/ui/VirtualKeyboard";

type Step = "details" | "document" | "purpose" | "success";

interface Document {
  id: string;
  name: string;
  description: string;
  fee: number;
}

const STANDARD_PURPOSES = [
  "Employment Requirement",
  "Bank Requirement",
  "School/Scholarship Requirement",
  "Postal ID Application",
  "Medical Assistance",
  "Travel/Passport Requirement",
];

export default function WalkInRequestFlow() {
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Form State
  const [guestData, setGuestData] = useState({ firstName: "", lastName: "", address: "", lengthOfStay: "", phone: "" });
  const [temporaryResidentId, setTemporaryResidentId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [purposeType, setPurposeType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [referenceNo, setReferenceNo] = useState("");

  // Keyboard state
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const router = useRouter();

  const handleKeyboardChange = (value: string) => {
    if (activeInput === "firstName") setGuestData({ ...guestData, firstName: value.toUpperCase() });
    if (activeInput === "lastName") setGuestData({ ...guestData, lastName: value.toUpperCase() });
    if (activeInput === "address") setGuestData({ ...guestData, address: value.toUpperCase() });
    if (activeInput === "lengthOfStay") setGuestData({ ...guestData, lengthOfStay: value });
    if (activeInput === "phone") setGuestData({ ...guestData, phone: value });
    if (activeInput === "purpose") setPurpose(value);
  };

  const getKeyboardValue = () => {
    if (activeInput === "firstName") return guestData.firstName;
    if (activeInput === "lastName") return guestData.lastName;
    if (activeInput === "address") return guestData.address;
    if (activeInput === "lengthOfStay") return guestData.lengthOfStay;
    if (activeInput === "phone") return guestData.phone;
    if (activeInput === "purpose") return purpose;
    return "";
  };

  useEffect(() => {
    fetch("/api/documents")
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(err => console.error("Failed to fetch documents", err));
  }, []);

  // Close keyboard on step transition or when purpose type is changed
  useEffect(() => {
    setKeyboardOpen(false);
    setActiveInput(null);
  }, [step, purposeType]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestData.firstName.trim() || !guestData.lastName.trim() || !guestData.address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/kiosk/temporary-resident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestData),
      });
      const data = await res.json();
      if (res.ok) {
        setTemporaryResidentId(data.id);
        setStep("document");
      } else {
        toast.error(data.error || "Failed to create temporary record");
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
    
    if (!selectedDoc || !finalPurpose || !temporaryResidentId) {
      toast.error("Please specify a purpose");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId: temporaryResidentId,
          documentId: selectedDoc.id,
          purpose: finalPurpose,
          source: "kiosk"
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
      case "details":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-3xl mx-auto space-y-8 py-4"
          >
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black text-white drop-shadow-md">Walk-in Registration</h2>
              <p className="text-xl text-blue-200 font-medium drop-shadow-sm">Please provide your details to create a temporary record.</p>
            </div>

            <form onSubmit={handleDetailsSubmit} className="space-y-6 bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] shadow-xl border border-white/20">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-blue-300 ml-2">First Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                    <input 
                      required
                      inputMode="none"
                      type="text"
                      className="w-full text-lg pl-12 p-4 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder-blue-300/50 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(96,165,250,0.3)] outline-none transition-all font-bold"
                      value={guestData.firstName}
                      onChange={e => setGuestData({...guestData, firstName: e.target.value.toUpperCase()})}
                      onFocus={() => { setActiveInput("firstName"); setKeyboardOpen(true); }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-blue-300 ml-2">Last Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                    <input 
                      required
                      inputMode="none"
                      type="text"
                      className="w-full text-lg pl-12 p-4 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder-blue-300/50 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(96,165,250,0.3)] outline-none transition-all font-bold"
                      value={guestData.lastName}
                      onChange={e => setGuestData({...guestData, lastName: e.target.value.toUpperCase()})}
                      onFocus={() => { setActiveInput("lastName"); setKeyboardOpen(true); }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-blue-300 ml-2">Current Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                  <input 
                    required
                    inputMode="none"
                    type="text"
                    className="w-full text-lg pl-12 p-4 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder-blue-300/50 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(96,165,250,0.3)] outline-none transition-all font-medium"
                    value={guestData.address}
                    onChange={e => setGuestData({...guestData, address: e.target.value.toUpperCase()})}
                    onFocus={() => { setActiveInput("address"); setKeyboardOpen(true); }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-blue-300 ml-2">Length of Stay (Optional)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                    <input 
                      inputMode="none"
                      type="text"
                      className="w-full text-lg pl-12 p-4 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder-blue-300/50 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(96,165,250,0.3)] outline-none transition-all font-bold"
                      value={guestData.lengthOfStay}
                      onChange={e => setGuestData({...guestData, lengthOfStay: e.target.value})}
                      onFocus={() => { setActiveInput("lengthOfStay"); setKeyboardOpen(true); }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-blue-300 ml-2">Contact No. (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                    <input 
                      inputMode="none"
                      type="text"
                      className="w-full text-lg pl-12 p-4 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder-blue-300/50 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(96,165,250,0.3)] outline-none transition-all font-bold"
                      value={guestData.phone}
                      onChange={e => setGuestData({...guestData, phone: e.target.value})}
                      onFocus={() => { setActiveInput("phone"); setKeyboardOpen(true); }}
                    />
                  </div>
                </div>
              </div>

              <KioskButton type="submit" disabled={loading} className="mt-8 h-20 text-2xl w-full">
                <span className="w-full text-center flex justify-center">{loading ? <Loader2 className="animate-spin" size={32} /> : "Proceed"}</span>
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
              <h2 className="text-4xl font-black text-white drop-shadow-md">Welcome, {guestData.firstName}</h2>
              <p className="text-xl text-blue-200 font-medium drop-shadow-sm">Please select the document you require.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {documents.map((doc, index) => (
                <KioskButton 
                  key={doc.id}
                  variant="secondary"
                  size="lg"
                  className={`h-auto p-8 flex-col items-start gap-4 text-left rounded-[2rem] border-transparent hover:border-blue-400/50 group ${
                    index === documents.length - 1 && documents.length % 2 !== 0 ? "md:col-span-2 md:w-[calc(50%-12px)] md:mx-auto" : ""
                  }`}
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
            className="w-full max-w-3xl mx-auto space-y-6"
          >
            <div className="text-center space-y-2 mb-6 relative z-10">
              <div className="flex items-center justify-center gap-4 text-blue-300 mb-4">
                <div className="p-3 bg-white/10 rounded-2xl shadow-inner border border-white/20 text-blue-200"><FileText size={32} /></div>
                <ArrowRight size={20} />
                <div className="p-3 bg-white/10 rounded-2xl shadow-inner border border-white/20 text-blue-200"><ClipboardCheck size={32} /></div>
              </div>
              <h2 className="text-3xl font-black text-white drop-shadow-md">Purpose of Request</h2>
              <p className="text-lg text-blue-200 font-medium drop-shadow-sm">Why do you need a {selectedDoc?.name}?</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 relative z-10">
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {STANDARD_PURPOSES.map(p => (
                  <KioskButton
                    key={p}
                    variant={purposeType === p ? "primary" : "secondary"}
                    onClick={() => setPurposeType(p)}
                    className="h-auto p-3 text-base min-h-[80px]"
                  >
                    {p}
                  </KioskButton>
                ))}
                <KioskButton
                  variant={purposeType === "Others" ? "primary" : "secondary"}
                  onClick={() => setPurposeType("Others")}
                  className="h-auto p-3 text-base min-h-[80px]"
                >
                  Others (Type manually)
                </KioskButton>
              </div>

              {purposeType === "Others" && (
                  <motion.textarea 
                  inputMode="none"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="w-full text-xl p-4 rounded-2xl border-2 border-white/10 bg-white/5 text-white placeholder-blue-300/50 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(96,165,250,0.3)] outline-none transition-all font-medium min-h-[120px] resize-none mb-4"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  onFocus={() => { setActiveInput("purpose"); setKeyboardOpen(true); }}
                />
              )}

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <KioskButton 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => setStep("document")}
                  className="h-20 text-xl w-full"
                >
                  Go Back
                </KioskButton>
                <KioskButton 
                  variant="primary"
                  size="lg"
                  disabled={!purposeType || (purposeType === "Others" && !purpose) || loading} 
                  onClick={handleSubmit}
                  className="h-20 text-xl w-full"
                >
                  {loading ? <Loader2 className="animate-spin" size={32} /> : "Submit Request"}
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
                    Next Step: Verification
                  </p>
                  <p className="text-base text-amber-200/80 font-medium">
                    Please proceed to the Staff Window and present a Valid ID or Lease Contract to verify your temporary residency.
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
    <div className={`w-full h-full pb-${keyboardOpen ? '80' : '0'} transition-all duration-300`}>
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
      <VirtualKeyboard 
        inputName={activeInput || ""} 
        inputValue={getKeyboardValue()} 
        onChange={handleKeyboardChange}
        isOpen={keyboardOpen}
        onClose={() => { setKeyboardOpen(false); setActiveInput(null); }}
      />
    </div>
  );
}
