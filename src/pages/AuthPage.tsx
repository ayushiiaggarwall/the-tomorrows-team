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
import { Mail, Lock, User, Eye, EyeOff, RefreshCw } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  
  const { signUp, signIn, resetPassword } = useAuth();
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

        // Store signup data temporarily for potential resend
        localStorage.setItem('pendingSignupData', JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          timestamp: Date.now()
        }));

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
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
                )}
                
                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
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
