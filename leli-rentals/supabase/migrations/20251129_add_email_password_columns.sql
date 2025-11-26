-- ================================================================
-- Add email and password columns to user_profiles table
-- ================================================================
-- This migration adds email and password columns to store user
-- authentication data directly in the user_profiles table
-- ================================================================

-- Add email column (unique, not null)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Add password column (hashed password storage)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ================================================================
-- Update existing records with email from auth.users
-- ================================================================
-- This will populate the email column for existing users
-- Note: Run this manually in Supabase SQL Editor after creating the column

-- UPDATE user_profiles up
-- SET email = au.email
-- FROM auth.users au
-- WHERE up.user_id = au.id
-- AND up.email IS NULL;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
