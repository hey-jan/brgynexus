"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/utils/utils";
import { Clock, HelpCircle, ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface KioskLayoutProps {
  children: React.ReactNode;
}

export const KioskLayout = ({ children }: KioskLayoutProps) => {
  const [time, setTime] = useState(new Date());
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Inactivity Timeout (2 minutes)
  useEffect(() => {
    if (pathname === "/kiosk") return;

    let timeout: NodeJS.Timeout;
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        router.push("/kiosk");
      }, 120000); // 2 minutes
    };

    window.addEventListener("mousemove", resetTimeout);
    window.addEventListener("mousedown", resetTimeout);
    window.addEventListener("touchstart", resetTimeout);
    window.addEventListener("keypress", resetTimeout);

    resetTimeout();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimeout);
      window.removeEventListener("mousedown", resetTimeout);
      window.removeEventListener("touchstart", resetTimeout);
      window.removeEventListener("keypress", resetTimeout);
    };
  }, [pathname, router]);

  const isHome = pathname === "/kiosk";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden select-none relative">
      
      {/* Ambient background glow for the surrounding monitor space */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-5xl max-h-5xl bg-blue-500/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Tablet Frame (iPad Pro dimensions 1024x1366) */}
      <div className="w-full max-w-[1024px] h-[95vh] max-h-[1366px] bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[8px] border-slate-800 flex flex-col relative overflow-hidden z-10">
        
        {/* Decorative Background Elements inside tablet */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px]"></div>
        </div>

        {/* Glassmorphic Header */}
        <header className="px-8 py-5 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-xl shadow-lg z-10 relative shrink-0">
          <div className="flex items-center gap-4">
            {!isHome && (
              <button
                onClick={() => router.back()}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-90 text-blue-200 hover:text-white"
                aria-label="Go Back"
              >
                <ArrowLeft size={36} />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">BrgyNexus</h1>
              <p className="text-blue-300 font-bold uppercase tracking-widest text-xs mt-0.5">Service Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end hidden sm:flex">
              <div className="flex items-center gap-2 text-2xl font-black text-white drop-shadow-sm">
                <Clock size={24} className="text-blue-400" />
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-blue-200 font-medium tracking-wide text-sm mt-0.5">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <button className="flex flex-col items-center gap-1 group">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-blue-400/50 transition-all shadow-inner">
                <HelpCircle size={28} className="text-blue-300 group-hover:text-blue-200" />
              </div>
              <span className="text-[10px] font-bold uppercase text-blue-300 tracking-widest group-hover:text-blue-200">Help</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col items-center justify-start p-6 sm:p-8 z-10 relative overflow-y-auto w-full scroll-smooth">
          <div className="w-full h-full flex flex-col">
            {children}
          </div>
        </main>

        {/* Glassmorphic Footer */}
        <footer className="px-8 py-4 flex items-center justify-between text-sm font-medium text-blue-200/80 bg-slate-950/40 backdrop-blur-md border-t border-white/5 z-10 relative shrink-0">
          <div>&copy; {new Date().getFullYear()} Barangay Management System</div>
        </footer>
      </div>
    </div>
  );
};
