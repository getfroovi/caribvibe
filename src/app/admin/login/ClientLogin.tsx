'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminLogin } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export function ClientLogin({ error, message }: { error?: string, message?: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden relative items-center justify-center">
      {/* Minimalistic Admin Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-blue-900/10 blur-[120px] mix-blend-screen opacity-50 pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-900/10 blur-[120px] mix-blend-screen opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      </div>

      <motion.div 
        className="w-full max-w-[420px] px-6 relative z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex justify-center mb-8">
          <Link href="/">
            <img src="/logo.png" alt="theGriot.io" className="h-12 w-auto object-contain drop-shadow-2xl grayscale hover:grayscale-0 transition-all duration-500" />
          </Link>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-3xl p-8 lg:p-10 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Glossy top highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 mb-4 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              Admin Portal
            </h2>
            <p className="text-zinc-500 text-sm">
              Restricted access. Authorized personnel only.
            </p>
          </div>

          <form className="space-y-5" onSubmit={() => setLoading(true)} action={adminLogin}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20 font-medium text-center"
                >
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 text-green-400 p-3 rounded-lg text-sm border border-green-500/20 font-medium text-center"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  className="bg-zinc-950/50 border-white/5 focus:border-white/20 focus:ring-0 text-white pl-10 h-12 rounded-lg transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  className="bg-zinc-950/50 border-white/5 focus:border-white/20 focus:ring-0 text-white pl-10 h-12 rounded-lg transition-all shadow-inner" 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-white hover:bg-zinc-200 text-black rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 group mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-xs text-zinc-600">
              Not an administrator?{' '}
              <Link href="/login" className="text-zinc-400 font-medium hover:text-white transition-colors underline decoration-white/20 underline-offset-4">
                User Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
