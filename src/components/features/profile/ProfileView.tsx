"use client";

import * as React from "react";
import { User, Mail, Phone, MapPin, Calendar, Shield, BadgeCheck, BadgeAlert, Edit2, Save, X } from "lucide-react";
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
      toast.error("Failed to update profile. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {profile.firstName} {profile.middleName ? `${profile.middleName} ` : ""}{profile.lastName}
            </h1>
            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-semibold">
                {profile.role}
              </span>
              {profile.residentProfile?.isVerified && (
                <span className="flex items-center px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-semibold">
                  <BadgeCheck className="h-4 w-4 mr-1" />
                  Verified Resident
                </span>
              )}
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                    <Input 
                      value={formData.firstName} 
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                    <Input 
                      value={formData.lastName} 
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      placeholder="09123456789"
                    />
                  </div>
                  {profile.residentProfile && (
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                      <Input 
                        value={formData.address} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})} 
                        required 
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Email Address</p>
                  <p className="font-medium text-slate-900 dark:text-white flex items-center">
                    <Mail className="h-4 w-4 mr-2 opacity-50" />
                    {profile.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Phone Number</p>
                  <p className="font-medium text-slate-900 dark:text-white flex items-center">
                    <Phone className="h-4 w-4 mr-2 opacity-50" />
                    {profile.phone || "Not provided"}
                  </p>
                </div>
                {profile.residentProfile && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Birthdate</p>
                      <p className="font-medium text-slate-900 dark:text-white flex items-center">
                        <Calendar className="h-4 w-4 mr-2 opacity-50" />
                        {format(new Date(profile.residentProfile.birthdate), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Gender</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {profile.residentProfile.gender}
                      </p>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="font-medium text-slate-900 dark:text-white flex items-center">
                        <MapPin className="h-4 w-4 mr-2 opacity-50" />
                        {profile.residentProfile.address}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Account Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Registered</span>
                <span className="text-sm font-medium">{format(new Date(profile.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Account Role</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 font-bold uppercase">{profile.role}</span>
              </div>
              {profile.role === 'RESIDENT' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Verification</span>
                  {profile.residentProfile?.isVerified ? (
                    <span className="text-xs font-bold text-green-600 flex items-center uppercase">
                      <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-yellow-600 flex items-center uppercase">
                      <BadgeAlert className="h-3 w-3 mr-1" /> Pending
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
