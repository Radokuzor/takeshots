# TakeShots — AI Onboarding Guide

TakeShots is a single-product DTC landing page for the **Take V2**, a patented shot holder & straw ($19.99). The site also hosts **Most Likely To**, a free realtime party game, and a one-page **About Us**. That's the whole public site — home, play, about, plus the checkout flow and a private admin order-fulfillment view. There is no multi-product shop, no gift guides, no blog, and no "near me" bar guides — those existed earlier in the project's life and were deliberately removed (see "Removed in the pivot" below). Don't resurrect them without being asked.

Read this before making changes — it covers the stack, where things live, the data model, and known gaps you need to work around rather than "fix" by guessing.

## Stack

- **Next.js 16** (App Router), React 19, TypeScript
- **Supabase** (Postgres) — no ORM, raw `supabase-js` calls. `src/lib/supabase.ts` exports `supabase` (anon key, client-safe) and `supabaseAdmin()` (service role, server-only). Used for the `products` table (legacy — see Data Model), `email_subscribers`, and `orders`.
- **Firebase (Firestore)** — used only for the realtime `/play` party game now. `src/lib/firebase.ts` exports the client SDK `db`, used client- and server-side alike. `firestore.rules` are open (`allow read, write: if true`) since there's no auth system.
- **Stripe** — Checkout is built directly with `@stripe/react-stripe-js` Elements (PaymentIntent-based, not Stripe Checkout Sessions) on `/checkout`. A webhook handler at `src/app/api/webhooks/stripe/route.ts` listens for `payment_intent.succeeded`, writes a row to `orders`, and pings Telegram (`TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`) with the order summary.
- **Clerk** — installed and wraps the app (`ClerkProvider` in `src/app/layout.tsx`) but **not used for anything**. No middleware, no protected routes, no sign-in UI. Treat it as dead code unless you're the one implementing real user auth.
- **Zustand** — `src/lib/cart.ts` holds only `buyNowItem` (a single `{product, quantity}`), set by the homepage's "Buy Now" button right before navigating to `/checkout`. There is no multi-item cart or cart drawer anymore — one product, one purchase flow.
- **Tailwind CSS v4** — imported via `@import "tailwindcss"` in `globals.css`; `tailwind.config.ts` still carries v3-style `theme.extend` (colors/radius) alongside it. Both are in effect.
- No component library (no shadcn/Radix) — everything is hand-built Tailwind + a few shared classes in `globals.css`.
- No tests, no CI config.

## Folder Map

```
src/app/
  layout.tsx            RootLayout: ClerkProvider, Navbar, DiscountModal, Footer, Organization/WebSite JSON-LD
  page.tsx               Homepage — the entire product pitch for the Take V2 (hero, brand story, features, how-it-works, reviews, email capture). Product JSON-LD lives here too.
  about/                  About Us — static page, explicitly says "we're not a gift shop and we're not a game" (the game is a separate offering, not the product)
  play/                   "Most Likely To" party game (Firestore-backed, realtime) — see Firebase-backed features below
  play/create, play/join, play/[code]/  Host/join flow + the game itself (lobby → voting → reveal → ended). These three are noindex (own layout.tsx each) since they're ephemeral/personalized, not content pages.
  checkout/               Stripe Elements checkout for whatever's in `buyNowItem`. noindex (layout.tsx). Redirects to `/` if there's nothing to check out.
  checkout/return/         Post-payment confirmation page (polls `/api/checkout/session-status`)
  admin/                  Order fulfillment dashboard only (`OrdersClient.tsx`) — gated by a cookie, not Clerk. noindex (layout.tsx).
  admin/login/             Password form → POST /api/admin/auth
  admin/analytics/         Analytics dashboard (AnalyticsClient.tsx) — its own password gate (ANALYTICS_PASSWORD, default "test1234"), separate from ADMIN_PASSWORD
ANALYTICS_PASSWORD        — optional, defaults to "test1234"
  admin/analytics/login/   Password form → POST /api/admin/analytics-auth
  privacy/, terms/         Static legal pages
  api/checkout/            Creates a Stripe PaymentIntent from the current buy-now item
  api/checkout/session-status/  Polled by /checkout/return to confirm payment succeeded
  api/subscribe/           Upserts into email_subscribers (discount popup / footer capture)
  api/admin/auth/            Sets the admin_auth cookie
  api/admin/orders/          Reads orders for the admin dashboard
  api/webhooks/stripe/       Verifies signature, writes `orders` row, pings Telegram
  api/analytics/session-end/ AnalyticsTracker beacon endpoint — upserts analytics_sessions (merging snapshots) and pings Telegram once per session
  api/admin/analytics-auth/  Sets/clears the analytics_auth cookie (sha256 of the password, not a bare "1")
  sitemap.ts, robots.ts      Static — just `/`, `/play`, `/about`, `/privacy`, `/terms`. No dynamic content to enumerate anymore.
  icon.tsx, apple-icon.tsx   Dynamically generated favicons (next/og)

src/components/           Navbar, Footer, DiscountModal, GetDiscountButton, EmailCapture,
                           ProductGallery, BrandCarousel, HomeBuyButton, AnalyticsTracker

src/lib/
  supabase.ts            supabase (anon) + supabaseAdmin() (service role) clients
  firebase.ts            Client Firestore instance (db) — used only by /play now
  playGame.ts             /play game actions (createGame, castVote, etc.) + realtime hooks (useGame, usePlayers, useVotes, useRound)
  playerId.ts, gameCode.ts, prompts.ts   /play support (localStorage player id, game code gen, prompt bank)
  stripe.ts              Server Stripe client
  cart.ts                Zustand store holding just `buyNowItem` — no multi-item cart
  telegram.ts             notifyTelegram (HTML parse mode, prefixes the site name — pass visitor text through esc())
  analytics.ts            Client: trackEvent() (window "ts-track" event), attribution in sessionStorage, payload types
  analyticsServer.ts      Server: UA parsing, geo from Vercel/Cloudflare headers, analytics password gate
  analyticsStats.ts       Pure stats computation for /admin/analytics
  types.ts                Product (trimmed — id/name/description/price/photo_url/created_at), EmailSubscriber, CartItem, OrderItem, ShippingAddress, Order, Database types

supabase/schema.sql       Postgres schema. Still defines `products` and `articles` tables from the pre-pivot gift-directory era — see Data Model.
firestore.rules            Source of truth for Firestore rules — deploy via `firebase deploy --only firestore:rules`; nothing does this automatically
```

## Removed in the pivot

The site used to be a general gift-directory (bachelorette/wedding/birthday gift guides, a multi-product shop, city bar guides, an AI-written blog) with an admin panel for generating that content. All of that was deliberately removed because the product is just the Take V2 + the game + an about page. Specifically deleted:

- Routes: `/shop`, `/shop/[id]`, `/gifts/[occasion]`, `/near-me`, `/near-me/[city]`, `/blog`, `/blog/[slug]`
- Components: `ProductCard`, `ProductEmbed`, `ArticlePage`, `HeroCarousel`, `CartDrawer`
- Admin tooling: the Amazon-scrape → Claude product-copy pipeline (`/api/admin/amazon-scrape`), the article generator (`/api/admin/generate-article`), the shot-content generator (`/api/admin/shot-content`), and their supporting upload/delete routes — the admin dashboard is now purely order fulfillment.
- Libs: `src/lib/blog.ts` (local-markdown blog reader), `src/lib/shotContent.ts`, `src/content/blog/*.md`
- The `@anthropic-ai/sdk` and `react-markdown` npm dependencies (nothing left that used them)
- The Firestore `shot_content` collection's rules block (the collection itself was never deleted server-side — see Known Gaps)
- The homepage's Supabase-backed "More Gifts You'll Love" cross-sell section

**If you're asked to touch anything gift/shop/blog-shaped again, confirm scope first** — it may mean resurrecting a deleted feature, which is a bigger decision than it looks (data model, nav, admin tooling, SEO surface all move together), not a small patch.

## Auth — Read This Before Touching Anything Admin-Related

There are two unrelated systems in the codebase; only one is real:

- **Clerk**: scaffolded (`ClerkProvider`, env vars present) but wired to nothing. No middleware.ts, no route protection, no `auth()`/`currentUser()` calls anywhere. Treat it as dead code unless you're the one implementing real user auth.
- **Admin auth (what's actually used)**: a single shared password in `ADMIN_PASSWORD`. `POST /api/admin/auth` checks it and sets an httpOnly `admin_auth=1` cookie (8h). `/api/admin/orders` manually checks `cookies().get("admin_auth")?.value === "1"`. `/admin/page.tsx` redirects server-side to `/admin/login` if the cookie is missing. No CSRF protection, no per-user identity, no rate limiting.

If you're asked to add user accounts, gate a customer-facing feature, or add roles — that's new work, not "connecting the existing Clerk setup," since nothing today assumes Clerk exists.

## Data Model (`supabase/schema.sql`)

- **products** — still defined in the schema from the pre-pivot gift-directory era (`occasion_tag`/`occasion_tags`, `pros`/`cons`/`key_points`, `reviews`, etc.), but **nothing in the app reads or writes this table anymore**. The one product the site sells (the Take V2) is a hardcoded object in `src/app/page.tsx`, not a Supabase row — `HomeBuyButton` builds a synthetic `Product` (`id: "promo-<name>"`) in-memory for the cart/checkout flow. The `Product` type in `src/lib/types.ts` was trimmed to match (`id`, `name`, `description`, `price`, `photo_url`, `created_at`) — it no longer mirrors the full `products` table shape. This table and its Storage bucket (`product-images`) are orphaned data, not deleted — see Known Gaps.
- **articles** — also still in the schema (near-me/blog content), also completely unused by any route now. Orphaned, not deleted — see Known Gaps.
- **email_subscribers** — `email` (unique), `source` (`hero`|`popup`|`footer`|`play_page`), `discount_claimed` (boolean field exists but **nothing ever sets it true** — no discount code system is implemented despite the funnel UI implying one).
- **orders** — the only actively-used data table besides email_subscribers. Written by the Stripe webhook (`payment_intent.succeeded`), read by the admin dashboard. `items` is a jsonb array of `{product_id, name, price, quantity}` built from Stripe PaymentIntent metadata at checkout time, not a foreign key into `products`.
- **analytics_sessions** — one row per browser-tab session (pages, events, scroll, UTM/referrer, device, geo, checkout/purchase flags). Written only by `/api/analytics/session-end` (service role), read by `/admin/analytics`. Checkout also forwards attribution into Stripe PaymentIntent metadata (`ts_*` keys) so the order Telegram message can show the sale's source.
- **game_sessions** — placeholder, still unused; Firestore owns `/play` state, not this table.

RLS: public SELECT on `products`/`articles` (both now moot since nothing queries them), public INSERT on `email_subscribers`. `orders`/`game_sessions` have RLS on with no public policies (service-role only).

## Firebase-backed Features

Firestore is used for exactly one thing now:

**`/play` — "Most Likely To" party game.** Fully realtime (`onSnapshot` listeners), no page reloads: host creates a game (`games/{code}`), players join, vote each round (`games/{code}/rounds/{i}/votes/{playerId}`), scores tally live. No auth — a `localStorage`-persisted UUID (`src/lib/playerId.ts`) is the only identity, and `firestore.rules` are wide open (`allow write: if true`) since there's no auth to check against.

The `shot_content` collection (an AI-generated blog-guide feature, formerly surfaced on `/blog`) was removed along with the blog. Its Firestore rules block was deleted, but the collection itself may still contain old documents — Firestore doesn't clean up on rule removal, so if you're auditing Firestore data directly, expect to find it and know it's dead.

## Known Gaps / Inconsistencies (don't "fix" silently — flag or confirm intent first)

- **Orphaned Supabase tables/storage**: `products`, `articles`, and the `product-images` Storage bucket still exist in the database from before the pivot, with no code path reading or writing them anymore. They weren't dropped because that's a data-loss action beyond what removing frontend routes required — dropping them (or archiving/exporting first) needs an explicit decision from whoever owns the Supabase project.
- **`ANTHROPIC_API_KEY` and `SCRAPERAPI_KEY` are now unused** (their only callers — the amazon-scrape and article-generation routes — were deleted) but are still listed as env vars below and likely still set in `.env.local`. Harmless to leave, safe to remove once you're sure nothing else depends on them.
- **`discount_claimed` and the discount funnel are cosmetic** — email capture works, but no discount code is ever issued or validated anywhere.
- **`loadStripe()` instantiation** — check `HeroCarousel`-era duplication concerns no longer apply (that component is deleted); current callers are `checkout/page.tsx` only, so this is no longer a live issue.
- **`README.md` is empty/placeholder** — this file is the real source of project context.
- No `.env.example` — if you add a new env var, there's no template file to update, just this doc and `.env.local`.

## Design System

- Palette: cream background (`#F5F4F0`), near-black text (`#1A1A1A`), coral/orange accent gradient (`#FF6B35` → `#FF4500`). Bold, uppercase, tight-tracking headline type. Playful party-brand aesthetic — lean into it rather than defaulting to generic SaaS styling.
- Shared utility classes in `globals.css`: `.btn-primary`, `.btn-ghost`, `.tag`, `.headline`, `.card`. Prefer reusing these over inventing new button/card patterns.
- Icons: `lucide-react` throughout.
- `DiscountModal`/`GetDiscountButton` communicate via a global `window` event (`open-discount-popup`) rather than React context — follow that pattern if adding another cross-tree trigger, don't introduce a new context provider for one modal.

## Environment Variables (keys only — see `.env.local` for values)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY,
NEXT_PUBLIC_CLERK_SIGN_IN_URL, NEXT_PUBLIC_CLERK_SIGN_UP_URL,
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL, NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
ADMIN_PASSWORD
SCRAPERAPI_KEY            — unused now, see Known Gaps
ANTHROPIC_API_KEY         — unused now, see Known Gaps
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID
```

## When Adding Features

- **New admin-only route**: copy the `cookies().get("admin_auth")` check from `api/admin/orders/route.ts` — there's no shared middleware or helper for it yet.
- **Anything touching money**: order writes happen only via the Stripe webhook (`payment_intent.succeeded`) — don't add a second write path (e.g. writing an order client-side after checkout) or you'll risk duplicate/inconsistent rows.
- **Touching the buy flow**: there's one product and one `buyNowItem` in the cart store — resist reintroducing a multi-item cart or product catalog unless that's explicitly the ask.
