
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const CheckEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const email = searchParams.get('email') || 'your email';
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    document.title = 'Check Your Email - The Tomorrows Team';
    
    // Start the countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleResendEmail = async () => {
    if (!canResend || isResending) return;
    
    setIsResending(true);
    try {
      // Get user's name from localStorage if available (from signup form)
      const userData = localStorage.getItem('pendingSignupData');
      const fullName = userData ? JSON.parse(userData).fullName || 'User' : 'User';
      
      // Attempt to resend verification email by triggering signup again
      const { error } = await signUp(email, 'temp-password-for-resend', fullName);
      
      if (error && !error.message.includes('already registered')) {
        throw error;
      }
      
      toast({
        title: "Email Resent",
        description: "We've sent another verification email to your inbox.",
      });
      
      // Reset timer
      setTimeLeft(300);
      setCanResend(false);
      
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend verification email. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="feature-card text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Check Your Inbox
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Click the link we sent to <strong>{email}</strong> to finish your account setup.
              </p>
              
              <div className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder.
                </p>
                
                {!canResend ? (
                  <div className="text-sm text-muted-foreground">
                    <p>You can request a new verification email in:</p>
                    <p className="text-lg font-mono text-primary mt-2">
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="w-full"
                    variant="outline"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckEmail;
