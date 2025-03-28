"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { getUserResumes, getUserCoverLetters, getUserJobDescriptions } from '@/lib/supabase';
import { FileText, FileEdit, Briefcase, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [resumeCount, setResumeCount] = useState(0);
  const [coverLetterCount, setCoverLetterCount] = useState(0);
  const [jobDescriptionCount, setJobDescriptionCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const [resumes, coverLetters, jobDescriptions] = await Promise.all([
          getUserResumes(user.id),
          getUserCoverLetters(user.id),
          getUserJobDescriptions(user.id)
        ]);
        
        setResumeCount(resumes.length);
        setCoverLetterCount(coverLetters.length);
        setJobDescriptionCount(jobDescriptions.length);
        
        // Create a combined list of recent activity
        const allItems = [
          ...resumes.map(resume => ({
            id: resume.id,
            title: resume.title,
            type: 'resume',
            date: new Date(resume.updated_at),
            icon: <FileText className="h-4 w-4" />
          })),
          ...coverLetters.map(letter => ({
            id: letter.id,
            title: letter.title,
            type: 'cover-letter',
            date: new Date(letter.updated_at),
            icon: <FileEdit className="h-4 w-4" />
          })),
          ...jobDescriptions.map(job => ({
            id: job.id,
            title: job.title,
            type: 'job-description',
            date: new Date(job.updated_at),
            icon: <Briefcase className="h-4 w-4" />
          }))
        ];
        
        // Sort by date and take the 5 most recent
        allItems.sort((a, b) => b.date.getTime() - a.date.getTime());
        setRecentActivity(allItems.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (user) {
      loadUserData();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex flex-col bg-background min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col bg-background min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please log in to view your dashboard
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-[1200px] mx-auto pt-24 pb-16 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.email}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Resumes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{resumeCount}</div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/resumes">
                      View all <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{coverLetterCount}</div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/cover-letters">
                      View all <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Job Descriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{jobDescriptionCount}</div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/job-descriptions">
                      View all <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest resumes, cover letters, and job descriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <ul className="space-y-4">
                    {recentActivity.map((item) => (
                      <li key={`${item.type}-${item.id}`} className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground capitalize">{item.type.replace('-', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/${item.type}s/${item.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No activity yet</p>
                    <div className="flex gap-4 justify-center mt-4">
                      <Button asChild size="sm">
                        <Link href="/analyze">Upload Resume</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/cover-letter">Upload Cover Letter</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
} 