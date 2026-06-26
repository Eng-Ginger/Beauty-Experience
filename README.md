# Beauty Experience — Sharjah

Luxury ladies salon website. Next.js 14 App Router + Supabase + Ziina hosted-checkout payments.

Founder: Dr. Rana Shehadeh. First Smart Mirror Hair & Beauty Try-On in the UAE.

---

## Tech stack

- **Next.js 14** (App Router, `'use client'` per page where needed)
- **Supabase** — `customers`, `bookings`, `mirror_bookings`, `loyalty_members`
- **Ziina** hosted checkout (api-v2.ziina.com) — full-tab redirect flow
- **Tailwind CSS** — custom palette (off-white, blush, rose, dusty, gold, charcoal, dark)
- **Framer Motion** — scroll reveals + page loader
- **Lenis** — smooth scroll (with `data-lenis-prevent` for modal/calendar internal scroll)
- **Zustand** — modal/UI state (`bookingStore`)
- **JWT (jose)** + bcrypt — customer auth via httpOnly cookie `be_session`
- **react-day-picker v10** — calendar inside booking + admin
- **Zod** — API input validation

---

## Local development

```bash
npm install
npm run dev          # localhost:3000
npm run build        # production build (must pass before deploy)
npx tsc --noEmit     # type-check only
```

### `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ZIINA_API_TOKEN=
ZIINA_WEBHOOK_SECRET=
NEXT_PUBLIC_BASE_URL=http://localhost:3000   # change to prod domain on hosting platform
ADMIN_PASSWORD=
```

`.env.local` is git-ignored. Add the same vars to your hosting platform (Vercel/Netlify) before deploying.

---

## Project structure

```
app/
  page.tsx                          # homepage (hero, sections, modals)
  layout.tsx                        # navbar + providers + smooth scroll
  globals.css                       # body bg #0D0D0D + scrollbar + marquees
  profile/page.tsx                  # customer profile + bookings + membership
  admin/page.tsx                    # admin dashboard (password-gated)
  admin/loyalty/page.tsx            # redirect → /admin
  api/
    auth/         login, logout, me, register
    bookings/     create, list, cancel, availability
    loyalty/      create-intent, confirm, join-free, webhook
    mirror-booking/                 # smart-mirror booking endpoint
    admin/        data, grant, revoke, delete, loyalty/*
components/
  layout/         Navbar, Footer
  sections/       Hero, TechShowcase, Services, NailPrinterShowcase,
                  SmartMirrorSpot, Testimonials, LoyaltySection, AboutSection
  ui/             BookingModal, SmartMirrorModal, LoyaltyModal, AuthModal,
                  Calendar, PaymentStatusBanner, PageLoader, SmoothScroll
lib/
  supabase.ts            # client + admin (service-role) proxies
  auth.ts                # JWT session helpers
  loyaltyTiers.ts        # SOURCE OF TRUTH for tier prices/discounts/perks
  loyaltyActivation.ts   # shared "activate membership + link customer" helper
  ziina.ts               # Ziina API wrappers
  adminRateLimit.ts      # constant-time pwd compare + IP rate limiter
  bookingStore.ts        # Zustand modal/UI state
  useCustomer.ts         # React context reading /api/auth/me
  useScrollLock.ts       # Lenis-aware modal scroll lock
  services.ts            # catalog (categories + items + prices)
public/                   # logo, hero-bg, smart-mirror, nail-art, nail-printer11, mirror-salon
```

---

## Key features

### Booking flow (`BookingModal.tsx`)
5 steps: **service category + item → specialist → date + time → add-ons → confirm**.

- Calendar greys out times where the chosen specialist is already booked (`/api/bookings/availability?date=…&specialist=…`).
- Submit-time conflict check at [app/api/bookings/create/route.ts](app/api/bookings/create/route.ts) blocks (a) same specialist same slot **or** (b) same service same slot → 409 with explicit error message.
- 409 sends user back to the calendar step and refetches availability.
- Add-ons + member discount applied before total. "* Prices are exclusive of VAT" disclaimer on totals.
- Ref-guarded double-click protection.

### Smart Mirror booking (`SmartMirrorModal.tsx`)
Separate flow writing to `mirror_bookings`. Same availability + 409 handling.

### Loyalty memberships
| Tier | Price | Discount | Source |
|---|---|---|---|
| Rose | Free | 5% | [lib/loyaltyTiers.ts](lib/loyaltyTiers.ts) |
| Gold | AED 299 / year | 15% | same |
| Platinum | AED 399 / year | 25% | same |

Flow: customer clicks tier → `LoyaltyModal` → T&C accepted → POST `/api/loyalty/create-intent` → **full-tab redirect** to Ziina checkout → Ziina redirects back to `/profile?membership=BE-M-XXXXXX#membership` → profile page **polls** `/api/loyalty/confirm` every 1.5s for ~12s. The webhook at `/api/loyalty/webhook` is the production confirmation path; the polling is a localhost-friendly resilience layer.

`activateLoyaltyMembership(intentId)` in [lib/loyaltyActivation.ts](lib/loyaltyActivation.ts) is the shared helper used by both webhook and confirm route — it updates `loyalty_members.status='active'` **and** writes `customers.membership_id` (the critical link that powers `/api/auth/me`'s join).

### Customer profile (`app/profile/page.tsx`)
- Profile card + membership card (active / expired with renew CTA / "join inner circle") + bookings list.
- Cancel booking inline.
- Force-dynamic + `<Suspense>` wrapper around `useSearchParams()` (required for the build to pass — see "Build pitfalls" below).

### Admin dashboard (`/admin`)
Password gate (sessionStorage key `adminPassword`, IP rate limiter on the server). Customer Navbar hidden on `/admin/*`.

Four tabs:
- **Bookings** — status filter + DayPicker date-range pills + per-row Delete
- **Mirror Bookings** — per-row Delete
- **Customers** — name/email search + per-row Delete
- **Loyalty Members** — tier + status filter, inline Grant form (email + tier), per-row Revoke (active only) + Delete

Delete on `loyalty_member` pre-clears `customers.membership_id` before deleting the row so no orphan reference is left.

---

## Database schema (Supabase)

### `bookings`
`booking_id` (PK, text), `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `service`, `date` (text YYYY-MM-DD), `time` (text HH:MM), `specialist`, `add_ons` (text[]), `price` (numeric), `status` (`upcoming` | `cancelled` | …)

### `mirror_bookings`
`booking_id` (PK), `name`, `phone`, `email`, `date`, `time`, `skin_concerns` (text[]), `referral_source`

### `customers`
`customer_id` (PK), `name`, `email`, `password_hash` (bcrypt), `phone`, `dob`, `membership_id` (FK to loyalty_members.membership_id, may be null)

### `loyalty_members`
`membership_id` (PK), `ziina_intent_id`, `name`, `email`, `phone`, `dob`, `tier` (`rose` | `gold` | `platinum`), `discount_percent`, `status` (`pending` | `active` | `expired` | `revoked` | `upgraded`), `joined_at`, `expires_at`, `created_at`

### Recommended SQL jobs (run once in Supabase SQL editor)

```sql
-- Daily: flip expired memberships out of 'active'
create or replace function expire_loyalty_memberships() returns void language plpgsql as $$
begin
  update loyalty_members set status = 'expired'
  where status = 'active' and expires_at < now();
end; $$;
select cron.schedule('expire-loyalty-memberships-daily', '0 3 * * *',
  $$ select expire_loyalty_memberships(); $$);

-- Daily: clean abandoned pending signups older than 24h
alter table loyalty_members add column if not exists created_at timestamptz default now();
create or replace function cleanup_abandoned_loyalty_signups() returns void language plpgsql as $$
begin
  delete from loyalty_members
  where status = 'pending' and created_at < now() - interval '24 hours';
end; $$;
select cron.schedule('cleanup-abandoned-loyalty-signups-daily', '0 4 * * *',
  $$ select cleanup_abandoned_loyalty_signups(); $$);
```

Enable `pg_cron` in Supabase Extensions before running the `cron.schedule` calls. Enable RLS on all 4 tables with no public policies — all writes go through `supabaseAdmin` (service role).

---

## Deployment checklist

1. **`NEXT_PUBLIC_BASE_URL`** → set to production domain on hosting platform.
2. **Ziina dashboard** → register webhook URL `https://<prod-domain>/api/loyalty/webhook` and confirm `ZIINA_WEBHOOK_SECRET` matches both sides.
3. **Rotate** `ZIINA_API_TOKEN` and `ADMIN_PASSWORD` (the placeholder `beautyels2025` is weak and was used in development).
4. **Env vars** on hosting platform must include all 8 from `.env.local`.
5. **Supabase RLS** enabled, no public policies.
6. **`npm run build`** must exit clean.
7. **Image assets** in `public/`: `logo.png`, `hero-bg.png`, `smart-mirror.png`, `nail-art.png`, `nail-printer11.png`, `mirror-salon.png` (the homepage will look broken without these).
8. Post-deploy: smoke test booking, duplicate-block 409, signup → profile, loyalty Ziina flow, admin login + tabs, mobile menu, all images load.

---

## Build pitfalls (learned the hard way)

- **`useSearchParams()` in a client component** prerendering bails the build. Fix is on `/profile`: wrap inner component in `<Suspense>` AND `export const dynamic = 'force-dynamic'`. Pattern is in [app/profile/page.tsx](app/profile/page.tsx).
- **`crypto.timingSafeEqual`** throws (not returns false) when buffer lengths differ. Wrap with explicit length check first — see webhook signature verification in [app/api/loyalty/webhook/route.ts](app/api/loyalty/webhook/route.ts).
- **Ziina webhook header** is `X-Hmac-Signature` (case-insensitive via `headers.get`).
- **Ziina checkout pages can't be iframed** — anti-clickjacking header blocks it. Always full-tab redirect via `window.location.href = data.payment_url`.
- **Race in availability**: app-level conflict check at create time + browser polling is the current setup. For DB-level safety, add a partial unique index:
  ```sql
  create unique index bookings_unique_active_slot on bookings (date, time, specialist)
    where status <> 'cancelled';
  ```

---

## Admin routes summary

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/admin/data?table=…` | GET | `Authorization: Bearer <pwd>` | Returns all rows from one of bookings/mirror_bookings/customers/loyalty_members |
| `/api/admin/grant` | POST | `adminPassword` in body | Grant a membership tier to a customer by email |
| `/api/admin/revoke` | POST | `adminPassword` in body | Set `status='revoked'`, clear `customers.membership_id` |
| `/api/admin/delete` | POST | `adminPassword` in body | Permanently delete a booking/customer/mirror_booking/loyalty_member |

All admin endpoints are IP-rate-limited (5 fails / 5 min, in-memory) and use constant-time password comparison.

---

## Things deferred / open

- **DB-level uniqueness on booking slots** — recommended SQL above, not applied yet.
- **Availability route currently only filters by specialist** — service-level conflicts still get blocked at submit-time only.
- **`/api/admin/loyalty/*`** routes still exist alongside the newer `/api/admin/{grant,revoke}` aliases. Re-exports keep both working; safe to drop the older routes once you confirm no external dependency.
- **Console errors** in API routes log error context only (status codes, error.message), not PII. Safe to keep for production debugging.
