-- Festive Season Promotions Migration
-- Created: 2025-11-26
-- Description: Adds festive season coupon and special offer for holiday celebrations

-- Insert Festive Season Coupon (25% OFF)
INSERT INTO coupons (
  id,
  code,
  discount_type,
  discount_value,
  description,
  max_uses,
  uses_count,
  min_purchase_amount,
  valid_from,
  valid_until,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'FESTIVE2025',
  'percentage',
  25,
  '🎄 Festive Season Special - 25% OFF on all bookings! Limited time offer ending soon.',
  1000,
  0,
  50.00,
  NOW(),
  NOW() + INTERVAL '7 days',
  true,
  NOW(),
  NOW()
) ON CONFLICT (code) DO NOTHING;

-- Insert Festive Special Offer (30% OFF)
INSERT INTO special_offers (
  id,
  title,
  description,
  discount_percentage,
  category,
  image_url,
  is_active,
  start_date,
  end_date,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '🎉 Festive Season Mega Sale',
  'Celebrate the holidays with up to 30% OFF on selected items! Book now and save big on your favorite rentals. Limited time offer - don''t miss out on these amazing deals!',
  30,
  'all',
  '/images/festive-banner.jpg',
  true,
  NOW(),
  NOW() + INTERVAL '10 days',
  NOW(),
  NOW()
);

-- Add comment for tracking
COMMENT ON TABLE coupons IS 'Stores promotional coupons with festive season offers';
COMMENT ON TABLE special_offers IS 'Stores special promotional offers including festive season deals';
