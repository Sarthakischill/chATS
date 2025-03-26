"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { getUserCoverLetters } from '@/lib/supabase';
import { deleteConversation } from '@/lib/conversation-service';
import { FileEdit, Trash2, Upload, Eye, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CoverLettersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoverLetters() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getUserCoverLetters(user.id);
        setCoverLetters(data);
      } catch (err) {
        console.error('Failed to load cover letters:', err);
        setError('Failed to load your cover letters. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCoverLetters();
  }, [user]);

  async function handleDelete(id: string) {
    if (!user) return;
    
    try {
      setIsDeleting(id);
      await deleteConversation(user.id, 'cover-letter', id);
      setCoverLetters(coverLetters.filter(letter => letter.id !== id));
    } catch (err) {
      console.error('Failed to delete cover letter:', err);
      setError('Failed to delete the cover letter. Please try again later.');
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
              Please log in to view your cover letters.
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
            <h1 className="text-3xl font-bold">Your Cover Letters</h1>
            <p className="text-muted-foreground">
              View and manage your saved cover letters
            </p>
          </div>
          <Button asChild>
            <Link href="/cover-letter">
              <Upload className="mr-2 h-4 w-4" />
              Upload Cover Letter
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
        ) : coverLetters.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coverLetters.map(letter => (
              <Card key={letter.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-xl">
                    <FileEdit className="mr-2 h-5 w-5 text-primary" />
                    {letter.title}
                  </CardTitle>
                  <CardDescription>
                    Created: {format(new Date(letter.created_at), 'PPP')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 flex-grow">
                  <p className="text-sm text-muted-foreground">
                    Last updated: {format(new Date(letter.updated_at), 'PPP p')}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/cover-letters/${letter.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(letter.id)}
                    disabled={isDeleting === letter.id}
                  >
                    {isDeleting === letter.id ? (
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
            <FileEdit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No cover letters yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first cover letter to get started
            </p>
            <Button asChild>
              <Link href="/cover-letter">
                <Plus className="mr-2 h-4 w-4" />
                Upload Cover Letter
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
} 