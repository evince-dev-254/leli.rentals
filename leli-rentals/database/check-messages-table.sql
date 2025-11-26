-- ================================================================
-- CHECK EXISTING MESSAGES TABLE SCHEMA
-- ================================================================
-- Run this first to see what columns the messages table has
-- ================================================================

-- Check if messages table exists and show its columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- Check if chat_sessions table exists
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'chat_sessions'
ORDER BY ordinal_position;

