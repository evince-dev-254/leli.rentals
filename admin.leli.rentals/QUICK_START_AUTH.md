# Quick Reference: Admin Authentication Setup

## 🎯 What You Need to Do

### 1️⃣ Create New Clerk Project for Admin
- Go to: https://dashboard.clerk.com/
- Click: **"Add application"**
- Name: **"Leli Admin Dashboard"**
- Copy the two keys you get

### 2️⃣ Update Admin App Environment
**Location**: `admin.leli.rentals/.env.local`

```env
# DIFFERENT Clerk keys (from new admin project)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# SAME Supabase keys (copy from main app)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# API proxy settings
NEXT_PUBLIC_MAIN_API_URL=http://localhost:3000/api
ADMIN_INTERNAL_TOKEN=super-secret-string
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=http://localhost:3001
```

### 3️⃣ Update Main App Environment
**Location**: `leli-rentals/.env.local`

Add this line:
```env
ADMIN_INTERNAL_TOKEN=super-secret-string
```

### 4️⃣ Restart Both Servers
```bash
# Stop both servers (Ctrl+C)
# Then restart them
```

---

## 📋 Checklist

- [ ] Created new Clerk project called "Leli Admin Dashboard"
- [ ] Copied Clerk keys to admin app `.env.local`
- [ ] Copied Supabase keys from main app to admin app `.env.local`
- [ ] Added `ADMIN_INTERNAL_TOKEN` to main app `.env.local`
- [ ] Ensured `ADMIN_INTERNAL_TOKEN` matches in both apps
- [ ] Restarted both dev servers
- [ ] Tested admin login at http://localhost:3001
- [ ] Tested main app at http://localhost:3000

---

## ❗ Important Rules

✅ **Clerk keys** → DIFFERENT in each app (separate projects)  
✅ **Supabase keys** → SAME in both apps (shared database)  
✅ **ADMIN_INTERNAL_TOKEN** → SAME in both apps (for API proxy)

---

## 📁 Files Created for You

1. **`SETUP_ADMIN_AUTH.md`** - Detailed setup guide
2. **`ENV_TEMPLATE_ADMIN.txt`** - Template for admin `.env.local`
3. **`ENV_ADMIN_TOKEN.txt`** - What to add to main app

---

## 🆘 Need Help?

Check **`SETUP_ADMIN_AUTH.md`** for detailed instructions and troubleshooting.
