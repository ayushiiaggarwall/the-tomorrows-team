
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const AlreadyRegistered = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || 'your email';

  useEffect(() => {
    document.title = 'Already Registered - The Tomorrows Team';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="feature-card text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Already Registered
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The email <strong>{email}</strong> is already registered with The Tomorrows Team.
              </p>
              
              <p className="text-sm text-muted-foreground">
                Please sign in to access your account instead.
              </p>
              
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full btn-primary"
                >
                  Sign In to Your Account
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login Page
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

export default AlreadyRegistered;
