'use client';

import { usePathname } from 'next/navigation';
import { FloatingChat } from '@/components/floating-chat';

export function ClientChatWrapper() {
  const pathname = usePathname();

  // Don't show floating chat on the chat page
  if (pathname === '/chat') {
    return null;
  }

  return <FloatingChat />;
} 