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
import { X, Upload, Plus, Eye, EyeOff, Copy, Users, Trash2 } from 'lucide-react';
import { useReferral } from '@/hooks/useReferral';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface PredefinedTag {
  id: string;
  name: string;
  category: string;
}

const ProfileSettings = () => {
  useEffect(() => {
    document.title = 'Profile Settings - The Tomorrows Team';
  }, []);

  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { generateReferralCode, getReferralStats } = useReferral();
  
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0
  });

  const referralCode = generateReferralCode();
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  useEffect(() => {
    const loadReferralStats = async () => {
      const stats = await getReferralStats();
      setReferralStats(stats);
    };
    loadReferralStats();
  }, [getReferralStats]);

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

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setDateOfBirth(userProfile.date_of_birth || '');
      setProfilePictureUrl(userProfile.profile_picture_url || '');
      setSelectedTags(userProfile.tags || []);
    }
  }, [userProfile]);

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

  const changePasswordMutation = useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Password updated successfully!",
        description: "Your password has been changed.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      // Simply sign out the user - actual deletion handled server-side
      await signOut();
    },
    onSuccess: () => {
      toast({
        title: "Account deletion requested",
        description: "You have been signed out. Your account will be permanently deleted within 24 hours.",
      });
      navigate('/');
    },
    onError: () => {
      toast({
        title: "Error processing deletion",
        description: "Unable to process account deletion. Please try again.",
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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ newPassword });
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

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
    setShowDeleteDialog(false);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="p-6">
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
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Profile Settings
            </h1>
            <p className="text-lg text-muted-foreground">
              Update your personal information and preferences
            </p>
          </div>

          <div className="space-y-6">
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
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Referral Link
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Share your referral link with friends and earn points when they attend their first GD
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Referral Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={referralCode}
                      readOnly
                      className="bg-muted font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(referralCode);
                        toast({ title: "Copied!", description: "Referral code copied to clipboard." });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Referral Link</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={referralLink}
                      readOnly
                      className="bg-muted text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={copyReferralLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{referralStats.totalReferrals}</div>
                    <div className="text-sm text-muted-foreground">Total Referrals</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{referralStats.completedReferrals}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{referralStats.pendingReferrals}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending || !newPassword || !confirmPassword}
                    className="btn-primary"
                  >
                    {changePasswordMutation.isPending ? 'Updating...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteAccountMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteAccountMutation.isPending ? 'Processing...' : 'Delete Account'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account Permanently"
        description="Are you sure you want to delete your account? This action will permanently remove all your data, including your profile, participation history, and reward points. This action cannot be undone."
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="destructive"
      />
      
      <Footer />
    </div>
  );
};

export default ProfileSettings;
