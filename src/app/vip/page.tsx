import { createClient } from '@/lib/supabase/server';
import { Crown, CheckCircle2, ShieldCheck, PlaySquare, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';

export const revalidate = 0;

export default async function VIPPage() {
  const supabase = await createClient();
  
  // Try to fetch custom settings, fallback to defaults
  const { data: settings } = await supabase.from('vip_settings').select('*').limit(1).single();

  const title = settings?.page_title || 'Become a VIP Member';
  const description = settings?.page_description || 'Get the ultimate theGriot.io experience. Gain unlimited access to premium exclusive content, ad-free viewing, and support local creators.';
  const pricingText = settings?.pricing_text || '$9.99/month';
  const benefits = settings?.benefits || [
    'Unlimited access to all premium videos',
    'Ad-free viewing experience',
    'Support your favorite creators'
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="pt-24 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16 mt-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-pink-500/20 to-violet-500/20 rounded-full mb-6 border border-pink-500/30">
            <Crown className="w-12 h-12 text-pink-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent tracking-tighter">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Benefits Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Gem className="w-32 h-32 text-pink-500" />
            </div>
            
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <ShieldCheck className="text-pink-500 w-6 h-6" /> VIP Benefits Include
            </h2>
            
            <ul className="space-y-6 relative z-10">
              {benefits.map((benefit: string, index: number) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="mt-1 bg-pink-500/20 p-1 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-pink-500" />
                  </div>
                  <span className="text-lg text-gray-200 font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Card */}
          <div className="bg-gradient-to-b from-pink-500/10 to-violet-500/10 border border-pink-500/30 rounded-3xl p-8 md:p-10 text-center relative overflow-hidden shadow-[0_0_50px_-12px_rgba(236,72,153,0.3)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-500/20 via-black/0 to-black/0 pointer-events-none" />
            
            <h3 className="text-xl font-semibold text-pink-400 mb-2">Premium Subscription</h3>
            <div className="text-5xl font-black mb-2 flex items-center justify-center gap-1">
              {pricingText.split('/')[0]}
              <span className="text-xl text-gray-400 font-normal">/{pricingText.split('/')[1] || 'mo'}</span>
            </div>
            <p className="text-gray-400 mb-10 text-sm">Cancel anytime. Billed securely.</p>

            <form action="/api/square/checkout" method="POST">
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-black py-8 text-xl rounded-2xl transition-all shadow-xl hover:shadow-pink-500/25 hover:scale-105"
              >
                Subscribe Now
              </Button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <PlaySquare className="w-4 h-4" /> HD/4K Video
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Secure Payment
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
