'use client';

import { useState } from 'react';
import { ShoppingBag, Store } from 'lucide-react';

interface StoreSettings {
  is_enabled: boolean;
  store_url: string;
  is_etsy_enabled: boolean;
  etsy_url: string;
}

export default function ShopClient({ settings }: { settings: StoreSettings | null }) {
  const hasMain = settings?.is_enabled && settings?.store_url;
  const hasEtsy = settings?.is_etsy_enabled && settings?.etsy_url;
  
  // Set initial tab based on what's enabled
  const initialTab = !hasMain && hasEtsy ? 'etsy' : 'main';
  const [activeTab, setActiveTab] = useState<'main' | 'etsy'>(initialTab);

  if (!hasMain && !hasEtsy) {
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

  const showTabs = hasMain && hasEtsy;
  const rawUrl = activeTab === 'main' ? settings?.store_url : settings?.etsy_url;
  
  const cleanIframeUrl = (val?: string) => {
    if (!val) return '';
    const match = val.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : val.trim();
  };
  const activeUrl = cleanIframeUrl(rawUrl);

  return (
    <div className="w-full h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col overflow-hidden bg-white">
      
      {/* Tab Navigation (Only visible if both are enabled) */}
      {showTabs && (
        <div className="w-full bg-slate-50 border-b border-slate-200 flex justify-center px-4 pt-4 shrink-0">
          <div className="flex gap-2 max-w-sm w-full">
            <button 
              onClick={() => setActiveTab('main')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-bold text-sm uppercase tracking-wider rounded-t-xl transition-all ${
                activeTab === 'main' 
                  ? 'bg-white text-pink-600 border-t-2 border-l border-r border-pink-500 shadow-sm relative z-10' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 border-t-2 border-transparent'
              }`}
            >
              <Store className="w-4 h-4" /> Official
            </button>
            <button 
              onClick={() => setActiveTab('etsy')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-bold text-sm uppercase tracking-wider rounded-t-xl transition-all ${
                activeTab === 'etsy' 
                  ? 'bg-white text-[#F1641E] border-t-2 border-l border-r border-[#F1641E] shadow-sm relative z-10' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 border-t-2 border-transparent'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Etsy
            </button>
          </div>
        </div>
      )}

      {/* iframe Container */}
      <div className="flex-1 w-full bg-white relative">
        {activeUrl ? (
          <iframe 
            src={activeUrl} 
            className="absolute inset-0 w-full h-full border-none"
            title={activeTab === 'main' ? "Official Store" : "Etsy Store"}
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-sm">
            Store URL not configured
          </div>
        )}
      </div>
    </div>
  );
}
