"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { UserPreferencesForm } from "@/components/auth/user-preferences";

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [saveResumeHistory, setSaveResumeHistory] = useState(true);
  const [saveCoverLetterHistory, setSaveCoverLetterHistory] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [weeklyTips, setWeeklyTips] = useState(false);
  
  useEffect(() => {
    if (user) {
      // Load user settings from localStorage for now
      // In a real app, you'd fetch these from your backend
      const savedGeminiKey = localStorage.getItem('gemini_api_key') || '';
      setGeminiApiKey(savedGeminiKey);
      
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setSaveResumeHistory(settings.saveResumeHistory ?? true);
        setSaveCoverLetterHistory(settings.saveCoverLetterHistory ?? true);
        setEmailNotifications(settings.emailNotifications ?? false);
        setWeeklyTips(settings.weeklyTips ?? false);
      }
    }
  }, [user]);
  
  const handleSaveApiKey = async () => {
    setIsLoading(true);
    try {
      // Save API key to localStorage for now
      // In a real app, you'd encrypt this and save it to your backend
      localStorage.setItem('gemini_api_key', geminiApiKey);
      
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error Saving API Key",
        description: "There was an error saving your API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Save preferences to localStorage for now
      // In a real app, you'd save these to your backend
      const settings = {
        saveResumeHistory,
        saveCoverLetterHistory,
        emailNotifications,
        weeklyTips,
      };
      
      localStorage.setItem('user_settings', JSON.stringify(settings));
      
      toast({
        title: "Preferences Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error Saving Preferences",
        description: "There was an error saving your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center pt-24 pb-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center px-6 pt-24 pb-16">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please log in to access settings
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-[1200px] mx-auto px-6 pt-24 pb-16">
        <div className="max-w-3xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your application preferences
            </p>
          </div>
          
          <UserPreferencesForm />
        </div>
      </main>
    </div>
  );
} 