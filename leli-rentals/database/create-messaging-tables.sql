-- ================================================================
-- MESSAGING TABLES: chat_sessions and messages
-- ================================================================
-- This script creates the tables needed for the messaging/chat system
-- Run this in your Supabase SQL Editor
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLE: chat_sessions
-- ================================================================
-- Stores chat sessions between users
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

-- Indexes for chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_participant_id ON chat_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- Unique constraint: one chat session per user-participant pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_sessions_unique_pair 
  ON chat_sessions(user_id, participant_id) 
  WHERE status = 'active';

-- ================================================================
-- TABLE: messages
-- ================================================================
-- Stores individual messages within chat sessions
-- Drop existing messages table first to avoid schema conflicts
DROP TABLE IF EXISTS messages CASCADE;

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

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_chat_session_id ON messages(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_read_status ON messages(read_status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Composite index for unread messages query
CREATE INDEX IF NOT EXISTS idx_messages_unread 
  ON messages(chat_session_id, receiver_id, read_status) 
  WHERE read_status = false;

-- ================================================================
-- FUNCTION: Update updated_at timestamp
-- ================================================================
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_chat_sessions_updated_at ON chat_sessions;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_sessions_updated_at();

-- ================================================================
-- FUNCTION: Increment unread count (optional helper function)
-- ================================================================
CREATE OR REPLACE FUNCTION increment_chat_unread(session_id UUID, receiver_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE chat_sessions
  SET unread_count = unread_count + 1,
      updated_at = NOW()
  WHERE id = session_id 
    AND participant_id = receiver_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- DISABLE RLS FOR DEVELOPMENT (comment out for production)
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view messages in their chat sessions" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;

-- Policy: Users can only see their own chat sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions
  FOR SELECT
  USING (auth.uid()::text = user_id OR auth.uid()::text = participant_id);

-- Policy: Users can create chat sessions where they are the user or participant
CREATE POLICY "Users can create their own chat sessions"
  ON chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own chat sessions
CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Users can view messages in their chat sessions
CREATE POLICY "Users can view messages in their chat sessions"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = messages.chat_session_id
        AND (chat_sessions.user_id = auth.uid()::text OR chat_sessions.participant_id = auth.uid()::text)
    )
  );

-- Policy: Users can send messages to chat sessions they're part of
CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = sender_id
    AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = messages.chat_session_id
        AND (chat_sessions.user_id = auth.uid()::text OR chat_sessions.participant_id = auth.uid()::text)
    )
  );

-- Policy: Users can update messages they received (mark as read)
CREATE POLICY "Users can update messages they received"
  ON messages
  FOR UPDATE
  USING (auth.uid()::text = receiver_id);

-- ================================================================
-- NOTES
-- ================================================================
-- 1. For development, you might want to disable RLS temporarily:
--    ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
--    ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
--
-- 2. To check if tables were created:
--    SELECT table_name FROM information_schema.tables 
--    WHERE table_schema = 'public' AND table_name IN ('chat_sessions', 'messages');
--
-- 3. To verify indexes:
--    SELECT indexname FROM pg_indexes 
--    WHERE tablename IN ('chat_sessions', 'messages');

