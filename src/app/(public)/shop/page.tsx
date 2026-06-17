'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<{ is_enabled: boolean, store_url: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase.from('store_settings').select('*').limit(1).single();
        if (data && !error) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching store settings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 pt-12 md:pt-24 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If store is disabled or URL is missing
  if (!settings?.is_enabled || !settings?.store_url) {
    return (
      <div className="max-w-7xl mx-auto p-8 pt-12 md:pt-24 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag className="w-16 h-16 text-slate-800 mb-6 opacity-50" />
        <h1 className="text-4xl md:text-5xl font-black mb-4">Official <span className="text-pink-500">Store</span></h1>
        <p className="text-xl text-gray-400 font-bold uppercase tracking-widest max-w-lg">
          Merch dropping soon. Check back later!
        </p>
      </div>
    );
  }

  // Render Embedded Store via iframe
  return (
    <div className="w-full h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col overflow-hidden bg-white">
      <iframe 
        src={settings.store_url} 
        className="w-full h-full border-none"
        title="Official Store"
        allowFullScreen
      />
    </div>
  );
}
