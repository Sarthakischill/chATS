"use client";

import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export type ConversationType = 'resume' | 'cover-letter' | 'job-description';

export interface ConversationMeta {
  id: string;
  userId: string;
  title: string;
  type: ConversationType;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  meta: ConversationMeta;
  messages: Message[];
  results?: any; // Can be resume analysis, cover letter, etc.
}

// Save a conversation to the database and its content to storage
export async function saveConversation(
  userId: string, 
  type: ConversationType,
  title: string,
  messages: Message[],
  results?: any
): Promise<string> {
  try {
    // Generate an ID for the conversation
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Create metadata for the database
    const meta: ConversationMeta = {
      id,
      userId,
      title,
      type,
      createdAt: now,
      updatedAt: now
    };
    
    // Create the full conversation object for storage
    const conversation: Conversation = {
      meta,
      messages,
      results
    };
    
    // Save conversation metadata to the database
    const { error: dbError } = await supabase
      .from(`${type}s`)
      .insert({
        id,
        user_id: userId,
        title,
        created_at: now,
        updated_at: now
      });
    
    if (dbError) throw dbError;
    
    // Save the full conversation to storage
    const { error: storageError } = await supabase.storage
      .from('conversations')
      .upload(`${userId}/${type}s/${id}.json`, JSON.stringify(conversation));
    
    if (storageError) throw storageError;
    
    return id;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

// Update an existing conversation
export async function updateConversation(
  userId: string,
  type: ConversationType,
  id: string,
  updates: {
    title?: string;
    messages?: Message[];
    results?: any;
  }
): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    
    // Get the current conversation data
    const { data: existingData, error: fetchError } = await supabase.storage
      .from('conversations')
      .download(`${userId}/${type}s/${id}.json`);
    
    if (fetchError) throw fetchError;
    
    // Parse the existing conversation
    const textDecoder = new TextDecoder('utf-8');
    const existingText = textDecoder.decode(await existingData.arrayBuffer());
    const existing: Conversation = JSON.parse(existingText);
    
    // Update conversation with new data
    const updated: Conversation = {
      ...existing,
      meta: {
        ...existing.meta,
        title: updates.title || existing.meta.title,
        updatedAt: now
      },
      messages: updates.messages || existing.messages,
      results: updates.results || existing.results
    };
    
    // Update the metadata in the database if title changed
    if (updates.title) {
      const { error: dbError } = await supabase
        .from(`${type}s`)
        .update({
          title: updates.title,
          updated_at: now
        })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (dbError) throw dbError;
    } else {
      // Just update the timestamp
      const { error: dbError } = await supabase
        .from(`${type}s`)
        .update({
          updated_at: now
        })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (dbError) throw dbError;
    }
    
    // Update the file in storage
    const { error: storageError } = await supabase.storage
      .from('conversations')
      .upload(`${userId}/${type}s/${id}.json`, JSON.stringify(updated), {
        upsert: true
      });
    
    if (storageError) throw storageError;
    
    return true;
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
}

// Get a specific conversation by ID
export async function getConversation(
  userId: string,
  type: ConversationType,
  id: string
): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase.storage
      .from('conversations')
      .download(`${userId}/${type}s/${id}.json`);
    
    if (error) throw error;
    
    const textDecoder = new TextDecoder('utf-8');
    const text = textDecoder.decode(await data.arrayBuffer());
    return JSON.parse(text);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}

// Get all conversations of a specific type for a user
export async function getUserConversations(
  userId: string,
  type: ConversationType
): Promise<ConversationMeta[]> {
  try {
    const { data, error } = await supabase
      .from(`${type}s`)
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      type,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error(`Error fetching ${type}s:`, error);
    return [];
  }
}

// Delete a conversation
export async function deleteConversation(
  userId: string,
  type: ConversationType,
  id: string
): Promise<boolean> {
  try {
    // Delete from database
    const { error: dbError } = await supabase
      .from(`${type}s`)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (dbError) throw dbError;
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('conversations')
      .remove([`${userId}/${type}s/${id}.json`]);
    
    if (storageError) throw storageError;
    
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
}

// Upload a file related to a conversation (like a PDF or document)
export async function uploadConversationFile(
  userId: string,
  type: ConversationType,
  conversationId: string,
  file: File
): Promise<string | null> {
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${conversationId}-${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${type}s/${conversationId}/${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: publicURLData } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);
    
    return publicURLData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

// Get all files for a conversation
export async function getConversationFiles(
  userId: string,
  type: ConversationType,
  conversationId: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from('files')
      .list(`${userId}/${type}s/${conversationId}`);
    
    if (error) throw error;
    
    return data.map(file => {
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(`${userId}/${type}s/${conversationId}/${file.name}`);
      
      return urlData.publicUrl;
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
} 