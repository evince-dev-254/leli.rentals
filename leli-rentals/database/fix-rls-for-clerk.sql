-- Fix RLS policy for user_verifications table
-- Since we're using Clerk authentication (not Supabase Auth), we need to disable RLS
-- or create policies that work with service role key

-- Option 1: Disable RLS (simpler for development)
ALTER TABLE user_verifications DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, create a permissive policy
-- DROP POLICY IF EXISTS "Users can manage own verifications" ON user_verifications;
-- CREATE POLICY "Allow all operations for authenticated users" ON user_verifications
--   FOR ALL USING (true) WITH CHECK (true);

-- Also disable RLS for other tables that might have similar issues
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage DISABLE ROW LEVEL SECURITY;
