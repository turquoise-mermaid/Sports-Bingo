import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface ProfileResult {
  role: string;
  username: string;
  needsProfileCompletion: boolean;
}

async function fetchProfile(userId: string): Promise<ProfileResult> {
  const { data } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', userId)
    .single();

  if (data) {
    return {
      role: data.role ?? 'free',
      username: data.username ?? '',
      needsProfileCompletion: !data.username,
    };
  }

  await supabase.from('profiles').insert({ id: userId, role: 'free' });
  return { role: 'free', username: '', needsProfileCompletion: true };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('free');
  const [username, setUsername] = useState<string>('');
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  const applyProfile = ({ role, username: u, needsProfileCompletion: needs }: ProfileResult) => {
    setUserRole(role);
    setUsername(u);
    setNeedsProfileCompletion(needs);
  };

  const refetchProfile = async (userId: string) => {
    const result = await fetchProfile(userId);
    applyProfile(result);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        if (!session.user.is_anonymous) {
          const result = await fetchProfile(session.user.id);
          applyProfile(result);
        }
        setLoading(false);
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error) setUser(data.user);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && !session.user.is_anonymous) {
        fetchProfile(session.user.id).then(applyProfile);
      } else {
        setUserRole('free');
        setUsername('');
        setNeedsProfileCompletion(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, userRole, username, needsProfileCompletion, refetchProfile };
}
