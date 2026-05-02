import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          The Modern <span className="text-blue-600">Barangay</span> System
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Request documents, track your requests, and stay updated with automated notifications. Fast, secure, and hassle-free.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto text-base">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">Login to Dashboard</Button>
          </Link>
        </div>
      </div>
      
      {/* Decorative background blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-indigo-500 blur-3xl rounded-full mix-blend-multiply filter" />
      </div>
    </section>
  );
}
