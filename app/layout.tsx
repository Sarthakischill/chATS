import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ChatWidget } from '@/components/chat-widget';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { ChatProvider } from '@/lib/chat-context';

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
            <ChatProvider>
              {children}
              <ChatWidget />
              <Toaster />
            </ChatProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
