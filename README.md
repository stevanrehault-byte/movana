# MOVANA — Cycling Experience Platform

> SaaS + marketplace for cycling experiences in Thailand

## Quick Start
```bash
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- MariaDB (mysql2, raw queries)
- Mapbox GL JS v3.3.0
- JWT auth (jose)

## Structure
```
src/app/api/        — REST API (17 endpoints)
src/app/dashboard/  — Operator dashboard (10 pages)
src/app/login/      — Auth pages
src/components/     — React components
src/lib/            — DB, Auth, Utils
scripts/migrations/ — SQL migrations (run in order)
docs/               — Project documentation
archive/            — Legacy WP plugin (reference)
```

## Documentation

- `docs/MOVANA-REFERENCE.md` — Complete project reference
- `docs/MOVANA-MATRICE-FONCTIONNELLE.md` — Feature matrix
- `docs/MOVANA-DECISIONS-IA.md` — AI system specs
- `.claude/CLAUDE.md` — Context for Claude Code

## Deploy

Hostinger VPS + Nginx + PM2 + Cloudflare
