# Claude Code — Kickoff Prompt for Borderless

Paste the block below as your **first message** to Claude Code, after placing this
`design_handoff_borderless` folder inside an empty project directory and opening it.

Work through it **one phase at a time** — let Claude Code finish and show you a working
result for each phase before saying "continue to the next phase." Don't paste it all and
walk away; review as you go.

---

## THE PROMPT (copy everything below this line)

You are helping me build a real web app from a design handoff. Before writing any code,
read `README.md` in this folder **completely** — it is the source of truth for the data
model, the formulas, the screen behavior, and the design tokens. Also open `data.js`
(the formulas + seed data), `styles.css` (the design system to reuse verbatim), and the
`.jsx` files (reference prototypes of each screen).

Context about me: I am the non-technical founder of "Borderless," an international events
circle in Kyoto. I am building this myself with your help. Explain what you're doing in
plain language, and whenever I need to do something outside the editor (create a Supabase
project, set an environment variable, run a command, deploy), give me exact step-by-step
instructions.

Key product constraints (from the README — do not deviate):
- ONE responsive website (great on phone for members, desktop for admin). NO native apps.
- NO online payments — entry fees are collected in person. Do NOT add Stripe.
- Replace the prototype's localStorage with a real Supabase backend.
- Match the design tokens and fonts in `styles.css` exactly.
- Reproduce the formulas in `data.js` EXACTLY: points = floor(price/100), invite bonus
  +10 new / +5 returning, break-even = ceil(cost/price). Use the worked examples in the
  README as test cases.
- Bilingual EN/JP throughout.

Target stack: Next.js (App Router, TypeScript) + Supabase (Postgres + Auth) + Vercel.
If you'd recommend something different, tell me why first and wait for my okay.

Build in these phases, pausing after each so I can verify before we continue:

PHASE 1 — Scaffold & design system.
Set up the Next.js + TypeScript project, port `styles.css` and the Google Fonts
(Shippori Mincho B1, Zen Kaku Gothic New), and render a static version of the public
hero + events feed using the seed data from `data.js` (hard-coded for now). Goal: it
looks like the prototype in my browser.

PHASE 2 — Supabase + database.
Walk me through creating a Supabase project. Create the tables from the README §2
(events, members, rsvps, points_ledger, rewards) with Row-Level Security. Write a seed
script that loads the events from `data.js`. Make the public feed read live from the
`events` table, showing only `published`/`completed` events.

PHASE 3 — Auth & member area.
Add Supabase Auth (email + magic link). Wire the "Sign in" / "Join free" flow and
redirect into the member dashboard after login. Build the member dashboard reading the
points balance from the points_ledger (sum), plus tier, streak, history, and rewards.

PHASE 4 — Admin: events.
Build the admin dashboard (gated to is_admin accounts): the events list with
status filter, and the create/edit "studio" with the live preview that computes
points/attendee, break-even (with the capacity bar), profit-if-full, and projected
revenue. Include draft/published, edit-prefilled, duplicate, delete, and recurrence.

PHASE 5 — Check-in & points.
Build the check-in roster screen. Finishing it sets status='completed', records
attendance into rsvps, and writes the participation points (and invite bonuses) into
points_ledger. Confirm a member's balance updates correctly.

PHASE 6 — Polish & ship.
Members table + charts on the admin overview, a PWA manifest (add-to-home-screen),
then deploy to Vercel and help me connect a domain.

Start with Phase 1 now. Before you begin, briefly confirm your understanding of the
project and the stack, then proceed.

---

## Tips while you work with Claude Code
- **Go phase by phase.** After each phase, actually open the app and click around before continuing.
- **Keep the prototype open** in a browser tab (open `index.html`) as your visual target.
- **When something looks off,** tell Claude Code "compare against the prototype in `public.jsx`/`admin.jsx`" — it can read the reference.
- **Commit to GitHub often** (Claude Code can do this for you) so you can always roll back.
- **Test the money math early** using the worked examples in README §3 — that logic is the heart of the app.
- **Secrets:** your Supabase keys go in `.env.local` (Claude Code will tell you which) — never paste them into public files.
