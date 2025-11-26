# Messaging Tables Setup Guide

This guide will help you set up the `chat_sessions` and `messages` tables in your Supabase database.

## Quick Setup

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** (left sidebar)

2. **Run the SQL Script**
   - Copy the contents of `create-messaging-tables.sql`
   - Paste it into the SQL Editor
   - Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

3. **Verify Tables Created**
   - Go to **Table Editor** (left sidebar)
   - You should see `chat_sessions` and `messages` tables

## What This Creates

### `chat_sessions` Table
Stores chat sessions between users with:
- User and participant information
- Listing and booking references
- Unread message count
- Status (active, archived, blocked)

### `messages` Table
Stores individual messages within chat sessions with:
- Sender and receiver IDs
- Message content and type
- Read status
- Timestamps

## Row Level Security (RLS)

The script includes RLS policies that:
- Allow users to view only their own chat sessions
- Allow users to send messages only in sessions they're part of
- Allow users to mark messages as read

**For Development:** If you need to disable RLS temporarily:

```sql
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

## Troubleshooting

### Error: "relation already exists"
If tables already exist, the script uses `CREATE TABLE IF NOT EXISTS` so it should be safe to run again. However, if you want to recreate them:

```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
```

Then run the script again.

### Error: "permission denied"
Make sure you're running the SQL as a database administrator or with proper permissions.

## Testing

After setup, you can test by running a simple query:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('chat_sessions', 'messages');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('chat_sessions', 'messages');
```

## Next Steps

Once the tables are created, the messaging feature should work automatically. The application will:
1. Create chat sessions when users start conversations
2. Store messages in the database
3. Display chat history correctly
4. Handle read/unread status

