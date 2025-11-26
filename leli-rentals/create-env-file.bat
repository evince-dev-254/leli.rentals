@echo off
echo ============================================
echo Creating .env.local file...
echo ============================================
echo.

(
echo # ============================================
echo # SUPABASE DATABASE ^(REQUIRED for drafts, listings, favorites^)
echo # ============================================
echo # Get these from: https://supabase.com/dashboard/project/_/settings/api
echo NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
echo.
echo # ============================================
echo # CLERK ^(You already have these - find and add them^)
echo # ============================================
echo NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
echo CLERK_SECRET_KEY=your_clerk_secret_key
echo.
echo # ============================================
echo # GOOGLE MAPS ^(Optional^)
echo # ============================================
echo NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
echo.
echo # ============================================
echo # CLOUDINARY ^(Optional^)
echo # ============================================
echo NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
echo NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
echo.
echo # ============================================
echo # RESEND ^(Optional^)
echo # ============================================
echo RESEND_API_KEY=your_resend_key
echo RESEND_FROM_EMAIL=hello@updates.leli.rentals
) > .env.local

echo.
echo ============================================
echo SUCCESS! .env.local file created!
echo ============================================
echo.
echo Next steps:
echo 1. Open .env.local in your code editor
echo 2. Replace the placeholder values with your actual credentials
echo 3. Follow DATABASE_SETUP_COMPLETE_GUIDE.md for Supabase setup
echo 4. Restart your dev server: npm run dev
echo.
echo Press any key to open .env.local in Notepad...
pause >nul
notepad .env.local

