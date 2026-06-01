'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlaySquare, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store';

export function BottomNav() {
  const pathname = usePathname();

  const { user } = useUserStore();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/feed', icon: PlaySquare, label: 'Feed' },
    { href: '/shop', icon: ShoppingBag, label: 'Shop' },
    { href: user ? '/profile' : '/login', icon: User, label: 'Profile' },
  ];

  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="md:hidden fixed bottom-0 w-full z-50 bg-black/80 backdrop-blur-lg border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-full h-full relative">
              <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`} />
              <span className={`text-[10px] mt-1 transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-pink-500 to-violet-500 rounded-b-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
