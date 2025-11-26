-- Migration: Webhook Monitoring and User Sync Logging
-- Created: 2025-11-26
-- Description: Creates tables for tracking webhook failures and user sync operations

-- Table: webhook_failures
-- Logs all webhook processing failures for monitoring and retry
CREATE TABLE IF NOT EXISTS webhook_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type TEXT NOT NULL, -- e.g., 'user.created', 'user.updated'
  user_id TEXT NOT NULL, -- Clerk user ID
  event_data JSONB NOT NULL, -- Full webhook event data
  error_message TEXT NOT NULL,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_webhook_failures_user_id ON webhook_failures(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_failures_resolved ON webhook_failures(resolved);
CREATE INDEX IF NOT EXISTS idx_webhook_failures_created_at ON webhook_failures(created_at DESC);

-- Table: user_sync_log
-- Tracks manual sync operations between Clerk and Supabase
CREATE TABLE IF NOT EXISTS user_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- 'manual', 'automatic', 'retry'
  users_synced INTEGER DEFAULT 0,
  users_failed INTEGER DEFAULT 0,
  failed_user_ids TEXT[], -- Array of user IDs that failed
  error_details JSONB,
  triggered_by TEXT, -- Admin user ID or 'system'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress' -- 'in_progress', 'completed', 'failed'
);

-- Index for monitoring sync operations
CREATE INDEX IF NOT EXISTS idx_user_sync_log_status ON user_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_user_sync_log_started_at ON user_sync_log(started_at DESC);

-- Add comment for documentation
COMMENT ON TABLE webhook_failures IS 'Logs webhook processing failures for monitoring and retry mechanisms';
COMMENT ON TABLE user_sync_log IS 'Tracks user synchronization operations between Clerk and Supabase';
