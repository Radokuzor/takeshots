# TakeShots — AI Onboarding Guide

TakeShots is a gift/product directory: occasion-based gift guides (bachelorette, wedding, birthday, etc.) with a Stripe-powered shop, AI-generated blog/city content, and an admin panel where products and articles are created largely via Claude.

Read this before making changes — it covers the stack, where things live, the data model, and known gaps/inconsistencies you need to work around rather than "fix" by guessing.

## Stack

- **Next.js 16** (App Router), React 19, TypeScript
- **Supabase** (Postgres) — no ORM, raw `supabase-js` calls. `src/lib/supabase.ts` exports `supabase` (anon key, client-safe) and `supabaseAdmin()` (service role, server-only)
- **Stripe** — Checkout Sessions only (no webhook handler — see Gaps below)
- **Clerk** — installed and wraps the app (`ClerkProvider` in `src/app/layout.tsx`) but **not used for anything**. No middleware, no protected routes, no sign-in UI. Don't assume Clerk auth exists anywhere.
- **Anthropic SDK** (`claude-sonnet-4-6`) — powers the admin panel's product-copy generation and article writing
- **ScraperAPI** — server-side Amazon page scraping (product details + reviews) via raw `fetch` + regex, no scraping library
- **Zustand** — cart store (`src/lib/cart.ts`), persisted to `localStorage` as `takeshots-cart`
- **Tailwind CSS v4** — imported via `@import "tailwindcss"` in `globals.css`; `tailwind.config.ts` still carries v3-style `theme.extend` (colors/radius) alongside it. Both are in effect.
- No component library (no shadcn/Radix) — everything is hand-built Tailwind + a few shared classes in `globals.css`.
- No tests, no CI config.

## Folder Map

```
src/app/
  layout.tsx            RootLayout: ClerkProvider, Navbar, CartDrawer, DiscountModal, Footer
  page.tsx               Homepage
  shop/                  Shop grid (client-side occasion filter, fetches ALL products, no pagination)
  shop/[id]/              Product detail page
  gifts/[occasion]/       Statically generated (generateStaticParams) per-occasion gift guides
  near-me/[city]/          City gift-guide pages — renders an `articles` row of category "near_me"
  blog/[slug]/             Blog post — renders an `articles` row of category "blog"
  play/                   Placeholder "coming soon" page (future drinking-game feature), email waitlist only
  admin/                  Admin dashboard (products + articles CRUD, AI tools) — gated by a cookie, not Clerk
  admin/login/             Password form → POST /api/admin/auth
  api/checkout/            Creates Stripe Checkout Session
  api/subscribe/           Upserts into email_subscribers
  api/products/[id]/enrich/  Lazy Amazon-review fetch + cache
  api/admin/*               All require the admin_auth cookie (see Auth below)

src/components/           Navbar, Footer, CartDrawer, ProductCard, ProductEmbed,
                           HeroCarousel, ArticlePage (shared blog/near-me renderer),
                           DiscountModal, GetDiscountButton, EmailCapture

src/lib/
  supabase.ts            supabase (anon) + supabaseAdmin() (service role) clients
  stripe.ts              Server Stripe client
  cart.ts                Zustand cart store
  types.ts               Product, Article, EmailSubscriber, CartItem, Database types

supabase/schema.sql       Source of truth for the DB schema + RLS policies
```

## Auth — Read This Before Touching Anything Admin-Related

There are two unrelated systems in the codebase; only one is real:

- **Clerk**: scaffolded (`ClerkProvider`, env vars present) but wired to nothing. No middleware.ts, no route protection, no `auth()`/`currentUser()` calls anywhere. Treat it as dead code unless you're the one implementing real user auth.
- **Admin auth (what's actually used)**: a single shared password in `ADMIN_PASSWORD`. `POST /api/admin/auth` checks it and sets an httpOnly `admin_auth=1` cookie (8h). Every `/api/admin/*` route manually checks `cookies().get("admin_auth")?.value === "1"`. `/admin/page.tsx` redirects server-side to `/admin/login` if the cookie is missing. No CSRF protection, no per-user identity, no rate limiting.

If you're asked to add user accounts, gate a customer-facing feature, or add roles — that's new work, not "connecting the existing Clerk setup," since nothing today assumes Clerk exists.

## Data Model (`supabase/schema.sql`)

- **products** — `name`, `description`, `price`, `photo_url` + `photo_urls[]`, `amazon_asin`, `pros/cons/key_points[]`, `reviews jsonb` (`{stars, title, body}[]`), `featured`. Two occasion fields coexist:
  - `occasion_tag` (single, legacy, check-constrained to 7 values) — still what `/gifts/[occasion]` filters on
  - `occasion_tags[]` (newer, multi-tag) — what `/shop` filters on
  - Every write path (admin product create/update) keeps `occasion_tag = occasion_tags[0]` in sync. **If you add a new write path for products, you must sync both fields or `/gifts/[occasion]` will silently drop products.**
- **articles** — `title`, `slug` (unique), `category` (`near_me` | `blog`), `city` (near_me only), `body` (Markdown with `{{product:<uuid>}}` embed placeholders — `ArticlePage.tsx` regex-splits on these and interleaves `ProductEmbed` components), `tags[]`, `related_slugs[]`.
- **email_subscribers** — `email` (unique), `source` (`hero`|`popup`|`footer`|`play_page`), `discount_claimed` (boolean field exists but **nothing ever sets it true** — no discount code system is implemented despite the funnel UI implying one).
- **orders** — exists in schema, has a `status` enum, but **no code path ever writes to it**. See Gaps below.
- **game_sessions** — placeholder for the future `/play` feature; schema comment notes "Firebase will own this later." Not used yet.

RLS: public SELECT on `products`/`articles`, public INSERT on `email_subscribers`. `orders`/`game_sessions` have RLS on with no public policies (service-role only).

## The AI Content Pipelines (core of the admin panel)

1. **Product enrichment** (`POST /api/admin/amazon-scrape`): admin pastes an Amazon URL → ScraperAPI fetches the product + review pages → regex extracts title/price/bullets/images/reviews → Claude turns that into structured product JSON (name, description, key_points, pros, cons) grounded in the real scraped copy → admin reviews and saves via `/api/admin/products`. Images get re-uploaded into Supabase Storage bucket `product-images`, falling back to the original Amazon CDN URL if upload fails.
2. **Article generation** (`POST /api/admin/generate-article`): admin picks products + a prompt → Claude writes a full Markdown article, embedding `{{product:<uuid>}}` placeholders where relevant → saved to `articles`.
3. **Review backfill** (`GET /api/products/[id]/enrich`): if a product has an `amazon_asin` but no cached `reviews`, this lazily scrapes and caches them on first product-page view.

If you're asked to change how products or articles are generated, these three routes are the whole system — there's no separate ingestion pipeline elsewhere.

## Known Gaps / Inconsistencies (don't "fix" silently — flag or confirm intent first)

- **No Stripe webhook handler.** `STRIPE_WEBHOOK_SECRET` is defined in env but unused. Checkout Sessions are created and money is charged, but nothing ever writes to the `orders` table, sends a confirmation, or reconciles payment status. There's no success/confirmation page either — success/cancel just redirects to `/shop?success=1`/`?cancelled=1`.
- **Cart isn't cleared after successful checkout** — it's only cleared by explicit user action in the UI.
- **`discount_claimed` and the discount funnel are cosmetic** — email capture works, but no discount code is ever issued or validated anywhere.
- **`loadStripe()` is instantiated redundantly** in ~5 components (`ProductCard`, `ProductDetailClient`, `CartDrawer`, `HeroCarousel`, `ProductEmbed`) instead of a shared client module.
- **No search feature** — `/shop` filtering is occasion-only, client-side, over the entire unpaginated product set.
- **`/near-me` cities are hardcoded** to Austin/Houston/Dallas in both the index page and homepage, not driven by the `articles` table.
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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (unused)
ADMIN_PASSWORD
SCRAPERAPI_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_SITE_URL
```

## When Adding Features

- **New product fields**: update `supabase/schema.sql`, `src/lib/types.ts`, and both `POST`/`PUT` handlers in `src/app/api/admin/products/route.ts` — nothing here is generated from the schema.
- **New occasion**: update the check constraint in `supabase/schema.sql`, the occasion list used by `/shop` filtering and `/gifts/[occasion]/generateStaticParams`, and `OCCASION_META` (SEO copy) in the gifts page.
- **New admin-only route**: copy the `cookies().get("admin_auth")` check from an existing `api/admin/*` route — there's no shared middleware or helper for it yet.
- **Anything touching money**: remember there's currently no order persistence or webhook — if the task is order-related, you likely need to build that from scratch, not extend something that exists.
