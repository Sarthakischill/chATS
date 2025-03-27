// lib/chat-context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react';
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

  // Function to load user's documents (memoized with useCallback)
  // Now depends ONLY on `user` to stabilize its reference.
  const loadUserDocuments = useCallback(async () => {
    if (!user) {
      setContextDocuments([]); // Clear if no user
      console.log('loadUserDocuments: No user, cleared documents.');
      return;
    }

    try {
      console.log('loadUserDocuments: Loading documents for user:', user.id);
      const [resumes, coverLetters, jobDescs] = await Promise.all([
        getUserResumes(user.id),
        getUserCoverLetters(user.id),
        getUserJobDescriptions(user.id)
      ]);
      console.log('loadUserDocuments: Fetched documents:', { resumes, coverLetters, jobDescs });

      // Map fetched documents WITHOUT selection state initially
      const fetchedDocsMap = new Map<string, Omit<ContextDocument, 'selected'>>();

      resumes.forEach((resume: any) => fetchedDocsMap.set(resume.id, {
        id: resume.id, type: 'resume',
        title: resume.title || `Resume ${resume.id.substring(0, 8)}`,
        content: resume.content || '',
      }));
      coverLetters.forEach((letter: any) => fetchedDocsMap.set(letter.id, {
        id: letter.id, type: 'coverLetter',
        title: letter.title || `Cover Letter ${letter.id.substring(0, 8)}`,
        content: letter.content || '',
      }));
      jobDescs.forEach((job: any) => fetchedDocsMap.set(job.id, {
        id: job.id, type: 'jobDescription',
        title: job.title || `Job ${job.id.substring(0, 8)}`,
        content: job.job_description || job.content || '',
      }));

      // Use functional update to merge fetched data with the PREVIOUS state, preserving selection
      setContextDocuments(prevDocs => {
        console.log('loadUserDocuments: Merging fetched docs with previous state:', prevDocs);
        const newDocs: ContextDocument[] = [];
        const currentDocMap = new Map(prevDocs.map(doc => [doc.id, doc])); // Map current state for quick lookup

        // Process fetched documents
        fetchedDocsMap.forEach((fetchedDocData, docId) => {
          const existingDoc = currentDocMap.get(docId);
          newDocs.push({
            ...fetchedDocData,
            // Preserve selection if doc already existed, otherwise default to false
            selected: existingDoc ? existingDoc.selected : false
          });
        });

        // Filter out any docs that were in prevDocs but are no longer fetched (e.g., deleted)
        // This step ensures that deleted documents are removed from the context.
        const finalDocs = newDocs.filter(doc => fetchedDocsMap.has(doc.id));

        console.log('loadUserDocuments: Merged documents state:', finalDocs);

        // Optional: Sort documents consistently
        finalDocs.sort((a, b) => {
          const typeOrder = { resume: 1, coverLetter: 2, jobDescription: 3 };
          if (a.type !== b.type) return typeOrder[a.type] - typeOrder[b.type];
          return a.title.localeCompare(b.title);
        });

        return finalDocs; // Return the intelligently merged and sorted list
      });

    } catch (error) {
      console.error('loadUserDocuments: Error loading documents:', error);
      setContextDocuments([]); // Clear on error
    }
  // Depend ONLY on `user`. This stabilizes the function reference.
  }, [user]);

  // Load documents when the user state changes (login/logout).
  // This effect relies on the stable reference of loadUserDocuments.
  useEffect(() => {
    console.log('ChatProvider Effect: User changed, triggering loadUserDocuments.');
    loadUserDocuments();
  // Depend only on the memoized function. It runs when the user logs in/out.
  }, [loadUserDocuments]);

  // Toggle document selection - This function should now reliably update state
  const toggleDocumentSelection = (docId: string) => {
    if (!docId) return;

    console.log('toggleDocumentSelection: Toggling ID:', docId);

    setContextDocuments(prevDocs => {
      const docExists = prevDocs.some(doc => doc.id === docId);
      if (!docExists) {
          console.warn("toggleDocumentSelection: Document ID not found:", docId);
          return prevDocs; // Avoid unnecessary state update if ID is invalid
      }

      // Map to new array, toggling the selected state
      const updatedDocs = prevDocs.map(doc =>
        doc.id === docId ? { ...doc, selected: !doc.selected } : doc
      );
      console.log('toggleDocumentSelection: Updated state:', updatedDocs.find(d => d.id === docId)?.selected, updatedDocs);
      return updatedDocs;
    });
  };

  // Send a message
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
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
      const selectedDocs = contextDocuments.filter(doc => doc.selected);
      const contextText = selectedDocs.length > 0 
        ? selectedDocs.map(doc => `## ${doc.type.toUpperCase()}: ${doc.title}\n\n${doc.content}`).join('\n\n---\n\n')
        : '';
      
      const currentMessages = [...messages, userMessage];
      const lastMessages = currentMessages.slice(-6);
      const mappedMessages = lastMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      console.log("Sending to Gemini - History:", mappedMessages.length, "Context length:", contextText.length);
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
        content: "I'm sorry, I encountered an error processing your request. Please check the console or try again.",
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
    console.log('Clearing chat conversation.');
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
        loadUserDocuments, // Provide the stable, memoized function
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