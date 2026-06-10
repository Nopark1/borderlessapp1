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
- [ ] Phase 2 — Supabase + database (live events feed).
- [ ] Phase 3 — Auth & member area.
- [ ] Phase 4 — Admin: events studio.
- [ ] Phase 5 — Check-in & points.
- [ ] Phase 6 — Polish & ship (PWA, Vercel, domain).

## Project layout

```
app/                 Next.js App Router (layout, page, global CSS)
components/           UI components ported from the prototype
lib/
  data.ts            Seed events, categories, tiers, rewards (Phase 1: hard-coded)
  formulas.ts        The money/points math — ported EXACTLY from the spec
  i18n.ts            EN/JP string dictionary + date helpers
  types.ts           Shared domain types
PROJECT_SPEC.md      Build spec / source of truth (from the design handoff)
*.jsx, *.js,         Original clickable React/HTML prototype (reference only; open
index.html           index.html in a browser to view it)
```

### The formulas (the heart of the product — see `lib/formulas.ts`)

- Points earned per attendee = `floor(price / 100)` (¥100 = 1 point)
- Break-even attendees = `ceil(cost / price)`
- Invite bonus = +10 for a brand-new guest, +5 for their 2nd/3rd time
- "Past" everywhere means `attended != null`
