import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the API with the key from environment variables
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Validate API key
if (!apiKey) {
  console.error("Gemini API key is missing. Make sure NEXT_PUBLIC_GEMINI_API_KEY is set in your .env file");
}

// Initialize the GenAI instance
const genAI = new GoogleGenerativeAI(apiKey || "");

// Get the Gemini model (use Gemini Flash 2.0)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

// Generic function to generate content with Gemini
export async function generateWithGemini(prompt: string): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env file.");
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate content. Please check your API key in .env file and try again.');
  }
}

/**
 * Analyze a resume using the Gemini API
 */
export async function analyzeResume(resumeText: string, jobDescription?: string) {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env file.");
    }
    
    // Create the prompt based on whether a job description is available
    let prompt = `Analyze this resume for ATS compatibility and provide detailed feedback: 
    
    ${resumeText}
    
    Analyze the structure, content, and overall effectiveness of this resume. Provide a JSON response in the following format:
    {
      "score": 85, // Overall ATS compatibility score (0-100)
      "sectionScores": {
        "formatting": 90, // Score for formatting (0-100)
        "content": 80, // Score for content quality (0-100)
        "keywords": 75, // Score for keyword optimization (0-100)
        "experience": 85 // Score for experience descriptions (0-100)
      },
      "keywordMatches": 70, // Percentage of keywords matched (0-100)
      "strengths": [
        "Clear section headings",
        "Good use of action verbs",
        // 3-6 key strengths
      ],
      "improvements": [
        "Add more industry-specific keywords",
        "Quantify achievements with metrics",
        // 3-6 key improvements
      ],
      "missingKeywords": [
        "project management",
        "agile methodology",
        // Key missing keywords
      ]
    }`;

    if (jobDescription) {
      prompt += `\n\nPlease also evaluate this resume against the following job description to provide more targeted recommendations:
      
      ${jobDescription}`;
    }

    // Configure generation parameters
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };

    // Generate the content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonStr = text.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonStr);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    if (error.message?.includes("API Key")) {
      throw new Error("API key error: Please check your Gemini API key in the .env file");
    }
    throw error;
  }
}

/**
 * Analyze a resume from a PDF file using the Gemini API
 */
export async function analyzeResumePDF(pdfFile: File, jobDescription?: string) {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env file.");
    }
    
    // Create parts array for the multimodal input
    const parts = [];
    
    // Add the PDF file part
    const fileData = await pdfFile.arrayBuffer();
    parts.push({
      inlineData: {
        data: Buffer.from(fileData).toString('base64'),
        mimeType: pdfFile.type,
      },
    });
    
    // Add text instructions
    let promptText = "Analyze this resume PDF for ATS compatibility and provide detailed feedback.";
    
    if (jobDescription) {
      promptText += `\n\nPlease also evaluate this resume against the following job description to provide more targeted recommendations:
      
      ${jobDescription}`;
    }
    
    promptText += `\n\nProvide a JSON response in the following format:
    {
      "score": 85, // Overall ATS compatibility score (0-100)
      "sectionScores": {
        "formatting": 90, // Score for formatting (0-100)
        "content": 80, // Score for content quality (0-100)
        "keywords": 75, // Score for keyword optimization (0-100)
        "experience": 85 // Score for experience descriptions (0-100)
      },
      "keywordMatches": 70, // Percentage of keywords matched (0-100)
      "strengths": [
        "Clear section headings",
        "Good use of action verbs",
        // 3-6 key strengths
      ],
      "improvements": [
        "Add more industry-specific keywords",
        "Quantify achievements with metrics",
        // 3-6 key improvements
      ],
      "missingKeywords": [
        "project management",
        "agile methodology",
        // Key missing keywords
      ]
    }`;
    
    parts.push({ text: promptText });
    
    // Configure generation parameters
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };
    
    // Generate the content with the multimodal model
    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
      generationConfig,
      safetySettings,
    });
    
    const response = result.response;
    const text = response.text();
    
    // Extract the extracted text and save it to localStorage
    const extractedText = extractTextFromGeminiResponse(text);
    if (extractedText) {
      localStorage.setItem('userResume', extractedText);
    }
    
    // Parse the JSON response
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonStr = text.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonStr);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error: any) {
    console.error("Error analyzing resume PDF:", error);
    if (error.message?.includes("API Key") || error.message?.includes("403")) {
      throw new Error("API key error: Please check your Gemini API key in the .env file");
    }
    throw error;
  }
}

/**
 * Extract text content from PDF using Gemini's multimodal capabilities
 */
export async function extractTextFromPDF(pdfFile: File) {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env file.");
    }
    
    // Create parts array for the multimodal input
    const fileData = await pdfFile.arrayBuffer();
    const parts = [
      {
        inlineData: {
          data: Buffer.from(fileData).toString('base64'),
          mimeType: pdfFile.type,
        },
      },
      { text: "Extract all the text content from this PDF resume. Return only the raw text without any additional commentary." },
    ];
    
    // Generate the content with the multimodal model
    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 2048,
      },
      safetySettings,
    });
    
    const response = result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Error extracting text from PDF:", error);
    if (error.message?.includes("API Key") || error.message?.includes("403")) {
      throw new Error("API key error: Please check your Gemini API key in the .env file");
    }
    throw error;
  }
}

/**
 * Extract text from Gemini's response when it's analyzed a PDF
 */
function extractTextFromGeminiResponse(response: string): string | null {
  // Look for patterns that might indicate the model included the extracted text
  const extractedTextMarkers = [
    "Here is the extracted text:",
    "Extracted text from the resume:",
    "Resume content:",
    "Text content:",
    "The resume contains:"
  ];
  
  for (const marker of extractedTextMarkers) {
    const index = response.indexOf(marker);
    if (index !== -1) {
      const startIndex = index + marker.length;
      const nextSection = response.indexOf("\n\n", startIndex + 1);
      if (nextSection !== -1) {
        return response.substring(startIndex, nextSection).trim();
      }
    }
  }
  
  return null;
}

/**
 * Generate a cover letter using the Gemini API
 */
export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  companyName: string,
  position: string,
  options: { formalTone: boolean; includingSkills: boolean }
) {
  try {
    // Create the prompt with all the necessary information
    const prompt = `Create a personalized cover letter based on the resume and job description below:
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Company: ${companyName}
    Position: ${position}
    Tone: ${options.formalTone ? 'Formal and professional' : 'Conversational but professional'}
    Include Specific Skills: ${options.includingSkills ? 'Yes, highlight quantifiable achievements and specific skills' : 'Focus more on general qualifications and fit'}
    
    Please create a well-structured cover letter that:
    1. Grabs attention in the opening paragraph
    2. Highlights relevant experience and skills from the resume that match the job description
    3. Explains why the candidate is a good fit for the company culture
    4. Includes a clear call to action in the closing paragraph
    
    Also provide metadata in the following JSON format at the end:
    {
      "keywords": ["keyword1", "keyword2", "keyword3"], // Important keywords used in the letter
      "wordCount": 320, // Total word count
      "tips": ["Use consistent formatting", "Add more industry jargon", "Consider mentioning a company achievement"] // 2-3 tips for improvement
    }
    
    Generate the cover letter first, followed by the metadata JSON.`;

    // Configure generation parameters
    const generationConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };

    // Generate the content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const text = response.text();
    
    // Extract cover letter and metadata
    const jsonStartIndex = text.lastIndexOf('{');
    if (jsonStartIndex !== -1) {
      const coverLetter = text.substring(0, jsonStartIndex).trim();
      const jsonStr = text.substring(jsonStartIndex);
      
      try {
        const metadata = JSON.parse(jsonStr);
        return { coverLetter, metadata };
      } catch (e) {
        return { coverLetter, metadata: {} };
      }
    } else {
      return { coverLetter: text, metadata: {} };
    }
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw error;
  }
}

/**
 * Generate a cover letter from a PDF resume using the Gemini API
 */
export async function generateCoverLetterFromPDF(
  pdfFile: File,
  jobDescription: string,
  companyName: string,
  position: string,
  options: { formalTone: boolean; includingSkills: boolean }
) {
  try {
    // Create parts array for the multimodal input
    const parts = [];
    
    // Add the PDF file part
    const fileData = await pdfFile.arrayBuffer();
    parts.push({
      inlineData: {
        data: Buffer.from(fileData).toString('base64'),
        mimeType: pdfFile.type,
      },
    });
    
    // Add text instructions
    const promptText = `Create a personalized cover letter based on this resume PDF and job description:
    
    Job Description:
    ${jobDescription}
    
    Company: ${companyName}
    Position: ${position}
    Tone: ${options.formalTone ? 'Formal and professional' : 'Conversational but professional'}
    Include Specific Skills: ${options.includingSkills ? 'Yes, highlight quantifiable achievements and specific skills' : 'Focus more on general qualifications and fit'}
    
    Please create a well-structured cover letter that:
    1. Grabs attention in the opening paragraph
    2. Highlights relevant experience and skills from the resume that match the job description
    3. Explains why the candidate is a good fit for the company culture
    4. Includes a clear call to action in the closing paragraph
    
    Also provide metadata in the following JSON format at the end:
    {
      "keywords": ["keyword1", "keyword2", "keyword3"], // Important keywords used in the letter
      "wordCount": 320, // Total word count
      "tips": ["Use consistent formatting", "Add more industry jargon", "Consider mentioning a company achievement"] // 2-3 tips for improvement
    }
    
    Generate the cover letter first, followed by the metadata JSON.`;
    
    parts.push({ text: promptText });
    
    // Configure generation parameters
    const generationConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };
    
    // Generate the content with the multimodal model
    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
      generationConfig,
      safetySettings,
    });
    
    const response = result.response;
    const text = response.text();
    
    // Extract the resume text if possible and save to localStorage
    const extractedText = extractTextFromGeminiResponse(text);
    if (extractedText) {
      localStorage.setItem('userResume', extractedText);
    }
    
    // Extract cover letter and metadata
    const jsonStartIndex = text.lastIndexOf('{');
    if (jsonStartIndex !== -1) {
      const coverLetter = text.substring(0, jsonStartIndex).trim();
      const jsonStr = text.substring(jsonStartIndex);
      
      try {
        const metadata = JSON.parse(jsonStr);
        return { coverLetter, metadata };
      } catch (e) {
        return { coverLetter, metadata: {} };
      }
    } else {
      return { coverLetter: text, metadata: {} };
    }
  } catch (error) {
    console.error("Error generating cover letter from PDF:", error);
    throw error;
  }
}

/**
 * Get personalized learning recommendations using the Gemini API
 */
export async function getLearningRecommendations(resumeText: string, jobDescription?: string) {
  try {
    // Create the prompt
    let prompt = `Based on the following resume, provide personalized learning recommendations:
    
    ${resumeText}
    
    Analyze the skills and experience in this resume and provide a JSON response with the following:
    {
      "recommendedCourses": [
        {
          "id": 1,
          "title": "Course title",
          "provider": "Provider name",
          "duration": "X hours",
          "level": "Beginner/Intermediate/Advanced",
          "rating": 4.8,
          "students": 12500,
          "image": "https://placehold.co/100/e9e9e9/999999?text=Course",
          "relevance": 95,
          "category": "technical/soft"
        }
      ],
      "skillGaps": [
        {
          "skill": "Skill name",
          "currentLevel": 25,
          "requiredLevel": 70,
          "category": "technical/soft",
          "description": "Description of why this skill is important"
        }
      ],
      "projects": [
        {
          "id": 1,
          "title": "Project title",
          "skills": ["Skill1", "Skill2", "Skill3", "Skill4"],
          "difficulty": "Beginner/Intermediate/Advanced",
          "duration": "Estimated time to complete",
          "description": "Brief description of the project"
        }
      ]
    }`;

    if (jobDescription) {
      prompt += `\n\nConsider the following job description for more targeted recommendations:
      
      ${jobDescription}`;
    }

    // Configure generation parameters
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    };

    // Generate the content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonStr = text.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonStr);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error getting learning recommendations:", error);
    throw error;
  }
}

/**
 * Get learning recommendations from a PDF resume using the Gemini API
 */
export async function getLearningRecommendationsFromPDF(pdfFile: File, jobDescription?: string) {
  try {
    // Create parts array for the multimodal input
    const parts = [];
    
    // Add the PDF file part
    const fileData = await pdfFile.arrayBuffer();
    parts.push({
      inlineData: {
        data: Buffer.from(fileData).toString('base64'),
        mimeType: pdfFile.type,
      },
    });
    
    // Add text instructions
    let promptText = "Based on this resume PDF, provide personalized learning recommendations.";
    
    if (jobDescription) {
      promptText += `\n\nConsider the following job description for more targeted recommendations:
      
      ${jobDescription}`;
    }
    
    promptText += `\n\nAnalyze the skills and experience in this resume and provide a JSON response with the following:
    {
      "recommendedCourses": [
        {
          "id": 1,
          "title": "Course title",
          "provider": "Provider name",
          "duration": "X hours",
          "level": "Beginner/Intermediate/Advanced",
          "rating": 4.8,
          "students": 12500,
          "image": "https://placehold.co/100/e9e9e9/999999?text=Course",
          "relevance": 95,
          "category": "technical/soft"
        }
      ],
      "skillGaps": [
        {
          "skill": "Skill name",
          "currentLevel": 25,
          "requiredLevel": 70,
          "category": "technical/soft",
          "description": "Description of why this skill is important"
        }
      ],
      "projects": [
        {
          "id": 1,
          "title": "Project title",
          "skills": ["Skill1", "Skill2", "Skill3", "Skill4"],
          "difficulty": "Beginner/Intermediate/Advanced",
          "duration": "Estimated time to complete",
          "description": "Brief description of the project"
        }
      ]
    }`;
    
    parts.push({ text: promptText });
    
    // Configure generation parameters
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    };
    
    // Generate the content with the multimodal model
    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
      generationConfig,
      safetySettings,
    });
    
    const response = result.response;
    const text = response.text();
    
    // Extract the resume text if possible and save to localStorage
    const extractedText = extractTextFromGeminiResponse(text);
    if (extractedText) {
      localStorage.setItem('userResume', extractedText);
    }
    
    // Parse the JSON response
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonStr = text.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonStr);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error getting learning recommendations from PDF:", error);
    throw error;
  }
}

/**
 * Get a response from the AI chatbot using the Gemini API
 */
export async function getChatResponse(messages: { role: string; content: string }[], resumeText?: string) {
  try {
    // Prepare the conversation history
    const history = messages.slice(-6); // Include only last 6 messages for context
    
    // Create the prompt
    let prompt = `You are an AI resume and job application assistant. Be helpful, concise, and provide specific advice.
    
    CONVERSATION HISTORY:
    ${history.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    `;
    
    if (resumeText) {
      prompt += `USER'S RESUME:
      ${resumeText}
      
      Please consider this resume when providing advice.
      `;
    }
    
    prompt += `Please respond to the user's most recent message.`;

    // Configure generation parameters
    const generationConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    // Generate the content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw error;
  }
} 