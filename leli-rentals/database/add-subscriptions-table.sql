-- ================================================================
-- ADD SUBSCRIPTIONS TABLE
-- ================================================================
-- This script creates a subscriptions table to track user subscription plans
-- including free trial subscriptions for owners during verification
-- ================================================================

-- Create SUBSCRIPTIONS table
-- ================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'basic', 'professional', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);

-- Disable RLS for development
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS subscriptions_updated_at_trigger ON subscriptions;
CREATE TRIGGER subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- ================================================================
-- ✅ SUBSCRIPTIONS TABLE CREATED!
-- ================================================================
-- You can now track:
-- ✅ Trial subscriptions (5-day free access during verification)
-- ✅ Paid subscriptions (basic, professional, premium)
-- ✅ Subscription status (active, expired, cancelled)
-- ✅ Subscription periods with start and end dates
-- ================================================================
