"use client";

import * as React from "react";
import { format } from "date-fns";
import { 
  Users, 
  Upload, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  X,
  FileSpreadsheet,
  ArrowRight,
  Info
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function UserManagementPage() {
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    }
  });
  
  // Bulk upload states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [results, setResults] = React.useState<any | null>(null);



  const getRoleColor = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'STAFF': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  // Client-side self-contained CSV Template generator
  const downloadTemplate = () => {
    const csvHeaders = "firstName,middleName,lastName,email,phone,gender,address,birthdate,civilStatus,residentType,lengthOfStay\n";
    const csvSample = "Juan,,Dela Cruz,juan.delacruz@example.com,09171234567,Male,123 Sampaguita St.,1990-01-01,Single,Permanent,\nMaria,Santos,Dalisay,maria.dalisay@example.com,09187654321,Female,456 Narra St.,1985-05-15,Married,Permanent,\n";
    const blob = new Blob([csvHeaders + csvSample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "brgynexus_residents_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Template downloaded successfully!");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setResults(null);
    } else {
      toast.error("Please upload a valid CSV file (.csv)");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setResults(null);
      } else {
        toast.error("Please select a valid CSV file (.csv)");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/users/bulk", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process CSV file");
      }

      setResults(data);
      
      // Refresh user list dynamically
      refetch();
        
      if (data.errorCount === 0) {
        toast.success(`Successfully registered ${data.successCount} residents!`);
      } else if (data.successCount > 0) {
        toast.warning(`Registered ${data.successCount} residents, but ${data.errorCount} rows had errors.`);
      } else {
        toast.error("Failed to register any residents. Check the error list below.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setResults(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Bulk Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <Users className="h-7 w-7 mr-3 text-blue-600 dark:text-blue-400" />
            User Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, inspect, and manage system users or upload new resident profiles in bulk.
          </p>
        </div>
        <Button 
          onClick={() => {
            resetModal();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold rounded-xl px-5 py-2.5"
        >
          <Upload className="h-4.5 w-4.5" />
          Bulk Register Residents
        </Button>
      </div>

      {/* Main Users Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Registered</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* High-Fidelity Dialog Modal for Bulk CSV Registration */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bulk Resident Registration</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Import hundreds of residents in seconds using a CSV file</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Informative Alert Banner */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Instructions & Guidelines</p>
                  <p className="text-xs leading-relaxed text-blue-700/90 dark:text-blue-300/80">
                    Residents imported in bulk are automatically <strong>verified</strong>. They will be assigned a default temporary password: <code className="bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded font-mono font-bold">WelcomeNexus123!</code> which they should update upon their first login.
                  </p>
                </div>
              </div>

              {/* Template Download Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Need a CSV template?</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Download our pre-structured template containing sample columns.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 border-slate-300 hover:border-slate-400 dark:border-slate-700 font-semibold rounded-lg shrink-0"
                >
                  <Download className="h-4 w-4 text-blue-500" />
                  Download Template
                </Button>
              </div>

              {/* Drag-and-Drop / File Picker Zone */}
              {!results && (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    isDragging 
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" 
                      : file 
                        ? "border-green-500 bg-green-50/10 dark:bg-green-950/5" 
                        : "border-slate-300 hover:border-blue-400 dark:border-slate-700 dark:hover:border-slate-600 bg-slate-50/30 dark:bg-slate-950/10"
                  }`}
                  onClick={() => document.getElementById('csvFileInput')?.click()}
                >
                  <input 
                    type="file" 
                    id="csvFileInput" 
                    className="hidden" 
                    accept=".csv" 
                    onChange={handleFileChange}
                    disabled={isProcessing}
                  />
                  
                  {file ? (
                    <>
                      <div className="p-4 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-2xl mb-3 animate-bounce">
                        <FileSpreadsheet className="h-10 w-10" />
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {(file.size / 1024).toFixed(2)} KB • Ready to upload
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline mt-4 flex items-center gap-1 cursor-pointer"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-2xl mb-3">
                        <Upload className="h-10 w-10" />
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Drag & drop your CSV file here, or <span className="text-blue-600 dark:text-blue-400 hover:underline">browse</span>
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                        Supports standard CSV files (.csv) up to 5MB
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Progress Loader during CSV ingestion */}
              {isProcessing && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 rounded-full animate-ping absolute opacity-20"></div>
                    <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-base">Processing CSV Upload...</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                      Parsing fields, generating verified resident profiles, and pre-hashing user accounts. Please wait...
                    </p>
                  </div>
                </div>
              )}

              {/* Comprehensive Processing Summary Report */}
              {results && (
                <div className="space-y-6">
                  
                  {/* Results Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Processed</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{results.total}</p>
                    </div>
                    <div className="p-4 bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl text-center">
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider mb-1">Success</p>
                      <p className="text-2xl font-black text-green-700 dark:text-green-400">{results.successCount}</p>
                    </div>
                    <div className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-center">
                      <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider mb-1">Failed Rows</p>
                      <p className="text-2xl font-black text-red-700 dark:text-red-400">{results.errorCount}</p>
                    </div>
                  </div>

                  {/* Successful Registrations List */}
                  {results.successCount > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4.5 w-4.5 text-green-600 dark:text-green-400" />
                        Successfully Registered ({results.successCount})
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                        {results.successes.map((suc: any, idx: number) => (
                          <div key={idx} className="p-3 flex justify-between items-center gap-3">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{suc.name}</span>
                            <span className="text-slate-500 dark:text-slate-400 font-mono">{suc.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Logs List */}
                  {results.errorCount > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
                        Import and Parsing Errors ({results.errorCount})
                      </h4>
                      <div className="bg-red-50/30 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-xl max-h-48 overflow-y-auto divide-y divide-red-100 dark:divide-red-900/20 text-xs">
                        {results.errors.map((err: any, idx: number) => (
                          <div key={idx} className="p-3 flex items-start gap-3">
                            <span className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-2 py-0.5 rounded font-mono font-black shrink-0">
                              Row {err.row}
                            </span>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{err.name}</p>
                              <p className="text-red-600 dark:text-red-400 mt-0.5">{err.error}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-950/20">
              {results ? (
                <Button 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl px-5"
                >
                  Close & Done
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    disabled={isProcessing}
                    className="border-slate-300 hover:border-slate-400 text-slate-700 dark:border-slate-700 dark:text-slate-300 rounded-xl px-5"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={!file || isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6"
                  >
                    Upload and Process
                  </Button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
