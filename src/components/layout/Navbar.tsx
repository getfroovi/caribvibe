'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingBag, BookOpen, Info, Home, User, Crown, Tv } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store';
import { AuthRequiredModal } from './AuthRequiredModal';

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { siteMode, setSiteMode, user } = useUserStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleVIP = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSiteMode('premium');
  };

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/feed', label: 'Feed', icon: undefined },
    { href: '/about', label: 'About', icon: Info },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/magazine', label: 'Magazine', icon: BookOpen },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent tracking-tighter">
              theGriot.io
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-pink-400 ${
                  pathname === link.href ? 'text-white drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {mounted && (
              <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                <button
                  onClick={() => setSiteMode('free')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${siteMode === 'free' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  <Tv className="w-3.5 h-3.5" /> Free
                </button>
                <button
                  onClick={handleToggleVIP}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${siteMode === 'premium' ? 'bg-gradient-to-r from-amber-200 to-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  <Crown className="w-3.5 h-3.5" /> VIP
                </button>
              </div>
            )}

            <Link href={user ? "/profile" : "/login"} className="text-gray-300 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-4">
            {mounted && (
              <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10">
                <button
                  onClick={() => setSiteMode('free')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${siteMode === 'free' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  <Tv className="w-3 h-3" /> Free
                </button>
                <button
                  onClick={handleToggleVIP}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${siteMode === 'premium' ? 'bg-gradient-to-r from-amber-200 to-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  <Crown className="w-3 h-3" /> VIP
                </button>
              </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-black/90 backdrop-blur-lg border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href ? 'bg-white/10 text-pink-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {link.label}
                </Link>
              );
            })}
            <Link href={user ? "/profile" : "/login"} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">
              <User className="w-5 h-5" />
              {user ? 'Profile' : 'Account'}
            </Link>
          </div>
        </motion.div>
      )}

      {showAuthModal && <AuthRequiredModal onClose={() => setShowAuthModal(false)} />}
    </nav>
  );
}
