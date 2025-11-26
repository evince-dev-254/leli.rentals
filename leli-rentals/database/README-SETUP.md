# Database Setup Guide - Coupons & Special Offers

## 🚀 Quick Setup (3 Steps)

### Step 1: Create Tables
Run these scripts in Supabase SQL Editor **in order**:

1. **Coupons Table**
   ```sql
   -- Copy and paste contents from: add-coupons-table.sql
   ```

2. **Special Offers Table**
   ```sql
   -- Copy and paste contents from: add-special-offers-table.sql
   ```

### Step 2: Verify Tables
Run this verification query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('coupons', 'special_offers');
```

✅ You should see both `coupons` and `special_offers` rows.

### Step 3: Add Sample Data (Optional)
Want to test with holiday promotions?

1. Open `sample-holiday-promotions.sql`
2. **IMPORTANT**: Replace `'YOUR_USER_ID_HERE'` with your actual Clerk user ID
   - Find it in browser console when logged in
   - Or run: `SELECT DISTINCT user_id FROM listings LIMIT 1;`
3. Run the script in Supabase

---

## 📊 What Gets Created

### Coupons Table
Stores discount codes that users enter at checkout:
- `BLACKFRIDAY50` - 50% off Black Friday sale
- `HOLIDAY25` - 25% off entire December
- `NEWYEAR500` - KSh 500 fixed discount
- `CYBERMON40` - 40% off electronics

### Special Offers Table  
Stores automatic promotional banners/badges:
- Black Friday Blowout (50% off, 48 hours)
- Holiday Season Sale (30% off all December)
- New Year Flash Sale (35% off)
- Early Bird Special (20% off)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Both tables exist in Supabase
- [ ] Navigate to `/dashboard/owner/coupons` (should load without errors)
- [ ] Navigate to `/dashboard/owner/special-offers` (should load without errors)
- [ ] If you added sample data:
  - [ ] See 4 coupons in the coupons page
  - [ ] See 4 special offers in the special offers page
  - [ ] All show correct dates and discounts

---

## 🔧 Common Issues

### "Column does not exist" error
- Make sure you're using the **latest** versions of the SQL files
- The files were updated to use: `expiry_date`, `max_uses`, `current_uses`

### "Foreign key violation" on special_offers
- This happens if you try to link to a `listing_id` that doesn't exist
- For owner-wide offers, use `listing_id = NULL`

### "User ID not found" in sample data
- Remember to replace `'YOUR_USER_ID_HERE'` with your actual Clerk user ID
- The user ID looks like: `user_2abc123XYZ...`

---

## 📝 Next Steps

After database setup:

1. **Add Navigation** (optional)
   - Add quick action cards in `/dashboard/owner/page.tsx`
   - Link to coupons and special offers pages

2. **Notification Sound**
   - Replace `public/notification-sound.mp3.txt` with real `.mp3` file
   - Test at `http://localhost:3000/notification-sound.mp3`

3. **Test Features**
   - Create a real coupon from the dashboard
   - Create a special offer
   - Apply coupon at checkout (need to integrate with booking flow)
   - See special offer badge on listings (need to add component to listing cards)

4. **Integration** (requires additional work)
   - Add `<SpecialOfferBadge>` to listing cards
   - Add `<CouponInput>` to checkout page
   - Display special offers on homepage

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `add-coupons-table.sql` | Creates coupons table |
| `add-special-offers-table.sql` | Creates special_offers table |
| `sample-holiday-promotions.sql` | Sample data for testing |
| `README-SETUP.md` | This guide |

---

## 🆘 Need Help?

Check the main walkthrough: `walkthrough.md` in the `.gemini/antigravity/brain/` folder for comprehensive documentation.
