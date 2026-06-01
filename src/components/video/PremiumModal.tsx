import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockKeyhole } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface PremiumModalProps {
  onUnlock: () => void;
}

export function PremiumModal({ onUnlock }: PremiumModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    modal_title: 'Unlock Full Video',
    modal_description: 'You\'ve reached the end of the free preview. Subscribe to watch the rest of this video and access our entire premium catalog.',
    benefits: ['Unlimited access to all premium videos', 'Ad-free viewing experience', 'Support your favorite creators'],
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('vip_settings').select('*').limit(1).single();
        if (data && !error) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching vip_settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleUnlock = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await res.json();
      if (data.url) {
        toast.success('Redirecting to secure checkout...');
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error(error);
      toast.error('Payment gateway error. Mocking unlock for demo.');
      onUnlock(); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <Card className="w-full max-w-sm shadow-2xl border-white/10 bg-black/80 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-tr from-pink-500 to-violet-500 p-3 rounded-full mb-4 w-fit">
            <LockKeyhole className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">{settings.modal_title}</CardTitle>
          <CardDescription className="text-gray-300 mt-2">
            {settings.modal_description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-300 mb-4">
            {settings.benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2">✓ {benefit}</li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button 
            className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold py-6 text-lg rounded-xl transition-all shadow-lg hover:shadow-pink-500/25"
            onClick={handleUnlock}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Subscribe Now'}
          </Button>
          <Link href="/vip" className="w-full">
            <Button variant="ghost" className="w-full text-pink-400 hover:text-pink-300 hover:bg-white/5 transition-colors">
              View Full VIP Benefits
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
