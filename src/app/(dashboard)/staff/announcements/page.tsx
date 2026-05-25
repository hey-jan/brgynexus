"use client";

import * as React from "react";
import { format } from "date-fns";
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Megaphone, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function StaffAnnouncementsPage() {
  const { data: announcements = [], isLoading, refetch: fetchAnnouncements } = useQuery({
    queryKey: ['staff-announcements'],
    queryFn: async () => {
      const res = await fetch('/api/announcements');
      if (!res.ok) throw new Error('Failed to fetch announcements');
      return res.json();
    }
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [priority, setPriority] = React.useState('NORMAL');
  const [editId, setEditId] = React.useState<string | null>(null);


  const handleOpenModal = (announcement: any = null) => {
    if (announcement) {
      setEditId(announcement.id);
      setTitle(announcement.title);
      setContent(announcement.content);
      setPriority(announcement.priority);
    } else {
      setEditId(null);
      setTitle('');
      setContent('');
      setPriority('NORMAL');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setTitle('');
    setContent('');
    setPriority('NORMAL');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = editId ? 'PATCH' : 'POST';
    const url = editId ? `/api/announcements/${editId}` : '/api/announcements';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, priority })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save announcement');
      }

      toast.success(editId ? 'Announcement updated' : 'Announcement created');
      fetchAnnouncements();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-slate-500">Manage public announcements for the barangay.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Megaphone className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Loading announcements...</td></tr>
              ) : announcements.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">No announcements found.</td></tr>
              ) : (
                announcements.map((announcement: any) => (
                  <tr key={announcement.id}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                      {announcement.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {announcement.author?.firstName} {announcement.author?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenModal(announcement)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => handleDelete(announcement.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editId ? 'Edit Announcement' : 'New Announcement'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Scheduled Power Interruption" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                  <Textarea 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    placeholder="Write the full announcement details here..." 
                    required 
                    className="min-h-[150px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:border-slate-700 dark:text-slate-50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  >
                    <option value="NORMAL" className="dark:bg-slate-900">NORMAL</option>
                    <option value="HIGH" className="dark:bg-slate-900">HIGH</option>
                    <option value="EMERGENCY" className="dark:bg-slate-900">EMERGENCY</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 shrink-0 bg-slate-50 dark:bg-slate-950/50">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Announcement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
