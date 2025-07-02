import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Users, MapPin, LogIn } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAtomicGDRegistration } from '@/hooks/useAtomicGDRegistration';
import { ConsentModal } from '@/components/ConsentModal';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const JoinGD = () => {
  useEffect(() => {
    document.title = 'Join Group Discussion - The Tomorrows Team';
  }, []);

  const { user } = useAuth();
  const registerMutation = useAtomicGDRegistration();
  
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedGdForConsent, setSelectedGdForConsent] = useState<any>(null);
  
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

      // Get registration counts for all GDs (excluding cancelled registrations)
      const gdsWithCounts = await Promise.all(
        (gds || []).map(async (gd) => {
          const { count, error: countError } = await supabase
            .from('gd_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('gd_id', gd.id)
            .is('cancelled_at', null);

          if (countError) {
            console.error('Error counting registrations for GD:', gd.id, countError);
            return { ...gd, spotsLeft: gd.slot_capacity, isFull: false };
          }

          const registrationCount = count || 0;
          const spotsLeft = Math.max(0, gd.slot_capacity - registrationCount);
          
          return {
            ...gd,
            spotsLeft,
            isFull: spotsLeft === 0
          };
        })
      );

      // Check if current user is registered for any GDs (only active registrations)
      if (user?.id) {
        const { data: userRegistrations, error: regError } = await supabase
          .from('gd_registrations')
          .select('gd_id, cancelled_at')
          .eq('user_id', user.id);

        if (!regError && userRegistrations) {
          // Only consider registrations that are NOT cancelled
          const activeRegistrations = userRegistrations.filter(reg => !reg.cancelled_at);
          const userRegisteredGdIds = new Set(activeRegistrations.map(reg => reg.gd_id));
          
          return gdsWithCounts.map(gd => ({
            ...gd,
            isUserRegistered: userRegisteredGdIds.has(gd.id)
          }));
        }
      }

      return gdsWithCounts.map(gd => ({ ...gd, isUserRegistered: false }));
    },
    staleTime: 0,
    gcTime: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Authentication Required", {
        description: "Please log in to register for group discussions."
      });
      return;
    }

    if (!formData.selectedGdId) {
      toast.error("No GD Selected", {
        description: "Please select a group discussion to register for."
      });
      return;
    }

    if (!formData.occupation) {
      toast.error("Occupation Required", {
        description: "Please select your occupation."
      });
      return;
    }

    if (formData.occupation === 'Others' && !formData.occupationOther.trim()) {
      toast.error("Please Specify", {
        description: "Please specify your occupation in the text field."
      });
      return;
    }

    // Validation for occupation-specific fields
    if (formData.occupation === 'Student' && (!formData.studentInstitution.trim() || !formData.studentYear.trim())) {
      toast.error("Student Details Required", {
        description: "Please provide your institution and year of study."
      });
      return;
    }

    if (formData.occupation === 'Working Professional' && (!formData.professionalCompany.trim() || !formData.professionalRole.trim())) {
      toast.error("Professional Details Required", {
        description: "Please provide your company and role."
      });
      return;
    }

    if (formData.occupation === 'Self Employed' && !formData.selfEmployedProfession.trim()) {
      toast.error("Profession Required", {
        description: "Please specify your profession."
      });
      return;
    }

    // Check if GD is full before attempting registration
    const selectedGd = upcomingGDs?.find(gd => gd.id === formData.selectedGdId);
    if (selectedGd?.isFull) {
      toast.error("Session Full", {
        description: "This group discussion is now full. Please try another session."
      });
      return;
    }

    // Show consent modal instead of directly registering
    setSelectedGdForConsent(selectedGd);
    setShowConsentModal(true);
  };

  const handleConsentAgree = async () => {
    setShowConsentModal(false);
    
    await registerMutation.mutateAsync({
      gdId: formData.selectedGdId!,
      userId: user!.id,
      registrationData: {
        participantName: formData.name,
        participantEmail: user!.email || '',
        participantPhone: formData.phone,
        participantOccupation: formData.occupation,
        participantOccupationOther: formData.occupation === 'Others' ? formData.occupationOther : undefined,
        studentInstitution: formData.occupation === 'Student' ? formData.studentInstitution : undefined,
        studentYear: formData.occupation === 'Student' ? formData.studentYear : undefined,
        professionalCompany: formData.occupation === 'Working Professional' ? formData.professionalCompany : undefined,
        professionalRole: formData.occupation === 'Working Professional' ? formData.professionalRole : undefined,
        selfEmployedProfession: formData.occupation === 'Self Employed' ? formData.selfEmployedProfession : undefined,
      }
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

  const handleConsentCancel = () => {
    setShowConsentModal(false);
    setSelectedGdForConsent(null);
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

  const selectedGd = upcomingGDs?.find(gd => gd.id === formData.selectedGdId);

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
                {upcomingGDs.map((gd) => (
                  <Card 
                    key={gd.id} 
                    className={`cursor-pointer transition-all ${
                      formData.selectedGdId === gd.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    } ${gd.isFull ? 'opacity-60' : ''}`}
                    onClick={() => !gd.isFull && setFormData(prev => ({ ...prev, selectedGdId: gd.id }))}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{gd.topic_name}</CardTitle>
                        <div className="flex flex-col gap-1">
                          <Badge variant={gd.isFull ? "destructive" : "secondary"}>
                            {gd.isFull ? 'Full' : `${gd.spotsLeft} spots left`}
                          </Badge>
                          {gd.isUserRegistered && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              ✅ Registered
                            </Badge>
                          )}
                        </div>
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
                    ) : selectedGd?.isFull ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">😞</div>
                        <h3 className="text-lg font-semibold mb-2">Session Full</h3>
                        <p className="text-muted-foreground">
                          This session is now full. Please select another session.
                        </p>
                      </div>
                    ) : selectedGd?.isUserRegistered ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">✅</div>
                        <h3 className="text-lg font-semibold mb-2">Already Registered</h3>
                        <p className="text-muted-foreground">
                          You are already registered for this session. Check your dashboard for details.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Show yellow message if user is not signed in */}
                        {!user && (
                          <Alert className="border-yellow-400 bg-yellow-50 text-yellow-800">
                            <LogIn className="h-4 w-4" />
                            <AlertDescription className="flex items-center justify-between">
                              <span>Please sign in to register for this session.</span>
                              <Link to="/login">
                                <Button size="sm" variant="outline" className="ml-2">
                                  Sign In
                                </Button>
                              </Link>
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {selectedGd && (
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>{selectedGd.spotsLeft}</strong> out of {selectedGd.slot_capacity} spots remaining
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
                            disabled={!user}
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
                            disabled={!user}
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
                            disabled={!user}
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
                          disabled={registerMutation.isPending || selectedGd?.isFull || !user}
                        >
                          {!user ? 'Please Sign In First' : registerMutation.isPending ? 'Registering...' : 'Register for GD'}
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

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={handleConsentCancel}
        onAgree={handleConsentAgree}
        gdTitle={selectedGdForConsent?.topic_name || ''}
      />

      <Footer />
    </div>
  );
};

export default JoinGD;
