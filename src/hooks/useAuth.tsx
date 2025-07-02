
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setIsAdmin(data.is_admin);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email_confirmed_at);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email, 'Email confirmed:', session.user.email_confirmed_at);
          
          // Check if email is not confirmed
          if (!session.user.email_confirmed_at) {
            console.log('Email not confirmed, user needs to verify email');
          }
        }
        
        if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed, checking email confirmation status');
          // Check if email was just confirmed during token refresh
          if (session.user.email_confirmed_at) {
            console.log('Email confirmed during token refresh');
            // Check if we're on a verification page
            if (window.location.pathname.includes('/auth/v1/verify') || 
                window.location.search.includes('type=signup')) {
              window.location.href = '/email-verified';
              return;
            }
          }
        }
        
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email_confirmed_at);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Use the current domain for redirect
    const redirectUrl = `${window.location.origin}/email-verified`;
    
    console.log('Signing up with redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) {
      console.error('Signup error:', error);
    } else {
      console.log('Signup successful, user should receive confirmation email');
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Sign in error:', error);
      
      // Provide more specific error handling
      if (error.message.includes('Email not confirmed')) {
        console.log('Email not confirmed error detected');
      }
    } else {
      console.log('Sign in successful');
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Attempting to reset password for:', email);
      
      // First check if user exists in our profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      console.log('Profile check result:', { profile, profileError });
      
      // If user doesn't exist in profiles, return a user not found error
      if (!profile) {
        console.log('User not found in profiles table');
        return { 
          error: { 
            message: 'User not found - not registered',
            code: 'user_not_found'
          }
        };
      }
      
      // User exists, proceed with password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      console.log('Reset password response:', { error });
      
      return { error };
    } catch (error: any) {
      console.log('Reset password error caught:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
