
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { authLimiter } from '@/utils/validation';
import { createSafeError, logSecurityEvent } from '@/utils/errorHandler';

export const useSecureAuth = () => {
  const auth = useAuth();
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Session timeout configuration (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Auto logout on session timeout
  useEffect(() => {
    if (!auth.user) return;

    const checkSession = () => {
      const timeSinceActivity = Date.now() - lastActivity;
      
      if (timeSinceActivity >= SESSION_TIMEOUT) {
        logSecurityEvent('session_timeout', { userId: auth.user?.id });
        auth.signOut();
        return;
      }

      // Show warning before timeout
      if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_TIME) {
        // TODO: Show session warning modal
        console.warn('Session will expire soon');
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [auth.user, lastActivity, auth]);

  const secureSignIn = async (email: string, password: string) => {
    const clientId = `${email}_${Date.now()}`;
    
    if (!authLimiter.isAllowed(clientId)) {
      logSecurityEvent('auth_rate_limit_exceeded', { email, clientId });
      throw createSafeError(
        new Error('Too many login attempts. Please try again later.'),
        'auth'
      );
    }

    try {
      const result = await auth.signIn(email, password);
      
      if (result.error) {
        logSecurityEvent('login_failed', { email, error: result.error.message });
      } else {
        logSecurityEvent('login_success', { email });
      }
      
      return result;
    } catch (error) {
      logSecurityEvent('login_error', { email, error });
      throw createSafeError(error, 'auth');
    }
  };

  const secureSignUp = async (email: string, password: string, fullName: string) => {
    const clientId = `${email}_signup_${Date.now()}`;
    
    if (!authLimiter.isAllowed(clientId)) {
      logSecurityEvent('signup_rate_limit_exceeded', { email, clientId });
      throw createSafeError(
        new Error('Too many signup attempts. Please try again later.'),
        'auth'
      );
    }

    try {
      const result = await auth.signUp(email, password, fullName);
      
      if (result.error) {
        logSecurityEvent('signup_failed', { email, error: result.error.message });
      } else {
        logSecurityEvent('signup_success', { email });
      }
      
      return result;
    } catch (error) {
      logSecurityEvent('signup_error', { email, error });
      throw createSafeError(error, 'auth');
    }
  };

  const secureSignInWithGoogle = async () => {
    try {
      const result = await auth.signInWithGoogle();
      
      if (result.error) {
        logSecurityEvent('google_signin_failed', { error: result.error.message });
      } else {
        logSecurityEvent('google_signin_success', {});
      }
      
      return result;
    } catch (error) {
      logSecurityEvent('google_signin_error', { error });
      throw createSafeError(error, 'auth');
    }
  };

  return {
    ...auth,
    secureSignIn,
    secureSignUp,
    secureSignInWithGoogle,
    sessionTimeRemaining: SESSION_TIMEOUT - (Date.now() - lastActivity)
  };
};
