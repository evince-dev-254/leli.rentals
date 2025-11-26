-- Fix notification types check constraint
-- The previous schema had a restrictive check constraint that caused 400 errors
-- when inserting notifications with types like 'welcome', 'favorite', etc.

-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add a new, more inclusive constraint
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'message', 
  'booking', 
  'system', 
  'verification', 
  'subscription', 
  'review', 
  'welcome', 
  'favorite', 
  'listing', 
  'listing_status', 
  'payment', 
  'reminder'
));
