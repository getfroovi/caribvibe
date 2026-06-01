'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ImageUploader({ 
  currentUrl, 
  onUpload, 
  label, 
  aspectRatio = '16:9' 
}: { 
  currentUrl?: string, 
  onUpload: (url: string) => void, 
  label: string,
  aspectRatio?: '16:9' | '9:16'
}) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      
      onUpload(data.publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const aspectClass = aspectRatio === '9:16' ? 'aspect-[9/16] w-32 md:w-48' : 'aspect-video w-full max-w-sm';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none text-white">{label}</label>
      {currentUrl ? (
        <div className={`relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 ${aspectClass}`}>
          <img src={currentUrl} alt="Uploaded" className="w-full h-full object-cover" />
          <button 
            onClick={() => onUpload('')} 
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900 hover:bg-zinc-800/80 cursor-pointer transition ${aspectClass}`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
              <span className="text-xs text-zinc-400">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center p-4">
              <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
              <span className="text-xs text-zinc-400 font-medium text-center">Click to upload file<br/>({aspectRatio})</span>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
