"use client";

import React, { useState } from "react";
import { KioskButton } from "@/components/ui/KioskButton";
import { Search, Loader2, CheckCircle2, Clock, XCircle, FileCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CheckStatus() {
  const [refNo, setRefNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNo) return;
    
    setLoading(true);
    try {
      // Assuming the backend supports searching by ID prefix or full ID
      const res = await fetch(`/api/requests/${refNo}`);
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        toast.error("Request not found. Please check your reference number.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return { 
          icon: <Clock size={48} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />, 
          text: "PENDING VERIFICATION", 
          desc: "Please proceed to the staff window to present your ID.",
          color: "bg-amber-500/10 border border-amber-400/30 text-white"
        };
      case "APPROVED":
        return { 
          icon: <FileCheck size={48} className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />, 
          text: "APPROVED", 
          desc: "Verification complete. Your document is being prepared.",
          color: "bg-blue-500/10 border border-blue-400/30 text-white"
        };
      case "RELEASED":
        return { 
          icon: <CheckCircle2 size={48} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />, 
          text: "READY FOR PICKUP", 
          desc: "Your document is ready! Please proceed to the counter.",
          color: "bg-emerald-500/10 border border-emerald-400/30 text-white"
        };
      case "REJECTED":
        return { 
          icon: <XCircle size={48} className="text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.8)]" />, 
          text: "REJECTED", 
          desc: "There was an issue with your request. Please talk to staff.",
          color: "bg-rose-500/10 border border-rose-400/30 text-white"
        };
      default:
        return { 
          icon: <Search size={48} className="text-blue-300/50" />, 
          text: status, 
          desc: "Updating status...",
          color: "bg-white/5 border border-white/10 text-white"
        };
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-10 space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-md">Check Status</h2>
        <p className="text-xl text-blue-200 font-medium leading-relaxed drop-shadow-sm">
          Enter your 8-character Reference Number to track your request.
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-8 bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] shadow-xl border border-white/20">
        <div className="relative">
          <input 
            required
            type="text"
            className="w-full text-4xl p-8 rounded-[2rem] border-2 border-white/10 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(96,165,250,0.3)] bg-white/5 text-white placeholder-blue-300/30 outline-none transition-all font-black text-center tracking-[0.4em] uppercase"
            placeholder="E.G. AB12CD34"
            value={refNo}
            onChange={e => setRefNo(e.target.value.toUpperCase())}
            maxLength={8}
          />
        </div>

        <KioskButton type="submit" disabled={loading || refNo.length < 4} className="h-20 text-2xl rounded-2xl">
          {loading ? <Loader2 className="animate-spin" size={32} /> : "Track Request"}
        </KioskButton>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-6 text-center backdrop-blur-md ${getStatusDisplay(result.status).color}`}
          >
            {getStatusDisplay(result.status).icon}
            <div className="space-y-2">
              <span className="text-sm font-black uppercase tracking-[0.3em] text-blue-200/80">Current Status</span>
              <h3 className="text-5xl font-black drop-shadow-md">{getStatusDisplay(result.status).text}</h3>
            </div>
            <p className="text-xl font-medium max-w-md text-white/90">{getStatusDisplay(result.status).desc}</p>
            
            <div className="h-px w-full bg-white/20 my-4" />
            
            <div className="grid grid-cols-2 gap-12 w-full text-center">
              <div>
                <p className="text-xs font-bold uppercase text-blue-200/80 mb-1">Document</p>
                <p className="text-2xl font-bold drop-shadow-sm">{result.document?.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-blue-200/80 mb-1">Requested On</p>
                <p className="text-2xl font-bold drop-shadow-sm">{format(new Date(result.createdAt), "MMM d, yyyy")}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
