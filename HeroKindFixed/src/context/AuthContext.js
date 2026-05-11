import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchUserProfile, updateUserProfile } from '../lib/db';

const XP_LEVELS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 200 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
];
const getLevelFromXp = (xp) =>
  XP_LEVELS.reduce((lvl, rule) => (xp ?? 0) >= rule.xp ? rule.level : lvl, 1);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const data = await fetchUserProfile(userId);
    setProfile(data);
  };

  const patchProfile = async (fields) => {
    if (!user?.id) return;
    const updatedFields = { ...fields };
    if ('xp' in fields) {
      updatedFields.level = getLevelFromXp(fields.xp);
    }
    setProfile(prev => prev ? { ...prev, ...updatedFields } : prev);
    await updateUserProfile(user.id, updatedFields);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, fetchProfile, patchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
