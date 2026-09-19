# HUSHWORK Reset Systems — Product Requirements Document

**Status:** Build contract
**Version:** 1.1
**Date:** 2026-09-19

## 1. Product definition

HUSHWORK is a direct-to-consumer store for practical objects that help people move cleanly between focused work, decompression, and personal time. The store sells small-batch desk and home goods as individual pieces, coordinated kits, and refillable essentials.

The product is not a gallery, mood board, or interactive art experiment. Every screen should help a customer understand a product, trust the purchase, or complete an order.

**Positioning:** better transitions between the things you have to do and the time that belongs to you.

**Primary customers:** design-conscious professionals, freelancers, remote workers, and gift buyers aged 25–45 who want their routines and spaces to feel considered without buying status objects.

**Business model:** product sales, gift purchases, and repeat purchases of consumables/refills. Curated kits are intentionally deferred until the catalog has enough repeatable components.

## 2. Goals and non-goals

### Goals

- Ship a credible production-style commerce experience on the web.
- Ship a companion Android client using the same API and product data.
- Make the catalog feel real through coherent, high-quality product imagery and useful merchandising.
- Support browsing, search, filtering, product detail, cart, guest checkout, customer accounts, orders, and catalog-backed AI shopping help.
- Keep checkout safe: the server owns price, inventory, order totals, and payment state.
- Make the experience fast, responsive, accessible, and easy to hand off to a client.
- Provide a hosted web URL and a live Android development surface when local tooling allows.

### Non-goals for v1

- Multi-vendor marketplace behavior.
- Microservices, event buses, Redis, or a custom headless CMS.
- Raw card form handling or storing card data.
- Social feeds, loyalty points, subscriptions, or an elaborate personalization engine.
- A full operational ERP. The first admin surface is limited to catalog and order visibility.

## 3. Product scope

### Web routes

| Route | Purpose |
| --- | --- |
| `/` | Product-first storefront home with featured products, kits, trust signals, and a clear path to shop. |
| `/shop` | Searchable catalog with collection, price, stock, and sort controls. |
| `/collections/[slug]` | Merchandised views for Focus, Reset, Travel, Gifts, and Refills. |
| `/product/[slug]` | Product gallery, details, materials, stock, quantity, assurance, and add-to-cart. |
| `/cart` | Editable cart, shipping estimate, discount entry, and checkout handoff. |
| `/checkout` | Address, shipping option, order review, and hosted payment handoff. |
| `/checkout/success` | Confirmed order state and next steps. |
| `/login`, `/signup`, `/forgot-password` | Customer authentication and recovery. |
| `/account` | Profile, saved items, order history, and order detail. |
| `/about`, `/materials`, `/shipping-returns`, `/contact`, `/privacy`, `/terms` | Trust and support content. |
| `/admin` | Protected catalog, stock, and order status tools for staff. |

### Android routes/screens

- Home
- Shop and collection tabs
- Search and filter sheet
- Product detail with image gallery
- Cart
- Checkout handoff to hosted payment
- Login/signup
- Orders and account

The Android client is a first-class companion, not a screenshot wrapper. It uses the same API contract, auth model, product IDs, prices, image URLs, and brand tokens.

## 4. Core user journeys

### Browse to purchase

1. Customer lands on the home page and sees useful products immediately.
2. Customer opens Shop or a collection.
3. Customer searches or filters by intent, price, or availability.
4. Customer opens a product, reviews the gallery/details, chooses quantity, and adds it to bag.
5. Customer edits the bag, sees shipping and the free-shipping threshold, and continues as guest or signed-in customer.
6. Server revalidates product prices and inventory.
7. Customer completes payment through a hosted provider checkout.
8. Verified webhook creates the order and decrements inventory exactly once.
9. Customer sees the order confirmation and can later view it in Account.

### Shopping guide

1. Customer asks a plain-language question such as “a small gift for a new remote worker.”
2. Server sends the question with a compact live catalog context to the AI provider.
3. The assistant returns a short answer and product recommendations limited to available catalog records.
4. If AI credentials are unavailable, the route returns a transparent catalog search result; it never invents products, prices, reviews, or policies.

### Account and order

- Email/password signup and login.
- Revocable secure web sessions.
- Passwords stored as strong one-way hashes.
- Customer sees only their own profile and orders.
- Admin sees operational order data through a server-protected role check.

## 5. Information architecture and UX rules

- The first viewport exposes shopping actions; the brand story stays secondary.
- Navigation is short: Shop, Collections, About, Search, Account, Bag.
- Every product card answers: what is it, what is it for, how much, and is it available?
- Product detail leads with photography and purchase controls before long copy.
- Checkout is a focused task flow with no decorative interruptions.
- Empty, loading, sold-out, error, and success states are designed as real states, not placeholders.
- Guest checkout is available. Account creation can happen after purchase.
- Search and filters preserve URL state so results are shareable and refresh-safe.

## 6. Visual direction

### Thesis

**Quiet utility, precisely merchandised.** HUSHWORK should feel like a well-edited independent retailer: confident typography, product photography with real material detail, strong alignment, and enough whitespace for comparison. It should never look like an art-school microsite or a component-library demo.

### Palette

- Cloud: `#F5F4EF` — primary surface.
- Carbon: `#141515` — type, navigation, primary actions.
- Stone: `#E4E3DD` — borders and secondary surfaces.
- Slate: `#536A82` — restrained collection accent and links.
- Ember: `#C76645` — sparse purchase/attention accent.
- Moss: `#657462` — available/success state.

No texture overlay, fake paper grain, decorative orbits, unexplained dials, or CSS-made product objects.

### Type and layout

- Use a clean grotesk for interface text with a restrained serif only for editorial emphasis.
- Body text is readable at 16px or larger; metadata is never smaller than 12px.
- 12-column desktop grid, 4-column mobile grid, consistent 24px/32px spacing rhythm.
- Product tiles use actual image assets with consistent aspect ratios, crop rules, and alt text.
- Borders are thin and intentional. Corners are modest, not pill-heavy.
- Buttons are rectangular or softly rounded with clear hierarchy.

### Imagery

Each core product has a clean packshot and an in-context lifestyle image. Featured products also carry a distinct detail/use image. The catalog uses one photography language: neutral studio base, directional light, tactile materials, honest shadows, and a controlled cloud/slate/ember palette. Four-image galleries are a future content expansion, not a reason to ship repetitive variants.

### Motion

- Route and section entry: 180–320ms opacity/translate transitions.
- Product gallery: quick crossfade or slide with reduced-motion fallback.
- Bag feedback: one clear confirmation motion, not a persistent floating gimmick.
- Hover: image scale up to 1.02 and subtle metadata shift.
- Respect `prefers-reduced-motion` throughout web and Android.

## 7. Functional requirements

### Catalog

- Server-rendered product data with cached public reads.
- Product records include slug, name, description, category, collection, price in integer cents, stock, materials, care, dimensions, featured state, and active state.
- Product images include role, URL, alt text, sort order, width, height, and focal point.
- Search matches name, description, materials, and collection.
- Inventory never becomes negative.

### Cart

- Cart is usable without an account.
- Cart state persists locally between visits.
- Quantity controls validate positive integers and current stock.
- Server revalidates the cart before payment.
- Free shipping threshold is visible and calculated from server-validated subtotal.

### Checkout and payments

- Create a hosted payment session on the server.
- Never trust client totals, product names, or prices.
- Use idempotency keys for checkout requests and payment events.
- Verify payment webhooks before creating/fulfilling orders.
- Order status values: `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`.
- A missing payment provider configuration is an operational setup error, never a fake successful purchase.

### Authentication and authorization

- Email/password signup, login, logout, and recovery-ready session design.
- HttpOnly, Secure, SameSite cookies for the web.
- Bearer access token support for Android API calls.
- Password hash comparison is constant-time through the chosen password library.
- Admin access is denied by default and checked server-side.
- Rate limit auth, checkout, and AI endpoints.

### AI

- AI assistant is optional but useful: product discovery, gifting, routine-building, and comparison.
- Prompt context is assembled from the active catalog only.
- Assistant cannot change orders, issue refunds, promise shipping, or invent availability.
- Responses include product IDs/links when recommending products.
- Deterministic catalog fallback is labeled as search assistance when a model key is absent.

### Admin

- Staff can view products, update stock/active state, and view/update order status.
- Admin mutations are validated and recorded with actor and timestamp.
- No public route exposes the service database credential.

## 8. API contract

The web app owns the API so browser and Android clients share business rules.

```text
GET    /api/v1/products?query=&collection=&sort=&page=
GET    /api/v1/products/:slug
POST   /api/checkout/session
POST   /api/checkout/webhook
GET    /api/v1/orders
POST   /api/assistant
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/health
```

Protected operations endpoints:

```text
PATCH  /api/admin/products/:slug
PATCH  /api/admin/orders/:id
```

Every write endpoint validates JSON with Zod, returns a stable error shape, and logs a request ID without logging passwords, tokens, or payment data.

## 9. Data model

Core tables:

- `products`
- `product_images`
- `users`
- `sessions`
- `password_reset_tokens`
- `orders`
- `order_items`
- `payment_events`
- `wishlist_items`
- `admin_audit_events`

Money is integer cents. IDs are opaque strings. Foreign keys, unique constraints, stock checks, and indexes belong in the database. Product snapshots are copied into order items so historical orders remain accurate after catalog edits.

## 10. Hosting and operations

- Web/API: Next.js App Router deployed to Vercel or equivalent.
- Database: dedicated hosted Postgres project, never local SQLite in production.
- Product assets: optimized committed assets for the current eight-SKU catalog; the image URL contract is ready for object storage/CDN migration when catalog operations need uploads.
- Android: Expo/React Native with a live development server and EAS-ready build configuration.
- Environments: local, preview, production variables kept separate.
- CI: install, lint, typecheck, build, dependency audit, API/security checks, browser smoke.
- Observability: health endpoint, request IDs, structured server errors, and deployment logs.
- SEO: metadata, canonical product URLs, sitemap, robots, product structured data.

## 11. Security and performance acceptance

- No SQL string interpolation for user input.
- No service keys in client bundles.
- CSP and security headers are active in production.
- Cross-origin write requests are protected by same-origin checks or token rules.
- Auth cookies cannot be read by JavaScript.
- Checkout prices and inventory are re-read inside a transaction.
- Product images use responsive dimensions and lazy loading below the fold.
- Public catalog reads are cacheable; personalized routes are not cached publicly.
- Keyboard navigation, visible focus, semantic headings, alt text, contrast, and reduced motion pass a manual audit.
- No intentional horizontal overflow at 320px, 390px, 768px, or 1440px.

## 12. Delivery gates

### Gate A — Product contract

- This PRD exists in the repo.
- All visible copy and navigation match the reset-systems positioning.
- Prototype-only art and “demo checkout” language are removed.

### Gate B — Professional storefront

- Home, shop, product detail, cart, auth/recovery, checkout, account, support, and admin pages work.
- Product imagery is consistent, real-looking, and sufficiently varied for the current catalog.
- Design works across mobile and desktop with intentional loading/empty/error states.

### Gate C — Production backend

- Hosted Postgres is configured.
- Auth/session paths are secure.
- API validates inputs and enforces server-owned totals/inventory.
- Payment integration is present and refuses to fake success when credentials are absent.

### Gate D — Companion app

- Expo app boots and connects to the hosted API.
- Home, shop, product, cart, auth, and order screens are usable.
- Android development surface is available through Expo Go/emulator or web fallback.

### Gate E — Release

- Hosted web URL is reachable.
- Production build, lint, typecheck, audit, and smoke checks pass.
- GitHub contains the PRD, web app, backend, Android app, setup docs, and environment contract.
- Remaining external setup is documented precisely, never hidden behind demo behavior.

## 13. Intentional v1 simplifications

- One Next.js application owns the web UI and API.
- One hosted Postgres database is enough; no separate service layer.
- Stripe-hosted checkout avoids PCI scope.
- Expo keeps Android delivery fast and shares TypeScript concepts without a second backend.
- Product image metadata stays in Postgres while binary assets live in object storage/CDN.
- Admin is intentionally narrow; expand only when real operational needs appear.
