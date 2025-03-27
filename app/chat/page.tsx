"use client";

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/header';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Check, 
  Send, 
  Bot, 
  Loader2, 
  FileText, 
  FileIcon, 
  Briefcase, 
  ChevronRight,
  MessageCircle
} from "lucide-react";
import { useChat } from '@/lib/chat-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-context';

export default function ChatPage() {
  const {
    messages,
    newMessage,
    setNewMessage,
    isTyping,
    sendMessage,
    contextDocuments,
    toggleDocumentSelection,
    loadUserDocuments,
    clearChat
  } = useChat();
  
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showDocuments, setShowDocuments] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user's documents when the component mounts
  useEffect(() => {
    if (user) {
      loadUserDocuments();
    }
  }, [user, loadUserDocuments]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  const handleClearChat = () => {
    clearChat();
  };

  const getDocumentsByType = (type: string) => {
    return contextDocuments.filter(doc => doc.type === type);
  };
  
  const getSelectedDocumentsCount = () => {
    return contextDocuments.filter(doc => doc.selected).length;
  };

  type DocumentItemProps = {
    doc: {
      id: string;
      type: string;
      title: string;
      selected: boolean;
    };
    icon: React.ReactNode;
  };

  const DocumentItem = ({ doc, icon }: DocumentItemProps) => (
    <div 
      key={doc.id}
      onClick={() => toggleDocumentSelection(doc.id)}
      className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all ${
        doc.selected 
          ? 'bg-[#1A1A1A] border-l-2 border-primary' 
          : 'hover:bg-[#1A1A1A] border-l-2 border-transparent'
      }`}
    >
      <div className={`mr-3 p-2 rounded-md ${doc.selected ? 'bg-primary/10' : 'bg-[#242424]'}`}>
        {icon}
      </div>
      <div className="flex-grow overflow-hidden">
        <div className="text-sm font-medium truncate">{doc.title}</div>
        <div className="text-xs text-muted-foreground">
          {doc.type === 'resume' ? 'Resume' : 
           doc.type === 'coverLetter' ? 'Cover Letter' : 
           'Job Description'}
        </div>
      </div>
      <div className={`ml-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
        doc.selected 
          ? 'bg-primary' 
          : 'bg-transparent border border-muted-foreground/30 group-hover:border-muted-foreground/60'
      }`}>
        {doc.selected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
    </div>
  );

  type EmptyStateMessageProps = {
    type: string;
    icon: React.ReactNode;
    message: string;
    link: string;
    linkText: string;
  };

  const EmptyStateMessage = ({ type, icon, message, link, linkText }: EmptyStateMessageProps) => (
    <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
      <div className="bg-[#1A1A1A] h-16 w-16 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground">{message}</p>
        <Button variant="link" size="sm" className="text-primary" asChild>
          <a href={link}>{linkText}</a>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex flex-1 container max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex h-[calc(100vh-130px)] w-full rounded-xl overflow-hidden bg-[#141414] border border-border/50 shadow-xl">
          {/* Left sidebar for document selection */}
          <div className={`bg-[#171717] ${showDocuments ? 'w-80' : 'w-0'} transition-all duration-300 flex flex-col border-r border-border/40`}>
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-primary/80" />
                  Chat Context
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Select documents to use as reference
                </p>
              </div>
              
              <div className="bg-[#232323] px-2 py-1 rounded-md text-xs font-medium">
                {getSelectedDocumentsCount()} selected
              </div>
            </div>
            
            <ScrollArea className="flex-grow">
              <div className="p-4 space-y-2">
                {/* Document categories */}
                <div>
                  <div className="mb-2 px-1 flex items-center text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2 text-primary/60" />
                    Resumes
                  </div>
                  
                  {getDocumentsByType('resume').length > 0 ? (
                    <div className="space-y-1">
                      {getDocumentsByType('resume').map(doc => (
                        <DocumentItem key={doc.id} doc={doc} icon={<FileText className="h-4 w-4 text-primary" />} />
                      ))}
                    </div>
                  ) : (
                    <EmptyStateMessage 
                      type="resume"
                      icon={<FileText className="h-8 w-8 text-muted-foreground/40" />}
                      message="No resumes found"
                      link="/analyze"
                      linkText="Upload a resume"
                    />
                  )}
                </div>
                
                <div className="my-4 border-t border-border/20" />
                
                <div>
                  <div className="mb-2 px-1 flex items-center text-sm font-medium text-muted-foreground">
                    <FileIcon className="h-4 w-4 mr-2 text-primary/60" />
                    Cover Letters
                  </div>
                  
                  {getDocumentsByType('coverLetter').length > 0 ? (
                    <div className="space-y-1">
                      {getDocumentsByType('coverLetter').map(doc => (
                        <DocumentItem key={doc.id} doc={doc} icon={<FileIcon className="h-4 w-4 text-primary" />} />
                      ))}
                    </div>
                  ) : (
                    <EmptyStateMessage 
                      type="coverLetter"
                      icon={<FileIcon className="h-8 w-8 text-muted-foreground/40" />}
                      message="No cover letters found"
                      link="/cover-letter"
                      linkText="Create a cover letter"
                    />
                  )}
                </div>
                
                <div className="my-4 border-t border-border/20" />
                
                <div>
                  <div className="mb-2 px-1 flex items-center text-sm font-medium text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-2 text-primary/60" />
                    Job Descriptions
                  </div>
                  
                  {getDocumentsByType('jobDescription').length > 0 ? (
                    <div className="space-y-1">
                      {getDocumentsByType('jobDescription').map(doc => (
                        <DocumentItem key={doc.id} doc={doc} icon={<Briefcase className="h-4 w-4 text-primary" />} />
                      ))}
                    </div>
                  ) : (
                    <EmptyStateMessage 
                      type="jobDescription"
                      icon={<Briefcase className="h-8 w-8 text-muted-foreground/40" />}
                      message="No job descriptions found"
                      link="/job-descriptions"
                      linkText="Add a job description"
                    />
                  )}
                </div>
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-border/40">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearChat}
                className="w-full bg-[#1A1A1A] hover:bg-[#232323] border-border/30"
              >
                Clear Conversation
              </Button>
            </div>
          </div>
          
          {/* Chat area */}
          <div className="flex-grow flex flex-col relative">
            {/* Toggle sidebar button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDocuments(!showDocuments)}
              className="absolute top-4 left-4 z-10 bg-background/5 hover:bg-background/20"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${showDocuments ? 'rotate-180' : ''}`} />
            </Button>
          
            <div className="px-6 py-4 border-b border-border/40 flex items-center">
              <div className="ml-10">
                <h2 className="text-lg font-semibold">Chat with AI Assistant</h2>
                {getSelectedDocumentsCount() > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Using {getSelectedDocumentsCount()} document{getSelectedDocumentsCount() !== 1 ? 's' : ''} as context
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex-grow overflow-hidden relative">
              {error && (
                <Alert variant="destructive" className="m-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                    >
                      {message.sender === 'bot' && (
                        <Avatar className="h-9 w-9 mr-3 mt-1 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`rounded-2xl px-4 py-3 max-w-[85%] shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-[#1A1A1A] text-foreground rounded-tl-none'
                        }`}
                      >
                        <div className={message.sender === 'user' ? 'text-sm' : 'text-sm'}>{message.content}</div>
                        <div className="mt-1 text-xs opacity-60 text-right">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      {message.sender === 'user' && (
                        <Avatar className="h-9 w-9 ml-3 mt-1 flex-shrink-0">
                          <AvatarFallback className="bg-accent">U</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <Avatar className="h-9 w-9 mr-3 mt-1 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-[#1A1A1A]">
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
            
            <div className="px-6 py-4 border-t border-border/40">
              <form onSubmit={handleMessageSubmit} className="flex items-center gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-grow py-6 px-4 bg-[#1A1A1A] border-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm rounded-full"
                  disabled={isTyping || !user}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="bg-primary hover:bg-primary/90 rounded-full h-12 w-12 flex items-center justify-center" 
                  disabled={isTyping || !user}
                >
                  {isTyping ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 