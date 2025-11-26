-- ================================================================
-- ADD SPECIAL OFFERS TABLE
-- ================================================================
-- This script creates a special_offers table for promotional deals
-- Special offers apply automatically to listings and are displayed
-- on home page, listing cards, and detail pages
-- ================================================================

-- Create SPECIAL_OFFERS table
-- ================================================================
CREATE TABLE IF NOT EXISTS special_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id TEXT NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  bookings_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_special_offers_owner_id ON special_offers(owner_id);
CREATE INDEX IF NOT EXISTS idx_special_offers_listing_id ON special_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_special_offers_is_active ON special_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_special_offers_dates ON special_offers(start_date, end_date);

-- Disable RLS for development
ALTER TABLE special_offers DISABLE ROW LEVEL SECURITY;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_special_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS special_offers_updated_at_trigger ON special_offers;
CREATE TRIGGER special_offers_updated_at_trigger
  BEFORE UPDATE ON special_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_special_offers_updated_at();

-- ================================================================
-- ✅ SPECIAL OFFERS TABLE CREATED!
-- ================================================================
-- Features:
-- ✅ Linked to specific listings or owner-wide
-- ✅ Percentage-based discounts
-- ✅ Date-based validity
-- ✅ Active/inactive status
-- ✅ Track views and bookings generated
-- ✅ Display on home, cards, and detail pages
-- ================================================================
