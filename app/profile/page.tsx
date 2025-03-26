import { UserProfileForm } from '@/components/auth/user-profile';
import { UserPreferencesForm } from '@/components/auth/user-preferences';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile and preferences
            </p>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <UserProfileForm />
            </TabsContent>
            
            <TabsContent value="preferences">
              <UserPreferencesForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 