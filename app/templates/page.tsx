"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Download, Eye, Check, AlertTriangle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showComingSoonModal, setShowComingSoonModal] = useState(true);
  const router = useRouter();
  
  const handleCloseModal = () => {
    setShowComingSoonModal(false);
    router.push("/dashboard");
  };

  const templates = [
    {
      id: 1,
      name: "Modern Professional",
      image: "https://placehold.co/300x400/e9e9e9/999999?text=Modern+Professional",
      category: "professional",
      free: true,
      features: [
        "Clean, minimal design",
        "ATS-optimized layout",
        "Section for skills and expertise",
        "Professional summary section"
      ]
    },
    {
      id: 2,
      name: "Technical Resume",
      image: "https://placehold.co/300x400/e9e9e9/999999?text=Technical+Resume",
      category: "technical",
      free: true,
      features: [
        "Skills matrix",
        "Project highlight section",
        "Technical competencies layout",
        "Education and certification focus"
      ]
    },
    {
      id: 3,
      name: "Creative Professional",
      image: "https://placehold.co/300x400/e9e9e9/999999?text=Creative+Professional",
      category: "creative",
      free: false,
      features: [
        "Modern layout with accent colors",
        "Portfolio section",
        "Skills visualization",
        "Custom sections for projects"
      ]
    },
    {
      id: 4,
      name: "Executive Resume",
      image: "https://placehold.co/300x400/e9e9e9/999999?text=Executive+Resume",
      category: "professional",
      free: false,
      features: [
        "Leadership highlights section",
        "Achievements and metrics focus",
        "Professional experience timeline",
        "Board experience section"
      ]
    },
    {
      id: 5,
      name: "Simple ATS",
      image: "https://placehold.co/300x400/e9e9e9/999999?text=Simple+ATS",
      category: "simple",
      free: true,
      features: [
        "Maximum ATS compatibility",
        "Simple, straightforward layout",
        "Skills and keywords focus",
        "Easy to scan format"
      ]
    },
    {
      id: 6,
      name: "Data Science Resume",
      image: "https://placehold.co/300x400/e9e9e9/999999?text=Data+Science+Resume",
      category: "technical",
      free: false,
      features: [
        "Technical skills section",
        "Projects with results metrics",
        "Education and certifications layout",
        "Publications and research section"
      ]
    }
  ];
  
  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);
    
  const categories = [
    { id: "all", name: "All Templates" },
    { id: "professional", name: "Professional" },
    { id: "technical", name: "Technical" },
    { id: "creative", name: "Creative" },
    { id: "simple", name: "Simple" }
  ];

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="flex-1 pt-16">
        <div className="container max-w-[1200px] mx-auto px-4 py-8">
          {/* Warning Banner */}
          <Alert className="mb-6 bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <AlertTitle className="text-amber-800 dark:text-amber-300 font-medium">
              Templates Preview
            </AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              This feature is currently in beta. Some functionality may be limited as we continue to enhance the resume templates.
            </AlertDescription>
          </Alert>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Resume Templates</h1>
            <p className="text-muted-foreground">
              Choose from our collection of ATS-optimized resume templates
            </p>
          </div>
          
          <div className="mb-8">
            <Tabs 
              defaultValue="all" 
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 mb-8">
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="border border-border bg-card overflow-hidden">
                <div className="relative">
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-[300px] object-cover"
                  />
                  {template.free ? (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Free
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      Pro
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-border pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-border">
                        <Eye className="h-4 w-4 mr-2" /> Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[900px]">
                      <DialogHeader>
                        <DialogTitle>{template.name}</DialogTitle>
                        <DialogDescription>
                          ATS-optimized resume template
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-center p-4 bg-muted rounded-md">
                        <img 
                          src={template.image} 
                          alt={template.name}
                          className="max-h-[600px] object-contain"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        {template.free ? (
                          <Button className="bg-primary">
                            <Download className="h-4 w-4 mr-2" /> Use This Template
                          </Button>
                        ) : (
                          <Button className="bg-primary">
                            <Check className="h-4 w-4 mr-2" /> Upgrade to Pro
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {template.free ? (
                    <Button className="bg-primary">
                      <Download className="h-4 w-4 mr-2" /> Use Template
                    </Button>
                  ) : (
                    <Button className="bg-primary">
                      <Check className="h-4 w-4 mr-2" /> Get Pro
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Coming Soon Modal */}
      <Dialog open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Coming Soon</DialogTitle>
            <DialogDescription className="text-base pt-2">
              This feature is currently under development. The AI-based personalized resume templates will be available soon.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-100 dark:bg-amber-950/40 p-4 rounded-md my-2 border border-amber-300 dark:border-amber-800">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                You can preview how this feature will look once it's developed by clicking the Preview button below.
              </p>
            </div>
          </div>
          <DialogFooter className="flex sm:justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={handleCloseModal}
            >
              Close
            </Button>
            <Button 
              className="bg-primary" 
              onClick={() => setShowComingSoonModal(false)}
            >
              Preview Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 