-- Fix: Remove trigger for user_verifications updated_at field
-- This field doesn't exist in the table schema

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_user_verifications_updated_at ON user_verifications;

-- The user_verifications table only has:
-- - submitted_at (when verification was submitted)
-- - verified_at (when verification was approved/rejected)
-- No updated_at field is needed or exists in the schema
