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

  const processStoredReferralCode = async (userId: string) => {
    const storedReferralCode = localStorage.getItem('pendingReferralCode');
    if (!storedReferralCode) return;

    console.log('Processing stored referral code:', storedReferralCode, 'for user:', userId);

    try {
      // First try exact match (in case someone enters full UUID)
      const { data: exactMatch, error: exactError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', storedReferralCode);
        
      if (exactMatch && exactMatch.length > 0) {
        console.log('Found exact UUID match:', exactMatch[0].id);
        const referrerId = exactMatch[0].id;
        await createReferralRelationship(referrerId, userId, storedReferralCode);
        localStorage.removeItem('pendingReferralCode');
        return;
      }
      
      // If no exact match, fetch all profiles and filter client-side for partial UUID match
      console.log('No exact match found, trying client-side filtering...');
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, full_name');
        
      if (allError) {
        console.error('Error fetching profiles:', allError);
        return;
      }
      
      // Filter client-side for UUID starting with referral code
      const matchingProfile = allProfiles?.find(profile => 
        profile.id.toLowerCase().startsWith(storedReferralCode.toLowerCase())
      );
      
      if (!matchingProfile) {
        console.log('No referrer found for code:', storedReferralCode);
        localStorage.removeItem('pendingReferralCode');
        return;
      }
      
      console.log('Found referrer via client-side filtering:', matchingProfile.id);
      await createReferralRelationship(matchingProfile.id, userId, storedReferralCode);
      localStorage.removeItem('pendingReferralCode');

    } catch (error) {
      console.error('Error processing stored referral:', error);
      localStorage.removeItem('pendingReferralCode');
    }
  };

  const createReferralRelationship = async (referrerId: string, newUserId: string, referralCode: string) => {
    // Don't allow self-referrals
    if (referrerId === newUserId) {
      console.log('Self-referral attempted, ignoring');
      return;
    }

    // Check if referral relationship already exists
    const { data: existingReferral } = await supabase
      .from('user_referrals')
      .select('id')
      .eq('referred_id', newUserId)
      .single();

    if (existingReferral) {
      console.log('Referral relationship already exists');
      return;
    }

    console.log('Creating referral relationship:', { referrerId, newUserId, referralCode });

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
      console.error('Error storing referral:', referralError);
    } else {
      console.log('Referral relationship stored successfully:', data);
      
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
            console.error('Error creating signup notification:', notificationError);
          } else {
            console.log('Signup notification sent successfully');
          }
        } catch (error) {
          console.error('Error sending signup notification:', error);
        }
      }, 2000); // Wait 2 seconds for profile to be fully created
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
          console.log('Token refreshed, checking email confirmation status');
          // Check if email was confirmed during token refresh
          if (session.user.email_confirmed_at) {
            console.log('Email confirmed during token refresh');
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
      console.log('Initial session check:', session?.user?.email_confirmed_at);
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
