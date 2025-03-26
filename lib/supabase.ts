"use client";

import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// User profile functions
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Resume functions
export async function getUserResumes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return [];
  }
}

export async function getResumeById(resumeId: string) {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching resume:', error);
    return null;
  }
}

export async function saveResume(userId: string, resumeData: any) {
  try {
    // Check if we're updating an existing resume or creating a new one
    if (resumeData.id) {
      const { data, error } = await supabase
        .from('resumes')
        .update({
          ...resumeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeData.id)
        .eq('user_id', userId) // Ensure the user owns this resume
        .select();
        
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('resumes')
        .insert([
          {
            ...resumeData,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
}

export async function deleteResume(userId: string, resumeId: string) {
  try {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId); // Ensure the user owns this resume
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
}

// Cover letter functions
export async function getUserCoverLetters(userId: string) {
  try {
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cover letters:', error);
    return [];
  }
}

export async function getCoverLetterById(coverId: string) {
  try {
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('id', coverId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching cover letter:', error);
    return null;
  }
}

export async function saveCoverLetter(userId: string, coverLetterData: any) {
  try {
    // Check if we're updating an existing cover letter or creating a new one
    if (coverLetterData.id) {
      const { data, error } = await supabase
        .from('cover_letters')
        .update({
          ...coverLetterData,
          updated_at: new Date().toISOString()
        })
        .eq('id', coverLetterData.id)
        .eq('user_id', userId) // Ensure the user owns this cover letter
        .select();
        
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('cover_letters')
        .insert([
          {
            ...coverLetterData,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving cover letter:', error);
    throw error;
  }
}

export async function deleteCoverLetter(userId: string, coverId: string) {
  try {
    const { error } = await supabase
      .from('cover_letters')
      .delete()
      .eq('id', coverId)
      .eq('user_id', userId); // Ensure the user owns this cover letter
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting cover letter:', error);
    throw error;
  }
}

// Job description functions
export async function getUserJobDescriptions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    return [];
  }
}

export async function getJobDescriptionById(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching job description:', error);
    return null;
  }
}

export async function saveJobDescription(userId: string, jobData: any) {
  try {
    // Check if we're updating an existing job description or creating a new one
    if (jobData.id) {
      const { data, error } = await supabase
        .from('job_descriptions')
        .update({
          ...jobData,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobData.id)
        .eq('user_id', userId) // Ensure the user owns this job description
        .select();
        
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('job_descriptions')
        .insert([
          {
            ...jobData,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving job description:', error);
    throw error;
  }
}

export async function deleteJobDescription(userId: string, jobId: string) {
  try {
    const { error } = await supabase
      .from('job_descriptions')
      .delete()
      .eq('id', jobId)
      .eq('user_id', userId); // Ensure the user owns this job description
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting job description:', error);
    throw error;
  }
}

// Types for user data
export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export type SavedResume = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
  updated_at: string;
}

export type SavedJobDescription = {
  id: string;
  user_id: string;
  title: string;
  company_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type SavedCoverLetter = {
  id: string;
  user_id: string;
  resume_id?: string;
  job_description_id?: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// User Authentication Functions
export async function signUp(email: string, password: string, options?: { data?: { display_name?: string; phone?: string | null } }) {
  try {
    // Check if there's already a user with this email
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // If there's a session, sign out first
      await supabase.auth.signOut();
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options?.data || {},
        emailRedirectTo: `${window.location.origin}/auth/confirm`
      }
    });
    
    if (error) throw error;
    
    // When data.user is provided but data.session is null, it means email confirmation is required
    if (data.user && !data.session) {
      return {
        ...data,
        message: "Please check your email for a confirmation link."
      };
    }
    
    // If both user and session are present, it means auto-confirmation (e.g., in development)
    return data;
  } catch (error: any) {
    // Handle specific error cases
    if (error.message?.includes('already registered')) {
      throw new Error("This email is already registered. Please sign in instead.");
    }
    console.error('Error signing up:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Handle specific error codes
      if (error.message.includes('Invalid login credentials')) {
        throw new Error("Invalid email or password. Please try again.");
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error("Please verify your email before signing in. Check your inbox for a confirmation email.");
      }
      throw error;
    }
    
    // Check if user is null (this means user doesn't exist)
    if (!data.user) {
      throw new Error("No account exists with this email. Please sign up first.");
    }
    
    // Check if email is confirmed
    if (data.user && !data.user.email_confirmed_at) {
      // Sign the user out if email is not confirmed
      await supabase.auth.signOut();
      throw new Error("Please verify your email before signing in. Check your inbox for a confirmation email.");
    }
    
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      // Try to sign out in case of invalid session
      await supabase.auth.signOut();
      return null;
    }
    
    if (data && data.session) {
      // Try to validate the session's token
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData?.user) {
          console.error('User validation error:', userError);
          // Session exists but user is invalid, sign out
          await supabase.auth.signOut();
          return null;
        }
        
        return userData.user;
      } catch (validationError) {
        console.error('Token validation error:', validationError);
        // Error validating token, sign out
        await supabase.auth.signOut();
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    await supabase.auth.signOut();
    return null;
  }
}

// Add these functions after the existing auth functions

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signInWithGithub() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in with GitHub:', error);
    throw error;
  }
} 