import './globals.css';
import type { Metadata } from 'next';
import { Outfit, Bricolage_Grotesque } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { ChatProvider } from '@/lib/chat-context';
import { ClientChatWrapper } from '@/components/client-chat-wrapper';

const outfit = Outfit({ subsets: ['latin'] });

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
});

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
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${bricolage.variable}`}>
      <body className={`${outfit.className} overflow-x-hidden`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <ChatProvider>
              {children}
              <ClientChatWrapper />
              <Toaster />
            </ChatProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
