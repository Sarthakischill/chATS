"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { getResumeAnalysis } from '@/lib/resume-service';
import { getConversationFiles } from '@/lib/conversation-service';
import { FileText, Download, FileUp, MessageSquare, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ResumeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [resume, setResume] = useState<any>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadResumeData() {
      if (!user || !id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch the resume data
        const resumeId = Array.isArray(id) ? id[0] : id;
        const resumeData = await getResumeAnalysis(user.id, resumeId);
        
        if (!resumeData) {
          throw new Error('Resume not found');
        }
        
        setResume(resumeData);
        
        // Fetch any associated files
        const fileUrls = await getConversationFiles(user.id, 'resume', resumeId);
        setFiles(fileUrls);
      } catch (err: any) {
        console.error('Error loading resume:', err);
        setError(err.message || 'Failed to load resume data');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadResumeData();
  }, [user, id]);
  
  if (!user) {
    return (
      <div className="flex flex-col bg-background min-h-screen">
        <Header />
        <main className="flex-1 container max-w-[1200px] mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertDescription>
              Please log in to view this resume.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1 container max-w-[1200px] mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : resume ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{resume.meta.title}</h1>
                <p className="text-muted-foreground">
                  Uploaded on {new Date(resume.meta.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/resumes">
                    Back to Resumes
                  </Link>
                </Button>
                {files.length > 0 && (
                  <Button variant="outline" asChild>
                    <a href={files[0]} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download Resume
                    </a>
                  </Button>
                )}
              </div>
            </div>
            
            <Tabs defaultValue="analysis">
              <TabsList>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis" className="space-y-6 mt-4">
                {resume.results ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{resume.results.summary}</p>
                      </CardContent>
                    </Card>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {resume.results.strengths.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                            Areas for Improvement
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {resume.results.weaknesses.map((weakness: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {resume.results.recommendations.map((recommendation: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium mr-3 mt-0.5">
                                {index + 1}
                              </div>
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/analyze">
                            <FileUp className="mr-2 h-4 w-4" />
                            Analyze Another Resume
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Analysis Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>There is no analysis data available for this resume.</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" asChild>
                        <Link href="/analyze">
                          Analyze This Resume
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="conversation" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversation History</CardTitle>
                    <CardDescription>
                      Your interaction history for this resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {resume.messages && resume.messages.length > 0 ? (
                      <div className="space-y-4">
                        {resume.messages.map((message: any, index: number) => (
                          <div 
                            key={index} 
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg p-4 ${
                                message.role === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(message.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No conversation history yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Resume not found</h3>
            <p className="text-muted-foreground mb-6">
              The resume you're looking for could not be found
            </p>
            <Button asChild>
              <Link href="/resumes">
                View All Resumes
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
} 