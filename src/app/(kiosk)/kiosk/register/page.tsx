"use client";

import React, { useState } from "react";
import { KioskButton } from "@/components/ui/KioskButton";
import { UserPlus, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function KioskRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        toast.error(data.error || "Failed to register");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl mx-auto space-y-12"
          >
            <div className="text-center space-y-4 relative z-10">
              <div className="w-24 h-24 bg-white/10 text-blue-300 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/20">
                <UserPlus size={48} />
              </div>
              <h2 className="text-5xl font-black text-white drop-shadow-md">New Resident Registration</h2>
              <p className="text-xl text-blue-200 font-medium drop-shadow-sm">Create your profile to access barangay services.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] shadow-xl border border-white/20 relative z-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-blue-300 ml-2">First Name</label>
                  <input 
                    required
                    name="firstName"
                    type="text"
                    className="w-full text-xl p-6 rounded-2xl border-2 border-white/10 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(96,165,250,0.3)] bg-white/5 text-white placeholder-blue-300/30 outline-none transition-all font-bold uppercase"
                    placeholder="e.g. JUAN"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-blue-300 ml-2">Last Name</label>
                  <input 
                    required
                    name="lastName"
                    type="text"
                    className="w-full text-xl p-6 rounded-2xl border-2 border-white/10 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(96,165,250,0.3)] bg-white/5 text-white placeholder-blue-300/30 outline-none transition-all font-bold uppercase"
                    placeholder="e.g. DELA CRUZ"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <label className="text-sm font-bold uppercase tracking-widest text-blue-300 ml-2">Email Address</label>
                <input 
                  required
                  name="email"
                  type="email"
                  className="w-full text-xl p-6 rounded-2xl border-2 border-white/10 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(96,165,250,0.3)] bg-white/5 text-white placeholder-blue-300/30 outline-none transition-all font-medium"
                  placeholder="e.g. juan@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-3 pt-4">
                <label className="text-sm font-bold uppercase tracking-widest text-blue-300 ml-2">PIN / Password</label>
                <input 
                  required
                  name="password"
                  type="password"
                  className="w-full text-xl p-6 rounded-2xl border-2 border-white/10 focus:border-blue-400 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(96,165,250,0.3)] bg-white/5 text-white placeholder-blue-300/30 outline-none transition-all font-medium tracking-widest"
                  placeholder="Enter a secure PIN or password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-6 pt-8">
                <KioskButton 
                  type="button"
                  variant="secondary" 
                  size="lg" 
                  onClick={() => router.push("/kiosk")}
                  className="h-24 text-2xl"
                  icon={<ArrowLeft size={28} />}
                >
                  Go Back
                </KioskButton>
                <KioskButton 
                  type="submit"
                  disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.password} 
                  className="h-24 text-2xl"
                >
                  {loading ? <Loader2 className="animate-spin" size={32} /> : "Register Now"}
                </KioskButton>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl mx-auto text-center space-y-12 py-10 relative z-10"
          >
            <div className="w-32 h-32 bg-white/10 text-emerald-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-400/30 backdrop-blur-md">
              <CheckCircle2 size={80} className="drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            </div>
            
            <div className="space-y-3 mb-10">
              <h2 className="text-5xl font-black text-white drop-shadow-md">Registration Complete</h2>
              <p className="text-xl text-blue-200 font-medium drop-shadow-sm">
                Your resident profile has been successfully created.
              </p>
            </div>

            <div className="bg-amber-500/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-amber-400/30 mt-8 mb-12 shadow-lg">
              <p className="text-xl font-bold text-amber-300 mb-2">Almost Done!</p>
              <p className="text-amber-200/80 font-medium text-lg leading-relaxed">
                Before you can request documents online, please proceed to the barangay staff window with a valid ID to verify your profile. You can still use the kiosk immediately!
              </p>
            </div>

            <div className="pt-8">
              <KioskButton 
                variant="primary" 
                size="lg" 
                onClick={() => router.push("/kiosk/request")}
                className="h-24 px-16 text-2xl rounded-[2rem]"
              >
                Continue to Request Document
              </KioskButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
