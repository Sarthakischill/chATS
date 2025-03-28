"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Download, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getUserCoverLetters, deleteCoverLetter } from '@/lib/cover-letter-service';
import { format } from 'date-fns';

export default function CoverLettersPage() {
  const { user } = useAuth();
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoverLetters() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const letters = await getUserCoverLetters(user.id);
        setCoverLetters(letters || []);
      } catch (error) {
        console.error("Error fetching cover letters:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCoverLetters();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    setIsDeleting(id);
    try {
      await deleteCoverLetter(user.id, id);
      setCoverLetters(coverLetters.filter(letter => letter.id !== id));
    } catch (error) {
      console.error("Error deleting cover letter:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-[1200px] mx-auto px-6 pt-24 pb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cover Letters</h1>
            <p className="text-muted-foreground">
              Your saved cover letters for job applications
            </p>
          </div>
          <Button asChild>
            <Link href="/cover-letter">
              <Plus className="mr-2 h-4 w-4" /> Create New Cover Letter
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : coverLetters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Cover Letters Found</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              You haven't created any cover letters yet. Create your first one to get started.
            </p>
            <Button asChild>
              <Link href="/cover-letter">
                <Plus className="mr-2 h-4 w-4" /> Create Cover Letter
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coverLetters.map((letter) => (
              <Card key={letter.id} className="border border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold truncate">{letter.title}</CardTitle>
                  <CardDescription>
                    {letter.company && (
                      <span className="block">{letter.company} - {letter.position}</span>
                    )}
                    <span className="text-xs">
                      {letter.created_at && format(new Date(letter.created_at), 'MMM d, yyyy')}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[100px]">
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {typeof letter.content === 'string' 
                      ? letter.content.substring(0, 150) + '...' 
                      : 'No preview available'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-border pt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/cover-letters/${letter.id}`}>
                      <FileText className="mr-2 h-4 w-4" /> View
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(letter.id)}
                    disabled={isDeleting === letter.id}
                  >
                    {isDeleting === letter.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 