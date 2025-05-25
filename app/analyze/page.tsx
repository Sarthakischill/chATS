"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, Info, CheckCircle, AlertTriangle, X, FileText, Upload, Loader2, AlignJustify, AlertCircle } from "lucide-react";
import { analyzeResume, analyzeResumePDF, extractTextFromPDF, analyzeJobDescription } from "@/lib/gemini";
import { analyzeResume as saveResumeToStorage, extractTextFromFile, saveResume } from "@/lib/resume-service";
import mammoth from 'mammoth';
import { useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth-context';
import { FileUpload } from '@/components/ui/file-upload';
import Link from "next/link";
import { saveJobDescription, getUserJobDescriptions } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from "@/components/ui/input";

// Custom renderer for markdown content
const MarkdownMessage = ({ content }: { content: string }) => (
  <div className="prose prose-sm dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-em:text-foreground">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Style the elements
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <span className="font-semibold text-foreground">{children}</span>,
        em: ({ children }) => <span className="italic text-foreground">{children}</span>,
        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 text-foreground">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => (
          <li className="mb-1">
            <span className="ml-1">{children}</span>
          </li>
        ),
        code: ({ children }) => (
          <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono">{children}</code>
        ),
        hr: () => <hr className="my-4 border-border" />,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default function AnalyzePage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [apiKeyError, setApiKeyError] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check for API key on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setApiKeyError(true);
      setError("Gemini API key is missing. Please add your NEXT_PUBLIC_GEMINI_API_KEY to the .env file.");
    }
  }, []);

  const extractTextFromDOCX = async (docxFile: File): Promise<string> => {
    try {
      const arrayBuffer = await docxFile.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    if (!user) {
      setError("Please log in to upload and analyze your resume");
      return;
    }
    
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setIsLoading(true);
    setError('');
    
    try {
      // Extract text from the file
      let text = await extractTextFromFile(uploadedFile);
      
      // Check if text looks like PDF binary data
      if (text.startsWith('%PDF-') || text.includes('endobj') || text.includes('/Type /Page')) {
        console.warn('Detected raw PDF data, providing user instructions');
        text = `[This PDF requires advanced extraction. For best results, please copy and paste the content manually.]`;
        setError("We detected binary PDF data. For best results, please open the PDF in a reader, copy all text (Ctrl+A, Ctrl+C), and paste it below.");
      }
      
      // Set the resume text
      setResumeText(text);
      
      // If we have job information, automatically analyze the resume
      if (jobDescription && jobTitle && text && !text.includes('[This PDF requires advanced extraction')) {
        await analyzeResumeWithJobInfo(uploadedFile, text, jobTitle, jobDescription);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Failed to process the file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(event.target.value);
  };

  const handleResumeTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(event.target.value);
  };

  const handleAnalyze = async () => {
    if (!user) {
      setError("Please log in to analyze your resume");
      return;
    }

    if (!resumeText && !file) {
      setError("No resume to analyze. Please upload a file or enter resume text.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const id = crypto.randomUUID();
      const { summary, score, sectionScores, keywordMatches, missingKeywords, strengths, improvements } = 
        await analyzeResume(resumeText, jobDescription);
      
      // Store results in state
      setResults({
        id,
        summary,
        score,
        sectionScores,
        keywordMatches,
        missingKeywords,
        strengths,
        improvements,
        timestamp: new Date().toISOString()
      });
      
      // If job description is provided, also analyze job fit
      if (jobDescription && jobDescription.trim()) {
        try {
          console.log('Analyzing job fit with description...');
          await saveJobDescriptionAndAnalyzeJobFit(jobDescription);
        } catch (jobError) {
          console.error("Error handling job description:", jobError);
          // Continue with resume analysis even if job description analysis fails
        }
      }
      
      // After successful analysis, redirect to the results page
      router.push(`/resumes/${id}`);
    } catch (err: any) {
      console.error("Error analyzing resume:", err);
      setError(err.message || "Failed to analyze your resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Separated job description handling logic
  const saveJobDescriptionAndAnalyzeJobFit = async (jobDescText: string) => {
    if (!user) return;
    
    try {
      // 1. Save job description separately
      console.log('Preparing to save job description...');
      
      // 2. Determine job title
      let jobTitleToUse = jobTitle && jobTitle.trim() 
        ? jobTitle.trim() 
        : "Untitled Job Description";
      
      if (jobTitleToUse === "Untitled Job Description" && jobDescText.trim()) {
        const firstLine = jobDescText.split('\n')[0].trim();
        if (firstLine.length > 0) {
          jobTitleToUse = firstLine.length > 50 
            ? firstLine.substring(0, 50) + "..." 
            : firstLine;
          
          if (jobTitleToUse.length < 10) {
            jobTitleToUse = "Job Description: " + jobTitleToUse;
          }
        }
      }
      
      // 3. Save job description
      console.log('Saving job description with title:', jobTitleToUse);
      const saveResult = await saveJobDescription(user.id, {
        title: jobTitleToUse,
        company_name: '',
        content: jobDescText
      });
      
      console.log('Job description save result:', saveResult);
      
      // 4. Verify job descriptions were saved
      const jdCount = await checkJobDescriptionsSaved(user.id);
      console.log(`User has ${jdCount} job descriptions after save`);
      
      return await analyzeJobDescription(jobDescText);
    } catch (error) {
      console.error('Error in saveJobDescriptionAndAnalyzeJobFit:', error);
      throw error;
    }
  };

  const handleReset = () => {
    setFile(null);
    setResumeText("");
    setJobDescription("");
    setResults(null);
    setError("");
  };

  // Handle resume analysis with job information
  const analyzeResumeWithJobInfo = async (
    resumeFile: File, 
    resumeText: string,
    jobTitle: string,
    jobDescription: string
  ) => {
    if (!user) {
      setError("Please log in to analyze your resume.");
      return;
    }
    
    try {
      setError("");
      setIsAnalyzing(true);
      
      // Add the job info to the analysis context
      const analysisContext = `Job Title: ${jobTitle}\n\nJob Description: ${jobDescription}`;
      
      // Analyze the job description and save it
      let jobDescriptionAnalysisResult = null;
      
      if (jobDescription) {
        console.log('Attempting to analyze and save job description...');
        try {
          // First analyze the job description
          jobDescriptionAnalysisResult = await analyzeJobDescription(jobDescription);
          
          let title = "Untitled Job Description";
          
          // If job title is provided, use it
          if (jobTitle && jobTitle.trim()) {
            title = jobTitle;
          } 
          // Otherwise, try to extract a title from the job description
          else if (jobDescription.trim()) {
            // Get the first line or first 50 characters, whichever is shorter
            const firstLine = jobDescription.split('\n')[0].trim();
            title = firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;
            
            // If first line is too short, use "Job Description" prefix
            if (title.length < 10) {
              title = "Job Description: " + title;
            }
          }
          
          console.log('Saving job description with title:', title);
          console.log('Job description content length:', jobDescription.length);
          console.log('User ID:', user.id);
          
          const saveResult = await saveJobDescription(user.id, {
            title: title,
            company_name: '',
            content: jobDescription
          });
          
          console.log('Job description save result:', saveResult);
          if (!saveResult) {
            console.error('Job description save returned no data');
          } else if (Array.isArray(saveResult) && saveResult.length === 0) {
            console.error('Job description save returned empty array');
          } else {
            console.log('Job description saved successfully with ID:', 
              Array.isArray(saveResult) && saveResult[0] ? saveResult[0].id : 
              (saveResult as any).id || 'unknown');
          }
          
          // Check if job descriptions exist for the user
          const jdCount = await checkJobDescriptionsSaved(user.id);
          console.log(`User has ${jdCount} job descriptions after save`);
          
        } catch (jobSaveError) {
          console.error('Error saving job description:', jobSaveError);
          // Continue with resume analysis even if job description save fails
        }
      }
      
      // Call our resume service with job description analysis
      const { id, analysis } = await saveResumeToStorage(
        user.id, 
        resumeFile, 
        resumeText + "\n\n" + analysisContext,
        jobDescription
      );
      
      // Add job description analysis to results
      analysis.jobDescription = jobDescriptionAnalysisResult;

      // Ensure sectionScores exists before setting results (interim fix)
      if (analysis && typeof analysis.sectionScores === 'undefined') {
        console.log("analyzeResumeWithJobInfo: sectionScores missing from service response, adding default.");
        analysis.sectionScores = { overall: 0 }; // Default value
      }
      
      // Set the results
      setResults(analysis);
      
      // After successful analysis, redirect to the results page
      router.push(`/resumes/${id}`);
    } catch (err: any) {
      console.error("Error analyzing resume:", err);
      setError(err.message || "Failed to analyze your resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add a check function to verify job descriptions
  const checkJobDescriptionsSaved = async (userId: string) => {
    try {
      const jobDescriptions = await getUserJobDescriptions(userId);
      console.log('Current job descriptions for user:', jobDescriptions);
      return jobDescriptions?.length || 0;
    } catch (error) {
      console.error('Error checking job descriptions:', error);
      return 0;
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError("Please log in to save your resume");
      return;
    }

    if (!file) {
      setError("No resume file to save");
      return;
    }

    // Make sure we have resume text
    if (!resumeText || resumeText.trim().length === 0) {
      setError("No resume text content available. Please try a different file or paste the content manually.");
      return;
    }

    // Check if the resume text contains PDF binary markers 
    if (resumeText.startsWith('%PDF-') || resumeText.includes('endobj') || resumeText.includes('/Type /Page')) {
      setError("The file appears to contain raw PDF data. Please upload a text-based PDF or paste the content manually.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      // Handle job description separately
      let jobDescriptionAnalysisResult = null;
      
      if (jobDescription && jobDescription.trim() !== '') {
        console.log('Handling job description - length:', jobDescription.length);
        
        try {
          // 1. Analyze the job description
          jobDescriptionAnalysisResult = await analyzeJobDescription(jobDescription);
          console.log('Job description analyzed successfully');
          
          // 2. Prepare job title for saving
          let jobTitleToUse = jobTitle && jobTitle.trim() 
            ? jobTitle.trim() 
            : "Untitled Job Description";
          
          // If no explicit title provided, try to extract one from the first line
          if (jobTitleToUse === "Untitled Job Description" && jobDescription.trim()) {
            const firstLine = jobDescription.split('\n')[0].trim();
            if (firstLine.length > 0) {
              jobTitleToUse = firstLine.length > 50 
                ? firstLine.substring(0, 50) + "..." 
                : firstLine;
              
              // Add a prefix if the title is too short
              if (jobTitleToUse.length < 10) {
                jobTitleToUse = "Job Description: " + jobTitleToUse;
              }
            }
          }
          
          // 3. Save the job description
          console.log('Attempting to save job description with title:', jobTitleToUse);
          const saveResult = await saveJobDescription(user.id, {
            title: jobTitleToUse,
            company_name: '',
            content: jobDescription
          });
          
          // 4. Log results
          console.log('Job description save API response:', saveResult);
          
          // 5. Verify job descriptions were saved
          const jdCount = await checkJobDescriptionsSaved(user.id);
          console.log(`User has ${jdCount} job descriptions after save attempt`);
          
        } catch (jobError) {
          console.error('Error handling job description:', jobError);
          // Continue with resume save even if job description fails
        }
      }

      // Save the resume with analysis results and file
      const savedResume = await saveResume(user.id, {
        title: file.name.split('.')[0],
        content: resumeText,
        file: file,  // Include the actual file
        metadata: {
          originalFileName: file.name,
          fileType: file.type,
          uploadDate: new Date().toISOString()
        },
        analysis_results: {
          ...results,
          jobDescription: jobDescriptionAnalysisResult
        }
      });

      // Redirect to resumes page
      router.replace('/resumes');
    } catch (err: any) {
      console.error('Error saving resume:', err);
      setError(err.message || "Failed to save resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName("");
    setResumeText("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-[1400px] mx-auto pt-24 pb-16 px-6">
        <div className="space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Resume Analysis</h1>
            <p className="text-muted-foreground">Optimize your resume for Applicant Tracking Systems</p>
          </div>

          {apiKeyError && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">API Key Error</h3>
                  <p className="text-red-700 mt-1">
                    Your Gemini API key is missing or invalid. To use this application:
                  </p>
                  <ol className="list-decimal ml-6 mt-2 text-red-700 space-y-1">
                    <li>Create a <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google AI API key</a></li>
                    <li>Add it to your <code className="bg-red-100 px-1 py-0.5 rounded">.env</code> file as <code className="bg-red-100 px-1 py-0.5 rounded">NEXT_PUBLIC_GEMINI_API_KEY=your_api_key</code></li>
                    <li>Restart the development server</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                {error.includes("log in") && (
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild className="mr-2">
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {!results ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <Card className="border border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Upload Your Resume</CardTitle>
                    <CardDescription>
                      Upload your resume in PDF, DOCX, or TXT format
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      id="resume-upload"
                      onFileUpload={handleFileUpload}
                      onRemove={handleRemoveFile}
                      acceptedTypes=".pdf,.txt,.docx,.doc"
                      isLoading={isLoading}
                      file={file}
                      error={error}
                      placeholderText="Upload your resume"
                      description="Drag and drop your resume file or click to browse (PDF, TXT)"
                    />
                    
                    <div className="mt-4">
                      <label htmlFor="resume-text" className="block text-sm font-medium mb-2">
                        Resume Text (Auto-populated from file upload, or paste manually)
                      </label>
                      <Textarea 
                        id="resume-text"
                        placeholder="Resume text will appear here after file upload, or paste it manually..."
                        value={resumeText}
                        onChange={handleResumeTextChange}
                        className="min-h-[150px] resize-none border-border bg-background"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4 text-sm">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Job Description (Optional)</CardTitle>
                    <CardDescription>
                      Paste the job description to get job-specific recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="job-title" className="block text-sm font-medium mb-2">
                          Job Title
                        </label>
                        <Input 
                          id="job-title"
                          placeholder="Enter the job title"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="border-border bg-background"
                        />
                      </div>
                      <Textarea 
                        placeholder="Paste job description here to get personalized recommendations..."
                        className="min-h-[200px] resize-none border-border bg-background"
                        value={jobDescription}
                        onChange={handleJobDescriptionChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Info className="h-4 w-4 mr-2" />
                      Adding a job description improves your analysis accuracy
                    </div>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">How It Works</CardTitle>
                    <CardDescription>
                      Our AI-powered analysis helps you optimize your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">1</div>
                        <div>
                          <h3 className="font-medium">Upload Your Resume</h3>
                          <p className="text-sm text-muted-foreground">
                            Upload your resume in PDF, DOCX, or TXT format
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">2</div>
                        <div>
                          <h3 className="font-medium">Add a Job Description</h3>
                          <p className="text-sm text-muted-foreground">
                            Optionally add the job description for tailored recommendations
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">3</div>
                        <div>
                          <h3 className="font-medium">Get AI Analysis</h3>
                          <p className="text-sm text-muted-foreground">
                            Our AI analyzes your resume for ATS compatibility and job fit
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">4</div>
                        <div>
                          <h3 className="font-medium">Improve & Apply</h3>
                          <p className="text-sm text-muted-foreground">
                            Apply the suggestions to improve your chances with ATS systems
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-4">
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={(!resumeText && !file) || isAnalyzing || isLoading} 
                      className="w-full bg-primary"
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Analyzing...
                        </div>
                      ) : (
                        "Analyze Resume"
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Why ATS Optimization Matters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      75% of resumes are rejected by ATS before a human ever sees them. Our AI helps you get past these systems.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Improve your chance of getting interviews</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Tailor your resume to specific job descriptions</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Stand out from other applicants</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Get personalized feedback to improve</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                <CardFooter className="flex justify-between gap-4">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/analyze">
                      <FileUp className="mr-2 h-4 w-4" />
                      Analyze Another Resume
                    </Link>
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Save Resume
                      </>
                    )}
                  </Button>
                </CardFooter>
              </div>

              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Analysis Summary</CardTitle>
                  <CardDescription>
                    {!results.summary && "No analysis summary is available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {results.summary ? (
                    <MarkdownMessage content={results.summary} />
                  ) : (
                    <p className="text-muted-foreground">Please wait while we generate your analysis summary...</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">ATS Compatibility Score</CardTitle>
                  <CardDescription>
                    How well your resume performs against ATS systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <span className="text-4xl font-bold">{results.score}%</span>
                    </div>
                    <Progress value={results.score} className="h-2" />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Section Scores</h3>
                      {results.sectionScores && typeof results.sectionScores === 'object' ? (
                        Object.entries(results.sectionScores).map(([key, value]: [string, any]) => (
                          <div key={key} className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm capitalize">{key}</span>
                              <span className="text-sm font-medium">{value}%</span>
                            </div>
                            <Progress value={value} className="h-1.5" />
                          </div>
                        ))
                      ) : (
                        // Optional: Render a fallback message or null if sectionScores is not available
                        <p className="text-sm text-muted-foreground">Section scores are not available.</p> 
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-3">Keyword Match</h3>
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Match rate</span>
                          <span className="text-sm font-medium">{results.keywordMatches}%</span>
                        </div>
                        <Progress value={results.keywordMatches} className="h-1.5" />
                      </div>
                      <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                        <AlertTitle className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Missing Keywords
                        </AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            {results.missingKeywords.map((keyword: string, index: number) => (
                              <li key={index} className="text-sm">{keyword}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="strengths">
                <TabsList className="w-full grid grid-cols-2 mb-6">
                  <TabsTrigger value="strengths">Strengths</TabsTrigger>
                  <TabsTrigger value="improvements">Improvements</TabsTrigger>
                </TabsList>

                <TabsContent value="strengths">
                  <Card className="border border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        Resume Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {results.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex">
                            <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="improvements">
                  <Card className="border border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                        Suggested Improvements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {results.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex">
                            <AlertTriangle className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {error && (
            <div className="mt-4 w-full">
              <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <p className="mt-2 text-xs">
                  Try a different file format or check that the file is not corrupted.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 