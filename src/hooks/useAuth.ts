import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

async function ensureProfile(userId: string): Promise<{ role: string; displayName: string }> {
  const { data } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', userId)
    .single();
  if (data) return { role: data.role, displayName: data.display_name ?? '' };
  await supabase.from('profiles').insert({ id: userId, role: 'free' });
  return { role: 'free', displayName: '' };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('free');
  const [savedDisplayName, setSavedDisplayName] = useState<string>('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        if (!session.user.is_anonymous) {
          ensureProfile(session.user.id).then(({ role, displayName }) => {
            setUserRole(role);
            setSavedDisplayName(displayName);
          });
        }
        setLoading(false);
      } else {
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (!error) setUser(data.user);
          setLoading(false);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && !session.user.is_anonymous) {
        ensureProfile(session.user.id).then(({ role, displayName }) => {
          setUserRole(role);
          setSavedDisplayName(displayName);
        });
      } else {
        setUserRole('free');
        setSavedDisplayName('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, userRole, savedDisplayName };
}
