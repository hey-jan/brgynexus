"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  Bell, 
  User, 
  CheckCircle, 
  FileBadge, 
  QrCode, 
  Users, 
  BarChart, 
  Settings, 
  ShieldAlert
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

type Role = "RESIDENT" | "STAFF" | "ADMIN";

interface SidebarProps {
  role: Role;
  onMobileClose?: () => void;
}

export function Sidebar({ role, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const residentLinks = [
    { href: "/resident", label: "Dashboard", icon: LayoutDashboard },
    { href: "/resident/request", label: "Request Document", icon: FileText },
    { href: "/resident/requests", label: "My Requests", icon: Clock },
    { href: "/resident/notifications", label: "Notifications", icon: Bell },
    { href: "/resident/profile", label: "Profile", icon: User },
  ];

  const staffLinks = [
    { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
    { href: "/staff/requests", label: "All Requests", icon: FileText },
    { href: "/staff/pending", label: "Pending Requests", icon: Clock },
    { href: "/staff/approved", label: "Approved Requests", icon: CheckCircle },
    { href: "/staff/generate", label: "Generate Documents", icon: FileBadge },
    { href: "/staff/verify", label: "QR Verification", icon: QrCode },
    { href: "/staff/profile", label: "Profile", icon: User },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/requests", label: "All Requests", icon: FileText },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart },
    { href: "/admin/logs", label: "System Logs", icon: ShieldAlert },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/admin/profile", label: "Profile", icon: User },
  ];

  const links = role === "ADMIN" ? adminLinks : role === "STAFF" ? staffLinks : residentLinks;

  return (
    <div className="flex h-full w-full flex-col bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xl font-bold text-blue-600 dark:text-blue-500">
          Brgy<span className="text-slate-900 dark:text-white">Nexus</span>
        </span>
        <span className="ml-2 text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/50 dark:text-blue-400">
          {role}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" 
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <LogoutButton />
      </div>
    </div>
  );
}
