"use client";

import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];

// Get the user's profile
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

// Update the user's profile
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    website?: string;
    bio?: string;
  }
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

// Get the user's preferences
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return null;
  }
}

// Update the user's preferences
export async function updateUserPreferences(
  userId: string,
  updates: {
    theme?: string;
    notification_email?: boolean;
  }
): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    return null;
  }
}

// Upload a new avatar image and update the user's profile
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ avatar_url: string } | null> {
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload the file to the "avatars" bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: publicURLData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatar_url = publicURLData.publicUrl;

    // Update the user's profile with the new avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('avatar_url')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
}

// Delete the user's avatar
export async function deleteAvatar(userId: string): Promise<boolean> {
  try {
    // Get the current avatar URL to extract the file name
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (profile?.avatar_url) {
      // Extract the file name from the URL
      const fileNameWithPath = profile.avatar_url.split('/').pop() as string;

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileNameWithPath]);

      if (deleteError) throw deleteError;
    }

    // Update the profile to remove the avatar URL
    const { error } = await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return false;
  }
} 