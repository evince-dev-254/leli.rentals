-- ================================================================
-- COMPLETE FEATURES SCHEMA UPDATE
-- ================================================================
-- This script adds all missing tables and columns for the complete feature set:
-- 1. Coupons & Deals
-- 2. Reviews & Ratings
-- 3. Notifications
-- 4. User Verifications
-- 5. Booking Fees & Updates
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. NOTIFICATIONS SYSTEM
-- ================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'booking', 'system', 'verification', 'subscription', 'review')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ================================================================
-- 2. COUPONS & DEALS SYSTEM
-- ================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_booking_amount DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coupons_owner_id ON coupons(owner_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- Track coupon usage
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  booking_id UUID, -- Will reference bookings table
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handle potential missing columns in coupon_usage
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupon_usage' AND column_name = 'booking_id') THEN
        ALTER TABLE coupon_usage ADD COLUMN booking_id UUID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);

-- ================================================================
-- 3. REVIEWS & RATINGS SYSTEM
-- ================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID, -- Will reference bookings table
  listing_id UUID, -- Will reference listings table
  reviewer_id TEXT NOT NULL,
  reviewee_id TEXT NOT NULL, -- The owner being reviewed (or renter if owner is reviewing)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  response TEXT, -- Owner's response
  response_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handle potential column mismatch if table already existed
DO $$
BEGIN
    -- Rename user_id to reviewer_id if it exists and reviewer_id does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'user_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reviewer_id') THEN
        ALTER TABLE reviews RENAME COLUMN user_id TO reviewer_id;
    END IF;

    -- Add reviewer_id if it doesn't exist (and wasn't renamed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reviewer_id') THEN
        ALTER TABLE reviews ADD COLUMN reviewer_id TEXT;
    END IF;

    -- Add reviewee_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reviewee_id') THEN
        ALTER TABLE reviews ADD COLUMN reviewee_id TEXT DEFAULT '';
    END IF;

    -- Add booking_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'booking_id') THEN
        ALTER TABLE reviews ADD COLUMN booking_id UUID;
    END IF;

    -- Add is_published column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'is_published') THEN
        ALTER TABLE reviews ADD COLUMN is_published BOOLEAN DEFAULT TRUE;
    END IF;

    -- Add listing_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'listing_id') THEN
        ALTER TABLE reviews ADD COLUMN listing_id UUID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- ================================================================
-- 4. USER VERIFICATIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS user_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  id_type TEXT NOT NULL CHECK (id_type IN ('passport', 'national_id', 'driving_license')),
  id_number TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  selfie_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT, -- Admin ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_status ON user_verifications(status);

-- ================================================================
-- 5. BOOKING UPDATES (Fees & Coupons)
-- ================================================================
-- Add columns to bookings table if they don't exist
DO $$
BEGIN
    -- Add booking_fee column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_fee') THEN
        ALTER TABLE bookings ADD COLUMN booking_fee DECIMAL(10, 2) DEFAULT 0;
    END IF;

    -- Add coupon_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'coupon_id') THEN
        ALTER TABLE bookings ADD COLUMN coupon_id UUID REFERENCES coupons(id);
    END IF;

    -- Add discount_amount column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'discount_amount') THEN
        ALTER TABLE bookings ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
    END IF;

    -- Add payment_status column if not exists (might already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
        ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;
    
    -- Add payment_breakdown column for split payments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_breakdown') THEN
        ALTER TABLE bookings ADD COLUMN payment_breakdown JSONB DEFAULT '{}';
    END IF;
END $$;

-- ================================================================
-- 6. USER PROFILE UPDATES
-- ================================================================
DO $$
BEGIN
    -- Add subscription_plan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_plan') THEN
        ALTER TABLE user_profiles ADD COLUMN subscription_plan TEXT DEFAULT 'free';
    END IF;

    -- Add subscription_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE user_profiles ADD COLUMN subscription_status TEXT DEFAULT 'active';
    END IF;

    -- Add verification_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'verification_status') THEN
        ALTER TABLE user_profiles ADD COLUMN verification_status TEXT DEFAULT 'unverified';
    END IF;
    
    -- Add account_type (renter/owner)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'account_type') THEN
        ALTER TABLE user_profiles ADD COLUMN account_type TEXT DEFAULT 'renter';
    END IF;
END $$;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;

-- Disable for development (optional)
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE coupon_usage DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_verifications DISABLE ROW LEVEL SECURITY;

-- Create basic policies (adjust as needed)

-- Notifications: Users can see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);

-- Coupons: Everyone can view active coupons (or restrict to owners viewing their own)
CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage own coupons" ON coupons
  FOR ALL USING (auth.uid()::text = owner_id);

-- Reviews: Everyone can view published reviews
CREATE POLICY "Anyone can view published reviews" ON reviews
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid()::text = reviewer_id);

-- Verifications: Users can view/create their own
CREATE POLICY "Users can manage own verifications" ON user_verifications
  FOR ALL USING (auth.uid()::text = user_id);

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Function to calculate booking fee (10%)
CREATE OR REPLACE FUNCTION calculate_booking_fee(price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN price * 0.10;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_verifications_updated_at ON user_verifications;
CREATE TRIGGER update_user_verifications_updated_at
    BEFORE UPDATE ON user_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
