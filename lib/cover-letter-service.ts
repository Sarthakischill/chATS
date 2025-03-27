"use client";

import { supabase } from './supabase';
import { 
  saveCoverLetter as supabaseSaveCoverLetter, 
  getUserCoverLetters as supabaseGetCoverLetters 
} from './supabase';
import { uploadConversationFile } from './conversation-service';
import { v4 as uuidv4 } from 'uuid';

// Type definition for cover letter data
export type CoverLetterData = {
  id?: string;
  title: string;
  company: string;
  position: string;
  content: string;
  resumeText?: string;
  jobDescription?: string;
  metadata?: any;
};

/**
 * Saves a cover letter to Supabase
 * @param userId User ID
 * @param coverLetter Cover letter data
 * @returns The saved cover letter data
 */
export async function saveCoverLetter(
  userId: string,
  coverLetter: CoverLetterData
): Promise<any> {
  try {
    const id = coverLetter.id || uuidv4();
    
    // Prepare data for database
    const coverLetterRecord = {
      id,
      title: coverLetter.title || `Cover Letter for ${coverLetter.company} - ${coverLetter.position}`,
      company: coverLetter.company,
      position: coverLetter.position,
      content: coverLetter.content,
      resume_text: coverLetter.resumeText,
      job_description: coverLetter.jobDescription,
      metadata: coverLetter.metadata || {}
    };
    
    // Save to database using the supabase function
    const { data, error } = await supabase
      .from('cover_letters')
      .upsert([{
        ...coverLetterRecord,
        user_id: userId,
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) {
      console.error('Error saving cover letter:', error);
      throw error;
    }
    
    return data?.[0];
  } catch (error) {
    console.error('Error saving cover letter:', error);
    throw error;
  }
}

/**
 * Get all cover letters for a user
 * @param userId User ID
 * @returns Array of cover letters
 */
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

/**
 * Get a specific cover letter
 * @param userId User ID
 * @param coverId Cover letter ID
 * @returns The cover letter data or null
 */
export async function getCoverLetter(userId: string, coverId: string) {
  try {
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('id', coverId)
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching cover letter:', error);
    return null;
  }
}

/**
 * Delete a cover letter
 * @param userId User ID
 * @param coverId Cover letter ID
 * @returns Success status
 */
export async function deleteCoverLetter(userId: string, coverId: string) {
  try {
    const { error } = await supabase
      .from('cover_letters')
      .delete()
      .eq('id', coverId)
      .eq('user_id', userId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting cover letter:', error);
    throw error;
  }
} 