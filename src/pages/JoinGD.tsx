
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ChevronDown, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const JoinGD = () => {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [timeUntilReveal, setTimeUntilReveal] = useState<string>('');
  const { toast } = useToast();

  const { data: upcomingSlots, isLoading } = useQuery({
    queryKey: ['upcoming-gds-for-registration'],
    queryFn: async () => {
      // Get upcoming active GDs
      const { data: gds, error } = await supabase
        .from('group_discussions')
        .select(`
          id,
          topic_name,
          scheduled_date,
          slot_capacity,
          description
        `)
        .eq('is_active', true)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error fetching GDs:', error);
        return [];
      }

      if (!gds) return [];

      // Get registration counts for each GD
      const gdsWithCounts = await Promise.all(
        gds.map(async (gd) => {
          const { count } = await supabase
            .from('gd_registrations')
            .select('*', { count: 'exact' })
            .eq('gd_id', gd.id);

          const registrationsCount = count || 0;
          const spotsLeft = Math.max(0, gd.slot_capacity - registrationsCount);

          return {
            id: gd.id,
            date: new Date(gd.scheduled_date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            }),
            time: new Date(gd.scheduled_date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            }),
            topic: gd.topic_name,
            spotsLeft,
            totalSpots: gd.slot_capacity,
            description: gd.description
          };
        })
      );

      return gdsWithCounts;
    }
  });

  // Calculate time until next topic reveal (3 hours before GD)
  useEffect(() => {
    const calculateTimeUntilReveal = () => {
      if (!upcomingSlots || upcomingSlots.length === 0) {
        setTimeUntilReveal('Coming Soon...');
        return;
      }

      // Get the earliest scheduled GD
      const nextGD = upcomingSlots[0];
      if (!nextGD) {
        setTimeUntilReveal('Coming Soon...');
        return;
      }

      // Parse the date and time back from the formatted strings
      const gdDateTime = new Date(nextGD.date + ' ' + nextGD.time);
      
      // Topic reveals 3 hours before the GD
      const revealTime = new Date(gdDateTime.getTime() - (3 * 60 * 60 * 1000));
      const now = new Date();
      
      if (now >= revealTime) {
        setTimeUntilReveal('Topic Revealed!');
        return;
      }

      const timeDiff = revealTime.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setTimeUntilReveal(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilReveal(`${minutes}m`);
      }
    };

    calculateTimeUntilReveal();
    const interval = setInterval(calculateTimeUntilReveal, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [upcomingSlots]);

  const gdRules = [
    "Be respectful and listen to others' viewpoints",
    "Keep your arguments relevant to the topic",
    "Avoid personal attacks or offensive language",
    "Give everyone a chance to speak",
    "Back your points with examples or data when possible",
    "Join the session 5 minutes before start time",
    "Ensure a stable internet connection and quiet environment",
    "Keep your camera on throughout the discussion"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    toast({
      title: "Registration Submitted",
      description: "Your registration has been submitted successfully!"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Be Heard. Be Counted.
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Our group discussions happen every weekend. Sign up below to reserve your spot — it's free, fun, and you'll meet incredible minds from across India.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Registration Form */}
          <div>
            <Card className="feature-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Register for a GD</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" placeholder="Enter your full name" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input id="age" type="number" placeholder="25" min="16" max="35" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="institution">College/Company (Optional)</Label>
                    <Input id="institution" placeholder="e.g., IIT Delhi, Google India" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gdSlot">Choose a GD Slot *</Label>
                    <Select value={selectedSlot} onValueChange={setSelectedSlot} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {upcomingSlots?.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.date} at {slot.time} - {slot.topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full btn-primary text-lg py-3">
                    Register for GD
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Available Slots & Rules */}
          <div className="space-y-8">
            {/* Available Slots */}
            <Card className="feature-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Available Slots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted/50 rounded-lg"></div>
                    ))}
                  </div>
                ) : !upcomingSlots?.length ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📅</div>
                    <h3 className="text-lg font-semibold mb-2">No Upcoming Slots</h3>
                    <p className="text-muted-foreground">
                      There are no group discussions scheduled at the moment. Check back soon!
                    </p>
                  </div>
                ) : (
                  upcomingSlots.map((slot) => (
                    <div key={slot.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-medium">{slot.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm">{slot.time}</span>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2">{slot.topic}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{slot.spotsLeft}/{slot.totalSpots} spots available</span>
                        </div>
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${((slot.totalSpots - slot.spotsLeft) / slot.totalSpots) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* GD Rules */}
            <Card className="feature-card">
              <CardHeader>
                <Collapsible open={isRulesOpen} onOpenChange={setIsRulesOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <CardTitle className="text-xl font-bold">GD Rules & Guidelines</CardTitle>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isRulesOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                </Collapsible>
              </CardHeader>
              <Collapsible open={isRulesOpen} onOpenChange={setIsRulesOpen}>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-3">
                      {gdRules.map((rule, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Next Topic Reveal Timer */}
            <Card className="feature-card bg-gradient-to-r from-primary/10 to-accent/10">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Next Topic Reveals In</h3>
                <div className="text-3xl font-bold text-primary mb-2">{timeUntilReveal}</div>
                <p className="text-sm text-muted-foreground">
                  {upcomingSlots && upcomingSlots.length > 0 
                    ? "Topics are announced 3 hours before each session"
                    : "New group discussions will be scheduled soon"
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JoinGD;
