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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative items-center justify-center">
      {/* Minimalistic Admin Background */}
      <div className="absolute inset-0 z-0 bg-slate-50">
      </div>

      <motion.div 
        className="w-full max-w-[420px] px-6 relative z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex justify-center mb-8">
          <Link href="/">
            <img src="/logo.png" alt="theGriot.io" className="h-12 w-auto object-contain filter invert drop-shadow-sm transition-all duration-500" />
          </Link>
        </div>

        <div className="bg-white p-8 lg:p-10 rounded-none border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-none bg-pink-50 text-pink-600 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2 uppercase">
              Admin Portal
            </h2>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
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
                  className="bg-red-50 text-red-600 p-3 rounded-none text-xs border border-red-200 font-semibold uppercase tracking-wider text-center"
                >
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 text-green-600 p-3 rounded-none text-xs border border-green-200 font-semibold uppercase tracking-wider text-center"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  className="bg-slate-50 border-slate-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-slate-900 pl-10 h-12 rounded-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  className="bg-slate-50 border-slate-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-slate-900 pl-10 h-12 rounded-none transition-all" 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white rounded-none font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 group mt-4 border border-transparent shadow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-slate-200 pt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Not an administrator?{' '}
              <Link href="/login" className="text-pink-600 font-bold hover:text-pink-700 transition-colors underline decoration-pink-600 underline-offset-4">
                User Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
