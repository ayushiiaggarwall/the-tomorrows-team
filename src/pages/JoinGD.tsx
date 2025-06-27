
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useGDRegistrationCount } from '@/hooks/useGDRegistrationCount';
import { useAtomicGDRegistration } from '@/hooks/useAtomicGDRegistration';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const JoinGD = () => {
  useEffect(() => {
    document.title = 'Join Group Discussion - The Tomorrows Team';
  }, []);

  const { user } = useAuth();
  const { toast } = useToast();
  const registerMutation = useAtomicGDRegistration();
  
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

  // Fetch upcoming GDs
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
      return gds || [];
    },
    staleTime: 0,
    gcTime: 0,
  });

  // Get registration count for selected GD
  const { registrationData } = useGDRegistrationCount(formData.selectedGdId || undefined);

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

    // Check if GD is full before attempting registration
    if (registrationData?.isFull) {
      toast({
        title: "Session Full",
        description: "This group discussion is now full. Please try another session.",
        variant: "destructive"
      });
      return;
    }

    await registerMutation.mutateAsync({
      gdId: formData.selectedGdId,
      userId: user.id,
      name: formData.name,
      email: user.email || '',
      phone: formData.phone,
      occupation: formData.occupation,
      occupationOther: formData.occupation === 'Others' ? formData.occupationOther : undefined,
      studentInstitution: formData.occupation === 'Student' ? formData.studentInstitution : undefined,
      studentYear: formData.occupation === 'Student' ? formData.studentYear : undefined,
      professionalCompany: formData.occupation === 'Working Professional' ? formData.professionalCompany : undefined,
      professionalRole: formData.occupation === 'Working Professional' ? formData.professionalRole : undefined,
      selfEmployedProfession: formData.occupation === 'Self Employed' ? formData.selfEmployedProfession : undefined
    });

    // Reset form on success
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
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
                {upcomingGDs.map((gd) => {
                  const gdRegistrationData = formData.selectedGdId === gd.id ? registrationData : null;
                  const spotsLeft = gdRegistrationData ? gdRegistrationData.spotsLeft : gd.slot_capacity;
                  const isFull = spotsLeft === 0;
                  
                  return (
                    <Card 
                      key={gd.id} 
                      className={`cursor-pointer transition-all ${
                        formData.selectedGdId === gd.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md'
                      } ${isFull ? 'opacity-60' : ''}`}
                      onClick={() => !isFull && setFormData(prev => ({ ...prev, selectedGdId: gd.id }))}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{gd.topic_name}</CardTitle>
                          <Badge variant={isFull ? "destructive" : "secondary"}>
                            {isFull ? 'Full' : `${spotsLeft} spots left`}
                          </Badge>
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
                  );
                })}
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
                    ) : registrationData?.isFull ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">😞</div>
                        <h3 className="text-lg font-semibold mb-2">Session Full</h3>
                        <p className="text-muted-foreground">
                          This session is now full. Please select another session.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {registrationData && (
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>{registrationData.spotsLeft}</strong> out of {registrationData.totalCapacity} spots remaining
                            </p>
                          </div>
                        )}
                        
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
                          disabled={registerMutation.isPending || registrationData?.isFull}
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
