-- Festive Season Special Offers and Coupons
-- Created: 2024-12-25 for the holiday season

-- Insert festive season special offers
INSERT INTO special_offers (
    id,
    owner_id,
    listing_id,
    title,
    description,
    discount_percentage,
    start_date,
    end_date,
    is_active,
    views_count,
    bookings_generated,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000', -- System-wide offers
    null,
    '🎄 Festive Season Special - 25% Off!',
    'Celebrate the holidays with 25% off all rentals this festive season! Perfect for your holiday events and celebrations.',
    25,
    '2024-12-15 00:00:00+00',
    '2025-01-15 23:59:59+00',
    true,
    0,
    0,
    now(),
    now()
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    null,
    '🎊 New Year Celebration - 30% Off!',
    'Ring in the new year with incredible savings! Get 30% off premium rentals for your NYE celebrations.',
    30,
    '2024-12-28 00:00:00+00',
    '2025-01-10 23:59:59+00',
    true,
    0,
    0,
    now(),
    now()
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    null,
    '🎁 Holiday Gift Special - 20% Off!',
    'Make this holiday season special with our gift-friendly 20% discount on all rental categories.',
    20,
    '2024-12-01 00:00:00+00',
    '2025-01-05 23:59:59+00',
    true,
    0,
    0,
    now(),
    now()
);

-- Insert festive season coupons
INSERT INTO coupons (
    id,
    owner_id,
    code,
    description,
    discount_type,
    discount_value,
    min_booking_amount,
    max_uses,
    current_uses,
    start_date,
    expiry_date,
    is_active,
    created_at
) VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000', -- System-wide coupons
    'FESTIVE25',
    'Celebrate the holidays with 25% off all rentals this festive season! Perfect for your holiday events and celebrations.',
    'percentage',
    25,
    5000,
    1000,
    0,
    '2024-12-15 00:00:00+00',
    '2025-01-15 23:59:59+00',
    true,
    now()
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'NEWYEAR30',
    'Ring in the new year with incredible savings! Get 30% off premium rentals for your NYE celebrations.',
    'percentage',
    30,
    8000,
    500,
    0,
    '2024-12-28 00:00:00+00',
    '2025-01-10 23:59:59+00',
    true,
    now()
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'HOLIDAY20',
    'Make this holiday season special with our gift-friendly 20% discount on all rental categories.',
    'percentage',
    20,
    3000,
    2000,
    0,
    '2024-12-01 00:00:00+00',
    '2025-01-05 23:59:59+00',
    true,
    now()
);

-- Insert category-specific special offers
INSERT INTO special_offers (
    id,
    owner_id,
    listing_id,
    title,
    description,
    discount_percentage,
    start_date,
    end_date,
    is_active,
    views_count,
    bookings_generated,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    null,
    '🏠 Luxury Apartment Rentals - Festive Deal',
    'Exclusive 35% off luxury apartment rentals for the festive season. Perfect for family gatherings and holiday stays.',
    35,
    '2024-12-20 00:00:00+00',
    '2025-01-15 23:59:59+00',
    true,
    0,
    0,
    now(),
    now()
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    null,
    '🚗 Premium Car Rentals - Holiday Special',
    'Drive in style this festive season with 40% off premium car rentals. Available for NYE and holiday trips.',
    40,
    '2024-12-25 00:00:00+00',
    '2025-01-12 23:59:59+00',
    true,
    0,
    0,
    now(),
    now()
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    null,
    '📸 Event Equipment - Party Ready',
    'Get your event equipment ready for the holidays with 30% off cameras, audio equipment, and more.',
    30,
    '2024-12-10 00:00:00+00',
    '2025-01-08 23:59:59+00',
    true,
    0,
    0,
    now(),
    now()
);

-- Insert category-specific coupons
INSERT INTO coupons (
    id,
    owner_id,
    code,
    description,
    discount_type,
    discount_value,
    min_booking_amount,
    max_uses,
    current_uses,
    start_date,
    expiry_date,
    is_active,
    created_at
) VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'LUXURY35',
    'Exclusive 35% off luxury apartment rentals for the festive season. Perfect for family gatherings and holiday stays.',
    'percentage',
    35,
    15000,
    300,
    0,
    '2024-12-20 00:00:00+00',
    '2025-01-15 23:59:59+00',
    true,
    now()
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'CAR40',
    'Drive in style this festive season with 40% off premium car rentals. Available for NYE and holiday trips.',
    'percentage',
    40,
    10000,
    200,
    0,
    '2024-12-25 00:00:00+00',
    '2025-01-12 23:59:59+00',
    true,
    now()
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'EVENT30',
    'Get your event equipment ready for the holidays with 30% off cameras, audio equipment, and more.',
    'percentage',
    30,
    5000,
    500,
    0,
    '2024-12-10 00:00:00+00',
    '2025-01-08 23:59:59+00',
    true,
    now()
);

-- Display confirmation message
SELECT 'Festive season promotions created successfully!' as status;

-- Show all created promotions
SELECT 
    'Special Offers' as type,
    title,
    discount_percentage as discount,
    start_date::date as valid_from,
    end_date::date as valid_until
FROM special_offers 
WHERE created_at >= now() - interval '1 hour'
UNION ALL
SELECT 
    'Coupons' as type,
    code as title,
    discount_value as discount,
    start_date::date as valid_from,
    expiry_date::date as valid_until
FROM coupons 
WHERE created_at >= now() - interval '1 hour'
ORDER BY type, valid_from;