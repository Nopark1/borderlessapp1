# Phase 2 — Connecting Supabase (step by step)

This guide takes you from zero to a live events feed reading from a real database.
No coding required — you'll click through the Supabase dashboard and copy two values.

Estimated time: ~10 minutes.

---

## 1. Create your Supabase project

1. Go to **https://supabase.com** and click **Start your project** → sign in (GitHub login is easiest).
2. Click **New project**.
   - **Name:** `borderless`
   - **Database Password:** click **Generate a password**, then **copy it somewhere safe** (a password manager). You won't need it day-to-day, but don't lose it.
   - **Region:** pick the one closest to Kyoto — **Northeast Asia (Tokyo)**.
3. Click **Create new project** and wait ~2 minutes while it sets up.

---

## 2. Create the database tables

1. In the left sidebar, click **SQL Editor**.
2. Click **+ New query**.
3. Open the file **`supabase/migrations/0001_init.sql`** from this project, copy **all** of it, and paste it into the editor.
4. Click **Run** (or press Cmd/Ctrl + Enter). You should see **"Success. No rows returned."**

This creates the five tables (`events`, `members`, `rsvps`, `points_ledger`, `rewards`)
and turns on **Row-Level Security** — so the public can only read published events, and
only admins can create or edit them.

---

## 3. Load the sample events

1. Still in the **SQL Editor**, click **+ New query** again.
2. Open **`supabase/seed.sql`**, copy all of it, and paste it in.
3. Click **Run**. This loads the 8 sample events and 4 rewards.

> To check it worked: sidebar → **Table Editor** → **events**. You should see the events.

---

## 4. Connect the website to Supabase

1. In Supabase, go to **Project Settings** (gear icon) → **API**.
2. Find these two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **Project API keys → `anon` `public`** (a long string)
3. In this project, make a copy of **`.env.local.example`** and name it **`.env.local`**.
4. Paste your two values in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-long-anon-key...
   ```

5. Save the file. Stop the dev server if it's running (Ctrl + C) and start it again:

   ```bash
   npm run dev
   ```

6. Open **http://localhost:3000**. The events feed is now coming from your database!
   (To prove it: in Supabase's **Table Editor**, change an event title, refresh the page — it updates.)

---

---

## 5. Auth settings (for sign-in / Join free — Phase 3)

Sign-in uses a **magic link** (we email you a secure link — no passwords). A couple of
quick Supabase settings make it work smoothly:

1. **Allowed redirect URLs.** In Supabase → **Authentication → URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` for now (we'll change it to your real
     domain at deploy time).
   - Under **Redirect URLs**, add `http://localhost:3000/auth/callback` (and later your
     production `https://your-domain/auth/callback`).
2. **Email.** Supabase's built-in email works out of the box for testing (with low rate
   limits and a generic sender). For real launch you'll connect your own email sender
   (SMTP) — we'll do that around deploy time.
3. **Google sign-in (optional).** The "Continue with Google" button only works after you
   enable Google in **Authentication → Providers**. It's fine to skip for now — magic link
   works on its own.

**Make yourself an admin:** sign in once (so your `members` row is created), then in
**Table Editor → members**, find your row and flip **`is_admin`** to `true`. That unlocks
the admin dashboard in Phase 4.

## Notes

- **`.env.local` holds secrets — it is never committed to GitHub** (it's already git-ignored).
- If you skip this setup, the site still runs using built-in sample data, so nothing breaks.
- **Making yourself an admin (needed in Phase 4):** after you sign up in Phase 3, go to
  Supabase → **Table Editor → members**, find your row, and set **`is_admin`** to `true`.
- **Re-loading the seed** is safe to run again — it skips events that already exist.
- If you ever change the sample data in `lib/data.ts`, regenerate the seed with
  `npm run gen:seed` (it rewrites `supabase/seed.sql`).
