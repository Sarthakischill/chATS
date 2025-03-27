"use client";

import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
export type Course = {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: string;
  rating?: number;
  students?: number;
  image?: string;
  relevance?: number;
  category: string;
  url?: string;
};

export type UserCourse = {
  id: string;
  courseId: string;
  userId: string;
  progress: number;
  startDate: string;
  lastAccessed: string;
  completed: boolean;
  title: string;
  provider: string;
  image?: string;
  category: string;
};

export type SkillGap = {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  category: string;
  description: string;
};

export type Project = {
  id: string;
  title: string;
  skills: string[];
  difficulty: string;
  duration: string;
  description: string;
};

export type LearningRecommendation = {
  id?: string;
  userId: string;
  recommendedCourses: Course[];
  skillGaps: SkillGap[];
  projects: Project[];
  resumeText?: string;
  jobDescription?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Save learning recommendations to Supabase
 * @param userId User ID
 * @param recommendation Learning recommendation data
 * @returns The saved recommendation data
 */
export async function saveLearningRecommendation(
  userId: string,
  recommendation: LearningRecommendation
): Promise<any> {
  try {
    const id = recommendation.id || uuidv4();
    const now = new Date().toISOString();
    
    // Save to Supabase table
    const { data, error } = await supabase
      .from('learning_recommendations')
      .upsert(
        {
          id,
          user_id: userId,
          created_at: recommendation.createdAt || now,
          updated_at: now,
          data: JSON.stringify({
            recommendedCourses: recommendation.recommendedCourses,
            skillGaps: recommendation.skillGaps,
            projects: recommendation.projects,
            resumeText: recommendation.resumeText,
            jobDescription: recommendation.jobDescription
          })
        },
        { onConflict: 'id' }
      )
      .select();
    
    if (error) throw error;
    
    // Also save to storage for full data access
    await supabase.storage
      .from('learning-recommendations')
      .upload(
        `${userId}/${id}.json`,
        new Blob([JSON.stringify({
          id,
          ...recommendation,
          createdAt: recommendation.createdAt || now,
          updatedAt: now
        })], { type: 'application/json' }),
        {
          upsert: true,
          contentType: 'application/json'
        }
      );
    
    return data;
  } catch (error) {
    console.error('Error saving learning recommendation:', error);
    throw error;
  }
}

/**
 * Get all learning recommendations for a user
 * @param userId User ID
 * @returns Array of learning recommendations
 */
export async function getUserLearningRecommendations(userId: string) {
  try {
    const { data, error } = await supabase
      .from('learning_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    // Parse the data field
    return (data || []).map(item => {
      try {
        const parsedData = JSON.parse(item.data);
        return {
          id: item.id,
          userId: item.user_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          ...parsedData
        };
      } catch (e) {
        return item;
      }
    });
  } catch (error) {
    console.error('Error fetching learning recommendations:', error);
    return [];
  }
}

/**
 * Get a specific learning recommendation
 * @param userId User ID
 * @param recommendationId Recommendation ID
 * @returns The recommendation data or null
 */
export async function getLearningRecommendation(userId: string, recommendationId: string) {
  try {
    // First try to get from storage for full data
    let { data, error } = await supabase.storage
      .from('learning-recommendations')
      .download(`${userId}/${recommendationId}.json`);
    
    if (data) {
      const textDecoder = new TextDecoder('utf-8');
      const text = textDecoder.decode(await data.arrayBuffer());
      return JSON.parse(text);
    }
    
    // If not in storage, get from database
    const { data: dbData, error: dbError } = await supabase
      .from('learning_recommendations')
      .select('*')
      .eq('id', recommendationId)
      .eq('user_id', userId)
      .single();
      
    if (dbError) throw dbError;
    
    if (dbData) {
      try {
        const parsedData = JSON.parse(dbData.data);
        return {
          id: dbData.id,
          userId: dbData.user_id,
          createdAt: dbData.created_at,
          updatedAt: dbData.updated_at,
          ...parsedData
        };
      } catch (e) {
        return dbData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching learning recommendation:', error);
    return null;
  }
}

/**
 * Delete a learning recommendation
 * @param userId User ID
 * @param recommendationId Recommendation ID
 * @returns Success status
 */
export async function deleteLearningRecommendation(userId: string, recommendationId: string) {
  try {
    // Delete from database
    const { error: dbError } = await supabase
      .from('learning_recommendations')
      .delete()
      .eq('id', recommendationId)
      .eq('user_id', userId);
      
    if (dbError) throw dbError;
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('learning-recommendations')
      .remove([`${userId}/${recommendationId}.json`]);
    
    if (storageError) {
      console.error('Error deleting learning recommendation from storage:', storageError);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting learning recommendation:', error);
    throw error;
  }
}

/**
 * Get user's in-progress courses
 * @param userId User ID
 * @returns Array of in-progress courses
 */
export async function getUserInProgressCourses(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_courses')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('last_accessed', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(course => ({
      id: course.id,
      courseId: course.course_id,
      userId: course.user_id,
      progress: course.progress,
      startDate: course.start_date,
      lastAccessed: course.last_accessed,
      completed: course.completed,
      title: course.title,
      provider: course.provider,
      image: course.image,
      category: course.category
    }));
  } catch (error) {
    console.error('Error fetching in-progress courses:', error);
    return [];
  }
}

/**
 * Update course progress
 * @param userId User ID
 * @param courseId Course ID 
 * @param progress Progress percentage (0-100)
 * @returns Updated course data
 */
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  progress: number
) {
  try {
    // Get the course first to check if it exists
    const { data: existingCourse, error: fetchError } = await supabase
      .from('user_courses')
      .select('*')
      .eq('id', courseId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "row not found" - which is fine, we'll create it
      throw fetchError;
    }
    
    const now = new Date().toISOString();
    const completed = progress >= 100;
    
    if (existingCourse) {
      // Update existing course
      const { data, error } = await supabase
        .from('user_courses')
        .update({
          progress,
          last_accessed: now,
          completed
        })
        .eq('id', courseId)
        .eq('user_id', userId)
        .select();
        
      if (error) throw error;
      return data;
    } else {
      // Course doesn't exist for this user, throw error
      throw new Error('Course not found for this user');
    }
  } catch (error) {
    console.error('Error updating course progress:', error);
    throw error;
  }
} 