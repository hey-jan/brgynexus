"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/utils/utils";
import { CalendarClock, ArrowLeft } from "lucide-react";
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
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center font-sans overflow-hidden select-none relative">
      
      {/* Ambient background glow for the surrounding monitor space */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-5xl max-h-5xl bg-blue-500/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Full-screen Kiosk Container */}
      <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 flex flex-col relative overflow-hidden z-10">
        
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
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl shadow-inner backdrop-blur-md">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <CalendarClock size={24} className="text-blue-400" />
            </div>
            <div className="flex flex-col items-start justify-center">
              <div className="text-2xl font-black text-white tracking-tight drop-shadow-md leading-none">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-blue-300/80 font-bold tracking-widest uppercase text-[10px] mt-1">
                {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col items-center justify-start p-6 sm:p-8 z-10 relative overflow-y-auto w-full scroll-smooth">
          <div className="w-full h-full flex flex-col">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};
