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
import { FileUp, Download, Sparkles, FileText, Copy, Check, RotateCcw, Loader2, Upload, AlertTriangle, AlertCircle } from "lucide-react";
import { generateCoverLetter, generateCoverLetterFromPDF, extractTextFromPDF } from "@/lib/gemini";
import mammoth from 'mammoth';
import { FileUpload } from '@/components/ui/file-upload';
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { saveCoverLetter } from "@/lib/cover-letter-service";
import { useRouter } from "next/navigation";
import { saveJobDescription } from '@/lib/supabase';

export default function CoverLetterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [formalTone, setFormalTone] = useState(true);
  const [includingSkills, setIncludingSkills] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    if (!user) {
      setError("Please log in to upload your resume");
      return;
    }

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
    } catch (err: any) {
      console.error("Error processing file:", err);
      setError(err.message || "Failed to process your resume. Please try a different file format.");
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      setError("Please log in to generate a cover letter");
      return;
    }
    
    if (!resumeText.trim()) {
      setError("Please upload or enter your resume text");
      return;
    }
    
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    if (!companyName.trim()) {
      setError("Please enter a company name");
      return;
    }

    if (!position.trim()) {
      setError("Please enter a job position/title");
      return;
    }
    
    setError("");
    setIsGenerating(true);
    
    try {
      // Save job description to database first
      try {
        await saveJobDescription(user.id, {
          title: `${position} at ${companyName}`,
          company_name: companyName,
          content: jobDescription
        });
        console.log('Job description saved successfully');
      } catch (jobSaveError) {
        console.error('Error saving job description:', jobSaveError);
        // Continue with cover letter generation even if job description save fails
      }
      
      // Call Gemini API to generate cover letter
      const response = await generateCoverLetter(
        resumeText,
        jobDescription,
        companyName,
        position,
        { formalTone, includingSkills }
      );
      
      setCoverLetter(response.coverLetter);
      setMetadata(response.metadata || {});
    } catch (err: any) {
      console.error('Error generating cover letter:', err);
      setError(err.message || 'Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError("Please log in to save your cover letter");
      return;
    }
    
    setIsSaving(true);
    setError("");
    
    try {
      // First save the job description again (in case it wasn't saved during generation)
      if (jobDescription && position && companyName) {
        try {
          await saveJobDescription(user.id, {
            title: `${position} at ${companyName}`,
            company_name: companyName,
            content: jobDescription
          });
        } catch (jobSaveError) {
          console.error('Error saving job description during cover letter save:', jobSaveError);
          // Continue even if this fails
        }
      }
      
      const result = await saveCoverLetter(user.id, {
        title: `Cover Letter for ${companyName} - ${position}`,
        company: companyName,
        position: position,
        content: coverLetter,
        resumeText: resumeText,
        jobDescription: jobDescription,
        metadata: metadata
      });
      
      // Redirect to cover letters page
      router.push("/cover-letters");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save cover letter. Please try again.");
    } finally {
      setIsSaving(false);
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-[1200px] mx-auto px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Cover Letter Generator</h1>
          <p className="text-muted-foreground">
            Create an ATS-optimized cover letter tailored to the job description
          </p>
        </div>

        {error && error.includes("log in") && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild className="mr-2">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
                      error="" 
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
                  
                  {error && !error.includes("log in") && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4 text-sm">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}
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
          <div className="space-y-6">
            <Card className="border border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold">Generated Cover Letter</CardTitle>
                  <CardDescription>
                    Your ATS-optimized cover letter for {companyName}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="text-xs flex items-center gap-1"
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap rounded-md border border-border bg-background p-4">
                  {coverLetter}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                  Create Another
                </Button>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Save Cover Letter
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            {metadata && metadata.keywords && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Keywords & Match Analysis</CardTitle>
                  <CardDescription>
                    Keywords and phrases detected in the job description and included in your cover letter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {metadata.keywords.map((keyword: string, i: number) => (
                      <div key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                        {keyword}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 