"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileTextIcon, BarChart3Icon, LightbulbIcon } from "lucide-react"

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-background py-12">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,120,45,0.15),transparent_70%)]"></div>
      
      <div className="container relative">
        <div className="flex flex-col md:flex-row gap-10 items-start justify-between">
          <div className="flex flex-col max-w-xl">
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              Optimize your resume <br />with <span className="text-primary">AI</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Get your resume noticed by applicant tracking systems. Our AI-powered 
              tool analyzes your resume against job descriptions to increase your
              chances of landing interviews.
            </p>
            <div className="mt-8 flex gap-4">
              <Button size="default" asChild className="rounded-md bg-primary">
                <Link href="/analyze">
                  Analyze Resume
                </Link>
              </Button>
              <Button size="default" variant="outline" asChild className="rounded-md">
                <Link href="/templates">
                  Browse Templates
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="w-full max-w-md">
            <div className="aspect-square overflow-hidden rounded-xl border border-primary/30 bg-card p-2">
              <div className="rounded-lg bg-muted/20 p-4 h-full">
                <div className="space-y-4">
                  <div className="h-3 w-32 rounded bg-muted"></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 h-3 rounded bg-muted"></div>
                    <div className="h-3 rounded bg-muted"></div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="grid grid-cols-4 gap-2">
                        <div className="h-3 rounded bg-muted"></div>
                        <div className="col-span-3 h-3 rounded bg-muted"></div>
                      </div>
                    ))}
                  </div>
                  <div className="h-24 rounded bg-muted"></div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-6 rounded bg-muted"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 grid grid-cols-3 gap-8">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <FileTextIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">ATS Optimization</h3>
              <p className="text-sm text-muted-foreground">Format and keywords that pass ATS scanners</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <BarChart3Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Detailed Analysis</h3>
              <p className="text-sm text-muted-foreground">Get scored feedback and improvement tips</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <LightbulbIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Skill Development</h3>
              <p className="text-sm text-muted-foreground">Learn what skills to build for your career</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 