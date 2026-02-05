# MOVANA — Document de Référence Technique

> **Version** : 2.0 — 5 Février 2026
> **Auteur** : Stévan Rehault
> **Statut** : Source de vérité — Ce fichier remplace tous les échanges précédents

---

## 1. IDENTITÉ DU PROJET

### Qu'est-ce que MOVANA ?

MOVANA est une **plateforme SaaS + marketplace** dédiée aux expériences cyclistes en Thaïlande. Elle connecte les opérateurs de cyclotourisme avec les riders à travers un hub de découverte structuré.

**Ce que MOVANA EST :**
- Un hub de découverte d'expériences cyclistes
- Une couche de curation et de qualité
- Une plateforme propulsée par les partenaires opérateurs

**Ce que MOVANA N'EST PAS :**
- Un tour operator
- Une plateforme de booking prioritaire
- Un outil de partage GPX communautaire

**Règle fondamentale** : Chaque route DOIT être créée et possédée par un partenaire opérateur. MOVANA ne concurrence JAMAIS ses partenaires.

### Distinction FreeRide vs MOVANA

| Aspect | FreeRide | MOVANA |
|--------|----------|--------|
| Type | Opérateur local (business de Stévan) | Plateforme SaaS nationale |
| Cible | B2C : touristes et expats Jomtien | B2B : opérateurs + B2C : discovery |
| Domaine | freeride-jomtien.com | movana.bike |
| Relation | FreeRide EST un partenaire T2/3 de MOVANA | MOVANA fournit l'infrastructure |

### Contexte personnel

- **Développeur** : Stévan (solo dev)
- **Relocalisation** : Thaïlande, Mars 2026
- **Lancement** : Mai 2026
- **Smart Visa** : Le projet sert de fondation pour la demande

---

## 2. STACK TECHNIQUE (CONFIRMÉ)

### Technologies

| Couche | Choix | Détail |
|--------|-------|--------|
| Framework | Next.js 16.1.6 | React 19, TypeScript, App Router |
| Styling | Tailwind CSS 4 | @tailwindcss/postcss |
| Database | MariaDB | Hostinger, mysql2, queries raw (PAS d'ORM) |
| Auth | JWT (jose) | Access token 15min + Refresh token 30j |
| Maps | Mapbox GL JS v3.3.0 | Directions, Map Matching, Geocoding, Elevation |
| Paiements | Stripe Connect Standard | OAuth, paiement direct opérateur, 0% commission MVP |
| Notifications | Firebase FCM | Push (planifié) |
| Email | Resend | Transactionnels multi-langue (planifié) |
| Deploy | Hostinger VPS | Nginx, PM2, Node.js 20 LTS |
| DNS/CDN/SSL | Cloudflare | Wildcard *.movana.bike |
| CI/CD | GitHub Actions | Push → build → deploy |
| IA | Claude API (Anthropic) | Système de crédits opérateur |

### Architecture domaines

| Domaine | Application |
|---------|-------------|
| movana.bike | Portail public (landing, discovery, routes, blog) |
| app.movana.bike | Dashboard opérateurs |
| api.movana.bike | Inutile — les API Routes Next.js servent déjà de backend |
| rider.movana.bike | PWA navigation terrain |
| {slug}.movana.bike | Sites opérateurs T3 |

> **Note** : Le code actuel est un Next.js monolithique avec API Routes intégrées. Nginx route les sous-domaines vers la même app Next.js.

### Design System

```css
--teal-deep: #3B7689;    /* Couleur primaire */
--emerald: #68B59B;      /* Secondaire */
--mint: #92D99E;         /* Accent */
--off-white: #F7FAF9;    /* Fond */
--dark: #1F2E2B;         /* Texte */
--secondary-text: #5E726E;
--gold: #E8B86D;         /* CTA / highlight */
--coral: #E07A5F;        /* Alerte / action */
```

Polices : Plus Jakarta Sans (body), Outfit (headings)

---

## 3. MODÈLE D'ABONNEMENT

### Tiers

```
T0 — FREE              0 ฿/mois     Annuaire basique, AUCUNE route
T1 — VISIBILITY       299 ฿/mois    Visibilité boostée + badge
T2 — EXPERIENCE       999 ฿/mois    Routes + Explorer + 50 crédits IA/mois
T3 — OPERATOR       2,499 ฿/mois    Tout + Flotte + Booking + Site + API + 200 crédits IA/mois
```

### Add-ons (T3 uniquement)

```
Domain custom      +500 ฿/mois
White Label       +1,500 ฿/mois     Aucune mention Movana
Recharge IA 200cr  +299 ฿ (one-shot)
Clé API propre     = crédits illimités (0 ฿ extra)
```

### Règles absolues tiers

- Pas de route sans T2+
- Pas de route sans propriété partenaire
- "Powered by Movana" badge visible partout (sauf White Label)
- Routes illimitées dès T2 (le gap T2→T3 = flotte + booking + site)
- Commission 0% au MVP

---

## 4. RÔLES & PERMISSIONS

| Code | Rôle | Description |
|------|------|-------------|
| ADM | Movana Admin | Staff interne, tout contrôle |
| OWN | Owner | Propriétaire compte opérateur, facturation |
| OPA | Operator Admin | Gère tout sauf facturation |
| OPM | Operator Manager | Opérations quotidiennes |
| OPS | Operator Staff | Réservations assignées |
| GUI | Guide | Voit ses missions uniquement |
| PTR | Partner | Partenaire local (resto, hôtel) |
| USR | User (Rider) | Compte optionnel (avis, historique) |
| PUB | Public | Visiteur anonyme |

---

## 5. BASE DE DONNÉES

### Migrations existantes (appliquées)

**001_init.sql** — Tables fondamentales :
- `users` — Comptes authentifiés (email, password_hash, role)
- `regions` — 12 régions Thaïlande (Pattaya, Bangkok, Chiang Mai, etc.)
- `operators` — Compte opérateur (tier, stripe, region, profil)
- `subscriptions` — Abonnements Stripe
- `team_members` — Membres équipe opérateur
- `routes` — Parcours cyclistes (GeoJSON, stats, difficulté)
- `route_themes` — 8 thématiques (Beach, Temples, Nature, Food, etc.)
- `route_theme_links` — Liaison many-to-many route↔thème
- `route_pois` — Points d'intérêt sur les routes
- `route_reviews` — Avis riders (5 critères)
- `refresh_tokens` — JWT refresh tokens

**002_fleet_bookings.sql** — Tables fleet & booking :
- `vehicles` — Véhicules (type, pricing multi-durée, specs, maintenance)
- `addons` — Accessoires/services (siège bébé, casque, GPS, assurance)
- `customers` — CRM light
- `delivery_zones` — Zones livraison avec polygones GeoJSON
- `bookings` — Réservations (workflow 8 statuts, pricing complet)
- `notifications` — Notifications multi-canal
- `partners` — Partenaires locaux
- `operator_pages` — Pages custom vitrine
- `rider_sessions` — GPS recordings PWA
- `audit_log` — Journal actions
- `push_subscriptions` — Abonnements push FCM

### Tables manquantes (à créer)

- `ia_credits` — Solde crédits IA par opérateur
- `ia_usage_log` — Historique consommation IA
- `promo_codes` — Codes promotionnels
- `qr_codes` — QR codes routes
- `guide_availability` — Disponibilités guides
- `badges` — Badges opérateurs (Verified, Top Rated, etc.)
- `newsletter_subscribers` — Abonnés newsletter
- `pages` + `page_versions` + `menus` + `global_sections` + `media` — Page builder

---

## 6. CODE EXISTANT — INVENTAIRE

### Repo GitHub : `stevanrehault-byte/movana-landing`

**Ce qui est déployé sur Hostinger (movana.bike).**
Historiquement, c'est un repo séparé créé parce que Hostinger ne supporte pas les monorepos.

### Repo GitHub : `stevanrehault-byte/movana`

**Le monorepo principal.** Contient des fichiers qui ne sont pas tous à jour par rapport à movana-landing.

### Source de vérité du code : `movana-deploy` (zip fourni)

C'est la version la plus complète et à jour. Voici ce qui existe :

#### API Routes fonctionnelles (17 endpoints)

| Endpoint | Méthodes | Statut |
|----------|----------|--------|
| `/api/auth/login` | POST | ✅ Fonctionnel |
| `/api/auth/register` | POST | ✅ Fonctionnel |
| `/api/auth/me` | GET | ✅ Fonctionnel |
| `/api/health` | GET | ✅ Fonctionnel |
| `/api/routes` | GET, POST | ✅ Fonctionnel |
| `/api/routes/mine` | GET | ✅ Fonctionnel |
| `/api/routes/[id]` | GET, PUT, DELETE | ✅ Fonctionnel |
| `/api/routes/[id]/pois` | GET, POST | ✅ Fonctionnel |
| `/api/vehicles` | GET, POST | ✅ Fonctionnel |
| `/api/vehicles/[id]` | GET, PUT, DELETE | ✅ Fonctionnel |
| `/api/bookings` | GET, POST | ✅ Fonctionnel |
| `/api/bookings/[id]` | GET, PUT | ✅ Fonctionnel |
| `/api/operators` | GET | ✅ Fonctionnel |
| `/api/operators/[idOrSlug]` | GET | ✅ Fonctionnel |
| `/api/regions` | GET | ✅ Fonctionnel |
| `/api/partners` | GET, POST | ✅ Fonctionnel |
| `/api/notifications` | GET | ✅ Fonctionnel |

#### Pages Dashboard (10 pages)

| Page | Chemin | Statut |
|------|--------|--------|
| Vue d'ensemble | `/dashboard` | ✅ |
| Liste routes | `/dashboard/routes` | ✅ |
| Route Builder Mapbox | `/dashboard/routes/new` | ✅ (complet avec snap-to-road, POIs, import GPX) |
| Édition route | `/dashboard/routes/[id]/edit` | ✅ |
| GPS Recording | `/dashboard/routes/record` | ✅ |
| Gestion flotte | `/dashboard/fleet` | ✅ |
| Ajout véhicule | `/dashboard/fleet/new` | ✅ |
| Réservations | `/dashboard/bookings` | ✅ |
| Notifications | `/dashboard/notifications` | ✅ |
| Profil opérateur | `/dashboard/profile` | ✅ |

#### Composants Route Builder (7 fichiers, ~1700 lignes)

- `RouteBuilder.tsx` — Composant principal Mapbox (draw, snap-to-road, 3D, satellite)
- `ToolBar.tsx` — Barre d'outils
- `RoutePanel.tsx` — Panneau latéral (infos route, POIs, save)
- `PoiModal.tsx` — Modal ajout/édition POI (11 catégories)
- `StatsBar.tsx` — Distance, durée, dénivelé
- `GPSRecorder.tsx` — Enregistrement GPS temps réel
- `Toast.tsx` — Notifications UI

#### Landing Page publique

Sections : Hero, Routes showcase, How it works, Partners, FAQ, CTA, Footer

#### Auth système

- `lib/auth.ts` — JWT avec jose (sign, verify, getAuthUser, requireRole)
- `lib/db.ts` — Pool MariaDB avec helpers (query, queryOne, execute)
- `AuthProvider.tsx` — Context React (user, operator, token, logout)

### Legacy WordPress : `freeride-platform` (53 000+ lignes)

**Placé dans /archive/ — lecture seule, référence pour portage.**

Features à porter :
- `explorer.js` (4193 lignes) — Logique terrain mode, navigation, POIs
- `terrain-mode.js` (842 lignes) — Turn-by-turn, voix, flèches directionnelles
- `design-system.css` (989 lignes) — Variables CSS, tokens
- PWA (serviceworker, manifest, app-shell) — Offline, install prompt
- QR Generator (~200 lignes) — À porter en Node.js
- Rental module (4 classes, ~2000 lignes) — Logique booking/fleet

---

## 7. ÉTAT DE MATURITÉ

```
Auth & Users ............. 60%  ✅ Login/Register/JWT  ❌ Middleware tier / 2FA
Routes & Explorer ........ 65%  ✅ Builder/GPX/GPS/API  ❌ Terrain mode / QR / Reviews
Fleet Management ......... 40%  ✅ Vehicles CRUD         ❌ Maintenance / Calendrier
Bookings ................. 30%  ✅ Booking CRUD          ❌ Wizard / Paiements / Guides
Hub Public ............... 45%  ✅ Landing Page          ❌ Discovery / Route detail / SEO
Site Builder (T3) ........ 25%  ✅ Architecture doc      ❌ GrapesJS / Subdomain
PWA Rider ................ 25%  ✅ Manifest basique      ❌ Navigation / Offline
Infra & DevOps ........... 20%  ✅ .env / Deploy basique ❌ CI/CD / Nginx / Cloudflare
```

---

## 8. SYSTÈME IA — CRÉDITS

### Consommation par action

| Action | Crédits | Description |
|--------|---------|-------------|
| POI Auto-complétion | 2 | Suggestion POIs sur un tracé |
| Description route | 3 | Texte EN+TH depuis tracé+POIs |
| Optimisation tracé | 5 | 2-3 variantes de parcours |
| Traduction page | 3 | 1 page dans 1 langue |
| Génération contenu page | 5 | Texte about, FAQ, etc. |
| Suggestion layout site | 3 | Template recommandé |
| Maintenance prédictive | 1 | Analyse état véhicule |
| Tarification dynamique | 2 | Suggestion prix période |
| Insights analytics | 3 | Résumé mensuel |
| Suggestion up-sell | 1 | Add-ons pertinents booking |
| Estimation difficulté | 0 | Algorithmique, gratuit |

### Flow backend

```
Action IA déclenchée
  → use_custom_api = true ? → Clé opérateur, 0 crédit, log quand même
  → balance >= coût ?       → API Movana (clé Anthropic), débit crédits, log
  → balance < coût ?        → Erreur 402 + lien recharge
```

---

## 9. INFRASTRUCTURE CIBLE

### Hostinger VPS

```
Nginx reverse proxy
├── movana.bike        → localhost:3000 (Next.js)
├── app.movana.bike    → localhost:3000 (même app, routing interne)
├── rider.movana.bike  → localhost:3000 (même app, routing interne)
├── *.movana.bike      → localhost:3000 (sites opérateurs T3)
```

> Le code est un monolithe Next.js. Nginx sert de reverse proxy avec Host header pour distinguer les sous-domaines.

### Cloudflare DNS

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | movana.bike | IP_HOSTINGER | ✅ Proxied |
| A | app | IP_HOSTINGER | ✅ Proxied |
| A | rider | IP_HOSTINGER | ✅ Proxied |
| A | * | IP_HOSTINGER | ✅ Proxied (wildcard) |

SSL : Full (strict), wildcard *.movana.bike

### PM2

```
movana-app : next start -p 3000 (2 instances cluster)
```

### GitHub Actions CI/CD

```
Push main → build → SSH deploy → pm2 reload
```

---

## 10. STRUCTURE GITHUB CIBLE

```
github.com/stevanrehault-byte/movana/
│
├── .claude/
│   └── CLAUDE.md                    # Context Claude Code (extrait de ce doc)
│
├── .github/
│   └── workflows/
│       ├── deploy.yml               # CI/CD → Hostinger
│       └── claude.yml               # Claude Code GitHub Actions
│
├── docs/
│   ├── MOVANA-REFERENCE.md          # CE DOCUMENT
│   ├── MATRICE-FONCTIONNELLE.md
│   ├── DECISIONS-IA.md
│   └── ROADMAP.md
│
├── scripts/
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   ├── 002_fleet_bookings.sql
│   │   └── 003_ia_credits.sql
│   ├── seed/
│   │   └── seed-freeride-operator.sql
│   └── deploy.sh
│
├── src/
│   ├── app/
│   │   ├── api/                     # 17+ API routes
│   │   ├── dashboard/               # Dashboard opérateur
│   │   ├── login/
│   │   ├── (public)/                # Pages publiques (hub, routes, blog)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx                 # Landing page
│   │
│   ├── components/
│   │   ├── ui/                      # Composants génériques
│   │   ├── route-builder/           # Route Builder Mapbox (7 fichiers)
│   │   ├── dashboard/               # Composants dashboard
│   │   ├── public/                  # Composants pages publiques
│   │   └── shared/                  # Logo, Navbar, Footer
│   │
│   ├── lib/
│   │   ├── db.ts                    # Pool MariaDB + helpers
│   │   ├── auth.ts                  # JWT + middleware
│   │   ├── utils.ts
│   │   ├── mapbox.ts
│   │   ├── stripe.ts               # À créer
│   │   └── ia.ts                    # À créer — client IA + gestion crédits
│   │
│   └── types/
│       └── index.ts                 # Types TypeScript partagés
│
├── public/
│   ├── sw.js                        # Service Worker
│   ├── manifest.json                # PWA Manifest
│   └── icons/
│
├── archive/                         # Legacy WP (lecture seule)
│   └── freeride-platform/
│
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 11. DÉCISIONS TECHNIQUES VALIDÉES

| # | Décision | Choix | Raison |
|---|----------|-------|--------|
| D1 | Architecture | Monolithe Next.js, pas de microservices | Dev solo, simplicité |
| D2 | Database | MariaDB raw SQL (mysql2), PAS d'ORM | Performance, contrôle, Hostinger natif |
| D3 | Sous-domaines | Nginx routing vers même app Next.js | Un seul process, maintenance simple |
| D4 | Page Builder T3 | GrapesJS | Open source, drag & drop, extensible |
| D5 | PWA Rider | Pas d'app native | Accessibilité, pas de store, QR direct |
| D6 | Mapbox | Injection script (pas npm) | Taille bundle, chargement dynamique |
| D7 | Repos GitHub | Un seul monorepo `movana` | Hostinger ne supporte pas monorepo Turborepo, mais un Next.js monolithique = OK |
| D8 | IA | Crédits prépayés + clé API propre | Contrôle coûts, scalable |
| D9 | Commission | 0% MVP | Argument commercial fort |
| D10 | i18n | next-intl (EN/TH/FR/RU) | 4 langues cibles |
| D11 | Paiements opérateur | Stripe Connect Standard | OAuth 1 clic, paiement direct |
| D12 | Dépendances | Zéro dépendance payante | Principe fondamental |

---

## 12. CODING STANDARDS

```
- TypeScript strict mode
- API routes retournent { data } ou { error }
- Auth middleware via getAuthUser(req) depuis lib/auth.ts
- Pas de librairie UI externe (Tailwind + composants custom)
- Mapbox chargé dynamiquement (script injection)
- Tout texte user-facing doit supporter i18n (EN/TH/FR/RU)
- UUIDs pour toutes les primary keys
- Toutes les tables ont operator_id pour multi-tenancy
- Pas de Prisma/Drizzle (raw SQL)
- Pas de jQuery
- Pas de dépendances payantes
```

---

## 13. ROADMAP DÉVELOPPEMENT (4-5 mois)

| Phase | Semaines | Contenu |
|-------|----------|---------|
| 1. Fondations | S1-3 | Setup infra, DB, API, Design system, i18n |
| 2. Auth & Operators | S4-6 | Login, dashboard, profil, Stripe subscriptions |
| 3. Routes & Explorer | S7-10 | CRUD, éditeur carte, POIs, portail public, QR, avis |
| 4. Fleet & Booking | S11-15 | Véhicules, guides, réservations, promos, paiements |
| 5. Sites & PWA | S16-18 | Site builder, custom domain, PWA rider, notifications |
| 6. Polish & Launch | S19-20 | Analytics, tests, FreeRide = premier client, LAUNCH |

---

## 14. PROCHAINES ACTIONS IMMÉDIATES

### Priorité 1 : Consolider le repo GitHub

1. Fusionner `movana-landing` et `movana` en un seul repo propre
2. Placer le code movana-deploy comme source de vérité dans `/src`
3. Placer freeride-platform dans `/archive/`
4. Créer le `.claude/CLAUDE.md`
5. Copier les docs dans `/docs/`
6. Copier les migrations dans `/scripts/migrations/`
7. `.gitignore` propre
8. Premier commit structuré

### Priorité 2 : Infra

9. Configurer Nginx avec reverse proxy sous-domaines
10. Configurer Cloudflare DNS complet
11. GitHub Actions CI/CD
12. Variables d'environnement Hostinger

### Priorité 3 : Compléter le code

13. Middleware tier-aware sur les API routes
14. Migration 003 (ia_credits, promo_codes, qr_codes, etc.)
15. Page `/explore` (discovery hub) avec filtres
16. Fiche route publique
17. Fiche opérateur publique

---

*Ce document est la source de vérité unique du projet MOVANA.*
*Toute session de développement commence par la lecture de ce fichier.*
