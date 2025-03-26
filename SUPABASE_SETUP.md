# Supabase Storage and Database Setup

This guide explains how to set up Supabase storage and database for the application.

## Prerequisites

- A Supabase project
- Admin access to your Supabase account

## Database Setup

1. Go to your Supabase dashboard and navigate to the **SQL Editor**
2. Create a new query and paste the contents of the `supabase/migrations/20230101000000_create_tables.sql` file
3. Run the query to create the necessary tables and functions

### Tables Created

- `profiles`: Stores user profile information (name, avatar URL, etc.)
- `user_preferences`: Stores user preferences (theme, notification settings)
- `resumes`: Stores metadata about user's resumes
- `cover_letters`: Stores metadata about user's cover letters
- `job_descriptions`: Stores metadata about user's job descriptions

### Database Security

The setup includes Row Level Security (RLS) policies that:
- Make profiles readable by anyone
- Ensure users can only modify their own profiles, preferences, and data
- Create triggers to automatically create profile entries when users sign up

## Storage Setup

1. Go to the **Storage** section in your Supabase dashboard
2. Create the following buckets:

### 1. Avatars Bucket
- Name: `avatars` 
- Access: Public
- Enable file size limits (recommended: 2MB max)

#### Policies for `avatars` bucket:

**Select policy (public read):**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**Insert policy (authenticated users only):**
```sql
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);
```

**Update/Delete policy (own files only):**
```sql
CREATE POLICY "Users can update/delete own avatars"
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

```sql
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2. Conversations Bucket
- Name: `conversations`
- Access: Private
- Enable file size limits (recommended: 5MB max)

#### Policies for `conversations` bucket:

**Select policy (own conversations only):**
```sql
CREATE POLICY "Users can view own conversations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'conversations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Insert policy (own conversations only):**
```sql
CREATE POLICY "Users can insert own conversations"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'conversations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Update/Delete policy (own conversations only):**
```sql
CREATE POLICY "Users can update own conversations"
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'conversations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

```sql
CREATE POLICY "Users can delete own conversations"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'conversations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Files Bucket
- Name: `files`
- Access: Public
- Enable file size limits (recommended: 10MB max)

#### Policies for `files` bucket:

**Select policy (public read):**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'files');
```

**Insert policy (authenticated users only):**
```sql
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Update/Delete policy (own files only):**
```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Environment Variables

Make sure your `.env.local` file includes:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Testing the Setup

1. Sign up for a new account in your application
2. Go to the profile page and try to upload an avatar
3. Create a resume, cover letter, or job description
4. Check the Supabase dashboard to ensure:
   - Records were created in the appropriate tables
   - Files were uploaded to the storage buckets

## Storage Structure

Your storage buckets will have the following structure:

```
avatars/
  user-id-xxx/avatar.jpg

conversations/
  user-id-xxx/
    resumes/
      resume-id-xxx.json
    cover-letters/
      cover-letter-id-xxx.json
    job-descriptions/
      job-description-id-xxx.json

files/
  user-id-xxx/
    resumes/
      resume-id-xxx/
        file1.pdf
        file2.docx
    cover-letters/
      cover-letter-id-xxx/
        file1.pdf
    job-descriptions/
      job-description-id-xxx/
        file1.pdf
```

## Troubleshooting

- If uploads fail, check the storage bucket permissions
- If database operations fail, check the RLS policies
- Check browser console for any specific error messages 