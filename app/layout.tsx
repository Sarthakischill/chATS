import './globals.css';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ResumeChat } from '@/components/resume-chatbot';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'chATS - Applicant Tracking System Helper',
  description: 'Optimize your resume for ATS with AI-powered suggestions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${outfit.className} overflow-x-hidden`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
            <ResumeChat />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
