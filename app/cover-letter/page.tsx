"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FileUp, Download, Sparkles, FileText, Copy, Check, RotateCcw, Loader2, Upload, AlertTriangle } from "lucide-react";
import { generateCoverLetter, generateCoverLetterFromPDF, extractTextFromPDF } from "@/lib/gemini";
import mammoth from 'mammoth';
import { FileUpload } from '@/components/ui/file-upload';

export default function CoverLetterPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [formalTone, setFormalTone] = useState(true);
  const [includingSkills, setIncludingSkills] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [metadata, setMetadata] = useState<any>({});
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

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
    setResumeFile(uploadedFile);
    setError("");
    
    try {
      setIsParsingFile(true);
      
      // Extract text from the file
      let text;
      if (uploadedFile.type === 'application/pdf') {
        text = await extractTextFromPDF(uploadedFile);
      } else if (uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractTextFromDOCX(uploadedFile);
      } else {
        text = await uploadedFile.text();
      }
      
      setResumeText(text);
      localStorage.setItem('userResume', text);
    } catch (err: any) {
      console.error("Error processing file:", err);
      setError(err.message || "Failed to process your resume. Please try a different file format.");
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleGenerate = async () => {
    if ((!resumeText && !resumeFile) || !jobDescription || !companyName || !position) {
      setError("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      let result;
      
      // If we have a PDF file, generate directly with Gemini
      if (resumeFile && resumeFile.type === "application/pdf") {
        result = await generateCoverLetterFromPDF(
          resumeFile,
          jobDescription,
          companyName,
          position,
          { formalTone, includingSkills }
        );
      } else {
        // Otherwise, use the text-based generation
        result = await generateCoverLetter(
          resumeText,
          jobDescription,
          companyName,
          position,
          { formalTone, includingSkills }
        );
      }
      
      // Store the resume text for future use in other components
      if (resumeText) {
        localStorage.setItem('userResume', resumeText);
      }
      localStorage.setItem('jobDescription', jobDescription);
      
      setCoverLetter(result.coverLetter);
      setMetadata(result.metadata);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate cover letter. Please try again or check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCoverLetter("");
    setMetadata({});
    setError("");
  };

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container max-w-[1200px] mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Cover Letter Generator</h1>
            <p className="text-muted-foreground">
              Create an ATS-optimized cover letter tailored to the job description
            </p>
          </div>

          {!coverLetter ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <Card className="border border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Job Details</CardTitle>
                    <CardDescription>
                      Enter information about the position you're applying for
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input 
                        id="company"
                        placeholder="Enter company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="border-border bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input 
                        id="position"
                        placeholder="Enter job title"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="border-border bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobDescription">Job Description</Label>
                      <Textarea 
                        id="jobDescription"
                        placeholder="Paste the complete job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="min-h-[200px] resize-none border-border bg-background"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Resume Information</CardTitle>
                    <CardDescription>
                      We'll use your resume to customize your cover letter
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <FileUpload
                        id="resume-upload"
                        onFileUpload={handleFileUpload}
                        acceptedTypes=".pdf,.docx,.doc,.txt"
                        isLoading={isParsingFile}
                        file={resumeFile}
                        error={error}
                        placeholderText="Upload your resume"
                        description="PDF, DOCX, or TXT"
                      />

                      <div>
                        <label htmlFor="resume-text" className="block text-sm font-medium mb-2">
                          Resume Text
                        </label>
                        <Textarea 
                          id="resume-text"
                          placeholder="Your resume content will appear here, or paste it manually..."
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          className="min-h-[150px] resize-none border-border bg-background"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Customization Options</CardTitle>
                    <CardDescription>
                      Tailor your cover letter to match your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="formal-tone">Formal Tone</Label>
                          <p className="text-sm text-muted-foreground">
                            Use a professional and formal writing style
                          </p>
                        </div>
                        <Switch 
                          id="formal-tone" 
                          checked={formalTone}
                          onCheckedChange={setFormalTone}
                        />
                      </div>
                      
                      <Separator className="bg-border" />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="include-skills">Include Specific Skills</Label>
                          <p className="text-sm text-muted-foreground">
                            Highlight quantifiable achievements and skills
                          </p>
                        </div>
                        <Switch 
                          id="include-skills" 
                          checked={includingSkills}
                          onCheckedChange={setIncludingSkills}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-4 flex-col">
                    <Button 
                      onClick={handleGenerate} 
                      disabled={(!resumeText && !resumeFile) || !jobDescription || !companyName || !position || isGenerating || isParsingFile}
                      className="w-full bg-primary"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Cover Letter...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" /> Generate Cover Letter
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Tips for a Great Cover Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Address a specific person when possible</li>
                      <li>• Include a compelling opening that shows your enthusiasm</li>
                      <li>• Highlight relevant achievements from your resume</li>
                      <li>• Explain why you're a good fit for the company culture</li>
                      <li>• Keep it concise - aim for 250-400 words</li>
                      <li>• End with a clear call to action</li>
                      <li>• Proofread carefully before sending</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card className="border border-border bg-card h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-semibold">Your Cover Letter</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy} className="border-border">
                          {copied ? (
                            <>
                              <Check className="mr-2 h-4 w-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" /> Copy
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleReset} className="border-border">
                          <RotateCcw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-md p-6 whitespace-pre-wrap font-serif">
                      {coverLetter}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-4">
                    <Button className="w-full bg-primary">
                      <Download className="mr-2 h-4 w-4" /> Download as PDF
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card className="border border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">ATS Optimization Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h3 className="font-medium mb-1">Keywords Used</h3>
                        <div className="flex flex-wrap gap-1">
                          {metadata.keywords ? (
                            metadata.keywords.map((keyword: string, index: number) => (
                              <div key={index} className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1">
                                {keyword}
                              </div>
                            ))
                          ) : (
                            ["React", "Next.js", "web development", "responsive", "APIs"].map((keyword) => (
                              <div key={keyword} className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1">
                                {keyword}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">Format</h3>
                        <p className="text-muted-foreground">Clean, professional format with clear paragraphs</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">Length</h3>
                        <p className="text-muted-foreground">
                          {metadata.wordCount 
                            ? `${metadata.wordCount} words (ideal for ATS)` 
                            : "~350 words (ideal for ATS)"
                          }
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">Personalization</h3>
                        <p className="text-muted-foreground">Company name mentioned multiple times</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">ATS Tips</h3>
                        <ul className="list-disc ml-5 space-y-1">
                          {metadata.tips ? (
                            metadata.tips.map((tip: string, index: number) => (
                              <li key={index} className="text-muted-foreground">{tip}</li>
                            ))
                          ) : (
                            <li className="text-muted-foreground">Strong action verbs highlight your achievements</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4 text-sm">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 