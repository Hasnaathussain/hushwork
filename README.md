# HUSHWORK

Useful things for the hours after.

HUSHWORK is a production-style direct-to-consumer store for small-batch objects that help people move between focused work, decompression, and personal time. The web storefront and Android companion use the same catalog, authentication, order, and assistant APIs.

## Product contract

The build is governed by [docs/prd.md](docs/prd.md). The design direction is quiet utility: real product photography, a tightly edited catalog, direct purchase paths, and motion used to clarify state rather than decorate the screen.

## Stack

- Next.js App Router, React, TypeScript, and responsive CSS for the web storefront.
- Hosted Neon Postgres for catalog, images, customers, sessions, orders, payment events, and audit-ready operational data.
- Stripe Checkout and verified webhook order fulfillment. Card data never enters the application.
- Expo / React Native Android companion using the `/api/v1` contract and Expo SecureStore bearer sessions.
- Optional catalog-grounded OpenAI shopping guide with a deterministic fallback when no model key is configured.

## Run the web app

```powershell
npm install
Copy-Item .env.example .env.local
# Set DATABASE_URL and AUTH_SECRET in .env.local.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The production database is initialized from [db/schema.sql](db/schema.sql) and [db/seed.sql](db/seed.sql). Product assets are committed under `public/images/products` so preview deployments are complete without a separate asset service.

Required environment variables:

```text
DATABASE_URL=postgresql://...
AUTH_SECRET=<at least 32 random characters>
NEXT_PUBLIC_APP_URL=https://your-domain.example
```

Optional integrations:

```text
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
RESEND_API_KEY=...
RESEND_FROM_EMAIL=HUSHWORK <hello@your-domain.example>
```

Checkout fails closed with a clear setup message until Stripe keys and the webhook are configured. It never creates a fake order.
Password recovery uses the same fail-safe pattern: set the Resend variables when the client wants real reset email delivery; without them, the API still returns a non-enumerating response and sends nothing.

## Android companion

The Android app is in [mobile](mobile). Install and start its live development server with:

```powershell
npm run mobile:install
npm run mobile:dev
```

For the Android emulator, the default API is `http://10.0.2.2:3000/api/v1`. For a physical device, copy [mobile/.env.example](mobile/.env.example) to `mobile/.env` and set `EXPO_PUBLIC_API_URL` to the HTTPS URL of the hosted web app or a LAN tunnel. The same app can be previewed in a browser with:

```powershell
npm run mobile:web
```

The Android package is `store.hushwork.app`; EAS credentials and Play Store signing are intentionally left to the client’s release account.

## Verification

```powershell
npm run lint
npm run typecheck
npm run build
npm run audit
npm run smoke
npm exec tsc --prefix mobile -- --noEmit
```

`npm run smoke` exercises the real home, catalog, product images, bag, checkout setup failure, assistant, signup, logout, and responsive paths. It writes ignored screenshots to `artifacts/`.

## API surface

```text
GET  /api/health
GET  /api/v1/products?collection=&q=
GET  /api/v1/products/:slug
POST /api/v1/auth/signup
POST /api/v1/auth/login
GET  /api/v1/orders                 # Bearer token
POST /api/checkout/session          # Stripe hosted Checkout
POST /api/checkout/webhook           # Stripe signature required
POST /api/assistant
PATCH /api/admin/products/:slug     # Admin session required
PATCH /api/admin/orders/:id         # Admin session required
```

The server re-reads prices and inventory from Postgres before creating a payment session. The webhook verifies Stripe’s signature, uses an idempotency key, locks stock rows in a transaction, and creates an order once.

## Operations

The protected `/admin` surface manages product stock/visibility and order status. Promote a staff account directly in the hosted database after creating it through the normal signup flow:

```sql
UPDATE users SET role = 'admin' WHERE email = 'staff@your-domain.example';
```

Every admin mutation writes an `admin_audit_events` record. No admin credential or service key is exposed to the browser.

## Deployment checklist

1. Deploy the Next.js project to Vercel (or an equivalent Node host).
2. Add `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and the Stripe variables to the production environment.
3. Point Stripe’s `checkout.session.completed` webhook to `/api/checkout/webhook`.
4. Confirm `/api/health`, signup/login, product images, hosted checkout, and order history on the production URL.
5. Start Expo with the production API URL and create the signed Android build through the client’s EAS/Play accounts.
6. If password recovery is required, add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`, then verify the reset flow on the production domain.
