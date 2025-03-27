"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Trash2, ExternalLink, Loader2, BookOpen, BarChart } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getUserLearningRecommendations, deleteLearningRecommendation } from '@/lib/learning-service';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function LearningRecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getUserLearningRecommendations(user.id);
        setRecommendations(data || []);
      } catch (error) {
        console.error("Error fetching learning recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    setIsDeleting(id);
    try {
      await deleteLearningRecommendation(user.id, id);
      setRecommendations(recommendations.filter(rec => rec.id !== id));
    } catch (error) {
      console.error("Error deleting learning recommendation:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Learning Recommendations</h1>
              <p className="text-muted-foreground">
                Your saved learning plans and skill development recommendations
              </p>
            </div>
            <Button asChild>
              <Link href="/learning">
                <Plus className="mr-2 h-4 w-4" /> Create New Learning Plan
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Learning Plans Found</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                You haven't created any learning plans yet. Create your first one to get started on your skill development journey.
              </p>
              <Button asChild>
                <Link href="/learning">
                  <Plus className="mr-2 h-4 w-4" /> Create Learning Plan
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="border border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold truncate">
                      Learning Plan {format(new Date(rec.createdAt), 'MMM d, yyyy')}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-xs">
                        Created on {format(new Date(rec.createdAt), 'MMMM d, yyyy')}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Top Skills to Develop:</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.skillGaps && rec.skillGaps.slice(0, 3).map((skill: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {skill.skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Recommended Courses:</p>
                        <p className="text-sm text-muted-foreground">
                          {rec.recommendedCourses ? `${rec.recommendedCourses.length} courses` : 'No courses'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Suggested Projects:</p>
                        <p className="text-sm text-muted-foreground">
                          {rec.projects ? `${rec.projects.length} projects` : 'No projects'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-border pt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/learning/recommendations/${rec.id}`}>
                        <BarChart className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(rec.id)}
                      disabled={isDeleting === rec.id}
                    >
                      {isDeleting === rec.id ? (
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
        </div>
      </main>
    </div>
  );
} 