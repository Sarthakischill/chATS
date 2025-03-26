"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background/50">
      <div className="container py-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-2">
            <Link href="/" className="font-bold">
              <span className="text-lg bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent">
                ch<span className="text-primary">ATS</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Optimize your resume for applicant tracking systems
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Product</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/analyze" className="text-sm text-muted-foreground hover:text-foreground">
                  Resume Analyzer
                </Link>
                <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">
                  Templates
                </Link>
                <Link href="/learning" className="text-sm text-muted-foreground hover:text-foreground">
                  Learning Paths
                </Link>
              </nav>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Company</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  About
                </Link>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </nav>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Legal</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms
                </Link>
              </nav>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} chATS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 