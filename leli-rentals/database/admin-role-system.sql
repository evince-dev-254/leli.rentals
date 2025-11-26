-- ================================================================
-- ADMIN ROLE SYSTEM: Database Schema Updates
-- ================================================================
-- This script adds admin role management to the existing schema
-- Run this AFTER the FRESH_START_SCHEMA.sql
-- ================================================================

-- STEP 1: Add role column to user_profiles table
-- ================================================================
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- Add index for role queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- STEP 2: Create admin_activity_log table
-- ================================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id TEXT,
  target_resource_type TEXT,
  target_resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for admin activity queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_user ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_target_user ON admin_activity_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action_type ON admin_activity_log(action_type);

-- Disable RLS for development
ALTER TABLE admin_activity_log DISABLE ROW LEVEL SECURITY;

-- STEP 3: Add account_type and verification_status to user_profiles if not exists
-- ================================================================
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'renter' CHECK (account_type IN ('renter', 'owner'));

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected'));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON user_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON user_profiles(verification_status);

-- STEP 4: Create function to log admin actions
-- ================================================================
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_user_id TEXT,
  p_action_type TEXT,
  p_target_user_id TEXT DEFAULT NULL,
  p_target_resource_type TEXT DEFAULT NULL,
  p_target_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_activity_log (
    admin_user_id,
    action_type,
    target_user_id,
    target_resource_type,
    target_resource_id,
    details
  ) VALUES (
    p_admin_user_id,
    p_action_type,
    p_target_user_id,
    p_target_resource_type,
    p_target_resource_id,
    p_details
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Verification - Show updated schema
-- ================================================================
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name 
     AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name IN ('user_profiles', 'admin_activity_log')
ORDER BY table_name;

-- ================================================================
-- ✅ ADMIN ROLE SYSTEM COMPLETE!
-- ================================================================
-- Added:
-- ✅ role column to user_profiles (user, admin, super_admin)
-- ✅ admin_activity_log table for tracking admin actions
-- ✅ account_type and verification_status columns
-- ✅ Indexes for performance
-- ✅ log_admin_action() function for easy logging
-- ================================================================
-- Next steps:
-- 1. Seed an initial admin user (run manually or via script)
-- 2. Update application code to check roles
-- 3. Implement admin management UI
-- ================================================================
