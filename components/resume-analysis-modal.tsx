import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, Briefcase } from "lucide-react";

interface ResumeAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: any;
}

export function ResumeAnalysisModal({ isOpen, onClose, analysis }: ResumeAnalysisModalProps) {
  if (!analysis) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resume Analysis Results</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {analysis.jobDescription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary" />
                  Job Description Summary
                </CardTitle>
                <CardDescription>
                  Key points from the target job description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.jobDescription.summary && (
                  <div>
                    <h3 className="text-base font-medium text-foreground mb-1">Summary</h3>
                    <p className="text-sm text-muted-foreground">{analysis.jobDescription.summary}</p>
                  </div>
                )}
                
                {analysis.jobDescription.requirements && analysis.jobDescription.requirements.length > 0 && (
                  <div>
                    <h3 className="text-base font-medium text-foreground mb-1">Key Requirements</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {Array.isArray(analysis.jobDescription.requirements) 
                        ? analysis.jobDescription.requirements.map((req: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 mt-1">•</span>
                              <span>{req}</span>
                            </li>
                          ))
                        : <li className="flex items-start">
                            <span className="mr-2 mt-1">•</span>
                            <span>{analysis.jobDescription.requirements}</span>
                          </li>
                      }
                    </ul>
                  </div>
                )}
                
                {analysis.jobDescription.responsibilities && analysis.jobDescription.responsibilities.length > 0 && (
                  <div>
                    <h3 className="text-base font-medium text-foreground mb-1">Key Responsibilities</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {Array.isArray(analysis.jobDescription.responsibilities)
                        ? analysis.jobDescription.responsibilities.map((resp: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 mt-1">•</span>
                              <span>{resp}</span>
                            </li>
                          ))
                        : <li className="flex items-start">
                            <span className="mr-2 mt-1">•</span>
                            <span>{analysis.jobDescription.responsibilities}</span>
                          </li>
                      }
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">ATS Compatibility Score</CardTitle>
              <CardDescription>
                How well your resume performs against ATS systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className="text-4xl font-bold">{analysis.score}%</span>
                </div>
                <Progress value={analysis.score} className="h-2" />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium mb-3">Section Scores</h3>
                  {Object.entries(analysis.sectionScores || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm capitalize">{key}</span>
                        <span className="text-sm font-medium">{value}%</span>
                      </div>
                      <Progress value={value} className="h-1.5" />
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Keyword Match</h3>
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Match rate</span>
                      <span className="text-sm font-medium">{analysis.keywordMatches}%</span>
                    </div>
                    <Progress value={analysis.keywordMatches} className="h-1.5" />
                  </div>
                  {analysis.missingKeywords?.length > 0 && (
                    <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                      <AlertTitle className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Missing Keywords
                      </AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          {analysis.missingKeywords.map((keyword: string, index: number) => (
                            <li key={index} className="text-sm">{keyword}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="strengths">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
            </TabsList>

            <TabsContent value="strengths">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Resume Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.strengths?.map((strength: string, index: number) => (
                      <li key={index} className="flex">
                        <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="improvements">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    Suggested Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.improvements?.map((improvement: string, index: number) => (
                      <li key={index} className="flex">
                        <AlertTriangle className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 