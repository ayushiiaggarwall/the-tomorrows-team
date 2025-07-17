
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, Users } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    referralCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  
  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = isSignUp ? 'Sign Up - The Tomorrows Team' : 'Sign In - The Tomorrows Team';
  }, [isSignUp]);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleResendVerification = async () => {
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }

    setIsResendingVerification(true);
    try {
      // Try to resend verification by attempting signup again with the same email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verified`
        }
      });

      if (error) {
        // If resend fails, try the signup approach as fallback
        const signupResult = await signUp(formData.email, 'temp-password-resend', formData.fullName || 'User');
        if (signupResult.error && !signupResult.error.message.includes('already')) {
          throw signupResult.error;
        }
      }

      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
      });
      
      navigate(`/check-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast({
        title: "Resend Failed",
        description: "Failed to resend verification email. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const processReferralCode = async (referralCode: string, newUserId: string) => {
    if (!referralCode.trim()) return;

    try {
      console.log('Processing referral code:', referralCode, 'for user:', newUserId);
      
      // First try exact match (in case someone enters full UUID)
      const { data: exactMatch, error: exactError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', referralCode);
        
      if (exactMatch && exactMatch.length > 0) {
        console.log('Found exact UUID match:', exactMatch[0].id);
        const referrerId = exactMatch[0].id;
        await createReferralRelationship(referrerId, newUserId, referralCode);
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
        profile.id.toLowerCase().startsWith(referralCode.toLowerCase())
      );
      
      if (!matchingProfile) {
        console.log('No referrer found for code:', referralCode);
        toast({
          title: "Invalid Referral Code",
          description: "The referral code you entered is not valid.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Found referrer via client-side filtering:', matchingProfile.id);
      await createReferralRelationship(matchingProfile.id, newUserId, referralCode);

    } catch (error) {
      console.error('Error processing referral:', error);
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

    // Store the referral relationship - database triggers will handle notifications
    const { error: referralError } = await supabase
      .from('user_referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: newUserId,
        referral_code: referralCode.toUpperCase(),
        status: 'pending'
      });

    if (referralError) {
      console.error('Error storing referral:', referralError);
    } else {
      console.log('Referral relationship stored successfully');
      toast({
        title: "Referral Applied",
        description: "Your referral code has been applied successfully!",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowResendOption(false);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords don't match",
            variant: "destructive"
          });
          return;
        }

        if (!formData.fullName.trim()) {
          toast({
            title: "Error",
            description: "Full name is required",
            variant: "destructive"
          });
          return;
        }

        // Check if user is already registered in profiles table
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', formData.email)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing user:', checkError);
          toast({
            title: "Error",
            description: "Unable to verify registration status. Please try again.",
            variant: "destructive"
          });
          return;
        }

        if (existingUser) {
          // User already exists, redirect to already registered page
          navigate(`/already-registered?email=${encodeURIComponent(formData.email)}`);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          // Make hook timeout errors more user-friendly
          let errorMessage = error.message;
          if (error.message.includes('Failed to reach hook') || error.message.includes('maximum time')) {
            errorMessage = 'Failed to signup. Please try again.';
          }
          
          toast({
            title: "Sign up failed",
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          // Store referral code for processing after email verification
          if (formData.referralCode.trim()) {
            localStorage.setItem('pendingReferralCode', formData.referralCode.trim());
          }
          
          // Redirect to check email page with the email address
          navigate(`/check-email?email=${encodeURIComponent(formData.email)}`);
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          // Check if it's an email not confirmed error
          if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
            setShowResendOption(true);
            toast({
              title: "Email Not Verified",
              description: "Please verify your email address. Click 'Resend Verification' if you didn't receive the email.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Sign in failed",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Redirect to dedicated reset password page
    navigate('/reset-password');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Google Sign In Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="feature-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {isSignUp ? 'Join The Tomorrows Team' : 'Welcome Back'}
              </CardTitle>
              <p className="text-center text-muted-foreground">
                {isSignUp 
                  ? 'Create your account to start your journey' 
                  : 'Sign in to continue to your dashboard'
                }
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="fullName" 
                        placeholder="Enter your full name" 
                        className="pl-10"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password" 
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="confirmPassword" 
                          type="password"
                          placeholder="Confirm your password" 
                          className="pl-10"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="referralCode" 
                          placeholder="Enter referral code if you have one" 
                          className="pl-10"
                          value={formData.referralCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, referralCode: e.target.value }))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Have a friend who referred you? Enter their referral code to earn them bonus points!
                      </p>
                    </div>
                  </>
                )}
                
                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                {showResendOption && !isSignUp && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResendVerification}
                    disabled={isResendingVerification}
                  >
                    {isResendingVerification ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                )}
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Options</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setShowResendOption(false);
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                  </p>
                </div>

                {!isSignUp && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AuthPage;
