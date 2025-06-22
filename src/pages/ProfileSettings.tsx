
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/DashboardSidebar';
import { X, Upload, Plus } from 'lucide-react';

interface PredefinedTag {
  id: string;
  name: string;
  category: string;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, date_of_birth, profile_picture_url, tags')
        .eq('id', user.id)
        .single();

      return profile;
    },
    enabled: !!user?.id
  });

  // Fetch predefined tags
  const { data: predefinedTags = [] } = useQuery({
    queryKey: ['predefined-tags'],
    queryFn: async () => {
      const { data } = await supabase
        .from('predefined_tags')
        .select('id, name, category')
        .order('category, name');

      return data || [];
    }
  });

  // Update form when profile data loads
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setDateOfBirth(userProfile.date_of_birth || '');
      setProfilePictureUrl(userProfile.profile_picture_url || '');
      setSelectedTags(userProfile.tags || []);
    }
  }, [userProfile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully!",
        description: "Your profile has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile-settings', user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTags.length > 3) {
      toast({
        title: "Too many tags",
        description: "Please select up to 3 tags only.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      full_name: fullName,
      date_of_birth: dateOfBirth || null,
      profile_picture_url: profilePictureUrl || null,
      tags: selectedTags
    });
  };

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(tag => tag !== tagName));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tagName]);
    } else {
      toast({
        title: "Maximum tags reached",
        description: "You can only select up to 3 tags.",
        variant: "destructive",
      });
    }
  };

  const handleAddCustomTag = () => {
    if (!customTag.trim()) return;
    
    if (selectedTags.includes(customTag)) {
      toast({
        title: "Tag already selected",
        description: "This tag is already in your selection.",
        variant: "destructive",
      });
      return;
    }

    if (selectedTags.length >= 3) {
      toast({
        title: "Maximum tags reached",
        description: "You can only select up to 3 tags.",
        variant: "destructive",
      });
      return;
    }

    setSelectedTags([...selectedTags, customTag]);
    setCustomTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted/50 rounded w-64 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const tagsByCategory = predefinedTags.reduce((acc: Record<string, PredefinedTag[]>, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <DashboardSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Profile Settings
              </h1>
              <p className="text-lg text-muted-foreground">
                Update your personal information and preferences
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profilePictureUrl} />
                      <AvatarFallback>{fullName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Label htmlFor="profilePicture">Profile Picture URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="profilePicture"
                          type="url"
                          placeholder="https://example.com/your-photo.jpg"
                          value={profilePictureUrl}
                          onChange={(e) => setProfilePictureUrl(e.target.value)}
                        />
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags About Yourself (Select up to 3)</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose tags that describe your skills, personality, and interests
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Tags ({selectedTags.length}/3)</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="default" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Custom Tag */}
                  <div className="space-y-2">
                    <Label>Add Custom Tag</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter a custom tag"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddCustomTag}
                        disabled={selectedTags.length >= 3 || !customTag.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Predefined Tags by Category */}
                  {Object.entries(tagsByCategory).map(([category, tags]) => (
                    <div key={category} className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">{category}</Label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => handleTagToggle(tag.name)}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn-primary"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfileSettings;
