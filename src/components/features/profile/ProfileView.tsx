"use client";

import * as React from "react";
import { User, Mail, Phone, MapPin, Calendar, BadgeCheck, Edit2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

export function ProfileView() {
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });

  const fetchProfile = React.useCallback(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || "",
          address: data.residentProfile?.address || "",
        });
        setIsLoading(false);
      });
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {profile.firstName} {profile.lastName}
              {profile.residentProfile?.isVerified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">{profile.email}</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2 text-blue-600" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Details Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Personal Details
          </h3>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">First Name</label>
                  <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Last Name</label>
                  <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                {profile.residentProfile && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Address</label>
                    <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Contact Information</p>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>{profile.phone || "No phone number"}</span>
                </div>
              </div>

              {profile.residentProfile && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Residency Details</p>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{format(new Date(profile.residentProfile.birthdate), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <User className="h-4 w-4 text-blue-600" />
                    <span>{profile.residentProfile.gender}</span>
                  </div>
                </div>
              )}

              {profile.residentProfile && (
                <div className="space-y-1 sm:col-span-2 pt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Address</p>
                  <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-blue-600 mt-1" />
                    <span className="leading-relaxed">{profile.residentProfile.address}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
