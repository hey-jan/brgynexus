"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Role = "RESIDENT" | "STAFF" | "ADMIN";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: Role;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <Sidebar role={role} />
      </div>

      {/* Mobile Sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex w-64 flex-1 flex-col bg-white dark:bg-slate-900">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <Sidebar role={role} onMobileClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col w-0 overflow-hidden">
        {/* Mobile top header */}
        <div className="lg:hidden flex h-16 flex-shrink-0 items-center border-b border-slate-200 bg-white px-4 dark:bg-slate-900 dark:border-slate-800">
          <Button 
            variant="ghost" 
            size="icon" 
            className="-ml-2 mr-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          </Button>
          <span className="text-lg font-bold text-slate-900 dark:text-white">BrgyNexus</span>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
