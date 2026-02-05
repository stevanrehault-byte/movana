# MOVANA — Décisions Validées & Modèle IA

> **Date** : 5 Février 2026
> **Statut** : Validé par Stévan

---

## 1. QUESTIONS TRANCHÉES

| # | Décision | Choix | Raison |
|---|----------|-------|--------|
| Q1 | Domain custom | **Add-on payant** (+500฿/mois sur T3) | Revenue additionnelle, complexité DNS à supporter |
| Q2 | Limite routes T2 | **Illimitées** | Pas de coût marginal pour Movana, le gap T2→T3 = flotte+booking+site |
| Q3 | Commission bookings | **0% MVP**, réévaluer post-100 opérateurs | Rester attractif au lancement |
| Q4 | PWA rider branding | **Logo opérateur** (petit "powered by Movana" discret en footer) | L'opérateur est le héros, pas Movana |
| Q5 | API publique | **Incluse T3** | Différenciateur, attire les opérateurs tech |
| Q6 | Webhooks | **Post-launch** | Aucun besoin identifié au MVP |
| Q7 | Marque blanche | **T4 / White Label** (tier ou add-on premium sur T3) | Aucune mention Movana = premium |
| Q8 | IA features | **Système de crédits** + possibilité de connecter sa propre clé API | Contrôle des coûts, scalable |

---

## 2. MODÈLE DE TIERS FINALISÉ

```
T0 — FREE                    0 ฿/mois
T1 — VISIBILITY            299 ฿/mois
T2 — EXPERIENCE            999 ฿/mois
T3 — OPERATOR            2,499 ฿/mois
    └── Add-on : Domain custom      +500 ฿/mois
    └── Add-on : White Label       +1,500 ฿/mois (ou T4 à 4,499 ฿)
    └── Add-on : Pack IA Extra     +299 ฿ (recharge crédits)

Crédits IA :
    T2 → 50 crédits/mois inclus
    T3 → 200 crédits/mois inclus
    Recharge → 299 ฿ = 200 crédits supplémentaires
    Clé API perso → crédits illimités (l'opérateur paie directement son fournisseur IA)
```

---

## 3. SYSTÈME DE CRÉDITS IA — ARCHITECTURE

### 3.1 Principe

Chaque action IA consomme des crédits. L'opérateur a un quota mensuel inclus dans son tier.
Il peut recharger ou connecter sa propre clé API (Anthropic/OpenAI) pour un usage illimité.

### 3.2 Table de consommation

| Action IA | Crédits | Description |
|-----------|---------|-------------|
| **POI Auto-complétion** | 2 | Chercher et suggérer des POIs sur un tracé |
| **Description route** | 3 | Générer texte EN + TH depuis tracé et POIs |
| **Optimisation tracé** | 5 | Calculer 2-3 variantes de parcours |
| **Traduction page** | 3 | Traduire une page complète dans 1 langue |
| **Génération contenu page** | 5 | Écrire le contenu d'une page (about, FAQ...) |
| **Suggestion layout site** | 3 | Proposer un template de site |
| **Maintenance prédictive** | 1 | Analyser l'état d'un véhicule |
| **Tarification dynamique** | 2 | Suggestion prix pour une période |
| **Insights analytics** | 3 | Résumé mensuel des tendances |
| **Suggestion up-sell** | 1 | Recommander add-ons dans le booking |
| **Estimation difficulté** | 0 | Algorithmique, pas d'IA → gratuit |

### 3.3 Schéma DB (à ajouter aux migrations)

```sql
-- CRÉDITS IA
CREATE TABLE IF NOT EXISTS ia_credits (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  
  -- Solde
  balance INT DEFAULT 0,
  monthly_allowance INT DEFAULT 0,      -- Quota mensuel selon tier
  
  -- Clé API propre (optionnel)
  custom_api_provider ENUM('anthropic','openai') NULL,
  custom_api_key_encrypted TEXT NULL,    -- Chiffré AES-256
  use_custom_api BOOLEAN DEFAULT FALSE,
  
  -- Reset mensuel
  last_reset_at DATETIME,
  next_reset_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  UNIQUE KEY uk_ia_credits_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HISTORIQUE CONSOMMATION IA  
CREATE TABLE IF NOT EXISTS ia_usage_log (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  user_id CHAR(36),
  
  action_type ENUM(
    'poi_autocomplete','route_description','route_optimize',
    'translate_page','generate_content','suggest_layout',
    'maintenance_predict','pricing_suggest','analytics_insights',
    'upsell_suggest'
  ) NOT NULL,
  
  credits_consumed INT NOT NULL,
  
  -- Contexte
  entity_type VARCHAR(50),              -- 'route', 'vehicle', 'page'
  entity_id CHAR(36),
  
  -- Résultat
  input_summary TEXT,                   -- Ce qui a été envoyé (résumé)
  output_summary TEXT,                  -- Ce qui a été reçu (résumé)
  
  -- API utilisée
  api_provider ENUM('movana','anthropic','openai') DEFAULT 'movana',
  api_model VARCHAR(50),                -- 'claude-sonnet-4-5', etc.
  tokens_input INT,
  tokens_output INT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_ia_usage_operator (operator_id),
  INDEX idx_ia_usage_type (action_type),
  INDEX idx_ia_usage_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.4 Flow API côté backend

```
Opérateur déclenche action IA
       │
       ▼
  Vérifier crédits
       │
       ├── use_custom_api = true ?
       │       │
       │       ▼ OUI
       │   Utiliser la clé API de l'opérateur
       │   → Pas de débit de crédits
       │   → Log quand même dans ia_usage_log
       │
       ├── balance >= coût ?
       │       │
       │       ▼ OUI
       │   Utiliser l'API Movana (clé Anthropic de Movana)
       │   → Débiter crédits
       │   → Log dans ia_usage_log
       │
       └── balance < coût ?
               │
               ▼
           Retourner erreur 402
           → "Crédits insuffisants. Rechargez ou connectez votre clé API."
           → Lien vers page recharge / config API
```

### 3.5 Dashboard crédits IA (dans Settings opérateur)

```
┌─────────────────────────────────────────────────────────┐
│  ⚡ Crédits IA                                          │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Solde actuel        142 / 200 crédits            │  │
│  │  ████████████████████████████░░░░░░░░  71%        │  │
│  │  Renouvellement : 12 mars 2026                    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  [ 🔄 Recharger 200 crédits — 299 ฿ ]                 │
│                                                         │
│  ── ou ──                                              │
│                                                         │
│  🔑 Utiliser votre propre clé API                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Fournisseur : [ Anthropic ▾ ]                    │  │
│  │  Clé API :     [ sk-ant-•••••••••••••••  ]        │  │
│  │  [ ✅ Connectée — crédits illimités ]              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  📊 Consommation ce mois                               │
│  ┌──────────────────────┬────────┬────────────────────┐ │
│  │ Action               │ Nombre │ Crédits            │ │
│  ├──────────────────────┼────────┼────────────────────┤ │
│  │ POI Auto-complétion  │   12   │     24             │ │
│  │ Description route    │    4   │     12             │ │
│  │ Traduction page      │    3   │      9             │ │
│  │ Maintenance prédic.  │    8   │      8             │ │
│  │ Insights analytics   │    1   │      3             │ │
│  ├──────────────────────┼────────┼────────────────────┤ │
│  │ TOTAL                │   28   │     56             │ │
│  └──────────────────────┴────────┴────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 4. POI AUTO-COMPLÉTION IA — DÉTAIL

### 4.1 Concept

Quand l'opérateur crée un parcours dans le Route Builder, il peut cliquer sur "✨ Suggérer des POIs" et l'IA analyse le tracé pour proposer automatiquement des points d'intérêt pertinents.

### 4.2 Flow

```
Opérateur trace sa route dans le Route Builder
       │
       ▼
  Clique "✨ Suggérer des POIs"
       │
       ▼
  Système extrait :
  • Le GeoJSON du tracé
  • Un buffer de 500m autour du tracé
  • La région / ville
       │
       ▼
  Appel Mapbox Geocoding / Google Places
  → Récupérer tous les lieux dans le buffer :
    restaurants, cafés, temples, viewpoints,
    marchés, parcs, plages, hôtels, shops...
       │
       ▼
  Appel Claude API avec contexte :
  "Voici un parcours vélo de 25km à Jomtien,
   difficulté modérée, thème Beach & Culture.
   Voici les 47 lieux trouvés près du tracé.
   Sélectionne les 8-12 plus pertinents pour
   un cycliste, classe-les par intérêt, et
   génère une description courte EN+TH pour chaque."
       │
       ▼
  Résultat affiché dans le Route Builder :
  ┌─────────────────────────────────────────┐
  │  ✨ 9 POIs suggérés                     │
  │                                         │
  │  ☑ 🛕 Wat Yansangwararam (2.3 km)     │
  │     "Ancient temple complex with..."    │
  │                                         │
  │  ☑ ☕ Café Amazon (5.1 km)             │
  │     "Quick coffee stop with..."        │
  │                                         │
  │  ☑ 👁 Silver Lake Viewpoint (8.7 km)  │
  │     "Panoramic view over..."           │
  │                                         │
  │  ☐ 🍜 Ying Restaurant (4.2 km)        │
  │     "Local seafood spot..."            │
  │                                         │
  │  ...                                    │
  │                                         │
  │  [ ✅ Ajouter les 7 sélectionnés ]     │
  │  [ ❌ Annuler ]                         │
  └─────────────────────────────────────────┘
       │
       ▼
  POIs ajoutés au parcours avec markers sur la carte
  L'opérateur peut ensuite éditer chaque POI
```

### 4.3 Données POI générées par l'IA

```typescript
interface SuggestedPOI {
  name: string;           // "Wat Yansangwararam"
  name_th: string;        // "วัดญาณสังวราราม"
  description: string;    // "Ancient temple complex with impressive architecture..."
  description_th: string; // "วัดเก่าแก่..."
  category: string;       // "temple"
  lat: number;
  lng: number;
  distanceFromRoute: number;  // mètres depuis le tracé
  distanceFromStart: number;  // km depuis le départ
  relevanceScore: number;     // 0-100 calculé par l'IA
  tips: string;               // "Visit early morning to avoid heat. Remove shoes."
  estimatedDuration: number;  // minutes de visite suggérées
  priceRange: string;         // "Free" / "50-100 ฿" / "$$"
  openingHours: string;       // "8:00-17:00" (si dispo)
  source: string;             // "google_places" / "mapbox" / "ai_generated"
}
```

---

## 5. TIER 4 / WHITE LABEL — SPÉCIFICATIONS

### Ce qui change vs T3

| Aspect | T3 Operator | T4 White Label |
|--------|-------------|----------------|
| Branding site | Logo opérateur + "Powered by Movana" en footer | Aucune mention Movana |
| PWA rider | Logo opérateur + petit Movana | Logo opérateur uniquement |
| Emails transactionnels | Template Movana avec logo opérateur | Template 100% custom opérateur |
| Domain | {slug}.movana.bike (custom en add-on) | Domain custom inclus |
| Favicon | Custom | Custom |
| Couleurs email | Couleurs Movana | Couleurs opérateur |
| Page de login | app.movana.bike/login | {domain}/login ou app.{domain}/login |
| Support | Standard | Prioritaire |

### Prix envisagé

```
Option A : T4 White Label = 4,499 ฿/mois (tier dédié)
Option B : Add-on White Label sur T3 = +1,500 ฿/mois

Recommandation : Option B (add-on)
→ Pas de tier supplémentaire à maintenir
→ Plus flexible pour l'opérateur
→ Revenue incrémentale claire
```

---

## 6. RÉSUMÉ PRICING FINAL

```
┌─────────────────────────────────────────────────────────────┐
│                    MOVANA PRICING                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  T0  FREE          0 ฿         Annuaire basique             │
│  T1  VISIBILITY    299 ฿/mois  Visibilité + badge          │
│  T2  EXPERIENCE    999 ฿/mois  Routes + Explorer + 50 IA   │
│  T3  OPERATOR    2,499 ฿/mois  Tout + Flotte + Booking     │
│                                + Site + API + 200 IA        │
│                                                             │
│  ADD-ONS (T3 uniquement)                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Domain custom      +500 ฿/mois                     │   │
│  │  White Label       +1,500 ฿/mois                    │   │
│  │  Recharge IA 200cr  +299 ฿ (one-shot)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  IA : Clé API propre = crédits illimités (0 ฿ extra)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
