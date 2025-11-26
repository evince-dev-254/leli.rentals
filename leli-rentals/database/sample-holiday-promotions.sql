-- ================================================================
-- SAMPLE HOLIDAY & BLACK FRIDAY PROMOTIONS
-- ================================================================
-- This script creates sample coupons and special offers for:
-- 1. Holiday Season (December 2025)
-- 2. Black Friday (November 2025)
-- 
-- Run this AFTER creating the coupons and special_offers tables
-- Replace 'YOUR_USER_ID_HERE' with your actual Clerk user ID
-- ================================================================

-- ================================================================
-- SAMPLE COUPONS
-- ================================================================

-- Black Friday Coupon - 50% OFF
INSERT INTO coupons (
    owner_id,
    code,
    description,
    discount_type,
    discount_value,
    min_booking_amount,
    start_date,
    expiry_date,
    max_uses,
    current_uses,
    is_active
) VALUES (
    'user_35vQ9mmCP8IK3wD5Ula3ayiNvJN',  -- Replace with your Clerk user ID
    'BLACKFRIDAY50',
    'Black Friday Mega Sale - 50% off all bookings!',
    'percentage',
    50,
    1000,  -- Minimum booking of KSh 1,000
    '2025-11-28 00:00:00+00',  -- Black Friday 2025
    '2025-11-29 23:59:59+00',  -- Ends Saturday
    100,  -- Limited to 100 uses
    0,
    true
);

-- Holiday Season Coupon - 25% OFF
INSERT INTO coupons (
    owner_id,
    code,
    description,
    discount_type,
    discount_value,
    min_booking_amount,
    start_date,
    expiry_date,
    max_uses,
    current_uses,
    is_active
) VALUES (
    'user_35vQ9mmCP8IK3wD5Ula3ayiNvJN',  -- Replace with your Clerk user ID
    'HOLIDAY25',
    'Happy Holidays! Enjoy 25% off your booking',
    'percentage',
    25,
    500,
    '2025-12-01 00:00:00+00',
    '2025-12-31 23:59:59+00',
    200,
    0,
    true
);

-- New Year Special - Fixed KSh 500 OFF
INSERT INTO coupons (
    owner_id,
    code,
    description,
    discount_type,
    discount_value,
    start_date,
    expiry_date,
    max_uses,
    current_uses,
    is_active
) VALUES (
    'user_35vQ9mmCP8IK3wD5Ula3ayiNvJN',  -- Replace with your Clerk user ID
    'NEWYEAR500',
    'New Year Special - KSh 500 off any booking',
    'fixed',
    500,
    '2025-12-26 00:00:00+00',
    '2026-01-05 23:59:59+00',
    50,
    0,
    true
);

-- Cyber Monday - 40% OFF Electronics
INSERT INTO coupons (
    owner_id,
    code,
    description,
    discount_type,
    discount_value,
    min_booking_amount,
    start_date,
    expiry_date,
    max_uses,
    current_uses,
    is_active
) VALUES (
    'user_35vQ9mmCP8IK3wD5Ula3ayiNvJN',  -- Replace with your Clerk user ID
    'CYBERMON40',
    'Cyber Monday - 40% off electronics rentals',
    'percentage',
    40,
    800,
    '2025-12-01 00:00:00+00',
    '2025-12-02 23:59:59+00',
    75,
    0,
    true
);

-- ================================================================
-- SAMPLE SPECIAL OFFERS
-- ================================================================

-- Black Friday Special Offer - Owner-Wide
INSERT INTO special_offers (
    owner_id,
    listing_id,
    title,
    description,
    discount_percentage,
    start_date,
    end_date,
    is_active,
    views_count,
    bookings_generated
) VALUES (
    'user_35vQ9mmCP8IK3wD5Ula3ayiNvJN',  -- Replace with your Clerk user ID
    NULL,  -- NULL means applies to all owner's listings
    '🔥 BLACK FRIDAY BLOWOUT - 50% OFF!',
    'Biggest sale of the year! Grab your favorite items at half price for 48 hours only!',
    50,
    '2025-11-28 00:00:00+00',
    '2025-11-29 23:59:59+00',
    true,
    0,
    0
);

-- Holiday Season Special Offer - Owner-Wide
INSERT INTO special_offers (
    owner_id,
    listing_id,
    title,
    description,
    discount_percentage,
    start_date,
    end_date,
    is_active,
    views_count,
    bookings_generated
) VALUES (
    'user_35vQ9mmCP8IK3wD5Ula3ayiNvJN',  -- Replace with your Clerk user ID
    NULL,
    '🎄 Holiday Season Sale - 30% OFF',
    'Celebrate the holidays with amazing deals on all our rentals throughout December!',
    30,
    '2025-12-01 00:00:00+00',
    '2025-12-31 23:59:59+00',
    true,
    0,
    0
);

-- New Year Flash Sale
INSERT INTO special_offers (
    owner_id,
    listing_id,
    title,
    description,
    discount_percentage,
    start_date,
    end_date,
    is_active,
    views_count,
    bookings_generated
) VALUES (
    'user_35vQ9mmCP8IK3wD5Ula3ayiNvJN',  -- Replace with your Clerk user ID
    NULL,
    '🎆 New Year Flash Sale - 35% OFF',
    'Ring in the new year with incredible savings! Limited time offer.',
    35,
    '2025-12-26 00:00:00+00',
    '2026-01-05 23:59:59+00',
    true,
    0,
    0
);

-- Early Bird Holiday Special
INSERT INTO special_offers (
    owner_id,
    listing_id,
    title,
    description,
    discount_percentage,
    start_date,
    end_date,
    is_active,
    views_count,
    bookings_generated
) VALUES (
    'user_35vQ9mmCP8IK3wD5Ula3ayiNvJN',  -- Replace with your Clerk user ID
    NULL,
    '🌟 Early Bird Holiday Special - 20% OFF',
    'Book early for the holidays and save 20% on your rental!',
    20,
    '2025-11-20 00:00:00+00',
    '2025-11-30 23:59:59+00',
    true,
    0,
    0
);

-- ================================================================
-- ✅ SAMPLE PROMOTIONS CREATED!
-- ================================================================
-- Before running this script:
-- 1. Replace 'YOUR_USER_ID_HERE' with your actual Clerk user ID
-- 2. Make sure coupons and special_offers tables exist
-- 3. Optionally, update dates to fit your timeline
-- 
-- To find your Clerk user ID:
-- - Sign in to your app
-- - Check the browser console or network tab
-- - Or query: SELECT DISTINCT owner_id FROM listings LIMIT 1;
-- ================================================================
