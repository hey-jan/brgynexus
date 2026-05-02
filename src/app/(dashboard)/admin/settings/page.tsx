"use client";

import * as React from "react";
import { Settings as SettingsIcon, Home, FileText, Bell, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general");

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  const tabs = [
    { id: "general", label: "General", icon: Home },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
          <SettingsIcon className="h-6 w-6 mr-2" />
          System Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Configure Barangay details and system-wide preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <tab.icon className="h-4 w-4 mr-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Barangay Information</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Barangay Name</label>
                  <Input defaultValue="Sambag I" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City/Municipality</label>
                  <Input defaultValue="Cebu City" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Barangay Hall Address</label>
                  <Input defaultValue="Urgello St., Sambag I, Cebu City" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Number</label>
                  <Input defaultValue="(032) 254-1234" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Email</label>
                  <Input defaultValue="info@sambag1.cebucity.gov.ph" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Document Policies</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-medium">Automatic Expiration</p>
                    <p className="text-sm text-slate-500">Automatically expire documents after 6 months.</p>
                  </div>
                  <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-medium">QR Verification</p>
                    <p className="text-sm text-slate-500">Enable public verification of released documents.</p>
                  </div>
                  <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 text-center py-12">
              <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Notification Settings</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Configure email alerts and SMS notifications for residents.</p>
              <p className="text-xs text-blue-600 font-bold uppercase mt-4">Requires SendGrid/Twilio API Keys</p>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Security & Access</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-slate-500">Log users out automatically after 24 hours of inactivity.</p>
                  </div>
                  <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-medium">Password Complexity</p>
                    <p className="text-sm text-slate-500">Require special characters and numbers for all users.</p>
                  </div>
                  <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button onClick={handleSave} className="px-8">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}