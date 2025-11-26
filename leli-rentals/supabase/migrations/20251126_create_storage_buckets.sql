-- Create storage buckets for file uploads
-- Run this in your Supabase SQL Editor
-- This version safely handles existing policies

-- Create bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read profile images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Service role can read all verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read listing images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all listing images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete their own listing images" ON storage.objects;

-- Set up RLS policies for profile-images bucket
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own profile images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can read profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

CREATE POLICY "Admins can read all profile images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()::text
    AND role IN ('admin', 'super_admin')
  )
);

-- Set up RLS policies for verification-documents bucket
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Service role can read all verification documents"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'verification-documents');

CREATE POLICY "Admins can read all verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()::text
    AND role IN ('admin', 'super_admin')
  )
);

-- Set up RLS policies for listing-images bucket
CREATE POLICY "Owners can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Public can read listing images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-images');

CREATE POLICY "Admins can read all listing images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'listing-images' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()::text
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Owners can delete their own listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
