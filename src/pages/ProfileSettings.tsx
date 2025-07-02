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
import { X, Upload, Plus, Eye, EyeOff, Copy, Users, Trash2, Clock, CheckCircle } from 'lucide-react';
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
  const { generateReferralCode, getReferralStats, getReferralDetails } = useReferral();
  
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
  const [isUploading, setIsUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

  const { data: referralDetails = [] } = useQuery({
    queryKey: ['referral-details', user?.id],
    queryFn: getReferralDetails,
    enabled: !!user?.id
  });

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
      setHasUnsavedChanges(false);
    }
  }, [userProfile]);

  // Check for unsaved changes
  useEffect(() => {
    if (userProfile) {
      const hasChanges = 
        fullName !== (userProfile.full_name || '') ||
        dateOfBirth !== (userProfile.date_of_birth || '') ||
        profilePictureUrl !== (userProfile.profile_picture_url || '') ||
        JSON.stringify(selectedTags) !== JSON.stringify(userProfile.tags || []);
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [fullName, dateOfBirth, profilePictureUrl, selectedTags, userProfile]);

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
      // Create deletion request
      const { error: insertError } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: user!.id,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Send notification email to admin
      const { error: adminEmailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: 'System Notification',
          email: 'thetomorrowsteam@gmail.com',
          topic: 'Account Deletion Request',
          message: `A user has requested account deletion:
          
User: ${fullName || 'Unknown'} (${user!.email})
User ID: ${user!.id}
Requested: ${new Date().toLocaleString()}

Please review this request in the admin dashboard and process the deletion if appropriate.

The user has been signed out and notified that their account will be deleted within 24 hours pending admin review.`
        }
      });

      if (adminEmailError) throw adminEmailError;

      // Send confirmation email to user
      const { error: userEmailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: 'The Tomorrows Team',
          email: user!.email!,
          topic: 'Account Deletion Request Received',
          message: `Dear ${fullName || 'User'},

We have received your request for account deletion. We're sad to hear you want to say goodbye and hope we'll see you again in the future.

Your account deletion request has been forwarded to our admin team for review and will be processed within 24 hours.

Once your account is deleted, all your data including:
- Profile information
- Group discussion registrations
- Reward points
- Participation history

Will be permanently removed and cannot be recovered.

If you change your mind or have any questions, please contact us at thetomorrowsteam@gmail.com before your account is processed.

Thank you for being part of The Tomorrows Team community.

Best regards,
The Tomorrows Team`
        }
      });

      if (userEmailError) throw userEmailError;

      // Sign out the user
      await signOut();
    },
    onSuccess: () => {
      toast({
        title: "Account deletion requested",
        description: "You have been signed out. Your deletion request has been sent to our team for review and will be processed within 24 hours. Please check your email for confirmation.",
      });
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: "Error processing deletion request",
        description: error.message || "Unable to process account deletion request. Please try again.",
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfilePictureUrl(publicUrl);
      
      toast({
        title: "Upload successful!",
        description: "Your profile picture has been uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
            {hasUnsavedChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <p className="text-sm font-medium">
                    You have unsaved changes. Click "Save Profile" to save your changes.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-6">
                   <Avatar className="h-24 w-24">
                       <AvatarImage src={profilePictureUrl} className="object-cover" />
                       <AvatarFallback>{fullName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                     </Avatar>
                     <div className="space-y-2">
                       <Label htmlFor="profilePicture">Profile Picture</Label>
                       <div className="flex space-x-2">
                         <Input
                           id="profilePicture"
                           type="url"
                           placeholder="https://example.com/your-photo.jpg"
                           value={profilePictureUrl}
                           onChange={(e) => setProfilePictureUrl(e.target.value)}
                         />
                         <input
                           type="file"
                           accept="image/*"
                           onChange={handleFileUpload}
                           className="hidden"
                           id="file-upload"
                         />
                         <Button 
                           type="button" 
                           variant="outline" 
                           size="sm"
                           onClick={() => document.getElementById('file-upload')?.click()}
                           disabled={isUploading}
                         >
                           {isUploading ? (
                             <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                           ) : (
                             <Upload className="h-4 w-4" />
                           )}
                         </Button>
                       </div>
                       <p className="text-xs text-muted-foreground">
                         Upload an image file or enter a URL above
                       </p>
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

                {referralDetails.length > 0 && (
                  <div className="space-y-2 pt-4">
                    <Label>Your Referrals</Label>
                    <div className="space-y-2">
                      {referralDetails.map((referral: any) => (
                        <div key={referral.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {referral.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              )}
                              <div>
                                <div className="font-medium">
                                  {referral.referred_profile?.full_name || 'User'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {referral.referred_profile?.email}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                              {referral.status === 'completed' ? 'Completed' : 'Pending'}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(referral.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  Request permanent deletion of your account. This will send a notification to our admin team for review.
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
                  {deleteAccountMutation.isPending ? 'Processing...' : 'Request Account Deletion'}
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
        title="Request Account Deletion"
        description="Are you sure you want to request deletion of your account? This will send a request to our admin team for review. You will be signed out immediately, and your account will be permanently deleted within 24 hours after admin approval. This action cannot be undone."
        confirmText="Request Deletion"
        cancelText="Cancel"
        variant="destructive"
      />
      
      <Footer />
    </div>
  );
};

export default ProfileSettings;
