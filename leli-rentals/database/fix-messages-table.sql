-- ================================================================
-- FIX MESSAGES TABLE: Handle existing table with wrong schema
-- ================================================================
-- This script will:
-- 1. Create chat_sessions table if it doesn't exist
-- 2. Drop messages table if it exists
-- 3. Recreate messages table with correct schema
-- ================================================================
-- ⚠️ WARNING: This will DELETE ALL MESSAGES if table needs recreation!
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, create chat_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  participant_avatar TEXT DEFAULT '/placeholder-user.jpg',
  participant_phone TEXT,
  participant_rating DECIMAL(3,2),
  participant_verified BOOLEAN DEFAULT false,
  listing_title TEXT,
  listing_image TEXT,
  booking_id TEXT,
  unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for chat_sessions if they don't exist
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_participant_id ON chat_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- Drop messages table if it exists (will cascade to constraints)
DROP TABLE IF EXISTS messages CASCADE;

-- Now create messages table with correct schema
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  metadata JSONB DEFAULT '{}',
  read_status BOOLEAN DEFAULT false,
  booking_id TEXT,
  listing_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_messages_chat_session_id ON messages(chat_session_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_read_status ON messages(read_status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Composite index for unread messages
CREATE INDEX idx_messages_unread 
  ON messages(chat_session_id, receiver_id, read_status) 
  WHERE read_status = false;

-- Disable RLS for development
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- VERIFY: Run this to check tables were created correctly
-- ================================================================
-- SELECT 
--   table_name,
--   column_name,
--   data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name IN ('chat_sessions', 'messages')
-- ORDER BY table_name, ordinal_position;
