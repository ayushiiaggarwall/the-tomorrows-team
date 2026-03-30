
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowLeft, RefreshCw, Lock, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [mode, setMode] = useState<'request' | 'update' | 'success'>('request');
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from the auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setMode('update');
        }
      }
    );

    // Check URL hash for recovery tokens (Supabase redirects with hash params)
    const hash = window.location.hash;
    if (hash && (hash.includes('type=recovery') || hash.includes('type=magiclink'))) {
      setMode('update');
    }

    // Also check URL search params (some flows use query params instead of hash)
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery') {
      setMode('update');
    }

    // Check if user already has an active session from the recovery link
    // (the PASSWORD_RECOVERY event may have already fired in the global auth listener)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // If we're on the reset-password page with an active session,
        // it's likely from a recovery link that was already processed
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        if (hashParams.get('type') === 'recovery' || 
            url.searchParams.get('type') === 'recovery' ||
            hash.includes('type=recovery')) {
          setMode('update');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        console.log('Reset password error:', error.message);
        
        if (error.message.includes('timeout') || 
            error.message.includes('Failed to reach hook') ||
            error.message.includes('maximum time')) {
          toast({
            title: "Request timeout",
            description: "The request is taking longer than expected. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        if (error.message.includes('User not found') || 
            error.message.includes('not registered') ||
            error.message.includes('Invalid login credentials') ||
            error.message.includes('Email not confirmed') ||
            error.message.includes('user_not_found') ||
            error.message.includes('signup_disabled') ||
            error.message.toLowerCase().includes('no user found')) {
          navigate('/user-not-found');
          return;
        }
        
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      } else {
        navigate(`/reset-email-sent?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      console.log('Reset password catch error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update password. Please try again.",
          variant: "destructive"
        });
      } else {
        setMode('success');
        toast({
          title: "Password updated!",
          description: "Your password has been successfully reset.",
        });
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    handleRequestReset({ preventDefault: () => {} } as React.FormEvent);
  };

  if (mode === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="py-20 px-4">
          <div className="max-w-md mx-auto">
            <Card className="feature-card text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-600">
                  Password Updated!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your password has been successfully reset. Redirecting to login...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (mode === 'update') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="py-20 px-4">
          <div className="max-w-md mx-auto">
            <Card className="feature-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Set new password
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  Enter your new password below.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="new-password" 
                        type="password" 
                        placeholder="Enter new password" 
                        className="pl-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required 
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="Confirm new password" 
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="feature-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Reset your password
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email address" 
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
                
                {retryCount > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleRetry}
                    disabled={loading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try again
                  </Button>
                )}
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to login
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPassword;
