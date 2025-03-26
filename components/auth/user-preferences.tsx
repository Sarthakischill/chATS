"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserPreferences, updateUserPreferences } from '@/lib/profile-service';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPreferences } from '@/lib/profile-service';

export function UserPreferencesForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState('light');
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    async function loadPreferences() {
      if (user) {
        try {
          setLoading(true);
          const userPreferences = await getUserPreferences(user.id);
          if (userPreferences) {
            setPreferences(userPreferences);
            setTheme(userPreferences.theme || 'light');
            setNotificationEmail(userPreferences.notification_email);
          }
        } catch (error: any) {
          console.error('Error loading preferences:', error);
          setErrorMsg(error.message || 'Failed to load preferences');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user]);

  async function handleUpdatePreferences() {
    if (!user) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const updatedPreferences = await updateUserPreferences(user.id, {
        theme,
        notification_email: notificationEmail
      });

      if (updatedPreferences) {
        setPreferences(updatedPreferences);
        setSuccessMsg('Preferences updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      setErrorMsg(error.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Please log in to view and edit your preferences.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Preferences</CardTitle>
        <CardDescription>Manage your application settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-4">Loading preferences...</div>
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

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Theme Preference</h3>
                <RadioGroup value={theme} onValueChange={setTheme} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">System default</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium mb-3">Notification Settings</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive email updates about account activity
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationEmail}
                    onCheckedChange={setNotificationEmail}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpdatePreferences}
          disabled={loading || saving}
          className="w-full sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardFooter>
    </Card>
  );
} 