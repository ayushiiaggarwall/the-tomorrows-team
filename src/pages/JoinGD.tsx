import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const JoinGD = () => {
  useEffect(() => {
    document.title = 'Join Group Discussion - The Tomorrows Team';
  }, []);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    occupation: '',
    occupationOther: '',
    studentInstitution: '',
    studentYear: '',
    professionalCompany: '',
    professionalRole: '',
    selfEmployedProfession: '',
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
          const { count: registrationsCount, error: countError } = await supabase
            .from('gd_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('gd_id', gd.id);

          if (countError) {
            console.error('Error fetching registrations for GD:', gd.id, countError);
          }

          const totalRegistrations = registrationsCount || 0;
          const spotsLeft = Math.max(0, gd.slot_capacity - totalRegistrations);

          console.log(`JoinGD - GD ${gd.id}: totalRegistrations=${totalRegistrations}, spots=${spotsLeft}/${gd.slot_capacity}`);

          return {
            ...gd,
            registrationsCount: totalRegistrations,
            spotsLeft
          };
        })
      );

      return gdsWithCounts;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 0,
  });

  // Set up real-time subscription for registration changes
  useEffect(() => {
    console.log('Setting up real-time subscription for JoinGD registrations');
    
    const channel = supabase
      .channel(`join-gd-updates`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gd_registrations'
        },
        (payload) => {
          console.log('JoinGD registration change detected:', payload);
          // Invalidate all GD-related queries immediately
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
          // Force refetch this specific query
          queryClient.refetchQueries({ queryKey: ['upcoming-gds-for-registration'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_discussions'
        },
        (payload) => {
          console.log('JoinGD GD change detected:', payload);
          // Invalidate all GD-related queries immediately
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
          // Force refetch this specific query
          queryClient.refetchQueries({ queryKey: ['upcoming-gds-for-registration'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up JoinGD real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
          participant_occupation: registrationData.occupation,
          participant_occupation_other: registrationData.occupationOther,
          student_institution: registrationData.studentInstitution,
          student_year: registrationData.studentYear,
          professional_company: registrationData.professionalCompany,
          professional_role: registrationData.professionalRole,
          self_employed_profession: registrationData.selfEmployedProfession
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
        phone: '',
        occupation: '',
        occupationOther: '',
        studentInstitution: '',
        studentYear: '',
        professionalCompany: '',
        professionalRole: '',
        selfEmployedProfession: '',
        selectedGdId: null
      });
      
      // Invalidate and refetch all GD-related queries
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
      queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['upcoming-gds-for-registration'] });
      queryClient.refetchQueries({ queryKey: ['upcoming-gds', user?.id] });
      queryClient.refetchQueries({ queryKey: ['home-upcoming-gds', user?.id] });
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

    if (!formData.occupation) {
      toast({
        title: "Occupation Required",
        description: "Please select your occupation.",
        variant: "destructive"
      });
      return;
    }

    if (formData.occupation === 'Others' && !formData.occupationOther.trim()) {
      toast({
        title: "Please Specify",
        description: "Please specify your occupation in the text field.",
        variant: "destructive"
      });
      return;
    }

    // Validation for occupation-specific fields
    if (formData.occupation === 'Student' && (!formData.studentInstitution.trim() || !formData.studentYear.trim())) {
      toast({
        title: "Student Details Required",
        description: "Please provide your institution and year of study.",
        variant: "destructive"
      });
      return;
    }

    if (formData.occupation === 'Working Professional' && (!formData.professionalCompany.trim() || !formData.professionalRole.trim())) {
      toast({
        title: "Professional Details Required",
        description: "Please provide your company and role.",
        variant: "destructive"
      });
      return;
    }

    if (formData.occupation === 'Self Employed' && !formData.selfEmployedProfession.trim()) {
      toast({
        title: "Profession Required",
        description: "Please specify your profession.",
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
      email: user.email, // Get email from user profile
      phone: formData.phone,
      occupation: formData.occupation,
      occupationOther: formData.occupation === 'Others' ? formData.occupationOther : null,
      studentInstitution: formData.occupation === 'Student' ? formData.studentInstitution : null,
      studentYear: formData.occupation === 'Student' ? formData.studentYear : null,
      professionalCompany: formData.occupation === 'Working Professional' ? formData.professionalCompany : null,
      professionalRole: formData.occupation === 'Working Professional' ? formData.professionalRole : null,
      selfEmployedProfession: formData.occupation === 'Self Employed' ? formData.selfEmployedProfession : null
    });
  };

  const formatDate = (dateString: string) => {
    // Parse the date properly without adding 'Z'
    const date = new Date(dateString);
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    // Parse the date properly without adding 'Z'
    const date = new Date(dateString);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderOccupationSpecificFields = () => {
    switch (formData.occupation) {
      case 'Student':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="studentInstitution">College/School *</Label>
              <Input
                id="studentInstitution"
                value={formData.studentInstitution}
                onChange={(e) => setFormData(prev => ({ ...prev, studentInstitution: e.target.value }))}
                required
                placeholder="Enter your institution name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentYear">Year of Study *</Label>
              <Input
                id="studentYear"
                value={formData.studentYear}
                onChange={(e) => setFormData(prev => ({ ...prev, studentYear: e.target.value }))}
                required
                placeholder="e.g., 1st Year, 2nd Year, Final Year"
              />
            </div>
          </>
        );
      case 'Working Professional':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="professionalCompany">Company *</Label>
              <Input
                id="professionalCompany"
                value={formData.professionalCompany}
                onChange={(e) => setFormData(prev => ({ ...prev, professionalCompany: e.target.value }))}
                required
                placeholder="Enter your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="professionalRole">Role *</Label>
              <Input
                id="professionalRole"
                value={formData.professionalRole}
                onChange={(e) => setFormData(prev => ({ ...prev, professionalRole: e.target.value }))}
                required
                placeholder="Enter your job role"
              />
            </div>
          </>
        );
      case 'Self Employed':
        return (
          <div className="space-y-2">
            <Label htmlFor="selfEmployedProfession">What do you do? *</Label>
            <Input
              id="selfEmployedProfession"
              value={formData.selfEmployedProfession}
              onChange={(e) => setFormData(prev => ({ ...prev, selfEmployedProfession: e.target.value }))}
              required
              placeholder="Describe your profession"
            />
          </div>
        );
      case 'Others':
        return (
          <div className="space-y-2">
            <Label htmlFor="occupationOther">Please specify *</Label>
            <Input
              id="occupationOther"
              value={formData.occupationOther}
              onChange={(e) => setFormData(prev => ({ ...prev, occupationOther: e.target.value }))}
              required
              placeholder="Please specify your occupation"
            />
          </div>
        );
      default:
        return null;
    }
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
                          <Label htmlFor="occupation">What do you do? *</Label>
                          <Select
                            value={formData.occupation}
                            onValueChange={(value) => setFormData(prev => ({ 
                              ...prev, 
                              occupation: value,
                              // Reset occupation-specific fields when changing occupation
                              occupationOther: '',
                              studentInstitution: '',
                              studentYear: '',
                              professionalCompany: '',
                              professionalRole: '',
                              selfEmployedProfession: ''
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your occupation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Student">Student</SelectItem>
                              <SelectItem value="Working Professional">Working Professional</SelectItem>
                              <SelectItem value="Self Employed">Self Employed</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {renderOccupationSpecificFields()}

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
