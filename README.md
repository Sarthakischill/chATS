# ATS Helper Application

A comprehensive ATS (Applicant Tracking System) helper application that helps job seekers optimize their resumes, generate cover letters, and improve their skills based on job descriptions. The application leverages Google's Gemini Flash 2.0 AI capabilities for advanced analysis and content generation.

## Features

- **Resume Analysis**: Upload your resume (PDF, DOCX, or TXT) and get detailed ATS compatibility feedback, including scores, strengths, and improvement suggestions
- **Cover Letter Generator**: Create tailored cover letters based on your resume and job descriptions
- **Learning Recommendations**: Get personalized course and project recommendations to improve your skills
- **Resume Chat Assistant**: Ask questions about your resume or job application process

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key (available at [Google AI Studio](https://makersuite.google.com/app/apikey))
- Supabase account

### Installation

1. Clone this repository
```bash
git clone <repository-url>
cd ats-helper
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your Gemini API key and Supabase credentials:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Setup

This application uses Supabase for authentication, database, and storage. Follow the steps below to set up your Supabase project:

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Copy your Supabase URL and anon key to the `.env.local` file

### 2. Set Up Database Tables

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/20230101000000_create_tables.sql` and run it

This will create the following tables:
- `profiles`: User profile information
- `user_preferences`: User preferences like theme
- `resumes`: Resume metadata
- `cover_letters`: Cover letter metadata
- `job_descriptions`: Job description metadata

### 3. Set Up Storage Buckets

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/setup-storage.sql` and run it

This will create the following storage buckets:
- `avatars`: For user profile pictures
- `conversations`: For storing conversation data and analysis results
- `files`: For storing uploaded documents

### 4. Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Set your Site URL (this should be your production URL, or http://localhost:3000 for development)
3. Under Email Templates, customize the templates to match your branding

## Using the Application

### Resume Analysis
1. Navigate to the Analysis page
2. Upload your resume in PDF, DOCX, or TXT format
3. Optionally add a job description for targeted analysis
4. Click "Analyze Resume" to get feedback

### Cover Letter Generator
1. Navigate to the Cover Letter page
2. Fill in the job details (company, position, job description)
3. Upload your resume or paste the text
4. Adjust customization options
5. Click "Generate Cover Letter"

### Learning Recommendations
1. Navigate to the Learning page
2. Upload your resume or paste the text
3. Optionally add a job description
4. Click "Generate Recommendations"

### Resume Chat
Use the chat interface to ask questions about your resume, job search, or interview preparation.

## Technologies Used

- Next.js 13
- TypeScript
- Tailwind CSS
- Google Gemini AI 1.5 Flash
- Shadcn UI Components

## Feedback and Support

For issues, questions, or feedback, please [create an issue](https://github.com/yourusername/ats-helper/issues) in this repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 