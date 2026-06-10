# Borderless — Build Handoff

A complete spec for turning the Borderless prototype into a real, persistent web app you can build yourself with an AI coding assistant (Cursor, Claude Code, v0, Lovable, etc.).

---

## 0. Read this first

**What's in this bundle:** a working, clickable **HTML/React prototype** of the whole product — public events site, member area, and admin/finance dashboard, bilingual EN/JP. It is a **design + behavior reference**, not the codebase you ship. The files use in-browser Babel and store data in the browser's `localStorage`. Your job is to **recreate these screens and rules in a real web framework with a real database** — keeping the exact look, the exact formulas, and the exact flows documented below.

**Fidelity: high.** Colors, type, spacing, copy, and interactions are final. Match them closely.

**The target shape (decided with the client):**
- A **single responsive website** — looks great on phones (members) and desktop (admin). **No native iOS/Android apps.** The "phone frame" in the prototype is just a preview; it's the same responsive site.
- **No online payments.** Borderless collects entry fees **in person**. Members RSVP online; an organizer taps **Check in** at the door; that's what records attendance and credits points. **Do not build Stripe or any payment flow.**
- Optionally a **PWA** (add-to-home-screen) so it feels app-like. Pure config, no app stores.

**Recommended stack (easiest path for self-building with AI tools):**
- **Next.js** (React, App Router) + TypeScript — the prototype is already React, so screens port directly.
- **Supabase** — Postgres database + **Auth** (email/password and/or magic link) + Row-Level Security, all managed, free to start. This replaces the entire `localStorage` layer.
- **Vercel** — free hosting, connect the GitHub repo, point a domain (e.g. `borderless.kyoto`) at it.
- Keep the **same CSS** (see `styles.css`) — it's plain CSS variables, no framework lock-in.

> If your AI tool prefers a different but equivalent stack (Remix, SvelteKit, Firebase instead of Supabase), that's fine — the **data model, formulas, and flows in this README are the source of truth**, not the framework.

---

## 1. The three surfaces

| Surface | Who | Device | Auth |
|---|---|---|---|
| **Public site** | Anyone (prospective members) | Mobile-first | None to browse; sign-in to RSVP |
| **Member area** | Logged-in members | Mobile-first | Required |
| **Admin dashboard** | You + organizers | Desktop | Required + `is_admin` role |

In the prototype these are switched with a top toolbar segmented control — **that's a demo aid only.** In the real app:
- Public site is the default at `/`.
- Member area is `/me` (or similar), reached after login.
- Admin is `/admin`, gated to admin accounts.

---

## 2. Data model (build these tables)

Field names mirror the prototype's objects so you can cross-reference `data.js`.

### `events`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid / text | PK |
| `slug` | text | URL-friendly, unique |
| `cover` | text | palette key OR uploaded image URL (see §6) |
| `category` | text | one of: `cultural, food, nightlife, outdoor, workshop, language` |
| `title_en`, `title_jp` | text | bilingual title |
| `date` | date | `YYYY-MM-DD` |
| `time`, `end_time` | text | `HH:MM` |
| `venue_en`, `venue_jp` | text | |
| `area_en`, `area_jp` | text | neighborhood label |
| `price` | int | entry fee in **yen** (drives points + break-even) |
| `capacity` | int | max attendees |
| `cost` | int | **total** event cost in yen (venue+food+supplies) — drives break-even |
| `blurb_en`, `blurb_jp` | text | one-line teaser |
| `desc_en`, `desc_jp` | text | full description |
| `lat`, `lng` | float | for the map pin |
| `invited` | int | how many were invited (denominator for show-rate) |
| `rsvp` | int | current RSVP count |
| `attended` | int / null | **null until checked-in**; set to headcount on check-in |
| `status` | text | `draft` \| `published` \| `completed` |
| `created_by` | uuid | admin who made it |

**Status rules (critical):**
- `draft` — admin-only, hidden from public site and weekend strip.
- `published` — visible everywhere; members can RSVP.
- `completed` — event has happened; `attended` is set. Shows in "Past" tables with finance.
- "Past" / "is past" everywhere in the prototype means **`attended != null`** (equivalently `status === 'completed'`).

### `members` (extends Supabase `auth.users`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | = auth user id |
| `name` | text | |
| `handle` | text | `@aoi` |
| `country` | text | flag/ISO |
| `joined` | date | |
| `is_admin` | bool | gates `/admin` |

Points, tier, streak, attended count are **derived** (see §3 and §4) — don't store stale copies; compute from the ledger / attendance.

### `rsvps`
| Column | Type |
|---|---|
| `id` | uuid |
| `event_id` | fk → events |
| `member_id` | fk → members |
| `created_at` | timestamp |
| `attended` | bool (set true on check-in) |
| `invited_by` | uuid / null (member who invited them — drives invite bonus, §3) |

### `points_ledger` (recommended — makes points auditable)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `member_id` | fk | |
| `event_id` | fk / null | |
| `kind` | text | `participation` \| `invite_fresh` \| `invite_returning` \| `redemption` |
| `points` | int | positive to earn, negative to redeem |
| `created_at` | timestamp | |

A member's **balance = SUM(points_ledger.points)**. This is cleaner than a single mutable counter and lets members see *where each point came from*.

### `rewards` (catalog)
`id, title_en, title_jp, cost (points), tag (popular|limited|null)`. Redeeming inserts a negative `points_ledger` row.

---

## 3. The formulas (copy these EXACTLY — they're the heart of the product)

All defined in `data.js` (`window.BL_DATA`). Reproduce verbatim:

```
YEN_PER_POINT = 100

// Points a member earns for ATTENDING an event — scales with entry fee.
// ¥1,000 event → 10 pts ; ¥2,500 → 25 pts.
pointsFor(event) = Math.floor(event.price / 100)

// Invite bonus — credited to the INVITER when their guest actually attends:
inviteBonus = { fresh: 10, returning: 5 }
//   +10 pts if the guest is brand-new to Borderless
//   +5  pts if it's the guest's 2nd or 3rd time
//   (4th+ time: no bonus)

// Break-even: how many paying attendees cover the event's total cost.
breakEven(event) = event.price > 0 ? Math.ceil(event.cost / event.price) : 0

// Per-event finance:
finOf(event):
    completed = event.attended != null
    revenue   = completed ? attended * price : price * capacity   // projected if not yet held
    costs     = event.cost
    net       = revenue - costs

// Points to award at check-in for an event:
pointsAwarded = attendedCount * pointsFor(event)
```

**Worked examples (use as test cases):**
- ¥2,500 event, cost ¥40,000, capacity 24 → points/attendee = **25**; break-even = `ceil(40000/2500)` = **16** attendees; profit-if-full = `24*2500 - 40000` = **¥20,000**.
- ¥1,000 event → **10** pts/attendee.
- Member attends a ¥3,800 event → earns **38** pts. If they invited a first-timer who showed up, the member also gets **+10**.

---

## 4. Tiers & member stats

```
tiers = [
  { key: "Guest",   min: 0  },
  { key: "Regular", min: 5  },
  { key: "Insider", min: 15 },
]
// tier = highest tier whose `min` <= member's points balance
```
- **Streak** = consecutive events attended without a gap (prototype shows a number; compute from attendance history).
- **Show rate** (admin) = `attended / invited` across past events, as a %.

---

## 5. Screen-by-screen behavior

### PUBLIC SITE (mobile-first)
1. **Hero** — logo brand mark, "Sign in" pill (top-right), headline "Meet Kyoto. Together.", subheading, two playful badges ("new every week", "100+ friends"), **Join free** + **See events** CTAs. Optional photo background (see §6).
2. **This weekend strip** — horizontal-scroll row of the soonest **published** events, each with a countdown sticker ("in 3 days" 🔥), area, and `price · spots-left` on one line. `spots-left = capacity - rsvp`.
3. **Events feed** — Upcoming / Past toggle. Upcoming = published, future-dated, sorted ascending. Cards show cover, category chip, title, date, area, price, spots-left.
4. **Event detail** — full description (bilingual), map pin (`lat`/`lng`), "I'm coming" RSVP (requires login → opens auth in signup mode), recap/gallery for past events.

**Auth entry points:** "Sign in" pill → login mode; "Join free" / "I'm coming" → signup mode. After successful auth, **redirect into the Member dashboard** and persist the session.

### MEMBER AREA (mobile-first)
- **Dashboard**: points balance, tier badge, streak, attended/invited counts, upcoming RSVPs.
- **History**: past events with went/missed.
- **Rewards**: catalog with point costs; redeem if balance ≥ cost (writes a negative ledger row).
- **"How points work"** explainer card: ¥100 = 1 pt, earned on attendance.
- **"Invite a friend"** card: shareable invite code; states the +10 (new) / +5 (returning) bonus.

### ADMIN DASHBOARD (desktop)
- **Overview**: metric cards (active members, invited→came, points issued/redeemed, avg revenue/head) + monthly members/revenue/cost charts.
- **Events tab**: status filter (All / Published / Draft / Past). Cards (upcoming/draft) + table (past, with revenue/costs/net colored). Each row/card has a **⋯ menu**: Edit · Check in (non-past only) · Duplicate · Delete (two-step confirm). **+ New event** button.
- **Create / Edit event** (two-pane "studio"):
  - *Left form:* cover picker (or photo upload), bilingual titles, category chips, date/time, venue & area, **price, capacity, cost, invited**, bilingual write-ups, and a **Repeat** section (cadence: one-time / weekly / biweekly / monthly + occurrences 2–24, with a live date preview; publishing a series creates N independent events).
  - *Right live preview:* the event card as it'll appear, **plus computed**: points/attendee (`price/100`), **break-even attendees** (with a capacity bar that turns red if break-even > capacity), **profit-if-full**, **cost-per-attendee**, projected revenue.
  - Buttons adapt to status: **Publish** (draft→published), **Save draft**, **Save changes**, **Unpublish**.
  - Editing opens the form **fully prefilled**; saving updates everywhere.
- **Check-in screen**: roster of invited members, tap to toggle present/absent, "Mark all"/"Clear all", live attendance ring + **live actual revenue, net, and points to award**. **Finish & record** → sets `status='completed'`, `attended = present count`, writes attendance + participation points (and any invite bonuses) into the ledger. The event moves to Past and feeds all metrics.
- **Duplicate**: clones an event as a **new draft** (`attended` null, `rsvp` 0, "(copy)" appended to titles) — good for recurring events.
- **Members tab**: searchable table (name, country, tier, attended, points, lifetime spend, status active/lapsing), retention metric (% who attended 3+).

---

## 6. Assets & imagery
- **Logo:** `borderless1.jpg` (deep red circular emblem — landmarks + torii). It's only 150×150, fine for the small brand mark; **don't** stretch it as a hero background. For hero/event covers, use real wide photos.
- **Event covers:** the prototype uses named gradient palettes (`matsuri, night, tea, river, food, lantern, sakura, zen`) as placeholders. In production, let admins **upload a photo per event** (store in Supabase Storage, keep the gradient as a fallback).
- **Maps:** the prototype draws a stylized pin from `lat`/`lng`. Swap for a real embed (Google Maps / Mapbox) or keep static — your call.

---

## 7. Design tokens (from `styles.css` — match exactly)

```
--paper:   #F4ECE0    --surface: #FBF6EE    --surface-2: #F1E7D8
--ink:     #2B221E    --ink-soft:#6C5D52    --ink-faint: #9A8B7D
--line:    #E2D5C2    --line-soft:#ECE2D2
--primary: #8A3233 (beni red)   --primary-d:#6E2728   --primary-soft:#F3E1DC
--gold:    #B4893C    --success: #4E7A52    --danger: #B0463C    --info: #3C5A78

--radius: 18px  --radius-sm: 12px  --radius-lg: 26px

Fonts (Google Fonts):
  Display: "Shippori Mincho B1"  (headings, bilingual serif)
  UI:      "Zen Kaku Gothic New" (body/UI)
```
Background is a warm radial washi-paper gradient (see `body` in `styles.css`). Full token set + component classes live in `styles.css` — port it as-is.

---

## 8. Bilingual (EN / JP)
Every user-facing string exists in both languages. The prototype keeps a global language toggle and an `i18n.js` dictionary (`window.BL_I18N`); content objects carry `_en`/`_jp` (or `title_en`/`title_jp`) pairs. In production use any i18n lib (e.g. `next-intl`) seeded from `i18n.js`, and keep bilingual columns on `events` as above. Default language: English, with a visible EN / 日本 toggle.

---

## 9. Replacing the prototype's persistence
The prototype persists to `localStorage` under key `borderless_state_v1` (`{ events, joined, _t }`), seeded once from `data.js`. **Delete all of this** and back the same state with Supabase:
- `events` array → `events` table (queries filtered by `status` per surface).
- `joined` map → `rsvps` table for the logged-in member.
- member identity → Supabase Auth session.
- **Row-Level Security:** public can `select` only `published`/`completed` events; members manage their own `rsvps`; only `is_admin` can insert/update/delete events or run check-in.

---

## 10. Suggested build order
1. Scaffold Next.js + Supabase; port `styles.css` and fonts; static public feed reading from the `events` table (seed it from `data.js`).
2. Supabase Auth + the "Sign in / Join free" flow + post-auth redirect to `/me`.
3. RSVP writes; member dashboard reads points from the ledger.
4. Admin: create/edit/publish/draft + the live-preview formulas (§3).
5. Check-in screen → records attendance + writes ledger (participation + invite bonus).
6. Duplicate/delete, recurrence, members table, charts.
7. PWA manifest + deploy to Vercel + domain.

---

## 11. Files in this bundle
| File | What it is |
|---|---|
| `index.html` | Entry point; loads everything (in-browser Babel — reference only). |
| `styles.css` | **The design system.** Port verbatim. |
| `data.js` | Mock data **+ all formulas** (`pointsFor`, `breakEven`, `finOf`, tiers, rewards). The spec source of truth. |
| `i18n.js` | EN/JP string dictionary. |
| `ui.jsx` | Shared primitives (icons, cover placeholders, mini charts). |
| `public.jsx` | Public site (hero, weekend strip, feed, event detail, auth sheet). |
| `member.jsx` | Member area (dashboard, history, rewards, invite). |
| `admin.jsx` | Admin (overview, events, create/edit studio, check-in, members). |
| `app.jsx` | Shell: state store, persistence layer (replace with Supabase), routing between surfaces. |
| `borderless1.jpg` | Logo emblem. |

Open `index.html` in a browser to see the live reference at any time.
