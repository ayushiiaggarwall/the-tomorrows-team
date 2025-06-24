
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const JoinGD = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    year: '',
    selectedGdId: null as string | null
  });

  // Fetch upcoming GDs with registration counts
  const { data: upcomingGDs, isLoading } = useQuery({
    queryKey: ['upcoming-gds-for-registration'],
    queryFn: async () => {
      const { data: gds, error } = await supabase
        .from('group_discussions')
        .select('*')
        .eq('is_active', true)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Get registration counts for each GD
      const gdsWithCounts = await Promise.all(
        (gds || []).map(async (gd) => {
          const { count } = await supabase
            .from('gd_registrations')
            .select('*', { count: 'exact' })
            .eq('gd_id', gd.id);

          const registrationsCount = count || 0;
          const spotsLeft = Math.max(0, gd.slot_capacity - registrationsCount);

          return {
            ...gd,
            registrationsCount,
            spotsLeft
          };
        })
      );

      return gdsWithCounts;
    }
  });

  // Register for GD mutation
  const registerMutation = useMutation({
    mutationFn: async (registrationData: any) => {
      const { data, error } = await supabase
        .from('gd_registrations')
        .insert({
          gd_id: registrationData.gdId,
          user_id: registrationData.userId,
          participant_name: registrationData.name,
          participant_email: registrationData.email,
          participant_phone: registrationData.phone,
          college_name: registrationData.college,
          year_of_study: registrationData.year
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You have been registered for the group discussion.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        year: '',
        selectedGdId: null
      });
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ 
        queryKey: ['upcoming-gds-for-registration'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['upcoming-gds', user?.id] 
      });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({
          title: "Already Registered",
          description: "You are already registered for this group discussion.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for group discussions.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.selectedGdId) {
      toast({
        title: "No GD Selected",
        description: "Please select a group discussion to register for.",
        variant: "destructive"
      });
      return;
    }

    // Check if user is already registered for this GD
    const { data: existingRegistration } = await supabase
      .from('gd_registrations')
      .select('id')
      .eq('gd_id', formData.selectedGdId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingRegistration) {
      toast({
        title: "Already Registered",
        description: "You are already registered for this group discussion.",
        variant: "destructive"
      });
      return;
    }

    registerMutation.mutate({
      gdId: formData.selectedGdId,
      userId: user.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      college: formData.college,
      year: formData.year
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join a Group Discussion
            </h1>
            <p className="text-xl text-muted-foreground">
              Select a session below and register to participate
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                      <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                      <div className="h-8 bg-muted/50 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !upcomingGDs?.length ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                <p className="text-muted-foreground">
                  New group discussions will be scheduled soon. Check back later!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Available GDs */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Available Sessions</h2>
                {upcomingGDs.filter(gd => gd.spotsLeft > 0).map((gd) => (
                  <Card 
                    key={gd.id} 
                    className={`cursor-pointer transition-all ${
                      formData.selectedGdId === gd.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, selectedGdId: gd.id }))}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{gd.topic_name}</CardTitle>
                        <Badge variant="secondary">{gd.spotsLeft} spots left</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(gd.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(gd.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{gd.slot_capacity} total slots</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{gd.meet_link ? 'Online' : 'Location TBD'}</span>
                        </div>
                      </div>
                      {gd.description && (
                        <p className="mt-3 text-sm">{gd.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {upcomingGDs.filter(gd => gd.spotsLeft === 0).length > 0 && (
                  <>
                    <h3 className="text-lg font-medium text-muted-foreground mt-8">Full Sessions</h3>
                    {upcomingGDs.filter(gd => gd.spotsLeft === 0).map((gd) => (
                      <Card key={gd.id} className="opacity-60">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{gd.topic_name}</CardTitle>
                            <Badge variant="destructive">Full</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(gd.scheduled_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(gd.scheduled_date)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </div>

              {/* Registration Form */}
              <div className="lg:sticky lg:top-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!formData.selectedGdId ? (
                      <p className="text-muted-foreground text-center py-8">
                        Select a group discussion to register
                      </p>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            placeholder="Enter your email"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            required
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="college">College/University *</Label>
                          <Input
                            id="college"
                            value={formData.college}
                            onChange={(e) => setFormData(prev => ({ ...prev, college: e.target.value }))}
                            required
                            placeholder="Enter your college name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="year">Year of Study *</Label>
                          <Input
                            id="year"
                            value={formData.year}
                            onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                            required
                            placeholder="e.g., 3rd Year, Final Year"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? 'Registering...' : 'Register for GD'}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JoinGD;
