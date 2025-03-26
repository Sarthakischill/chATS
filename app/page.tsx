"use client";

import { useEffect, useRef } from "react";
import { HomeHeader } from "@/components/home-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, BarChart2, ThumbsUp, LineChart, Star, Check, Zap, Award, Target, FileSearch, BarChartHorizontal, Book } from "lucide-react"

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Initialize the intersection observer for reveal animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    // Observe all elements with the reveal-on-scroll class
    const elementsToReveal = document.querySelectorAll(".reveal-on-scroll");
    elementsToReveal.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      // Clean up observers and event listeners
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="flex flex-col bg-background relative overflow-hidden">
      <HomeHeader />
      <main>
        {/* Hero Section */}
        <section className="min-h-screen flex items-center relative">
          <div className="container max-w-[1200px] mx-auto px-4 py-16">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-6xl font-bold leading-tight">
                Optimize your resume for <br /><span className="text-primary">ATS</span> with <span className="text-primary">AI</span>
              </h1>
              <p className="mt-4 text-muted-foreground max-w-2xl">
                Get your resume noticed by applicant tracking systems. Our AI-powered tool 
                analyzes your resume against job descriptions to increase your chances of landing 
                interviews.
              </p>
              <div className="mt-8 flex gap-4 mb-16">
                <Button asChild className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  <Link href="/analyze">Analyze Resume</Link>
                </Button>
                <Button variant="outline" asChild className="rounded-md border-input hover:bg-accent hover:text-accent-foreground font-medium">
                  <Link href="/templates">Browse Templates</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Section - Everything you need */}
        <section className="py-48 w-full">
          <div className="container max-w-[1200px] mx-auto px-4">
            <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="text-4xl font-bold mb-4">
                Everything you need to optimize your resume
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered tools help you create resumes that get past ATS systems and into the hands of recruiters.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 reveal-on-scroll reveal-children">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Smart Formatting</h3>
                <p className="text-muted-foreground">
                  Automatically restructure your resume with industry-standard formats that increase ATS readability and parsing accuracy
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Job-Specific Matching</h3>
                <p className="text-muted-foreground">
                  Compare your resume against specific job descriptions to highlight relevant experiences and identify missing qualifications
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Career Development</h3>
                <p className="text-muted-foreground">
                  Access personalized learning resources to build the skills employers are looking for in your target industry
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 reveal-on-scroll reveal-children">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <FileSearch className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">ATS Optimization</h3>
                <p className="text-muted-foreground">
                  Format and structure your resume with keywords that pass ATS scanners and get your application in front of recruiters
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <BarChartHorizontal className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Detailed Analytics</h3>
                <p className="text-muted-foreground">
                  Get scored feedback and actionable improvement tips with performance metrics for every section of your resume
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Book className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Keyword Matching</h3>
                <p className="text-muted-foreground">
                  Identify missing keywords based on job descriptions to tailor your resume for each position you apply to
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 reveal-on-scroll reveal-children">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Skill Enhancement</h3>
                <p className="text-muted-foreground">
                  Identify and showcase your most relevant skills that match what employers are seeking in your target role
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <BarChart2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Tailored Feedback</h3>
                <p className="text-muted-foreground">
                  Receive personalized suggestions for each job application to maximize your chances of getting past screening systems
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <ThumbsUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Modern Templates</h3>
                <p className="text-muted-foreground">
                  Access professional designs optimized for applicant tracking systems with clean layouts that highlight your qualifications
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section className="py-24 w-full">
          <div className="container max-w-[1200px] mx-auto px-4">
            <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="text-4xl font-bold mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that's right for your career stage
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal-on-scroll reveal-children">
              {[
                {
                  name: "Free",
                  price: "Free",
                  description: "Basic resume optimization to get started",
                  features: [
                    "Basic ATS compatibility check",
                    "Limited resume analyses (3/month)",
                    "Access to basic templates",
                    "Basic compatibility score"
                  ],
                  buttonText: "Get Started",
                  popular: false
                },
                {
                  name: "Pro",
                  price: "$15",
                  period: "/month",
                  description: "Comprehensive tools for serious job seekers",
                  features: [
                    "Unlimited resume analyses",
                    "Advanced keyword suggestions",
                    "Access to all templates",
                    "AI chatbot assistance",
                    "Cover letter optimization",
                    "Version control"
                  ],
                  buttonText: "Upgrade to Pro",
                  popular: true
                },
                {
                  name: "Pro+",
                  price: "$30",
                  period: "/month",
                  description: "Complete career development suite",
                  features: [
                    "All Pro features",
                    "Personalized roadmaps",
                    "Learning integrations",
                    "Labor market intelligence",
                    "Priority support"
                  ],
                  buttonText: "Upgrade to Pro+",
                  popular: false
                }
              ].map((plan, i) => (
                <div key={i} className={`rounded-xl border ${plan.popular ? 'border-primary' : 'border-border'} ${plan.popular ? 'shadow-md shadow-primary/10' : ''} bg-card p-6 relative`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </div>
                  )}
                  <div className="text-xl font-bold mb-2">{plan.name}</div>
                  <div className="flex items-baseline mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-accent text-accent-foreground hover:bg-accent/80'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/signup">{plan.buttonText}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-24 bg-muted/5 w-full relative">
          <div className="container max-w-[1200px] mx-auto px-4">
            <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="text-4xl font-bold mb-4">
                Frequently asked questions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about chATS
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto reveal-on-scroll reveal-children">
              {[
                {
                  question: "How does chATS help my resume pass ATS scans?",
                  answer: "chATS analyzes your resume against ATS algorithms, identifying formatting issues and missing keywords that might cause your resume to be filtered out. It then provides specific recommendations to improve your resume's compatibility."
                },
                {
                  question: "How accurate is the ATS score?",
                  answer: "Our ATS scoring system is based on data from thousands of successful resumes and real ATS systems. While we can't guarantee a specific outcome, our users report a significant increase in interview callbacks after optimizing with chATS."
                },
                {
                  question: "Can I use chATS with any file format?",
                  answer: "chATS works with PDF, DOCX, and plain text resume formats. For best results, we recommend using DOCX files as they allow for easier editing based on our suggestions."
                },
                {
                  question: "How does the keyword matching work?",
                  answer: "Our AI analyzes both your resume and the job description to identify missing keywords and phrases that are important to the role. It then suggests ways to naturally incorporate these keywords into your resume."
                }
              ].map((item, i) => (
                <div key={i} className="border-b border-border pb-6">
                  <h3 className="text-lg font-medium mb-2">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 w-full">
          <div className="container max-w-[1200px] mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center p-12 rounded-xl border border-border bg-card shadow-sm reveal-on-scroll">
              <h2 className="text-3xl font-bold mb-4">
                Ready to optimize your resume?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of job seekers who are landing interviews with ATS-optimized resumes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/analyze">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-input hover:bg-accent hover:text-accent-foreground">
                  <Link href="/templates">Browse Templates</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="w-full border-t border-border py-12">
          <div className="container max-w-[1200px] mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 reveal-on-scroll reveal-children">
              <div>
                <div className="text-xl font-bold text-primary mb-4">chATS</div>
                <p className="text-muted-foreground text-sm">
                  Optimize your resume for applicant tracking systems with AI-powered suggestions.
                </p>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-4">Product</div>
                <ul className="space-y-2">
                  <li><Link href="/analyze" className="text-sm text-muted-foreground hover:text-foreground">Resume Analyzer</Link></li>
                  <li><Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">Templates</Link></li>
                  <li><Link href="/learning" className="text-sm text-muted-foreground hover:text-foreground">Learning Paths</Link></li>
                </ul>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-4">Company</div>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
                  <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                  <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-4">Legal</div>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} chATS. All rights reserved.
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="sr-only">Twitter</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-1-4.8 4-7.6 7.5-4.5.7-.8 1.5-1.5 2.5-2z"></path></svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="sr-only">GitHub</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="sr-only">LinkedIn</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
