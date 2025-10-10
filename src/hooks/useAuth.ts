import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
          return;
        }

        setAuthState({
          user: session?.user || null,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setAuthState({
          user: session?.user || null,
          loading: false,
          error: null,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { data: null, error };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { data: null, error: { message: errorMessage } };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { data: null, error };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { data: null, error: { message: errorMessage } };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: { message: errorMessage } };
    }
  };


  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
};
