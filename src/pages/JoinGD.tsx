
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Calendar, Clock, Users, ChevronDown, CheckCircle } from 'lucide-react';

const JoinGD = () => {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

  const upcomingSlots = [
    {
      id: '1',
      date: 'January 11, 2025',
      time: '7:00 PM IST',
      topic: 'AI in Education: Boon or Bane?',
      spotsLeft: 12,
      totalSpots: 20
    },
    {
      id: '2',
      date: 'January 12, 2025',
      time: '8:00 PM IST',
      topic: 'Mental Health Awareness in Workplaces',
      spotsLeft: 8,
      totalSpots: 20
    },
    {
      id: '3',
      date: 'January 13, 2025',
      time: '6:30 PM IST',
      topic: 'Sustainable Living: Individual vs Corporate Responsibility',
      spotsLeft: 15,
      totalSpots: 20
    },
    {
      id: '4',
      date: 'January 14, 2025',
      time: '7:30 PM IST',
      topic: 'Social Media: Connecting or Isolating Society?',
      spotsLeft: 18,
      totalSpots: 20
    }
  ];

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
    console.log('Form submitted');
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
                        {upcomingSlots.map((slot) => (
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
                {upcomingSlots.map((slot) => (
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
                ))}
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
                <div className="text-3xl font-bold text-primary mb-2">2h 45m</div>
                <p className="text-sm text-muted-foreground">
                  Topics are announced 3 hours before each session
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
