"use client"

import { 
  FileText, 
  LineChart, 
  BarChart2,
  ThumbsUp, 
  BookOpen, 
  PenTool 
} from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "ATS Optimization",
      description:
        "Analyze your resume against ATS algorithms to ensure it passes automated scanning systems.",
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: "Detailed Analytics",
      description:
        "Get comprehensive feedback on your resume's strengths and weaknesses with actionable insights.",
    },
    {
      icon: <ThumbsUp className="h-8 w-8 text-primary" />,
      title: "Keyword Matching",
      description:
        "Identify missing keywords based on job descriptions to improve your match rate.",
    },
  ]

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Everything you need to optimize your resume
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered tools help you create resumes that get past ATS systems and into the hands of recruiters.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center"
            >
              <div className="mb-6 rounded-full bg-primary/10 p-4 w-fit">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-medium text-center">{feature.title}</h3>
              <p className="text-muted-foreground text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 