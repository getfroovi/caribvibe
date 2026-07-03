'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Code, Link as LinkIcon, Plus, Trash2, Edit2, X, Image as ImageIcon, Eye, EyeOff, Calendar } from 'lucide-react';
import { saveMagazineSettingsAction, saveMagazineIssueAction, deleteMagazineIssueAction } from '@/app/admin/settings-actions';

interface MagazineSettings {
  id: string;
  is_enabled: boolean;
}

interface MagazineIssue {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string;
  embed_url: string | null;
  embed_code: string | null;
  is_published: boolean;
  published_date: string;
}

export default function MagazineSettingsClient({ 
  initialSettings, 
  initialIssues 
}: { 
  initialSettings: MagazineSettings | null;
  initialIssues: MagazineIssue[];
}) {
  const [savingSettings, setSavingSettings] = useState(false);
  const [isEnabled, setIsEnabled] = useState(initialSettings?.is_enabled || false);
  const [issues, setIssues] = useState<MagazineIssue[]>(initialIssues);
  
  // CRUD states
  const [isEditing, setIsEditing] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Partial<MagazineIssue> | null>(null);
  const [savingIssue, setSavingIssue] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await saveMagazineSettingsAction({
        is_enabled: isEnabled,
        embed_url: '',
        embed_code: ''
      });
      
      if (!res.success) {
        throw new Error(res.error || 'Failed to save settings');
      }
      
      toast.success('Magazine section status updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(`Error saving settings: ${err.message || 'Failed to save settings'}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleStartAdd = () => {
    setEditingIssue({
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      title: '',
      description: '',
      cover_image_url: '',
      embed_url: '',
      embed_code: '',
      is_published: true,
      published_date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
  };

  const handleStartEdit = (issue: MagazineIssue) => {
    setEditingIssue({
      ...issue,
      published_date: issue.published_date ? new Date(issue.published_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
  };

  const handleSaveIssue = async () => {
    if (!editingIssue?.title || !editingIssue?.cover_image_url) {
      toast.error('Title and Cover Image URL are required fields.');
      return;
    }

    setSavingIssue(true);
    try {
      const payload = {
        id: editingIssue.id,
        title: editingIssue.title,
        description: editingIssue.description || '',
        cover_image_url: editingIssue.cover_image_url,
        embed_url: editingIssue.embed_url || '',
        embed_code: editingIssue.embed_code || '',
        is_published: editingIssue.is_published !== false,
        published_date: editingIssue.published_date ? new Date(editingIssue.published_date).toISOString() : new Date().toISOString()
      };

      const res = await saveMagazineIssueAction(payload);
      if (!res.success) {
        throw new Error(res.error || 'Failed to save issue');
      }

      toast.success('Magazine issue saved successfully!');
      
      // Reload page state or update list
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(`Error saving issue: ${err.message || 'Failed to save'}`);
    } finally {
      setSavingIssue(false);
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (!confirm('Are you sure you want to delete this magazine issue?')) return;
    setDeletingId(id);
    try {
      const res = await deleteMagazineIssueAction(id);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete issue');
      }
      toast.success('Magazine issue deleted successfully!');
      setIssues(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      console.error(err);
      toast.error(`Error deleting: ${err.message || 'Failed to delete'}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Magazine Management</h1>
          <p className="text-lg text-slate-500 mt-2">Publish interactive flip-books, arrange covers, and maintain past issue archives.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={savingSettings} className="bg-pink-600 text-white hover:bg-pink-700 rounded-none px-6 py-6 font-bold uppercase tracking-wider transition-all shadow-sm">
          <Save className="w-4 h-4 mr-2" /> {savingSettings ? 'Saving...' : 'Save Global Status'}
        </Button>
      </div>

      {/* Global Status Control */}
      <div className="bg-white border border-slate-200 rounded-none p-6 shadow-sm mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1 uppercase tracking-tight">Enable Magazine Section</h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Turn ON to make /magazine accessible. When OFF, visitors see a "Next Issue Dropping Soon" page.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pink-500 transition-colors"></div>
          </label>
        </div>
      </div>

      {/* Issues CRUD Area */}
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Magazine Issues</h2>
          <Button onClick={handleStartAdd} className="bg-white hover:bg-slate-50 text-violet-600 border border-slate-200 hover:border-violet-300 rounded-none px-4 py-5 font-bold uppercase tracking-wider transition-all shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add New Issue
          </Button>
        </div>

        {/* Issue Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.length === 0 ? (
            <div className="col-span-full text-center p-16 border border-dashed border-slate-300 rounded-none text-slate-500 bg-slate-50 font-semibold uppercase tracking-wider">
              No issues created yet. Click "Add New Issue" to get started!
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="bg-white border border-slate-200 rounded-none overflow-hidden relative shadow-sm transition-transform hover:-translate-y-1 flex flex-col group">
                {/* Cover Image Thumbnail */}
                <div className="aspect-[3/4] w-full bg-slate-100 relative overflow-hidden">
                  {issue.cover_image_url ? (
                    <img src={issue.cover_image_url} alt={issue.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  {/* Status Overlay Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1 font-bold text-[10px] uppercase tracking-wider shadow-sm border ${
                      issue.is_published 
                        ? 'bg-emerald-500/90 text-white border-emerald-400' 
                        : 'bg-amber-500/90 text-white border-amber-400'
                    }`}>
                      {issue.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Info and Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 uppercase tracking-tight">{issue.title}</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-pink-500" /> {new Date(issue.published_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-3 font-medium leading-relaxed">{issue.description || 'No description provided.'}</p>
                  </div>
                  
                  <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => handleStartEdit(issue)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-200 hover:border-violet-300 text-slate-700 hover:text-violet-600 font-bold text-xs uppercase tracking-wider transition-colors bg-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteIssue(issue.id)}
                      disabled={deletingId === issue.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-red-100 hover:border-red-300 text-red-500 hover:bg-red-50 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> {deletingId === issue.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Drawer Modal Overlay */}
      {isEditing && editingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  {editingIssue.id?.startsWith('temp-') ? 'Create Magazine Issue' : 'Edit Magazine Issue'}
                </h2>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Provide metadata and embeds for this publication</p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Issue Title *</label>
                <input
                  type="text"
                  value={editingIssue.title || ''}
                  onChange={e => setEditingIssue({...editingIssue, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all font-semibold"
                  placeholder="e.g. Issue #14: Summer Caribbean Vibe"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Description</label>
                <textarea
                  value={editingIssue.description || ''}
                  onChange={e => setEditingIssue({...editingIssue, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all h-24 resize-none"
                  placeholder="Summarize this issue's topics or highlights..."
                />
              </div>

              {/* Published Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-pink-500" /> Publication Date
                </label>
                <input
                  type="date"
                  value={editingIssue.published_date || ''}
                  onChange={e => setEditingIssue({...editingIssue, published_date: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Cover Image URL *</label>
                <input
                  type="url"
                  value={editingIssue.cover_image_url || ''}
                  onChange={e => setEditingIssue({...editingIssue, cover_image_url: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  placeholder="https://images.unsplash.com/... or Supabase storage path"
                  required
                />
                
                {editingIssue.cover_image_url && (
                  <div className="mt-3 aspect-[3/4] max-w-[120px] rounded-none overflow-hidden border border-slate-200">
                    <img src={editingIssue.cover_image_url} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Interactive Embed Settings</h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">Configure how this issue is viewed. Paste a direct link or embed iframe script.</p>
                </div>

                {/* Option A */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-pink-500" /> Option A: Direct Iframe URL
                  </label>
                  <input
                    type="url"
                    value={editingIssue.embed_url || ''}
                    onChange={e => setEditingIssue({...editingIssue, embed_url: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-none px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono"
                    placeholder="https://heyzine.com/flip-book/abc123456.html"
                  />
                </div>

                {/* Option B */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-violet-500" /> Option B: Raw Iframe Embed HTML Code (Overrides Option A)
                  </label>
                  <textarea
                    value={editingIssue.embed_code || ''}
                    onChange={e => setEditingIssue({...editingIssue, embed_code: e.target.value})}
                    className="w-full h-32 bg-[#1E1E1E] text-green-400 border border-slate-800 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono whitespace-pre placeholder:text-gray-600 resize-none"
                    placeholder={'<iframe src="https://heyzine.com/..." ...></iframe>'}
                    spellCheck="false"
                  />
                </div>
              </div>

              {/* Publish Checkbox */}
              <div className="pt-4 border-t border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={editingIssue.is_published !== false}
                      onChange={(e) => setEditingIssue({...editingIssue, is_published: e.target.checked})}
                      className="sr-only" 
                    />
                    <div className={`block w-10 h-6 rounded-none border border-slate-300 transition-colors ${editingIssue.is_published !== false ? 'bg-pink-600 border-pink-600' : 'bg-white'}`}></div>
                    <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-none border border-slate-300 transition-transform ${editingIssue.is_published !== false ? 'transform translate-x-4 bg-white border-white' : 'bg-slate-300'}`}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-pink-600 uppercase tracking-wider transition-colors flex items-center gap-1.5">
                    {editingIssue.is_published !== false ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-amber-500" />}
                    Publish immediately?
                  </span>
                </label>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-2">If unchecked, this issue will save as a Draft and remain hidden on /magazine.</p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t border-slate-200 flex gap-3 bg-slate-50 shrink-0">
              <Button 
                onClick={handleSaveIssue} 
                disabled={savingIssue} 
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-none py-6 font-bold uppercase tracking-wider transition-all"
              >
                {savingIssue ? 'Saving...' : 'Save Issue'}
              </Button>
              <Button 
                onClick={() => setIsEditing(false)} 
                variant="outline" 
                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-none py-6 font-bold uppercase tracking-wider transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
