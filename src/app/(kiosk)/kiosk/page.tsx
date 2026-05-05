import { KioskButton } from "@/components/ui/KioskButton";
import { FileText, Search, UserPlus } from "lucide-react";
import Link from "next/link";

export default function KioskLanding() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 py-10">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-md">
          How can we help you today?
        </h2>
        <p className="text-2xl text-blue-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
          Please select an option below to begin your transaction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-8 relative z-10">
        <Link href="/kiosk/request" className="w-full">
          <KioskButton 
            variant="secondary"
            size="2xl" 
            icon={<div className="w-32 h-32 bg-white/10 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-white/20"><FileText size={72} /></div>}
            className="flex-col h-auto py-16 text-center gap-2 rounded-[2rem]"
          >
            <span className="text-4xl font-black text-white drop-shadow-md">Request Document</span>
            <span className="text-xl font-medium text-blue-200 mt-2">
              Clearance, Residency, Indigency
            </span>
          </KioskButton>
        </Link>

        <Link href="/kiosk/status" className="w-full">
          <KioskButton 
            variant="secondary"
            size="2xl" 
            icon={<div className="w-32 h-32 bg-white/10 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-white/20"><Search size={72} /></div>}
            className="flex-col h-auto py-16 text-center gap-2 rounded-[2rem]"
          >
            <span className="text-4xl font-black text-white drop-shadow-md">Check Status</span>
            <span className="text-xl font-medium text-blue-200 mt-2">
              Track your pending request
            </span>
          </KioskButton>
        </Link>
      </div>

      <div className="mt-12 flex flex-col items-center gap-6 z-10 relative">
        <div className="w-16 h-1 bg-white/20 rounded-full mb-2"></div>
        <p className="text-blue-300 font-bold uppercase tracking-widest text-sm drop-shadow-sm">
          Not yet a registered resident?
        </p>
        <Link href="/kiosk/register">
          <KioskButton 
            variant="outline"
            size="lg"
            icon={<UserPlus size={28} />}
            className="px-16"
          >
            Register as New Resident
          </KioskButton>
        </Link>
      </div>
    </div>
  );
}
