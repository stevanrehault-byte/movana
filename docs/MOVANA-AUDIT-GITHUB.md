# MOVANA — Audit Complet du Code Existant & Plan GitHub

> **Date** : 5 Février 2026
> **Contexte** : Stévan prépare la mise sur GitHub de tout le dispositif Movana + FreeRide

---

## 1. CE QUI EXISTE — INVENTAIRE

### 📦 movana-deploy (Next.js 16 — LE PLUS COMPLET)

C'est la version de référence. App Next.js complète, prête à déployer sur Hostinger.

**Stack confirmé :**
- Next.js 16.1.6 + React 19 + TypeScript
- Tailwind CSS 4
- MariaDB via mysql2 (pas d'ORM, queries directes)
- JWT auth avec jose (access token 15min + refresh token 30j)
- Mapbox GL JS v3.3.0

**API Routes fonctionnelles (17 endpoints) :**

| Endpoint | Méthodes | Fonction |
|----------|----------|----------|
| `/api/auth/login` | POST | Login email/password |
| `/api/auth/register` | POST | Inscription opérateur |
| `/api/auth/me` | GET | Profil utilisateur connecté |
| `/api/health` | GET | Health check |
| `/api/routes` | GET, POST | Liste/Création routes |
| `/api/routes/mine` | GET | Routes de l'opérateur connecté |
| `/api/routes/[id]` | GET, PUT, DELETE | CRUD route |
| `/api/routes/[id]/pois` | GET, POST | POIs d'une route |
| `/api/vehicles` | GET, POST | Liste/Création véhicules |
| `/api/vehicles/[id]` | GET, PUT, DELETE | CRUD véhicule |
| `/api/bookings` | GET, POST | Liste/Création réservations |
| `/api/bookings/[id]` | GET, PUT | Détail/MAJ réservation |
| `/api/operators` | GET | Liste opérateurs |
| `/api/operators/[idOrSlug]` | GET | Détail opérateur |
| `/api/regions` | GET | Liste régions |
| `/api/partners` | GET, POST | Liste/Création partenaires |
| `/api/notifications` | GET | Notifications |

**Pages Dashboard (10 pages) :**
- `/dashboard` — Vue d'ensemble
- `/dashboard/routes` — Liste des routes
- `/dashboard/routes/new` — Route Builder (Mapbox complet)
- `/dashboard/routes/[id]/edit` — Édition route
- `/dashboard/routes/record` — GPS Recording (PWA)
- `/dashboard/fleet` — Gestion flotte
- `/dashboard/fleet/new` — Ajout véhicule
- `/dashboard/bookings` — Réservations
- `/dashboard/notifications` — Notifications
- `/dashboard/profile` — Profil opérateur

**Landing Page publique :**
- Hero, Routes showcase, How it works, Partners, FAQ, CTA, Footer

**Composants Route Builder (7 fichiers, ~1700 lignes) :**
- RouteBuilder.tsx — Composant principal avec Mapbox
- ToolBar.tsx — Barre d'outils (draw, POI, eraser, snap-to-road, 3D, satellite)
- RoutePanel.tsx — Panneau latéral (infos route, POIs, save)
- PoiModal.tsx — Modal ajout/édition POI
- StatsBar.tsx — Distance, durée, dénivelé
- GPSRecorder.tsx — Enregistrement GPS en temps réel
- Toast.tsx — Notifications UI

### 📦 movana-builder (sous-ensemble)
Contient uniquement les composants du Route Builder. C'est un extract, tout est déjà dans movana-deploy.

### 📦 movana-full (sous-ensemble)
Contient fleet, bookings, notifications, GPS recorder + SQL. Tout est déjà dans movana-deploy.

**→ movana-deploy est la seule source de vérité pour le code Node.js/Next.js.**

### 📦 freeride-platform (WordPress Plugin — 53 000+ lignes)

Plugin WordPress complet, héritage de tout le travail FreeRide Explorer.

**Fonctionnalités clés à porter/récupérer :**

| Feature WP | Lignes | Pertinence Movana |
|------------|--------|-------------------|
| explorer.js (frontend rider) | 4193 | ⭐ Logique terrain mode, navigation, POIs |
| terrain-mode.js | 842 | ⭐ Turn-by-turn, voix, direction arrows |
| design-system.css | 989 | ⚡ Variables CSS, tokens couleurs |
| freeride-platform.php | 3681 | 📋 CPTs, REST API, shortcodes — référence |
| PWA (serviceworker, manifest, app-shell) | ~500 | ⭐ Offline, install prompt |
| Elementor widgets (14 fichiers) | ~3000 | ❌ Plus pertinent (on quitte WP) |
| QR Generator | ~200 | ⭐ À porter en Node.js |
| Rental module (4 classes) | ~2000 | 📋 Logique booking/fleet/véhicules |
| License system | ~300 | ❌ Remplacé par tiers Movana |

### 📄 Base de données (MariaDB)

**2 migrations SQL complètes :**
- `001_init.sql` — users, regions, operators, subscriptions, team_members, routes, route_themes, route_pois, route_reviews, refresh_tokens + seed data (12 régions, 8 thèmes)
- `002_fleet_bookings.sql` — vehicles, addons, customers, delivery_zones, bookings, notifications, partners, operator_pages, rider_sessions, audit_log, push_subscriptions

**Tables manquantes (à créer) :**
- `pages` + `page_versions` + `menus` + `global_sections` + `media` (décrites dans PAGE-BUILDER-ARCHITECTURE.md)
- `promo_codes` (mentionné dans le CDC mais pas dans les migrations)
- `qr_codes` (mentionné dans le CDC)
- `guide_availability` (mentionné dans le CDC)
- `badges` (mentionné dans le CDC)
- `newsletter_subscribers` (mentionné dans le CDC)

### 📄 Documents de référence

| Document | Contenu |
|----------|---------|
| MOVANA-Cahier-Specifications-v1.0.docx | CDC complet : vision, tiers, stack, rôles, features, roadmap |
| MOVANA-PAGE-BUILDER-ARCHITECTURE.md | Architecture GrapesJS, migration 003, composants blocs |
| FreeRide_Experience_Parcours_GPS_v2.docx | Spec business des parcours FreeRide |
| 002_fleet_bookings.sql | Migration fleet/bookings/notifications |

---

## 2. ÉTAT DE MATURITÉ PAR MODULE

```
                    PRÊT   EN COURS   À FAIRE
                    ████   ████████   ████████████████

Auth & Users        ████████████████░░░░░░░░░░░░░░░░  60%
├── Login/Register  ████████████████████████           ✅
├── JWT + Refresh   ████████████████████████           ✅
├── Rôles/Tiers     ██████████░░░░░░░░░░░░░░░░░░░░░░  30% (pas de middleware tier)
└── 2FA             ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%

Routes & Explorer   ████████████████████░░░░░░░░░░░░  65%
├── Route Builder   ████████████████████████████       ✅ (Mapbox, snap, POIs)
├── Import GPX      ████████████████████████████       ✅
├── GPS Recording   ████████████████████████           ✅
├── Route CRUD API  ████████████████████████████       ✅
├── POIs API        ████████████████████████           ✅
├── Terrain Mode    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (existe en WP, à porter)
├── QR Codes        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
└── Reviews         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (table existe)

Fleet Management    ████████████░░░░░░░░░░░░░░░░░░░░  40%
├── Vehicles CRUD   ████████████████████████           ✅
├── Fleet Dashboard ██████████████░░░░░░░░░░░░░░░░░░  45% (liste + ajout)
├── Maintenance     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
└── Calendrier      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%

Bookings            ██████████░░░░░░░░░░░░░░░░░░░░░░  30%
├── Booking CRUD    ████████████████████████           ✅
├── Wizard public   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
├── Paiements       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (Stripe Connect)
├── Guides assign.  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
└── Delivery zones  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%

Hub Public          ██████████████░░░░░░░░░░░░░░░░░░  45%
├── Landing Page    ████████████████████████████       ✅
├── Discovery /exp  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
├── Route detail    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
├── Operator pages  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
└── SEO / i18n      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%

Site Builder (T3)   ████████░░░░░░░░░░░░░░░░░░░░░░░░  25%
├── Architecture    ████████████████████████           ✅ (doc complet)
├── GrapesJS integ  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
└── Subdomain rend  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%

PWA Rider           ████████░░░░░░░░░░░░░░░░░░░░░░░░  25%
├── Service Worker  ████████████████                   ~50% (basique)
├── Manifest        ████████████████████████           ✅
├── Navigation      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (à porter de WP)
└── Offline mode    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%

Infra & DevOps      ██████░░░░░░░░░░░░░░░░░░░░░░░░░░  20%
├── .env config     ████████████████████████           ✅
├── Hostinger setup ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
├── Nginx config    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
├── CI/CD GitHub    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
└── Cloudflare DNS  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
```

---

## 3. STRUCTURE GITHUB RECOMMANDÉE

Vu l'état du code, la recommandation évolue par rapport au doc précédent.
Le CDC prévoit tout dans un seul domaine (`movana.bike` + sous-domaines).
Le code actuel est un Next.js monolithique. **Il faut rester monorepo.**

### Un seul repo : `movana`

```
github.com/stevan-movana/movana/
│
├── .claude/
│   └── CLAUDE.md                    # ← Le fichier magique pour Claude Code
│
├── .github/
│   └── workflows/
│       ├── deploy.yml               # CI/CD → Hostinger
│       └── claude.yml               # Claude Code GitHub Actions
│
├── docs/
│   ├── CDC-v1.0.md                  # Cahier des specs (converti du .docx)
│   ├── ARCHITECTURE.md              # Architecture technique
│   ├── PAGE-BUILDER.md              # Architecture GrapesJS
│   ├── DATABASE.md                  # Schéma DB documenté
│   ├── API.md                       # Documentation API REST
│   ├── FREERIDE-FEATURES.md         # Features WP à porter
│   └── ROADMAP.md                   # Roadmap dev
│
├── scripts/
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   ├── 002_fleet_bookings.sql
│   │   └── 003_page_builder.sql
│   ├── seed/
│   │   └── seed-freeride-operator.sql  # Données test FreeRide
│   └── deploy.sh                    # Script déploiement Hostinger
│
├── src/                             # Next.js app (source de vérité)
│   ├── app/
│   │   ├── api/                     # Toutes les API routes
│   │   ├── dashboard/               # Dashboard opérateur
│   │   ├── login/
│   │   ├── (public)/                # Pages publiques (hub, routes, etc.)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx                 # Landing page
│   │
│   ├── components/
│   │   ├── ui/                      # Composants génériques (boutons, cards...)
│   │   ├── route-builder/           # Route Builder Mapbox
│   │   ├── dashboard/               # Composants dashboard
│   │   ├── public/                  # Composants pages publiques
│   │   └── shared/                  # Logo, Navbar, Footer...
│   │
│   ├── lib/
│   │   ├── db.ts                    # Connection MariaDB
│   │   ├── auth.ts                  # JWT auth
│   │   ├── utils.ts
│   │   ├── mapbox.ts                # Helpers Mapbox
│   │   └── stripe.ts               # Stripe Connect (à créer)
│   │
│   └── types/
│       └── index.ts                 # Types TypeScript partagés
│
├── public/
│   ├── sw.js                        # Service Worker
│   ├── manifest.json                # PWA Manifest
│   └── icons/
│
├── archive/                         # ← Ancien code WP pour référence
│   └── freeride-platform/           # Plugin WP complet (lecture seule)
│       ├── assets/js/explorer.js    # À porter → terrain mode
│       ├── assets/js/terrain-mode.js
│       ├── assets/css/design-system.css
│       └── ...
│
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

### Pourquoi un monorepo unique ?

1. **C'est déjà un monolithe Next.js** — le code actuel utilise les API Routes de Next.js, pas un backend séparé
2. **Le CDC confirme cette approche** — Hostinger VPS avec Nginx reverse proxy vers une seule app Next.js
3. **Les sous-domaines sont gérés par Nginx** — pas par des apps séparées
4. **Simplifier** — tu es dev solo, pas besoin de microservices

### Le dossier `archive/` est crucial

Le plugin FreeRide WordPress contient 53 000 lignes de code avec des features matures qu'il faudra porter progressivement :
- `explorer.js` → Logique front rider, navigation carte
- `terrain-mode.js` → Turn-by-turn, voix, flèches directionnelles
- Design system CSS → Variables couleurs, tokens
- PWA (serviceworker, manifest, app-shell, offline)
- QR Generator
- Logique booking/fleet du module rental

L'avoir dans le repo permet à Claude Code de le lire pour comprendre le comportement attendu quand on porte les features.

---

## 4. CLAUDE.md RECOMMANDÉ

```markdown
# MOVANA — Context for Claude Code

## Identity
- **Project**: Movana — Cycling Experience Platform for Thailand
- **Domain**: movana.bike (+ app.movana.bike, rider.movana.bike, {slug}.movana.bike)
- **Stage**: Pre-launch, target May 2026
- **Developer**: Stévan (solo dev, relocating to Thailand March 2026)

## What Movana IS / IS NOT
- IS: Discovery hub, curation layer, partner-powered SaaS platform
- IS NOT: Tour operator, booking platform, GPX sharing tool
- FreeRide = first test operator (Tier 3), Stévan's local business in Jomtien

## Tech Stack
- **Framework**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: MariaDB on Hostinger (mysql2, raw queries)
- **Auth**: JWT (jose) — access 15min + refresh 30d
- **Maps**: Mapbox GL JS v3.3.0 (directions, map matching, geocoding)
- **Payments**: Stripe Connect Standard (planned)
- **Notifications**: Firebase FCM (planned)
- **Email**: Resend (planned)
- **Deploy**: Hostinger VPS, Nginx, PM2, Cloudflare

## Subscription Tiers (CRITICAL BUSINESS LOGIC)
- T0 FREE: Directory listing, NO routes
- T1 VISIBILITY: Boosted visibility, badge, NO routes  
- T2 EXPERIENCE: Route creation, Explorer, QR codes
- T3 OPERATOR: Booking, fleet, guides, dedicated site, analytics

## User Roles
ADM (Movana Admin), OWN (Owner), OPA (Operator Admin),
OPM (Operator Manager), OPS (Staff), GUI (Guide),
PTR (Partner), USR (User), PUB (Public)

## Database
- Migrations in /scripts/migrations/ (run in order)
- No ORM — raw SQL via mysql2
- UUIDs for all primary keys
- All tables have operator_id for multi-tenancy

## Coding Standards
- TypeScript strict mode
- API routes return JSON with { data } or { error }
- Auth middleware via getAuthUser(req) from lib/auth.ts
- No external UI libraries beyond Tailwind + shadcn patterns
- Mapbox loaded dynamically (script injection, not npm package)
- All user-facing text should support i18n (EN/TH/FR/RU planned)

## File Organization
- /src/app/api/ — REST API (Next.js API routes)
- /src/app/dashboard/ — Operator dashboard (client components)
- /src/app/(public)/ — Public-facing pages (SSR preferred)
- /src/components/ — React components
- /src/lib/ — Shared utilities
- /archive/freeride-platform/ — Legacy WP plugin (reference for feature porting)

## Key Decisions
- Single Next.js app serving all subdomains (Nginx routing)
- No Drizzle/Prisma — raw mysql2 for performance and control
- GrapesJS for page builder (T3 operator sites + Movana global pages)
- PWA for rider experience (no native app)

## What NOT to do
- Don't add paid dependencies
- Don't mix tier logic (strict tier gates)
- Don't create routes without operator ownership
- Don't use Prisma/Drizzle (project uses raw SQL)
- Don't add jQuery
```

---

## 5. ACTIONS IMMÉDIATES

### Cette semaine

1. **Créer le repo GitHub** `stevan-movana/movana`
2. **Copier movana-deploy** comme base dans `/src`
3. **Copier les migrations SQL** dans `/scripts/migrations/`
4. **Placer freeride-platform** dans `/archive/`
5. **Créer le CLAUDE.md** (copier ci-dessus)
6. **Créer le .gitignore** (node_modules, .env.local, .next)
7. **Premier commit + push**

### Avant la Thaïlande (mars)

8. Installer Claude Code en local, tester une session
9. Compléter les migrations SQL manquantes (003, tables manquantes)
10. Middleware tier-aware sur les API routes
11. Page publique `/explore` avec filtres
12. Premier déploiement Hostinger
