"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, signIn, signUp, signOut, getCurrentUser, signInWithGoogle, signInWithGithub } from './supabase';
import { User, AuthError } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, options?: { data?: { display_name?: string; phone?: string | null } }) => Promise<any>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
        setError("Failed to load user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
    
    // Set up auth state listener for session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        } else if (event === 'USER_UPDATED' && session?.user) {
          setUser(session.user);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const result = await signIn(email, password);
      if (result?.user) {
        setUser(result.user);
      } else {
        throw new Error("Failed to login. Please try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Failed to login");
      // Re-throw to allow the component to handle the error
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, options?: { data?: { display_name?: string; phone?: string | null } }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      
      const result = await signUp(email, password, options);
      
      // The user needs to confirm their email, so we don't set the user here
      return result;
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "Failed to register");
      // Re-throw to allow the component to handle the error
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
      // Auth state will be handled by the onAuthStateChange listener
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message || "Failed to login with Google");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const loginWithGithub = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGithub();
      // Auth state will be handled by the onAuthStateChange listener
    } catch (error: any) {
      console.error("GitHub login error:", error);
      setError(error.message || "Failed to login with GitHub");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signOut();
      setUser(null);
    } catch (error: any) {
      console.error("Logout error:", error);
      setError(error.message || "Failed to logout");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        loginWithGoogle,
        loginWithGithub,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 