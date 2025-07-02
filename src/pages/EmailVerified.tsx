
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const EmailVerified = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(3);
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    document.title = 'Email Verified - The Tomorrows Team';
    
    // Check the current user's email confirmation status
    const checkVerificationStatus = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          setVerificationStatus('error');
          return;
        }

        if (user && user.email_confirmed_at) {
          console.log('Email verification confirmed:', user.email_confirmed_at);
          setVerificationStatus('success');
          
          toast({
            title: "Email Verified!",
            description: "Your email has been successfully verified. You can now sign in.",
          });

          // Start countdown to redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/login');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else {
          console.log('User not found or email not confirmed');
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        setVerificationStatus('error');
      }
    };

    // Small delay to ensure auth state is settled
    setTimeout(checkVerificationStatus, 500);
  }, [navigate, toast]);

  if (verificationStatus === 'checking') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="py-20 px-4">
          <div className="max-w-md mx-auto">
            <Card className="feature-card text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  Verifying Email...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Please wait while we confirm your email verification.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="py-20 px-4">
          <div className="max-w-md mx-auto">
            <Card className="feature-card text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-600">
                  Verification Failed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We couldn't verify your email. The link may have expired or already been used.
                </p>
                
                <div className="pt-4">
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
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
          <Card className="feature-card text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Email Verified
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your email has been successfully verified! You can now sign in to your account.
              </p>
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Redirecting to login page in {countdown} seconds...
                </p>
                
                <div className="mt-4">
                  <div className="animate-pulse">
                    <div className="h-2 bg-primary/20 rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EmailVerified;
