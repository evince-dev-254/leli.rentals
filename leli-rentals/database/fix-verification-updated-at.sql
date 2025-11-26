-- ================================================================
-- FIX: User Verifications updated_at Column
-- ================================================================
-- Problem: Trigger expects 'updated_at' column but table doesn't have it
-- Solution: Add the column and ensure trigger works properly
-- ================================================================

-- Step 1: Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_verifications' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_verifications 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Update existing rows to have current timestamp
        UPDATE user_verifications 
        SET updated_at = COALESCE(verified_at, submitted_at, NOW());
        
        RAISE NOTICE 'Added updated_at column to user_verifications table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in user_verifications table';
    END IF;
END $$;

-- Step 2: Create or replace the update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_user_verifications_updated_at ON user_verifications;

CREATE TRIGGER update_user_verifications_updated_at
    BEFORE UPDATE ON user_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- VERIFICATION
-- ================================================================
-- Check the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_verifications'
ORDER BY ordinal_position;

-- ================================================================
-- ✅ Fix Complete!
-- ================================================================
-- The user_verifications table now has:
-- - updated_at column (timestamp)
-- - Trigger to auto-update on changes
-- - All existing rows have updated_at set
-- ================================================================
