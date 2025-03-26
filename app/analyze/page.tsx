"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, Info, CheckCircle, AlertTriangle, X, FileText, Upload, Loader2, AlignJustify } from "lucide-react";
import { analyzeResume, analyzeResumePDF, extractTextFromPDF } from "@/lib/gemini";
import { analyzeResume as saveResumeToStorage, extractTextFromFile } from "@/lib/resume-service";
import mammoth from 'mammoth';
import { useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth-context';
import { FileUpload } from '@/components/ui/file-upload';

export default function AnalyzePage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [apiKeyError, setApiKeyError] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");

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
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setIsLoading(true);
    setError('');
    
    try {
      // Extract text from the file
      const text = await extractTextFromFile(uploadedFile);
      setResumeText(text);
      
      // If we have job information, automatically analyze the resume
      if (jobDescription && jobTitle) {
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
    // Check for API key first
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setApiKeyError(true);
      setError("Gemini API key is missing. Please add your NEXT_PUBLIC_GEMINI_API_KEY to the .env file.");
      return;
    }

    if (!resumeText && !file) {
      setError("Please upload a resume file or provide resume text");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setApiKeyError(false);
    
    try {
      let analysisResults;
      
      // If we have a PDF file, analyze it directly with Gemini
      if (file && file.type === "application/pdf") {
        analysisResults = await analyzeResumePDF(file, jobDescription);
      } else {
        // Otherwise, use the text-based analysis
        analysisResults = await analyzeResume(resumeText, jobDescription);
      }
      
      if (!analysisResults || typeof analysisResults !== 'object') {
        throw new Error("Invalid response format received from analysis");
      }
      
      // Store in localStorage for other components to use
      if (resumeText) {
        localStorage.setItem('userResume', resumeText);
      }
      
      if (jobDescription) {
        localStorage.setItem('jobDescription', jobDescription);
      }
      
      setResults(analysisResults);
    } catch (err: any) {
      console.error('Analysis error:', err);
      if (err.message?.includes("API key") || err.message?.includes("403")) {
        setApiKeyError(true);
      }
      setError(err.message || "Failed to analyze resume. Please try again or check your API key.");
    } finally {
      setIsAnalyzing(false);
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
      
      // Call our resume service
      const { id, analysis } = await saveResumeToStorage(user.id, resumeFile, resumeText + "\n\n" + analysisContext);
      
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

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container max-w-[1200px] mx-auto px-4 py-8">
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
                    <Textarea 
                      placeholder="Paste job description here to get personalized recommendations..."
                      className="min-h-[200px] resize-none border-border bg-background"
                      value={jobDescription}
                      onChange={handleJobDescriptionChange}
                    />
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
                <Button variant="outline" onClick={handleReset} className="border-border">
                  Analyze Another Resume
                </Button>
              </div>

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
                      {Object.entries(results.sectionScores).map(([key, value]: [string, any]) => (
                        <div key={key} className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm capitalize">{key}</span>
                            <span className="text-sm font-medium">{value}%</span>
                          </div>
                          <Progress value={value} className="h-1.5" />
                        </div>
                      ))}
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