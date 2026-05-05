import { KioskLayout } from "@/components/layout/KioskLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <KioskLayout>{children}</KioskLayout>;
}
