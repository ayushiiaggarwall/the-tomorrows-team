
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ResetEmailSent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    document.title = 'Email Sent - The Tomorrows Team';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="feature-card">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                Email sent
              </CardTitle>
              <p className="text-center text-muted-foreground">
                We've sent you a link to reset your password. Please check your email.
              </p>
              {email && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Check your inbox at <span className="font-medium">{email}</span>
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full btn-primary"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/reset-password')}
                      className="text-primary hover:underline"
                    >
                      try again
                    </button>
                  </p>
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

export default ResetEmailSent;
