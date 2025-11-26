# Quick Fix for "column chat_session_id does not exist" Error

## Problem
You're getting an error because the `messages` table already exists in Supabase with a different schema (different column names).

## Solution (Choose One)

### Option 1: Quick Fix - Just Fix Messages Table (Recommended)

Run this SQL in Supabase SQL Editor:

```sql
-- Drop and recreate messages table with correct schema
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

-- Create indexes
CREATE INDEX idx_messages_chat_session_id ON messages(chat_session_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_read_status ON messages(read_status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Disable RLS for development
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

### Option 2: Full Recreate (If Option 1 doesn't work)

Run `fix-messages-table.sql` - it will drop and recreate everything cleanly.

### Option 3: Check What Exists First

1. Run `check-messages-table.sql` to see what columns your messages table has
2. Then decide if you need to drop and recreate or just add the missing column

## After Running the Fix

1. Verify the table was created correctly:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages';
```

2. You should see `chat_session_id` in the list
3. Try your application again - it should work now!

