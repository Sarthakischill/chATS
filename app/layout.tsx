import './globals.css';
import type { Metadata } from 'next';
import { Outfit, Bricolage_Grotesque, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { ChatProvider } from '@/lib/chat-context';
import { ClientChatWrapper } from '@/components/client-chat-wrapper';
import { metadata } from './metadata';

const outfit = Outfit({ subsets: ['latin'] });

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
});

const inter = Inter({ subsets: ["latin"] });

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${bricolage.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={`${outfit.className} overflow-x-hidden ${inter.className}`}>
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
