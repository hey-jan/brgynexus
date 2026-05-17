import { KioskButton } from "@/components/ui/KioskButton";
import { FileText, Search } from "lucide-react";
import Link from "next/link";

export default function KioskLanding() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 py-10">
      <div className="text-center space-y-4 mb-6">
        <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
          How can we help you today?
        </h2>
        <p className="text-xl text-blue-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
          Please select an option below to begin your transaction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-8 relative z-10">
        <Link href="/kiosk/request" className="w-full">
          <KioskButton 
            variant="secondary"
            size="xl" 
            icon={<div className="w-24 h-24 bg-white/10 text-white rounded-3xl flex items-center justify-center mb-4 shadow-inner border border-white/20"><FileText size={56} /></div>}
            className="flex-col h-auto py-10 text-center gap-2 rounded-3xl"
          >
            <span className="text-3xl font-black text-white drop-shadow-md">Request Document</span>
            <span className="text-lg font-medium text-blue-200 mt-2">
              Clearance, Residency, Indigency
            </span>
          </KioskButton>
        </Link>

        <Link href="/kiosk/status" className="w-full">
          <KioskButton 
            variant="secondary"
            size="xl" 
            icon={<div className="w-24 h-24 bg-white/10 text-white rounded-3xl flex items-center justify-center mb-4 shadow-inner border border-white/20"><Search size={56} /></div>}
            className="flex-col h-auto py-10 text-center gap-2 rounded-3xl"
          >
            <span className="text-3xl font-black text-white drop-shadow-md">Check Status</span>
            <span className="text-lg font-medium text-blue-200 mt-2">
              Track your pending request
            </span>
          </KioskButton>
        </Link>
      </div>


    </div>
  );
}
