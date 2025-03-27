"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Plus, Loader2, AlertTriangle, Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getUserResumes, deleteResume, downloadResume } from '@/lib/resume-service';
import { ResumeAnalysisModal } from '@/components/resume-analysis-modal';

export default function ResumesPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadResumes() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userResumes = await getUserResumes(user.id);
        setResumes(userResumes);
      } catch (err: any) {
        console.error('Error loading resumes:', err);
        setError(err.message || 'Failed to load resumes');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadResumes();
  }, [user]);

  const handleDelete = async (resumeId: string) => {
    if (!user) return;
    
    try {
      setDeletingId(resumeId);
      await deleteResume(user.id, resumeId);
      setResumes(resumes.filter(resume => resume.id !== resumeId));
    } catch (err: any) {
      console.error('Error deleting resume:', err);
      setError(err.message || 'Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (resumeId: string) => {
    if (!user) return;
    
    try {
      setDownloadingId(resumeId);
      await downloadResume(user.id, resumeId);
    } catch (err: any) {
      console.error('Error downloading resume:', err);
      setError(err.message || 'Failed to download resume');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewAnalysis = (resume: any) => {
    setSelectedAnalysis(resume.analysis_results);
    setIsModalOpen(true);
  };

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
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : resumes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card key={resume.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {resume.title}
                  </CardTitle>
                  <CardDescription>
                    {new Date(resume.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {resume.metadata?.originalFileName && (
                      <p>Original file: {resume.metadata.originalFileName}</p>
                    )}
                    {resume.analysis_results && (
                      <div className="mt-2">
                        <p className="font-medium text-foreground">Analysis Score</p>
                        <p>{resume.analysis_results.score || 'N/A'}%</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="mt-auto pt-6 flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewAnalysis(resume)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDownload(resume.id)}
                    disabled={downloadingId === resume.id}
                  >
                    {downloadingId === resume.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleDelete(resume.id)}
                    disabled={deletingId === resume.id}
                  >
                    {deletingId === resume.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Delete'
                    )}
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

        <ResumeAnalysisModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAnalysis(null);
          }}
          analysis={selectedAnalysis}
        />
      </main>
    </div>
  );
} 