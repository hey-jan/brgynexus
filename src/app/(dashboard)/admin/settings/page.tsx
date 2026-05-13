"use client";

import * as React from "react";
import { Settings as SettingsIcon, Home, FileText, Bell, Save, Shield, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general");
  const [settings, setSettings] = React.useState({
    barangayName: "",
    city: "",
    province: "",
    captainName: "",
    captainTitle: "",
    logoUrl: "",
    signatureUrl: "",
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({
            barangayName: data.barangayName || "",
            city: data.city || "",
            province: data.province || "",
            captainName: data.captainName || "",
            captainTitle: data.captainTitle || "",
            logoUrl: data.logoUrl || "",
            signatureUrl: data.signatureUrl || "",
          });
        }
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save settings');
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'signatureUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit for base64
      toast.error("File is too large. Please select an image under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSettings(prev => ({ ...prev, [field]: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: "general", label: "General & Layout", icon: Home },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (isLoading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
          <SettingsIcon className="h-6 w-6 mr-2" />
          System Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Configure Barangay details, logos, and system preferences.</p>
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
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Barangay Identity</h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Barangay Name</label>
                    <Input value={settings.barangayName} onChange={e => setSettings({...settings, barangayName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City/Municipality</label>
                    <Input value={settings.city} onChange={e => setSettings({...settings, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Province</label>
                    <Input value={settings.province} onChange={e => setSettings({...settings, province: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h3 className="text-xl font-bold mb-4">Official Signatory</h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Captain's Name</label>
                    <Input value={settings.captainName} onChange={e => setSettings({...settings, captainName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Captain's Title</label>
                    <Input value={settings.captainTitle} onChange={e => setSettings({...settings, captainTitle: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h3 className="text-xl font-bold mb-4">Graphics & Signatures</h3>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-4">
                    <label className="text-sm font-medium block">Barangay Logo</label>
                    <div className="flex items-center gap-4">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 object-contain border border-slate-200 rounded-md bg-white p-1" />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 flex items-center justify-center rounded-md border border-slate-200 text-xs text-slate-400">No Logo</div>
                      )}
                      <div>
                        <input type="file" id="logoUpload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('logoUpload')?.click()}>
                          <Upload className="w-4 h-4 mr-2" /> Upload Logo
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium block">Captain's Signature</label>
                    <div className="flex items-center gap-4">
                      {settings.signatureUrl ? (
                        <img src={settings.signatureUrl} alt="Signature" className="h-16 object-contain border border-slate-200 rounded-md bg-white p-1" />
                      ) : (
                        <div className="h-16 px-4 bg-slate-100 flex items-center justify-center rounded-md border border-slate-200 text-xs text-slate-400">No Signature</div>
                      )}
                      <div>
                        <input type="file" id="signatureUpload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'signatureUrl')} />
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('signatureUpload')?.click()}>
                          <Upload className="w-4 h-4 mr-2" /> Upload Signature
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Document Policies</h3>
              <p className="text-slate-500">To edit the content/text of the documents, please go to the <strong>Document Templates</strong> tab in the sidebar.</p>
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
              </div>
            </div>
          )}

          <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="px-8">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}