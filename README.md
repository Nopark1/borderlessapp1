# Borderless

A bilingual (EN/JP) website for **Borderless**, an international events circle in Kyoto.
One responsive site — great on phones for members, on desktop for admin. **No native apps,
no online payments** (entry fees are collected in person).

Built with **Next.js (App Router, TypeScript)**. Supabase (Postgres + Auth) and Vercel
hosting arrive in later phases.

> The full product spec and formulas live in [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) (the
> source of truth). The original clickable prototype is the set of `*.jsx` / `*.js` files at
> the repo root plus `index.html` — open `index.html` in a browser to see the live reference.

## Run it locally

```bash
npm install      # install dependencies (first time only)
npm run dev      # start the dev server
```

Then open **http://localhost:3000** in your browser.

Other commands:

```bash
npm run build    # production build (also type-checks everything)
npm run start    # run the production build
```

## Build phases

- [x] **Phase 1 — Scaffold & design system.** Next.js + TypeScript project, design tokens
  and fonts ported from the prototype, and a static public hero + this-weekend strip +
  events feed reading the seed data. Bilingual EN/JP toggle.
- [x] **Phase 2 — Supabase + database.** Schema for all five tables with Row-Level Security
  (`supabase/migrations/0001_init.sql`), a generated seed (`supabase/seed.sql`), and the
  public feed reads live from the `events` table (published/completed only). Falls back to
  seed data until Supabase is connected. **Setup steps: see [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).**
- [x] **Phase 3 — Auth & member area.** Supabase Auth (passwordless magic link + Google),
  session handling via middleware, a bilingual `/login` flow, and the `/me` member dashboard
  (points summed from `points_ledger`, tier, streak, show-rate, upcoming RSVPs, history,
  rewards). Gated routes redirect to login. See the **Auth** section in `SUPABASE_SETUP.md`.
- [x] **Phase 4 — Admin: events studio.** Admin dashboard gated to `is_admin`: events list
  with status filter (All/Published/Draft/Past), upcoming cards (RSVP + break-even) and a past
  finance table, plus the create/edit **studio** with a live preview computing points/attendee,
  break-even (capacity bar), profit-if-full, projected revenue, and cost/head. Draft↔publish,
  edit-prefilled, duplicate, delete (two-step), and recurrence (weekly/biweekly/monthly).
- [ ] Phase 5 — Check-in & points.
- [ ] Phase 6 — Polish & ship (PWA, Vercel, domain).

## Project layout

```
app/                 Next.js App Router (layout, page, global CSS)
components/           UI components ported from the prototype
lib/
  data.ts            Seed events, categories, tiers, rewards
  formulas.ts        The money/points math — ported EXACTLY from the spec
  i18n.ts            EN/JP string dictionary + date helpers
  types.ts           Shared domain types
  supabase.ts        Supabase client factory (reads env vars)
  events.ts          Event queries (live from Supabase, falls back to seed data)
supabase/
  migrations/        Database schema + Row-Level Security
  seed.sql           Sample data (generated from lib/data.ts)
scripts/gen-seed.ts  Regenerates supabase/seed.sql from lib/data.ts
SUPABASE_SETUP.md    Step-by-step: create the project, run SQL, set env vars
PROJECT_SPEC.md      Build spec / source of truth (from the design handoff)
*.jsx, *.js,         Original clickable React/HTML prototype (reference only; open
index.html           index.html in a browser to view it)
```

### The formulas (the heart of the product — see `lib/formulas.ts`)

- Points earned per attendee = `floor(price / 100)` (¥100 = 1 point)
- Break-even attendees = `ceil(cost / price)`
- Invite bonus = +10 for a brand-new guest, +5 for their 2nd/3rd time
- "Past" everywhere means `attended != null`
