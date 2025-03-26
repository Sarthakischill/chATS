"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserProfile, updateUserProfile, uploadAvatar, deleteAvatar } from '@/lib/profile-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Profile } from '@/lib/profile-service';

export function UserProfileForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          setLoading(true);
          const userProfile = await getUserProfile(user.id);
          if (userProfile) {
            setProfile(userProfile);
            setFullName(userProfile.full_name || '');
            setBio(userProfile.bio || '');
            setAvatar(userProfile.avatar_url);
          }
        } catch (error: any) {
          console.error('Error loading profile:', error);
          setErrorMsg(error.message || 'Failed to load profile');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  async function handleUpdateProfile() {
    if (!user) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const updatedProfile = await updateUserProfile(user.id, {
        full_name: fullName,
        bio
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        setSuccessMsg('Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrorMsg(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    try {
      setUploadingAvatar(true);
      setErrorMsg(null);
      
      const file = e.target.files[0];
      const result = await uploadAvatar(user.id, file);

      if (result?.avatar_url) {
        setAvatar(result.avatar_url);
        setSuccessMsg('Avatar uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setErrorMsg(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleDeleteAvatar() {
    if (!user || !avatar) return;

    try {
      setUploadingAvatar(true);
      setErrorMsg(null);
      
      const success = await deleteAvatar(user.id);

      if (success) {
        setAvatar(null);
        setSuccessMsg('Avatar removed successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      setErrorMsg(error.message || 'Failed to delete avatar');
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (!user) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Please log in to view and edit your profile.
        </AlertDescription>
      </Alert>
    );
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || user?.email?.[0].toUpperCase() || 'U';
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-4">Loading profile...</div>
        ) : (
          <>
            {errorMsg && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
            {successMsg && (
              <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                <AlertDescription>{successMsg}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar || undefined} alt={fullName || user.email || ''} />
                <AvatarFallback>
                  {getInitials(fullName || user.email || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      {uploadingAvatar ? 'Uploading...' : 'Upload image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </Button>
                  {avatar && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAvatar}
                      disabled={uploadingAvatar}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpdateProfile}
          disabled={loading || saving}
          className="w-full sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
} 