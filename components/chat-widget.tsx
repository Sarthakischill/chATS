"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X, Bot, Minimize, Maximize, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from '@/lib/chat-context';

export function ChatWidget() {
  const {
    messages,
    newMessage,
    setNewMessage,
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    isTyping,
    sendMessage
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await sendMessage(newMessage);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 p-0 flex items-center justify-center z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className={`fixed right-6 bg-card border border-border shadow-lg transition-all duration-200 ease-in-out z-50 ${isMinimized ? 'h-16 bottom-6 w-80' : 'bottom-6 w-80 sm:w-96 h-[500px] max-h-[80vh]'}`}>
          <CardHeader className="p-3 border-b border-border cursor-pointer" onClick={toggleMinimize}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/robot-avatar.png" alt="AI Assistant" />
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                {isMinimized ? (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); toggleMinimize();}}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); toggleMinimize();}}>
                    <Minimize className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); toggleChat();}}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <>
              <CardContent className="p-3 flex-grow overflow-y-auto h-[390px]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`rounded-lg p-3 max-w-[80%] ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className="mt-1 text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="rounded-lg p-3 bg-muted text-muted-foreground">
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
              </CardContent>
              
              <CardFooter className="p-3 border-t border-border">
                <form onSubmit={handleMessageSubmit} className="flex w-full gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow"
                    disabled={isTyping}
                  />
                  <Button type="submit" size="icon" className="bg-primary" disabled={isTyping}>
                    {isTyping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  );
} 