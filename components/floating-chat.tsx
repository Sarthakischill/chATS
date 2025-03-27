"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  Loader2,
  X,
  Maximize2,
  MessageCircle
} from "lucide-react";
import { useChat } from '@/lib/chat-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-context';

export function FloatingChat() {
  const {
    messages,
    newMessage,
    setNewMessage,
    isTyping,
    sendMessage,
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized
  } = useChat();
  
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!user) {
      setError("Please log in to use the chat feature");
      return;
    }
    
    setError(null);
    await sendMessage(newMessage);
  };

  const handleExpand = () => {
    router.push('/chat');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsOpen(true)} 
          size="icon" 
          className="h-14 w-14 rounded-full bg-primary shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex gap-2">
        <Button 
          onClick={() => setIsMinimized(false)} 
          size="icon" 
          className="h-14 w-14 rounded-full bg-primary shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="w-[400px] h-[600px] flex flex-col rounded-xl overflow-hidden bg-[#141414] border border-border/50 shadow-xl">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between bg-[#171717]">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-md font-semibold">AI Assistant</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExpand}
              className="h-8 w-8"
              title="Expand to full view"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="h-8 w-8"
              title="Minimize"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Chat messages */}
        <div className="flex-grow overflow-hidden relative">
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`rounded-2xl px-3 py-2 max-w-[85%] shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-[#1A1A1A] text-foreground rounded-tl-none'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className="mt-1 text-xs opacity-60 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-accent">U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl rounded-tl-none px-3 py-2 bg-[#1A1A1A]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-pulse delay-150"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        
        {/* Chat input */}
        <div className="px-4 py-3 border-t border-border/40 bg-[#171717]">
          <form onSubmit={handleMessageSubmit} className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow py-2 px-3 bg-[#1A1A1A] border-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm rounded-full"
              disabled={isTyping || !user}
            />
            <Button 
              type="submit" 
              size="icon"
              className="bg-primary rounded-full h-9 w-9 flex items-center justify-center" 
              disabled={isTyping || !user}
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 