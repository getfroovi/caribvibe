import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'

interface UserState {
  user: User | null;
  role: 'admin' | 'free' | 'premium' | null;
  siteMode: 'free' | 'premium';
  setSiteMode: (mode: 'free' | 'premium') => void;
  setUser: (user: User | null, role?: 'admin' | 'free' | 'premium') => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      siteMode: 'free',
      setSiteMode: (mode) => set({ siteMode: mode }),
      setUser: (user, role = 'free') => set({ user, role }),
      clearUser: () => set({ user: null, role: null }),
    }),
    {
      name: 'caribvibe-storage',
    }
  )
)
