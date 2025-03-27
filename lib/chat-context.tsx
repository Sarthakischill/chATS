"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getChatResponse } from '@/lib/gemini';
import { useAuth } from '@/lib/auth-context';
import { 
  getUserResumes, 
  getUserCoverLetters, 
  getUserJobDescriptions 
} from '@/lib/supabase';

// Define message type
export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

// Define context document type
export type ContextDocument = {
  id: string;
  type: 'resume' | 'coverLetter' | 'jobDescription';
  title: string;
  content: string;
  selected: boolean;
};

// Define the shape of the context
export type ChatContextType = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
  sendMessage: (message: string) => Promise<void>;
  contextDocuments: ContextDocument[];
  setContextDocuments: React.Dispatch<React.SetStateAction<ContextDocument[]>>;
  toggleDocumentSelection: (docId: string) => void;
  loadUserDocuments: () => Promise<void>;
  clearChat: () => void;
};

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Initial welcome message
const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hi there! I\'m your AI assistant. How can I help you with your resume, cover letter, or job search today?',
    sender: 'bot',
    timestamp: new Date()
  }
];

// Provider component
export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [contextDocuments, setContextDocuments] = useState<ContextDocument[]>([]);

  // Load user's documents when user changes
  useEffect(() => {
    if (user) {
      loadUserDocuments();
    }
  }, [user]);

  // Function to load user's documents
  const loadUserDocuments = async () => {
    if (!user) return;

    try {
      // Load resumes
      const resumes = await getUserResumes(user.id);
      const resumeDocs = resumes.map((resume: any) => ({
        id: resume.id,
        type: 'resume' as const,
        title: resume.title || `Resume ${resume.id.substring(0, 5)}`,
        content: resume.content || '',
        selected: false
      }));

      // Load cover letters
      const coverLetters = await getUserCoverLetters(user.id);
      const coverLetterDocs = coverLetters.map((letter: any) => ({
        id: letter.id,
        type: 'coverLetter' as const,
        title: letter.title || `Cover Letter ${letter.id.substring(0, 5)}`,
        content: letter.content || '',
        selected: false
      }));

      // Load job descriptions
      const jobDescs = await getUserJobDescriptions(user.id);
      const jobDescDocs = jobDescs.map((job: any) => ({
        id: job.id,
        type: 'jobDescription' as const,
        title: job.title || `Job ${job.id.substring(0, 5)}`,
        content: job.description || '',
        selected: false
      }));

      // Combine all documents
      setContextDocuments([...resumeDocs, ...coverLetterDocs, ...jobDescDocs]);
    } catch (error) {
      console.error('Error loading user documents:', error);
    }
  };

  // Toggle document selection
  const toggleDocumentSelection = (docId: string) => {
    setContextDocuments(prevDocs =>
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, selected: !doc.selected } : doc
      )
    );
  };

  // Send a message
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);
    
    try {
      // Get selected documents context
      const selectedDocs = contextDocuments.filter(doc => doc.selected);
      const contextText = selectedDocs.length > 0 
        ? selectedDocs.map(doc => `${doc.type.toUpperCase()}: ${doc.title}\n${doc.content}`).join('\n\n')
        : '';
      
      // Get response from Gemini API
      const lastMessages = messages.slice(-6).concat(userMessage); // Include up to last 6 messages for context
      const mappedMessages = lastMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      const response = await getChatResponse(mappedMessages, contextText);
      
      const botMessage: Message = {
        id: Date.now().toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting chat response:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages(initialMessages);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        newMessage,
        setNewMessage,
        isOpen,
        setIsOpen,
        isMinimized,
        setIsMinimized,
        isTyping,
        setIsTyping,
        sendMessage,
        contextDocuments,
        setContextDocuments,
        toggleDocumentSelection,
        loadUserDocuments,
        clearChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Hook for using the chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 