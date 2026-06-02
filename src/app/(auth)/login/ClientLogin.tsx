'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { login, signup, resetPassword } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail, Play, Sparkles, User } from 'lucide-react';
import Link from 'next/link';

export function ClientLogin({ error, message }: { error?: string, message?: string }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden relative">
      {/* Background Animated Elements for Desktop Right Side */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-pink-600/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[40%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen opacity-50" />
      </div>

      {/* Left Panel: Visual/Brand Side */}
      <motion.div 
        className="hidden lg:flex flex-1 relative flex-col justify-between p-12 bg-zinc-950 overflow-hidden z-10"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544644181-1484b3f8c85e?q=80&w=2000&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        </div>

        <div className="relative z-20">
          <Link href="/">
            <img src="/logo.png" alt="theGriot.io" className="h-16 w-auto object-contain drop-shadow-2xl" />
          </Link>
        </div>

        <div className="relative z-20 max-w-xl">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">Premium Content</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-6 drop-shadow-2xl">
              STORIES.<br/>ROOTS.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-400 to-violet-500">LEGACY.</span>
            </h1>
            <p className="text-lg text-zinc-300 font-medium leading-relaxed max-w-md">
              Immerse yourself in authentic cultural experiences. 
              Join our community to explore exclusive cinematic narratives.
            </p>
          </motion.div>
        </div>

        <div className="relative z-20 text-zinc-500 text-sm font-medium">
          © {new Date().getFullYear()} theGriot.io. All rights reserved.
        </div>
      </motion.div>

      {/* Right Panel: Form Side */}
      <motion.div 
        className="flex-1 flex items-center justify-center relative z-20 bg-black/60 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        {/* Mobile background image */}
        <div className="absolute inset-0 lg:hidden bg-cover bg-center opacity-30 mix-blend-luminosity" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544644181-1484b3f8c85e?q=80&w=1000&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        </div>

        <div className="w-full max-w-[420px] px-6 lg:px-12 relative z-30">
          <div className="lg:hidden flex justify-center mb-10">
            <img src="/logo.png" alt="theGriot.io" className="h-16 w-auto object-contain drop-shadow-2xl" />
          </div>

          <div className="bg-zinc-950/80 lg:bg-zinc-900/40 backdrop-blur-3xl p-8 lg:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Glossy top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                {isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create an account' : 'Welcome back')}
              </h2>
              <p className="text-zinc-400 text-sm">
                {isForgotPassword 
                  ? 'Enter your email address and we will send you a recovery link.' 
                  : (isSignUp ? 'Join the community and start your journey.' : 'Enter your details to access your account.')}
              </p>
            </div>

            <form className="space-y-5" onSubmit={() => setLoading(true)}>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm border border-red-500/20 font-medium"
                  >
                    {error}
                  </motion.div>
                )}
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-green-500/10 text-green-400 p-3 rounded-xl text-sm border border-green-500/20 font-medium"
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label htmlFor="username" className="text-zinc-300 font-medium">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="cooluser123"
                      required={isSignUp}
                      className="bg-black/50 border-white/10 focus:border-pink-500/50 focus:ring-pink-500/20 text-white pl-10 h-12 rounded-xl transition-all"
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 font-medium">
                  {isSignUp || isForgotPassword ? 'Email address' : 'Email or Username'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <Input
                    id="email"
                    name="email"
                    type={isSignUp || isForgotPassword ? "email" : "text"}
                    placeholder={isSignUp || isForgotPassword ? "name@example.com" : "name@example.com or username"}
                    required
                    className="bg-black/50 border-white/10 focus:border-pink-500/50 focus:ring-pink-500/20 text-white pl-10 h-12 rounded-xl transition-all"
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-zinc-300 font-medium">Password</Label>
                    {!isSignUp && (
                      <button 
                        type="button" 
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-pink-400 hover:text-pink-300 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      placeholder="••••••••"
                      required 
                      className="bg-black/50 border-white/10 focus:border-pink-500/50 focus:ring-pink-500/20 text-white pl-10 h-12 rounded-xl transition-all" 
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                formAction={isForgotPassword ? resetPassword : (isSignUp ? signup : login)} 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white rounded-xl font-bold text-base transition-all shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_30px_rgba(219,39,119,0.5)] flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isForgotPassword ? 'Send Reset Link' : (isSignUp ? 'Create Account' : 'Sign In')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              {isForgotPassword ? (
                <p className="text-sm text-zinc-400">
                  Remember your password?{' '}
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-white font-bold hover:text-pink-400 transition-colors underline decoration-white/30 underline-offset-4"
                  >
                    Back to login
                  </button>
                </p>
              ) : (
                <p className="text-sm text-zinc-400">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-white font-bold hover:text-pink-400 transition-colors underline decoration-white/30 underline-offset-4"
                  >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
