# Quick Setup Guide

## Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account)
2. Create a new project (or use an existing one)
3. Once your project is ready, go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 2: Update .env.local

Open `.env.local` in your project root and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

**Important:** 
- Use your actual values from Step 1!
- The **Service Role Key** is found in the same API settings page (scroll down to "service_role" key)
- **⚠️ WARNING:** Never commit the Service Role Key to git - it bypasses all security!
- **Unsplash Access Key:** Get it from [Unsplash Developers](https://unsplash.com/developers) (optional, but needed for admin image search feature)

## Step 3: Set Up Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `SUPABASE_SCHEMA.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)

This creates the `prompts` and `favorites` tables with proper security policies.

## Step 4: Restart Dev Server

After updating `.env.local`, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Step 5: Import Seed Data (Optional)

To import the provided CSV file with 90+ prompts:

1. Make sure you have `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (see Step 2)
2. Run the import script:
   ```bash
   node scripts/import-csv-prompts.js
   ```
3. This will parse `scripts/prompts_seed.csv` and insert all prompts into Supabase

**Note:** Don't use Supabase's CSV import UI - it doesn't handle the tags array format correctly. Use the script instead!

## Step 6: Test!

1. Visit http://localhost:3000
2. Try creating a prompt at `/create`
3. Browse prompts at `/browse`
4. Sign in to save favorites (optional - requires Google OAuth setup)

## Optional: Google OAuth Setup

If you want users to sign in with Google:

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials (Client ID and Secret)
4. Add redirect URL: `http://localhost:3000/auth/callback` (for development)

That's it! Your app should now be fully functional.

