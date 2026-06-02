'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, ShieldCheck, Crown, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';
import { updateProfile, updatePassword, signOutAction } from './actions';
import Link from 'next/link';

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  role: string;
};

export function ClientProfile({ userProfile, pricingText = '$9.99/mo' }: { userProfile: UserProfile, pricingText?: string }) {
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  const handleUpdateProfile = async (formData: FormData) => {
    setLoading(true);
    setMessage('');
    setError('');
    
    const result = await updateProfile(formData);
    
    if (result.error) setError(result.error);
    if (result.success) setMessage(result.success);
    
    setLoading(false);
  };

  const handleUpdatePassword = async (formData: FormData) => {
    setPwLoading(true);
    setPwMessage('');
    setPwError('');
    
    const result = await updatePassword(formData);
    
    if (result.error) setPwError(result.error);
    if (result.success) {
      setPwMessage(result.success);
      // Optional: clear inputs
      (document.getElementById('password') as HTMLInputElement).value = '';
      (document.getElementById('confirmPassword') as HTMLInputElement).value = '';
    }
    
    setPwLoading(false);
  };

  const isPremium = userProfile.role === 'premium' || userProfile.role === 'admin';

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
      
      {/* Left Column: Account Details & Security */}
      <div className="flex-1 space-y-8">
        
        {/* Account Details Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <User className="w-32 h-32" />
          </div>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <User className="text-pink-500 w-6 h-6" /> Account Details
          </h2>
          
          <form action={handleUpdateProfile} className="space-y-5 relative z-10">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm border border-red-500/20 font-medium">
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-500/10 text-green-400 p-3 rounded-xl text-sm border border-green-500/20 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="username"
                  name="username"
                  defaultValue={userProfile.username || ''}
                  placeholder="cooluser123"
                  className="bg-black/50 border-white/10 focus:border-pink-500/50 text-white pl-10 h-12 rounded-xl"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">This is how you will appear publicly in comments.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-300">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={userProfile.full_name || ''}
                  placeholder="Your Name"
                  className="bg-black/50 border-white/10 focus:border-pink-500/50 text-white pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={userProfile.email}
                  required
                  className="bg-black/50 border-white/10 focus:border-pink-500/50 text-white pl-10 h-12 rounded-xl"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">If you change your email, you must verify the new address.</p>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 h-12 rounded-xl transition-all"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </motion.div>

        {/* Security Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="text-violet-500 w-6 h-6" /> Security
          </h2>
          
          <form action={handleUpdatePassword} className="space-y-5 relative z-10">
            <AnimatePresence mode="wait">
              {pwError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm border border-red-500/20 font-medium">
                  {pwError}
                </motion.div>
              )}
              {pwMessage && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-500/10 text-green-400 p-3 rounded-xl text-sm border border-green-500/20 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {pwMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-black/50 border-white/10 focus:border-violet-500/50 text-white pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-black/50 border-white/10 focus:border-violet-500/50 text-white pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={pwLoading}
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 h-12 rounded-xl transition-all"
            >
              {pwLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </motion.div>

      </div>

      {/* Right Column: Subscription & Actions */}
      <div className="w-full lg:w-80 space-y-6">
        
        {/* Subscription Status Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`rounded-3xl p-6 border relative overflow-hidden ${
            isPremium 
              ? 'bg-gradient-to-b from-amber-500/20 to-amber-500/5 border-amber-500/30' 
              : 'bg-gradient-to-b from-pink-500/10 to-violet-500/10 border-pink-500/30'
          }`}
        >
          <div className="mb-4">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">Current Plan</h3>
            <div className="flex items-center gap-2">
              {isPremium ? (
                <>
                  <Crown className="w-6 h-6 text-amber-400" />
                  <span className="text-2xl font-black text-amber-400">VIP Premium</span>
                </>
              ) : (
                <>
                  <User className="w-6 h-6 text-white" />
                  <span className="text-2xl font-black text-white">Free Member</span>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-zinc-400 mb-6">
            {isPremium 
              ? "You have full access to all premium content, ad-free streaming, and exclusive drops."
              : "Upgrade to VIP to unlock all premium movies, series, and an ad-free experience."}
          </p>

          {!isPremium && (
            <form action="/api/square/checkout" method="POST">
              <Button 
                type="submit"
                className="w-full h-auto flex flex-col items-center justify-center bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:scale-[1.02]"
              >
                <span className="flex items-center text-lg">
                  Upgrade to VIP <ChevronRight className="w-4 h-4 ml-1" />
                </span>
                <span className="text-xs font-medium text-white/80 mt-1 uppercase tracking-wide">
                  {pricingText} - Cancel Anytime
                </span>
              </Button>
            </form>
          )}
          
          {userProfile.role === 'admin' && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link href="/admin">
                <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white">
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <form action={signOutAction}>
            <Button 
              type="submit"
              variant="destructive"
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 h-12 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}
