"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { getUserResumes } from '@/lib/supabase';
import { deleteConversation } from '@/lib/conversation-service';
import { FileText, Trash2, Upload, Eye, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResumesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [resumes, setResumes] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResumes() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getUserResumes(user.id);
        setResumes(data);
      } catch (err) {
        console.error('Failed to load resumes:', err);
        setError('Failed to load your resumes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadResumes();
  }, [user]);

  async function handleDelete(id: string) {
    if (!user) return;
    
    try {
      setIsDeleting(id);
      await deleteConversation(user.id, 'resume', id);
      setResumes(resumes.filter(resume => resume.id !== id));
    } catch (err) {
      console.error('Failed to delete resume:', err);
      setError('Failed to delete the resume. Please try again later.');
    } finally {
      setIsDeleting(null);
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col bg-background min-h-screen">
        <Header />
        <main className="flex-1 container max-w-[1200px] mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertDescription>
              Please log in to view your resumes.
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Resumes</h1>
            <p className="text-muted-foreground">
              View and manage your saved resumes
            </p>
          </div>
          <Button asChild>
            <Link href="/analyze">
              <Upload className="mr-2 h-4 w-4" />
              Upload Resume
            </Link>
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : resumes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map(resume => (
              <Card key={resume.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-xl">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    {resume.title}
                  </CardTitle>
                  <CardDescription>
                    Created: {format(new Date(resume.created_at), 'PPP')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 flex-grow">
                  <p className="text-sm text-muted-foreground">
                    Last updated: {format(new Date(resume.updated_at), 'PPP p')}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/resumes/${resume.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(resume.id)}
                    disabled={isDeleting === resume.id}
                  >
                    {isDeleting === resume.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No resumes yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first resume to get started
            </p>
            <Button asChild>
              <Link href="/analyze">
                <Plus className="mr-2 h-4 w-4" />
                Upload Resume
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
} 