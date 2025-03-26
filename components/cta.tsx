"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,120,45,0.2),transparent_70%)]"></div>
      
      <div className="container relative">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to optimize your resume?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of job seekers who are landing interviews with ATS-optimized resumes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/analyze">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/learn-more">Learn More</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required. Start with our free plan today.
          </p>
        </div>
      </div>
    </section>
  )
} 