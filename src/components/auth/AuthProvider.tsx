'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useUserStore();
  const supabase = createClient();

  useEffect(() => {
    const fetchSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        setUser(session.user, profile?.role || 'free');
      } else {
        clearUser();
      }
    };

    fetchSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setUser(session.user, profile?.role || 'free');
        }
      } else if (event === 'SIGNED_OUT') {
        clearUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, clearUser, supabase]);

  return <>{children}</>;
}
