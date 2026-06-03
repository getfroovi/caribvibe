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
    <div className="flex h-screen w-full bg-white overflow-hidden relative items-center justify-center">
      {/* Minimalistic Admin Background */}
      <div className="absolute inset-0 z-0 bg-gray-50">
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

        <div className="bg-white p-8 lg:p-10 rounded-none border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-none bg-gray-100 border border-black mb-4">
              <ShieldAlert className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-2xl font-black text-black tracking-tight mb-2 uppercase">
              Admin Portal
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
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
                  className="bg-red-50 text-red-600 p-3 rounded-none text-xs border border-black font-bold uppercase tracking-wider text-center"
                >
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 text-green-600 p-3 rounded-none text-xs border border-black font-bold uppercase tracking-wider text-center"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  className="bg-white border-black focus:border-black focus:ring-1 focus:ring-black text-black pl-10 h-12 rounded-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  className="bg-white border-black focus:border-black focus:ring-1 focus:ring-black text-black pl-10 h-12 rounded-none transition-all" 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-none font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 group mt-4 border border-transparent"
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

          <div className="mt-8 text-center border-t border-black pt-6">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Not an administrator?{' '}
              <Link href="/login" className="text-black font-black hover:text-gray-700 transition-colors underline decoration-black underline-offset-4">
                User Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
