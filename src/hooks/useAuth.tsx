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
  signInWithGoogle: () => Promise<{ error: any }>;
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
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      // If no profile exists (user was deleted), sign them out silently
      if (!data) {
        await supabase.auth.signOut();
        return;
      }
      
      setIsAdmin(data.is_admin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const processStoredReferralCode = async (userId: string) => {
    const storedReferralCode = localStorage.getItem('pendingReferralCode');
    if (!storedReferralCode) return;

    // Processing stored referral code for user

    try {
      // First try exact match (in case someone enters full UUID)
      const { data: exactMatch, error: exactError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', storedReferralCode);
        
      if (exactMatch && exactMatch.length > 0) {
        // Found exact UUID match
        const referrerId = exactMatch[0].id;
        await createReferralRelationship(referrerId, userId, storedReferralCode);
        localStorage.removeItem('pendingReferralCode');
        return;
      }
      
      // If no exact match, fetch all profiles and filter client-side for partial UUID match
      // No exact match found, trying client-side filtering...
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, full_name');
        
      if (allError) {
        // Error fetching profiles
        return;
      }
      
      // Filter client-side for UUID starting with referral code
      const matchingProfile = allProfiles?.find(profile => 
        profile.id.toLowerCase().startsWith(storedReferralCode.toLowerCase())
      );
      
      if (!matchingProfile) {
        // No referrer found for code
        localStorage.removeItem('pendingReferralCode');
        return;
      }
      
      // Found referrer via client-side filtering
      await createReferralRelationship(matchingProfile.id, userId, storedReferralCode);
      localStorage.removeItem('pendingReferralCode');

    } catch (error) {
      // Error processing stored referral
      localStorage.removeItem('pendingReferralCode');
    }
  };

  const createReferralRelationship = async (referrerId: string, newUserId: string, referralCode: string) => {
    // Don't allow self-referrals
    if (referrerId === newUserId) {
      return;
    }

    // Check if referral relationship already exists
    const { data: existingReferral } = await supabase
      .from('user_referrals')
      .select('id')
      .eq('referred_id', newUserId)
      .single();

    if (existingReferral) {
      // Referral relationship already exists
      return;
    }

    // Creating referral relationship

    // Store the referral relationship - database triggers will handle notifications
    const { data, error: referralError } = await supabase
      .from('user_referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: newUserId,
        referral_code: referralCode.toUpperCase(),
        status: 'pending'
      })
      .select();

    if (referralError) {
      // Error storing referral
    } else {
      // Referral relationship stored successfully
      
      // Manually trigger signup notification since trigger might not fire immediately
      setTimeout(async () => {
        try {
          const { data: referrerProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', referrerId)
            .single();

          const { data: referredProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newUserId)
            .single();

          // Create signup notification manually
          const { error: notificationError } = await supabase.rpc('create_notification', {
            p_user_id: referrerId,
            p_title: '👥 Friend Joined!',
            p_message: `${referredProfile?.full_name || 'Someone'} just signed up using your referral code! They'll need to attend their first GD for you to earn bonus points.`,
            p_type: 'info',
            p_metadata: JSON.stringify({
              referred_user_id: newUserId,
              referred_user_name: referredProfile?.full_name,
              referral_code: referralCode.toUpperCase()
            })
          });

          if (notificationError) {
            // Error creating signup notification
          } else {
            // Signup notification sent successfully
          }
        } catch (error) {
          // Error sending signup notification
        }
      }, 2000); // Wait 2 seconds for profile to be fully created
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Auth state change event
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in successfully
          
          // Process any stored referral code after successful sign in
          if (session.user.email_confirmed_at) {
            setTimeout(() => {
              processStoredReferralCode(session.user.id);
            }, 1000); // Small delay to ensure profile is created
          }
          
          // If email is confirmed and we're on an auth-related page, redirect to dashboard
          if (session.user.email_confirmed_at) {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/login') || currentPath.includes('/auth') || 
                currentPath.includes('/check-email') || currentPath.includes('/email-verified')) {
              window.location.href = '/dashboard';
              return;
            }
          }
        }
        
        if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token refreshed, checking email confirmation status
          // Check if email was confirmed during token refresh
          if (session.user.email_confirmed_at) {
            // Email confirmed during token refresh
            // Process any stored referral code
            setTimeout(() => {
              processStoredReferralCode(session.user.id);
            }, 1000);
            
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
      // Initial session check
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
        
        // Process any stored referral code for existing confirmed users
        if (session.user.email_confirmed_at) {
          setTimeout(() => {
            processStoredReferralCode(session.user.id);
          }, 1000);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Use the current domain for redirect
    const redirectUrl = `${window.location.origin}/email-verified`;
    
    // Signing up with redirect URL
    
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
      // Signup error occurred
    } else {
      // Signup successful, user should receive confirmation email
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      // Sign in error
      
      // Provide more specific error handling
      if (error.message.includes('Email not confirmed')) {
        // Email not confirmed error detected
      }
      return { error };
    }
    
    // If auth succeeded, check if profile exists (for deleted users)
    if (data.user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
        
        // If no profile exists, sign out and return error
        if (!profile) {
          await supabase.auth.signOut();
          return { 
            error: { 
              message: 'Invalid login credentials',
              code: 'invalid_credentials'
            }
          };
        }
      } catch (profileError) {
        // If profile check fails, sign out and return error
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Invalid login credentials',
            code: 'invalid_credentials'
          }
        };
      }
    }
    
    // Sign in successful
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    try {
      // Attempting to reset password
      
      // First check if user exists in our profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      // Profile check result
      
      // If user doesn't exist in profiles, return a user not found error
      if (!profile) {
        // User not found in profiles table
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
      
      // Reset password response
      
      return { error };
    } catch (error: any) {
      // Reset password error caught
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    console.log('Attempting Google sign-in');
    
    try {
      // Use direct window redirect to avoid iframe issues
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        return { error };
      }

      console.log('Google sign-in initiated');
      return { error: null };
    } catch (err: any) {
      console.error('Google sign-in exception:', err);
      return { error: err };
    }
  };

  const value = {
    user,
    session,
    isAdmin,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
