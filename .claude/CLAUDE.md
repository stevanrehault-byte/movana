# MOVANA — Context for Claude Code

## Identity
- **Project**: Movana — Cycling Experience Platform for Thailand
- **Domain**: movana.bike (+ app.movana.bike, rider.movana.bike, {slug}.movana.bike)
- **Stage**: Pre-launch, target May 2026
- **Developer**: Stévan (solo dev, relocating to Thailand March 2026)
- **Full specs**: See /docs/MOVANA-REFERENCE.md

## What Movana IS / IS NOT
- IS: Discovery hub, curation layer, partner-powered SaaS platform
- IS NOT: Tour operator, booking platform, GPX sharing tool
- FreeRide = first test operator (Tier 3), Stévan's local business in Jomtien
- Every route MUST be owned by a partner operator. Movana NEVER competes with partners.

## Tech Stack
- **Framework**: Next.js 16.1.6 + React 19 + TypeScript (App Router)
- **Styling**: Tailwind CSS 4 (design tokens in globals.css)
- **Database**: MariaDB on Hostinger (mysql2, raw queries — NO ORM)
- **Auth**: JWT (jose) — access 15min + refresh 30d
- **Maps**: Mapbox GL JS v3.3.0 (loaded via script injection, NOT npm)
- **Payments**: Stripe Connect Standard (planned)
- **Notifications**: Firebase FCM (planned)
- **Email**: Resend (planned)
- **IA**: Claude API via credits system
- **Deploy**: Hostinger VPS, Nginx reverse proxy, PM2, Cloudflare DNS/CDN/SSL

## Subscription Tiers (CRITICAL BUSINESS LOGIC)
- T0 FREE: Directory listing only, NO routes
- T1 VISIBILITY (299B/mo): Boosted visibility, badge, NO routes
- T2 EXPERIENCE (999B/mo): Route creation, Explorer, QR codes, 50 IA credits/mo
- T3 OPERATOR (2499B/mo): Everything + fleet, booking, guides, site, API, 200 IA credits/mo

## User Roles
ADM (Movana Admin), OWN (Owner), OPA (Operator Admin),
OPM (Operator Manager), OPS (Staff), GUI (Guide),
PTR (Partner), USR (User), PUB (Public)

## Database
- Migrations in /scripts/migrations/ (run in order: 001, 002, 003...)
- No ORM — raw SQL via mysql2 pool (lib/db.ts)
- UUIDs for all primary keys
- All tables have operator_id for multi-tenancy

## Existing Code (working)
- 17 API routes (auth, routes, vehicles, bookings, operators, regions, partners, notifications)
- 10 dashboard pages (overview, routes, fleet, bookings, notifications, profile)
- Route Builder with Mapbox (draw, snap-to-road, GPX import, GPS recording, POIs)
- Landing page (hero, routes, how it works, partners, FAQ, CTA)

## Legacy Reference
- /archive/freeride-platform/ — WordPress plugin (53K+ lines, read-only)
- Key files to port: explorer.js (terrain mode), terrain-mode.js (turn-by-turn)

## Coding Standards
- TypeScript strict mode
- API routes return JSON: { data } or { error }
- Auth middleware: getAuthUser(req) from lib/auth.ts
- No external UI libraries beyond Tailwind + custom components
- Mapbox loaded dynamically (script injection, not npm package)
- All user-facing text should support i18n (EN/TH/FR/RU)
- No paid dependencies ever
- No Prisma/Drizzle (raw SQL only)
- No jQuery
