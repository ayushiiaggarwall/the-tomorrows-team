
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserX, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const UserNotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'User Not Found - The Tomorrows Team';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="feature-card">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <UserX className="w-16 h-16 text-orange-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                User not registered
              </CardTitle>
              <p className="text-center text-muted-foreground">
                We couldn't find an account with that email address. You need to sign up first.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full btn-primary"
                >
                  Sign up now
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to login
                  </button>
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

export default UserNotFound;
