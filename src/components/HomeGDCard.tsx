import { memo, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGDRegistrationCount } from '@/hooks/useGDRegistrationCount';

interface GDCardData {
  id: string;
  date: string;
  time: string;
  topic: string;
  totalCapacity: number;
  isRegistered: boolean;
}

interface HomeGDCardProps {
  gd: GDCardData;
}

// Memoized component for better performance
const HomeGDCard = memo(({ gd }: HomeGDCardProps) => {
  const { registrationData } = useGDRegistrationCount(gd.id);
  const { user } = useAuth();

  const buttonConfig = useMemo(() => {
    if (gd.isRegistered) {
      return {
        text: '✅ Registered',
        variant: 'secondary' as const,
        disabled: true,
        href: null
      };
    }
    
    if (registrationData?.isFull) {
      return {
        text: 'Full',
        variant: 'default' as const,
        disabled: true,
        href: null
      };
    }
    
    return {
      text: 'Register',
      variant: 'default' as const,
      disabled: false,
      href: user ? "/join-gd" : "/login"
    };
  }, [gd.isRegistered, registrationData?.isFull, user]);

  return (
    <Card className="feature-card">
      <CardContent className="p-6">
        <div className="flex items-center mb-3">
          <Calendar className="w-5 h-5 text-primary mr-2" />
          <span className="text-sm font-medium text-primary">{gd.date} • {gd.time}</span>
        </div>
        <h3 className="text-lg font-semibold mb-3">{gd.topic}</h3>
         <div className="flex justify-between items-center">
           <span className="text-sm text-muted-foreground">
             {registrationData 
               ? `${registrationData.spotsLeft} spots left`
               : 'Loading spots...'
             }
           </span>
           {registrationData?.isFull ? (
             <Badge variant="destructive">Full</Badge>
           ) : gd.isRegistered ? (
             <Badge variant="outline" className="text-green-600 border-green-600">
               ✅ Registered
             </Badge>
           ) : buttonConfig.href ? (
             <Link to={buttonConfig.href}>
               <Button 
                 size="sm" 
                 className="btn-primary"
                 variant={buttonConfig.variant}
                 disabled={buttonConfig.disabled}
               >
                 {buttonConfig.text}
               </Button>
             </Link>
           ) : (
             <Button 
               size="sm" 
               variant={buttonConfig.variant}
               disabled={buttonConfig.disabled}
             >
               {buttonConfig.text}
             </Button>
           )}
         </div>
      </CardContent>
    </Card>
  );
});

HomeGDCard.displayName = 'HomeGDCard';

export default HomeGDCard;