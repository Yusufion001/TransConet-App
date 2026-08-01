import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

type UserRole = 'owner' | 'admin' | 'shipper' | 'transporter' | null;

type AuthContextType = {
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ session: null, role: null, isLoading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setIsLoading(false);
        }
      }).catch(err => {
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setRole(null);
          setIsLoading(false);
        }
      });
      return () => subscription?.unsubscribe();
    } catch (err) {
      setIsLoading(false);
    }
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setRole(data.role as UserRole);
      } else {
        // console.error('Error fetching role:', error);
      }
    } catch (err) {
      // console.error('Failed to fetch role', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, role, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
