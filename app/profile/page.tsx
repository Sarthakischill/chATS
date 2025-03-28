import { UserProfileForm } from '@/components/auth/user-profile';
import { UserPreferencesForm } from '@/components/auth/user-preferences';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-[1200px] mx-auto px-6 pt-24 pb-16">
        <div className="space-y-8">
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