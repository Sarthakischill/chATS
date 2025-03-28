import { SignupForm } from '@/components/auth/signup-form';
import { Header } from '@/components/header';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </main>
    </div>
  );
} 