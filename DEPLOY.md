# Deploying Borderless to Vercel (with your domain)

This puts the site live on the internet, connected to your real Supabase database.
Allow ~20 minutes. No coding required.

> Prerequisite: you've finished `SUPABASE_SETUP.md` (project created, SQL run, you have
> your Project URL + publishable/anon key).

---

## 1. Get the code onto your main branch

The work has been developed on a feature branch. For a production deploy, the simplest
path is to **merge it into `main`** on GitHub (open the branch on GitHub → "Open pull
request" → merge), or just tell me and I can prepare that. Vercel can also deploy directly
from any branch if you prefer.

## 2. Create the Vercel project

1. Go to **https://vercel.com** and sign up with **GitHub** (free "Hobby" plan is fine).
2. Click **Add New… → Project**.
3. **Import** the `nopark1/borderlessapp1` repository.
4. Vercel auto-detects **Next.js** — leave the build settings as-is.

## 3. Add your environment variables (important)

Before clicking Deploy, expand **Environment Variables** and add the same two values from
your `.env.local`:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your `sb_publishable_…` key |

Then click **Deploy**. After ~2 minutes you'll get a live URL like
`https://borderlessapp1.vercel.app`.

## 4. Point Supabase auth at the live URL

So magic-link sign-in works in production:

1. Supabase → **Authentication → URL Configuration**.
2. Set **Site URL** to your Vercel URL (e.g. `https://borderlessapp1.vercel.app`).
3. Under **Redirect URLs**, add `https://borderlessapp1.vercel.app/auth/callback`.
4. Save.

Now open your live URL, sign in, and (first time) set your `members.is_admin = true` in
Supabase → Table Editor to unlock `/admin`.

## 5. Connect your domain (e.g. borderless.kyoto)

1. Buy the domain (any registrar — e.g. Google Domains, Namecheap, Porkbun).
2. In Vercel → your project → **Settings → Domains** → add `borderless.kyoto`.
3. Vercel shows the DNS records to add — copy them into your registrar's DNS settings
   (usually an `A` record and/or a `CNAME`). DNS can take a few minutes to a few hours.
4. Once it's verified, **repeat step 4 above** with the new domain
   (`https://borderless.kyoto` as Site URL, and `https://borderless.kyoto/auth/callback`
   as a redirect URL).

## 6. Install it like an app (PWA)

On your phone, open the live site in the browser → **Share → Add to Home Screen**. It
installs with the Borderless torii icon and opens full-screen like a native app. (No app
store needed.)

---

## Going forward
- Every time changes are pushed to your production branch, Vercel **auto-deploys** the update.
- Secrets live only in Vercel's Environment Variables and your local `.env.local` — never in
  the code. The `anon`/publishable key is safe to expose; your data is protected by the
  Row-Level Security policies we set up.
- For real magic-link email at volume, connect a custom SMTP sender in Supabase →
  Authentication → Emails (optional; the built-in sender works for low volume).
