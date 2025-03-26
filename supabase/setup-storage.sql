-- SQL commands to set up storage buckets in Supabase
-- Run these in the Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('conversations', 'conversations', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket

-- Public read access for avatars
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users can upload avatars to their own folder
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for conversations bucket

-- Users can view only their own conversations
CREATE POLICY "Users can view own conversations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'conversations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can insert only to their own conversation folders
CREATE POLICY "Users can insert own conversations"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'conversations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update only their own conversations
CREATE POLICY "Users can update own conversations"
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'conversations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete only their own conversations
CREATE POLICY "Users can delete own conversations"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'conversations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for files bucket

-- Public read access for files
CREATE POLICY "Public Access Files"
ON storage.objects FOR SELECT
USING (bucket_id = 'files');

-- Authenticated users can upload files to their own folder
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'files' AND
  auth.uid()::text = (storage.foldername(name))[1]
); 