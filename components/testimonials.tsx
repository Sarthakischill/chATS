"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content:
        "After using chATS to optimize my resume, I started getting callbacks from companies that previously rejected me. The insights were spot-on and helped me focus on what mattered.",
      avatar: "/avatars/avatar-1.png",
      initials: "SJ",
    },
    {
      name: "David Chen",
      role: "Marketing Manager",
      content:
        "The keyword suggestions were eye-opening. I was missing crucial terms that recruiters were looking for. My interview rate doubled within weeks of using chATS.",
      avatar: "/avatars/avatar-2.png",
      initials: "DC",
    },
    {
      name: "Priya Patel",
      role: "Data Scientist",
      content:
        "The personalized learning paths helped me identify skill gaps for the roles I wanted. I focused my learning and landed my dream job at a tech startup.",
      avatar: "/avatars/avatar-3.png",
      initials: "PP",
    },
  ]

  return (
    <section className="py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What our users say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our AI-powered platform has helped thousands of job seekers land interviews and secure their dream jobs.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  {Array(5)
                    .fill(null)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 