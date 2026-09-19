# HUSHWORK

Useful things for the hours after.

HUSHWORK is a portfolio-grade, local-first e-commerce experience for small-batch objects: light, scent, table, write, carry, and editions. It pairs an editorial storefront with a real SQLite-backed catalog, password auth, server-side sessions, order creation, and a shopping assistant that works in demo mode without an API key.

## Run locally

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database is created and seeded automatically at `.data/hushwork.db`. It is intentionally gitignored so every environment can own its data.

## Checks

```powershell
npm run lint
npm run typecheck
npm run build
npm run audit
```

## What is included

- Home, shop, product detail, cart drawer, checkout, account, login, and signup flows.
- Server-side catalog and order totals with stock checks inside a SQLite transaction.
- Password hashing with bcrypt and opaque, revocable, HttpOnly sessions.
- Same-origin checks on state-changing endpoints and input validation with Zod.
- Content-security and browser hardening headers.
- A local “After Hours” dial that changes the storefront mood.
- A read-only catalog assistant with deterministic demo fallback and optional OpenAI Responses API support.

For a production launch, move the database to a managed Postgres service, wire a hosted payment provider, add email delivery, and add an external rate limiter. Those are intentionally outside the local portfolio demo so the core flows stay inspectable.
