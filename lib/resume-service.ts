"use client";

import { supabase } from './supabase';
import { saveConversation, uploadConversationFile } from './conversation-service';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPDF, analyzeJobDescription } from './gemini'; // Import the PDF extraction function

// Type definition for resume data
export type ResumeData = {
  id?: string;
  title: string;
  content: string;
  file?: File;  // Add file to the type
  parsed_content?: string;
  metadata?: any;
  skills?: string[];
  experience?: any[];
  education?: any[];
  projects?: any[];
  certifications?: any[];
  analysis_results?: any;
};

/**
 * Saves a resume to Supabase
 * @param userId User ID
 * @param resume Resume data
 * @returns The saved resume data
 */
export async function saveResume(
  userId: string,
  resume: ResumeData
): Promise<any> {
  try {
    const id = resume.id || uuidv4();
    
    // First, upload the file to storage if provided
    let fileUrl = null;
    if (resume.file) {
      const fileExt = resume.file.name.split('.').pop();
      // Use a consistent path structure: userId/resumeId.extension
      const filePath = `${userId}/${id}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resume.file, {
          upsert: true,
          contentType: resume.file.type
        });
      
      if (uploadError) {
        console.error('Error uploading resume file:', uploadError);
        throw uploadError;
      }
      
      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
      
      fileUrl = publicUrl;
      
      // If the content is empty and we have a file, try to extract text
      if ((!resume.content || resume.content.trim().length === 0) && resume.file) {
        try {
          // Extract text from the file
          const extractedText = await extractTextFromFile(resume.file);
          if (extractedText && extractedText.trim().length > 0) {
            resume.content = extractedText;
            console.log('Successfully extracted text from file');
          } else {
            console.warn('Failed to extract text from file - content is empty');
          }
        } catch (extractError) {
          console.error('Error extracting text from file:', extractError);
          // Don't throw, continue with what we have
        }
      }
    }
    
    // Prepare data for database
    const resumeRecord = {
      id,
      title: resume.title,
      content: resume.content,
      parsed_content: resume.parsed_content,
      metadata: {
        ...resume.metadata || {},
        fileUrl: fileUrl,
        filePath: resume.file ? `${userId}/${id}.${resume.file.name.split('.').pop()}` : null,
        originalFileName: resume.file?.name,
        fileType: resume.file?.type,
        uploadDate: new Date().toISOString()
      },
      skills: resume.skills || [],
      experience: resume.experience || [],
      education: resume.education || [],
      projects: resume.projects || [],
      certifications: resume.certifications || [],
      analysis_results: resume.analysis_results || {}
    };
    
    // Save to database
    const { data, error } = await supabase
      .from('resumes')
      .upsert([{
        ...resumeRecord,
        user_id: userId,
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
    
    return data?.[0];
  } catch (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
}

/**
 * Get all resumes for a user
 * @param userId User ID
 * @returns Array of resumes
 */
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

/**
 * Get a specific resume
 * @param userId User ID
 * @param resumeId Resume ID
 * @returns The resume data or null
 */
export async function getResume(userId: string, resumeId: string) {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching resume:', error);
    return null;
  }
}

/**
 * Delete a resume
 * @param userId User ID
 * @param resumeId Resume ID
 * @returns Success status
 */
export async function deleteResume(userId: string, resumeId: string) {
  try {
    // First get the resume to get the file path
    const { data: resume } = await supabase
      .from('resumes')
      .select('metadata')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();
    
    // Delete from storage if there's a file
    if (resume?.metadata?.filePath) {
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([resume.metadata.filePath]);
      
      if (storageError) {
        console.error('Error deleting resume file:', storageError);
      }
    }
    
    // Delete from database
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
}

/**
 * Extract text from a file (PDF, DOCX, TXT)
 * @param file The file to extract text from
 * @returns Extracted text
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    // Handle different file types
    if (file.type === 'application/pdf') {
      // Use the PDF extraction function from gemini.ts
      return await extractTextFromPDF(file);
    } 
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             file.name.toLowerCase().endsWith('.docx')) {
      // For DOCX files
      const arrayBuffer = await file.arrayBuffer();
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } 
    else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      // For plain text files
      return await file.text();
    } 
    else {
      // Try to extract as plain text as fallback
      console.warn(`Unsupported file type: ${file.type}, attempting to extract as plain text`);
      return await file.text();
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${file.name}. Please try a different file format.`);
  }
}

// Function to analyze a resume
export async function analyzeResume(
  userId: string,
  resumeFile: File,
  resumeText: string,
  jobDescription?: string
): Promise<{ id: string; analysis: any }> {
  try {
    // Create a unique ID for this analysis
    const analysisId = uuidv4();
    
    // Create a title for the analysis based on the filename
    const title = `Resume Analysis: ${resumeFile.name.split('.')[0]}`;
    
    // Upload the file to storage
    const fileUrl = await uploadConversationFile(
      userId,
      'resume',
      analysisId,
      resumeFile
    );
    
    if (!fileUrl) {
      throw new Error('Failed to upload resume file');
    }

    // If job description is provided, analyze it
    let jobDescriptionAnalysis = null;
    if (jobDescription) {
      try {
        jobDescriptionAnalysis = await analyzeJobDescription(jobDescription);
      } catch (error) {
        console.error('Error analyzing job description:', error);
        // Don't throw error, continue with resume analysis
      }
    }
    
    // Save the conversation with initial message and file info
    const initialMessages = [
      {
        role: 'user' as const,
        content: `I've uploaded my resume: ${resumeFile.name}. Please analyze it.`,
        timestamp: new Date().toISOString()
      }
    ];
    
    // For demo, we'll create a simple analysis
    // In a real app, you would integrate with an AI service
    const analysis = {
      fileUrl,
      fileName: resumeFile.name,
      uploadDate: new Date().toISOString(),
      // Include job description analysis if available
      jobDescription: jobDescriptionAnalysis,
      // Example analysis data - in a real app, this would be generated by an AI
      summary: "Resume analysis summary would appear here.",
      strengths: [
        "Identified strength 1",
        "Identified strength 2",
        "Identified strength 3"
      ],
      weaknesses: [
        "Improvement area 1",
        "Improvement area 2"
      ],
      recommendations: [
        "Recommendation 1",
        "Recommendation 2",
        "Recommendation 3"
      ]
    };
    
    // Save the conversation with the analysis results
    await saveConversation(
      userId,
      'resume',
      title,
      initialMessages,
      analysis
    );
    
    return { id: analysisId, analysis };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}

// Function to get a specific resume analysis
export async function getResumeAnalysis(userId: string, analysisId: string) {
  try {
    // This reads from the conversations storage
    const { data, error } = await supabase.storage
      .from('conversations')
      .download(`${userId}/resumes/${analysisId}.json`);
    
    if (error) throw error;
    
    const textDecoder = new TextDecoder('utf-8');
    const text = textDecoder.decode(await data.arrayBuffer());
    return JSON.parse(text);
  } catch (error) {
    console.error('Error fetching resume analysis:', error);
    return null;
  }
}

/**
 * Downloads a resume file from storage
 * @param userId User ID
 * @param resumeId Resume ID
 */
export async function downloadResume(userId: string, resumeId: string) {
  try {
    // First get the resume metadata to get the file path
    const { data: resume } = await supabase
      .from('resumes')
      .select('metadata')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (!resume?.metadata?.filePath) {
      throw new Error('Resume file not found');
    }

    // Get the file from storage
    const { data, error } = await supabase.storage
      .from('resumes')
      .download(resume.metadata.filePath);

    if (error) {
      throw error;
    }

    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = resume.metadata.originalFileName || `resume-${resumeId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading resume:', error);
    throw error;
  }
} 