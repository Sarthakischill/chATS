import { SignupForm } from '@/components/auth/signup-form';
import { Header } from '@/components/header';

export default function SignupPage() {
  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </main>
    </div>
  );
} 