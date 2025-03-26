"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export function Pricing() {
  const tiers = [
    {
      name: "Free",
      description: "Basic resume optimization to get started",
      price: "Free",
      features: [
        "Basic ATS compatibility check",
        "Limited resume analyses (3/month)",
        "Access to basic templates",
        "Basic compatibility score",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Pro",
      description: "Comprehensive tools for serious job seekers",
      price: "$15",
      frequency: "/month",
      features: [
        "Unlimited resume analyses",
        "Advanced keyword suggestions",
        "Access to all templates",
        "AI chatbot assistance",
        "Resume examples by industry",
        "Cover letter optimization",
        "Version control for resumes",
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
      mostPopular: true,
    },
    {
      name: "Pro+",
      description: "Complete career development suite",
      price: "$30",
      frequency: "/month",
      features: [
        "All Pro features",
        "Personalized roadmaps",
        "Learning integrations",
        "Labor market intelligence",
        "Collaboration features",
        "Priority support",
      ],
      buttonText: "Upgrade to Pro+",
      buttonVariant: "outline" as const,
    },
  ]

  return (
    <section className="py-24 bg-muted/50">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that's right for your career stage.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Card
              key={index}
              className={
                tier.mostPopular
                  ? "border-primary shadow-md relative"
                  : "border shadow-sm"
              }
            >
              {tier.mostPopular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.frequency && (
                    <span className="text-muted-foreground">{tier.frequency}</span>
                  )}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={tier.buttonVariant} className="w-full" asChild>
                  <Link href="/signup">{tier.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
} 