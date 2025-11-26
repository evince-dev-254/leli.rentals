-- ================================================================
-- ADD COUPONS TABLE
-- ================================================================
-- This script creates a coupons table for owner discount codes
-- ================================================================

-- Create COUPONS table
-- ================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL NOT NULL,
  min_booking_amount DECIMAL,
  max_discount_amount DECIMAL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, code)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_owner_id ON coupons(owner_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_dates ON coupons(start_date, expiry_date);

-- Disable RLS for development
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS coupons_updated_at_trigger ON coupons;
CREATE TRIGGER coupons_updated_at_trigger
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();

-- ================================================================
-- ✅ COUPONS TABLE CREATED!
-- ================================================================
-- Features:
-- ✅ Unique codes per owner
-- ✅ Percentage or fixed discount types
-- ✅ Min/max amount constraints
-- ✅ Usage limits and tracking
-- ✅ Date-based validity
-- ✅ Active/inactive status
-- ================================================================
