"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, PlayCircle, BookOpen, CheckCircle, Star, Clock, ArrowRight, BarChart3, Loader2, AlertTriangle, Upload, FileText, AlertCircle } from "lucide-react";
import { getLearningRecommendations, getLearningRecommendationsFromPDF, extractTextFromPDF } from "@/lib/gemini";
import mammoth from 'mammoth';
import { FileUpload } from '@/components/ui/file-upload';
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { saveLearningRecommendation, getUserInProgressCourses, LearningRecommendation } from "@/lib/learning-service";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveJobDescription } from '@/lib/supabase';

export default function LearningPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("recommended");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
  const [recommendedCourses, setRecommendedCourses] = useState([
    {
      id: "1",
      title: "Advanced React for Frontend Developers",
      provider: "Coursera",
      duration: "15 hours",
      level: "Intermediate",
      rating: 4.8,
      students: 12500,
      image: "https://placehold.co/100/e9e9e9/999999?text=React",
      relevance: 95,
      category: "technical"
    },
    {
      id: "2",
      title: "Node.js & Express: Building RESTful APIs",
      provider: "Udemy",
      duration: "12 hours",
      level: "Intermediate",
      rating: 4.7,
      students: 8900,
      image: "https://placehold.co/100/e9e9e9/999999?text=Node",
      relevance: 90,
      category: "technical"
    },
    {
      id: "3",
      title: "Effective Communication for Technical Teams",
      provider: "LinkedIn Learning",
      duration: "6 hours",
      level: "All Levels",
      rating: 4.6,
      students: 5600,
      image: "https://placehold.co/100/e9e9e9/999999?text=Comm",
      relevance: 85,
      category: "soft"
    },
    {
      id: "4",
      title: "Modern JavaScript (ES6+) Fundamentals",
      provider: "Pluralsight",
      duration: "10 hours",
      level: "Beginner",
      rating: 4.9,
      students: 15800,
      image: "https://placehold.co/100/e9e9e9/999999?text=JS",
      relevance: 82,
      category: "technical"
    }
  ]);
  
  const [inProgressCourses, setInProgressCourses] = useState([
    {
      id: "5",
      title: "TypeScript for React Developers",
      provider: "Udemy",
      progress: 65,
      image: "https://placehold.co/100/e9e9e9/999999?text=TS",
      category: "technical"
    },
    {
      id: "6",
      title: "Git & GitHub for Modern Development",
      provider: "Coursera",
      progress: 42,
      image: "https://placehold.co/100/e9e9e9/999999?text=Git",
      category: "technical"
    }
  ]);
  
  const [skillGaps, setSkillGaps] = useState([
    {
      skill: "GraphQL",
      currentLevel: 25,
      requiredLevel: 70,
      category: "technical",
      description: "In-demand for modern API development"
    },
    {
      skill: "Docker & Containerization",
      currentLevel: 15,
      requiredLevel: 60,
      category: "technical",
      description: "Essential for DevOps and deployment"
    },
    {
      skill: "Project Management",
      currentLevel: 40,
      requiredLevel: 75,
      category: "soft",
      description: "Key for senior positions and team leadership"
    },
    {
      skill: "Data Visualization",
      currentLevel: 30,
      requiredLevel: 65,
      category: "technical",
      description: "Valuable for frontend and reporting roles"
    }
  ]);
  
  const [projects, setProjects] = useState([
    {
      id: "1",
      title: "Build a Full-Stack E-Commerce App",
      skills: ["React", "Node.js", "MongoDB", "Express"],
      difficulty: "Intermediate",
      duration: "4-6 weeks",
      description: "Create a functional e-commerce platform with user authentication, product catalog, cart functionality, and payment processing."
    },
    {
      id: "2",
      title: "Task Management Dashboard",
      skills: ["React", "Redux", "Firebase", "Material UI"],
      difficulty: "Intermediate",
      duration: "2-3 weeks",
      description: "Develop a Kanban-style task management dashboard with drag-and-drop functionality, user assignments, and real-time updates."
    },
    {
      id: "3",
      title: "API Integration Portfolio",
      skills: ["JavaScript", "REST APIs", "Fetch/Axios", "Data Visualization"],
      difficulty: "Beginner",
      duration: "1-2 weeks",
      description: "Create a portfolio that showcases your ability to integrate with various public APIs and display data in meaningful ways."
    }
  ]);

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
      setError("Please log in to upload your resume and get personalized learning recommendations");
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
      setHasResume(true);
    } catch (err: any) {
      console.error("Error processing file:", err);
      setError(err.message || "Failed to process your resume. Please try a different file format.");
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!user) {
      setError("Please log in to generate personalized learning recommendations");
      return;
    }
    
    if (!resumeText && !resumeFile) {
      setError("Please upload a resume or paste resume text to get recommendations");
      return;
    }

    // Show the coming soon modal instead of immediately processing
    setShowComingSoonModal(true);
  };

  const handleContinueToPreview = () => {
    setShowComingSoonModal(false);
    setIsLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      setHasGeneratedRecommendations(true);
      setActiveTab("recommended");
    }, 1500);
  };

  const handleCloseModal = () => {
    setShowComingSoonModal(false);
    router.push("/dashboard");
  };

  // Load user's in-progress courses
  useEffect(() => {
    const loadUserCourses = async () => {
      if (!user) return;
      
      try {
        const userCourses = await getUserInProgressCourses(user.id);
        if (userCourses && userCourses.length > 0) {
          // Transform to the format used in state
          const formattedCourses = userCourses.map(course => ({
            id: course.id.toString(),
            title: course.title,
            provider: course.provider,
            progress: course.progress,
            image: course.image || "https://placehold.co/100/e9e9e9/999999?text=Course",
            category: course.category || "technical"
          }));
          
          setInProgressCourses(formattedCourses);
        }
      } catch (error) {
        console.error("Error loading user courses:", error);
      }
    };
    
    loadUserCourses();
  }, [user]);
  
  // Add a handleSave function
  const handleSave = async () => {
    if (!user) {
      setError("Please log in to save your learning recommendations");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // First save the job description if it exists
      if (jobDescription && jobTitle) {
        try {
          await saveJobDescription(user.id, {
            title: jobTitle,
            company_name: '',
            content: jobDescription
          });
          console.log('Job description saved successfully');
        } catch (jobSaveError) {
          console.error('Error saving job description:', jobSaveError);
          // Continue even if this fails
        }
      } else if (jobDescription && !jobTitle) {
        // Use a default title if no title is provided
        try {
          await saveJobDescription(user.id, {
            title: "Learning Target Position",
            company_name: '',
            content: jobDescription
          });
          console.log('Job description saved with default title');
        } catch (jobSaveError) {
          console.error('Error saving job description:', jobSaveError);
          // Continue even if this fails
        }
      }
      
      await saveLearningRecommendation(user.id, {
        userId: user.id,
        recommendedCourses,
        skillGaps,
        projects,
        resumeText,
        jobDescription
      });
      
      // Optionally redirect to a learning dashboard
      // router.push("/learning/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save learning recommendations");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-[1200px] mx-auto px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Learning</h1>
          <p className="text-muted-foreground">
            Find personalized learning resources to advance your career
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

        {!hasGeneratedRecommendations ? (
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Get Personalized Recommendations</CardTitle>
                <CardDescription>
                  {hasResume 
                    ? "We've detected your resume. You can edit it below or generate recommendations."
                    : "Provide your resume and job target to get tailored learning suggestions"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasResume ? (
                  <div>
                    <FileUpload
                      id="resume-upload"
                      onFileUpload={handleFileUpload}
                      acceptedTypes=".pdf,.docx,.doc,.txt"
                      isLoading={isParsingFile}
                      file={resumeFile}
                      error=""
                      placeholderText="Upload your resume"
                      description="Upload your resume in PDF, DOCX, or TXT format to get personalized recommendations"
                    />
                    
                    {error && !error.includes("log in") && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4 text-sm">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label htmlFor="resume-text" className="block text-sm font-medium mb-2">
                      Your Resume {hasResume && <span className="text-green-600 text-xs">(Detected)</span>}
                    </label>
                    <Textarea 
                      id="resume-text"
                      placeholder="Resume text will appear here after file upload, or paste it manually..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="min-h-[200px] resize-none border-border bg-background"
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="job-description" className="block text-sm font-medium mb-2">
                    Target Job Description (Optional) {jobDescription && <span className="text-green-600 text-xs">(Detected)</span>}
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="job-title" className="block text-xs font-medium mb-1">
                        Job Title
                      </label>
                      <Input 
                        id="job-title"
                        placeholder="Enter the job title you're targeting..."
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="border-border bg-background"
                      />
                    </div>
                    <Textarea 
                      id="job-description"
                      placeholder="Paste a job description for a role you're targeting..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[150px] resize-none border-border bg-background"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-border pt-4">
                <Button 
                  onClick={handleGenerateRecommendations} 
                  disabled={(!resumeText && !resumeFile) || isLoading || isParsingFile}
                  className="w-full bg-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Recommendations...
                    </>
                  ) : hasResume ? (
                    "Generate Recommendations Using Detected Resume"
                  ) : (
                    "Generate Personal Learning Path"
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Why Skills Matter</CardTitle>
                <CardDescription>
                  How our personalized learning recommendations can help your career
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">1</div>
                  <div>
                    <h3 className="font-medium">Identify Your Skill Gaps</h3>
                    <p className="text-sm text-muted-foreground">
                      We analyze your resume against job market trends to identify areas for improvement
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">2</div>
                  <div>
                    <h3 className="font-medium">Get Personalized Courses</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive tailored course recommendations based on your experience and career goals
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">3</div>
                  <div>
                    <h3 className="font-medium">Build Real-World Skills</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply what you learn through hands-on projects designed for your skill level
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">4</div>
                  <div>
                    <h3 className="font-medium">Track Your Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor your development and see how your skills improve over time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-6 md:col-span-3">
              <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">+1 in the last month</p>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Hours Invested</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">27</div>
                    <p className="text-xs text-muted-foreground">Across 5 courses</p>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Skills Improved</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Based on your resume analysis</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="recommended" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="recommended">Recommended</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="skill-gaps">Skill Gaps</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recommended" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {recommendedCourses.map(course => (
                      <Card key={course.id} className="border border-border bg-card">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between">
                            <div>
                              <CardTitle className="text-lg">{course.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {course.provider} • {course.duration}
                              </CardDescription>
                            </div>
                            <Badge className="h-fit bg-primary/10 text-primary border-0">
                              {course.relevance}% Match
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="bg-background">
                              {course.level}
                            </Badge>
                            <Badge variant="outline" className="bg-background">
                              {course.category === "technical" ? "Technical" : "Soft Skills"}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="h-4 w-4 mr-1 text-amber-500 fill-amber-500" /> 
                              {course.rating} ({course.students.toLocaleString()} students)
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-border pt-3">
                          <Button variant="outline" className="mr-2 border-border">
                            <BookOpen className="h-4 w-4 mr-2" /> Details
                          </Button>
                          <Button className="bg-primary">
                            <PlayCircle className="h-4 w-4 mr-2" /> Start Learning
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="in-progress" className="mt-6">
                  <div className="space-y-6">
                    {inProgressCourses.map(course => (
                      <Card key={course.id} className="border border-border bg-card">
                        <CardHeader className="pb-3">
                          <div>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{course.title}</CardTitle>
                              <Button size="sm" className="h-8 bg-primary">
                                Continue <ArrowRight className="ml-2 h-3 w-3" />
                              </Button>
                            </div>
                            <CardDescription className="mt-1">
                              {course.provider}
                            </CardDescription>
                            <div className="mt-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-muted-foreground">Progress</span>
                                <span className="text-sm font-medium">{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="h-2" />
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                    
                    <div className="text-center p-4">
                      <Button variant="outline" className="border-border">
                        View All Courses
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="skill-gaps" className="mt-6">
                  <div className="space-y-6">
                    {skillGaps.map((skill, index) => (
                      <Card key={index} className="border border-border bg-card">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{skill.skill}</CardTitle>
                              <CardDescription className="mt-1">
                                {skill.description}
                              </CardDescription>
                            </div>
                            <Badge className={skill.category === "technical" ? "bg-blue-100 text-blue-700 border-0" : "bg-purple-100 text-purple-700 border-0"}>
                              {skill.category === "technical" ? "Technical" : "Soft Skill"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm">Current Level</span>
                                <span className="text-sm font-medium">{skill.currentLevel}%</span>
                              </div>
                              <Progress value={skill.currentLevel} className="h-2 bg-muted" />
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm">Target Level</span>
                                <span className="text-sm font-medium">{skill.requiredLevel}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full relative">
                                <div 
                                  className="absolute h-full bg-transparent border-r-2 border-primary"
                                  style={{ width: `${skill.requiredLevel}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-border pt-4">
                          <Button className="w-full bg-primary">
                            View Recommended Courses
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="projects" className="mt-6">
                  <div className="space-y-6">
                    {projects.map(project => (
                      <Card key={project.id} className="border border-border bg-card">
                        <CardHeader>
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="bg-background">
                              {project.difficulty}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" /> 
                              {project.duration}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{project.description}</p>
                          <div className="mb-2 text-sm font-medium">Skills you'll practice:</div>
                          <div className="flex flex-wrap gap-2">
                            {project.skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-0">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-border pt-4 flex justify-between">
                          <Button variant="outline" className="border-border">
                            View Details
                          </Button>
                          <Button className="bg-primary">
                            Start Project
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div>
              <div className="sticky top-24 space-y-4">
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Save Your Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Save your personalized learning plan to track your progress and access it anytime.
                    </p>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving} 
                      className="w-full"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Save Learning Plan
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Modal */}
        <Dialog open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Coming Soon</DialogTitle>
              <DialogDescription className="text-base pt-2">
                This feature is currently under development. The AI-based personalized learning recommendations will be available soon.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-amber-100 dark:bg-amber-950/40 p-4 rounded-md my-2 border border-amber-300 dark:border-amber-800">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">You can preview how this feature will look once it's developed by clicking the Preview button below.</p>
              </div>
            </div>
            <DialogFooter className="flex sm:justify-between mt-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Close
              </Button>
              <Button className="bg-primary" onClick={handleContinueToPreview}>
                Preview Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
} 