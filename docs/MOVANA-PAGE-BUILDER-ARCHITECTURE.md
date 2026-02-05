# MOVANA PAGE BUILDER — Architecture Technique
## GrapesJS + Next.js + MariaDB

---

## 1. VUE D'ENSEMBLE

### Ce qu'on construit

Un système de page builder visuel intégré au dashboard Movana, permettant :

- **Super Admin Movana** : créer/éditer toutes les pages de `movana.bike` (landing, about, FAQ, etc.)
- **Opérateurs T3** : créer/éditer les pages de leur site `{slug}.movana.bike`
- **Gestion complète** : pages illimitées, header/footer éditables, menus custom, blocs Movana pré-faits

### Stack technique

```
┌─────────────────────────────────────────────────────────────────┐
│  ÉDITEUR (Dashboard)                                            │
│  GrapesJS + @grapesjs/react + blocs custom Movana               │
│  → Sauvegarde JSON (composants + styles) via API REST           │
├─────────────────────────────────────────────────────────────────┤
│  API (Next.js API Routes)                                       │
│  /api/pages/* — CRUD pages                                      │
│  /api/builder/load/[id] — charge le projet GrapesJS             │
│  /api/builder/save/[id] — sauvegarde le projet GrapesJS         │
│  /api/menus/* — CRUD menus                                      │
│  /api/globals/* — header/footer                                 │
│  /api/media/* — upload images                                   │
├─────────────────────────────────────────────────────────────────┤
│  BASE DE DONNÉES (MariaDB)                                      │
│  pages, page_versions, menus, menu_items,                       │
│  global_sections, media                                         │
├─────────────────────────────────────────────────────────────────┤
│  RENDU PUBLIC (Next.js SSR)                                     │
│  [slug] → charge HTML/CSS depuis DB → rendu côté serveur        │
│  Header/Footer globaux injectés automatiquement                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. SCHEMA BASE DE DONNÉES

### Migration 003_page_builder.sql

```sql
-- ═══════════════════════════════════════════════════════════════
-- MOVANA DATABASE MIGRATION 003 - Page Builder System
-- Run AFTER 002_fleet_bookings.sql
-- ═══════════════════════════════════════════════════════════════

-- PAGES (any page for movana.bike or operator sites)
CREATE TABLE IF NOT EXISTS pages (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36),              -- NULL = movana global page
  
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Page type
  page_type ENUM('landing','about','contact','faq','terms','privacy',
                 'routes','fleet','booking','custom') DEFAULT 'custom',
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  og_image_url TEXT,
  
  -- GrapesJS project data (JSON)
  gjs_data LONGTEXT,                 -- Full GrapesJS project JSON
  
  -- Rendered output (cached for SSR performance)
  html_content LONGTEXT,             -- Rendered HTML
  css_content LONGTEXT,              -- Rendered CSS
  
  -- Status
  status ENUM('draft','published','archived') DEFAULT 'draft',
  is_homepage BOOLEAN DEFAULT FALSE,
  
  -- Versioning
  version INT DEFAULT 1,
  published_at DATETIME,
  published_by CHAR(36),
  
  sort_order INT DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  created_by CHAR(36),
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  UNIQUE KEY uk_pages_slug (operator_id, slug),
  INDEX idx_pages_operator (operator_id),
  INDEX idx_pages_status (status),
  INDEX idx_pages_type (page_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PAGE VERSIONS (history for undo/rollback)
CREATE TABLE IF NOT EXISTS page_versions (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  page_id CHAR(36) NOT NULL,
  
  version INT NOT NULL,
  gjs_data LONGTEXT,
  html_content LONGTEXT,
  css_content LONGTEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_by CHAR(36),
  
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  INDEX idx_page_versions (page_id, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MENUS (navigation management)
CREATE TABLE IF NOT EXISTS menus (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36),              -- NULL = movana global menu
  
  name VARCHAR(100) NOT NULL,        -- "Main Nav", "Footer Nav", etc.
  location ENUM('header','footer','sidebar','mobile','custom') DEFAULT 'header',
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_menus_operator (operator_id),
  INDEX idx_menus_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MENU ITEMS (individual links in a menu)
CREATE TABLE IF NOT EXISTS menu_items (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  menu_id CHAR(36) NOT NULL,
  parent_id CHAR(36),                -- for nested/dropdown menus
  
  label VARCHAR(200) NOT NULL,
  url VARCHAR(500),                  -- external URL
  page_id CHAR(36),                  -- internal page link
  
  link_type ENUM('page','url','anchor','dropdown') DEFAULT 'page',
  
  target ENUM('_self','_blank') DEFAULT '_self',
  icon VARCHAR(50),
  css_class VARCHAR(100),
  
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE SET NULL,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL,
  INDEX idx_menu_items_menu (menu_id),
  INDEX idx_menu_items_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GLOBAL SECTIONS (header, footer — shared across pages)
CREATE TABLE IF NOT EXISTS global_sections (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36),              -- NULL = movana global
  
  section_type ENUM('header','footer','banner','popup') NOT NULL,
  name VARCHAR(100) NOT NULL,
  
  gjs_data LONGTEXT,
  html_content LONGTEXT,
  css_content LONGTEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  UNIQUE KEY uk_global_section (operator_id, section_type),
  INDEX idx_global_sections_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MEDIA (uploaded images/files for the builder)
CREATE TABLE IF NOT EXISTS media (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36),              -- NULL = movana global
  uploaded_by CHAR(36),
  
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  file_size INT,                     -- bytes
  
  url TEXT NOT NULL,                 -- public URL
  thumbnail_url TEXT,
  
  alt_text VARCHAR(255),
  caption TEXT,
  
  folder VARCHAR(100) DEFAULT 'general',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_media_operator (operator_id),
  INDEX idx_media_folder (folder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BLOCK TEMPLATES (reusable saved blocks)
CREATE TABLE IF NOT EXISTS block_templates (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36),              -- NULL = movana system blocks
  
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) DEFAULT 'custom',
  description TEXT,
  thumbnail_url TEXT,
  
  -- GrapesJS block data
  gjs_content LONGTEXT NOT NULL,     -- HTML content of the block
  gjs_styles LONGTEXT,               -- CSS styles
  
  is_global BOOLEAN DEFAULT FALSE,   -- available to all operators?
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_block_templates_operator (operator_id),
  INDEX idx_block_templates_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PAGE ANALYTICS (tracking views, clicks, events per page)
CREATE TABLE IF NOT EXISTS page_analytics (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  page_id CHAR(36) NOT NULL,
  operator_id CHAR(36),
  
  -- Event data
  event_type ENUM('view','click','scroll_depth','cta_click','form_submit',
                  'bounce','time_on_page') DEFAULT 'view',
  
  -- Visitor info
  visitor_id VARCHAR(64),            -- anonymous hash (cookie/fingerprint)
  session_id VARCHAR(64),
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  referer TEXT,
  
  -- Device & location
  device_type ENUM('desktop','tablet','mobile') DEFAULT 'desktop',
  country VARCHAR(2),
  city VARCHAR(100),
  
  -- Event details
  element_id VARCHAR(100),           -- clicked element
  element_text VARCHAR(255),
  scroll_percent INT,                -- for scroll_depth events
  duration_seconds INT,              -- for time_on_page events
  
  -- UTM tracking
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  INDEX idx_page_analytics_page (page_id),
  INDEX idx_page_analytics_operator (operator_id),
  INDEX idx_page_analytics_date (created_at),
  INDEX idx_page_analytics_event (event_type),
  INDEX idx_page_analytics_visitor (visitor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PAGE ANALYTICS DAILY (aggregated stats for fast dashboard queries)
CREATE TABLE IF NOT EXISTS page_analytics_daily (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  page_id CHAR(36) NOT NULL,
  operator_id CHAR(36),
  
  date DATE NOT NULL,
  
  views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  avg_time_seconds INT DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,  -- percentage
  cta_clicks INT DEFAULT 0,
  form_submits INT DEFAULT 0,
  
  -- Device breakdown
  desktop_views INT DEFAULT 0,
  tablet_views INT DEFAULT 0,
  mobile_views INT DEFAULT 0,
  
  -- Top referrers (JSON array)
  top_referrers JSON,
  
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  UNIQUE KEY uk_page_daily (page_id, date),
  INDEX idx_pad_operator (operator_id),
  INDEX idx_pad_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TEMPLATE MARKETPLACE (operators share/sell page templates)
CREATE TABLE IF NOT EXISTS marketplace_templates (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  author_id CHAR(36) NOT NULL,       -- operator who created it
  
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  long_description LONGTEXT,
  
  category ENUM('landing','business','portfolio','blog','booking',
                'restaurant','hotel','tour','sport','other') DEFAULT 'other',
  tags JSON,                         -- ["cycling","minimal","dark"]
  
  -- Preview
  thumbnail_url TEXT,
  preview_url TEXT,                   -- live preview link
  screenshots JSON,                  -- array of image URLs
  
  -- Template data
  gjs_data LONGTEXT NOT NULL,        -- full GrapesJS project JSON
  html_content LONGTEXT,
  css_content LONGTEXT,
  included_pages JSON,               -- array of {title, slug, gjs_data}
  
  -- Pricing
  price_type ENUM('free','paid','premium_only') DEFAULT 'free',
  price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Stats
  installs INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  
  -- Status
  status ENUM('draft','pending_review','published','rejected','archived') DEFAULT 'draft',
  reviewed_by CHAR(36),
  reviewed_at DATETIME,
  rejection_reason TEXT,
  
  is_featured BOOLEAN DEFAULT FALSE,
  is_official BOOLEAN DEFAULT FALSE, -- Movana-made templates
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (author_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_marketplace_author (author_id),
  INDEX idx_marketplace_category (category),
  INDEX idx_marketplace_status (status),
  INDEX idx_marketplace_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TEMPLATE REVIEWS
CREATE TABLE IF NOT EXISTS template_reviews (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  template_id CHAR(36) NOT NULL,
  operator_id CHAR(36) NOT NULL,
  
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  
  is_verified BOOLEAN DEFAULT FALSE, -- actually installed the template
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (template_id) REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  UNIQUE KEY uk_template_review (template_id, operator_id),
  INDEX idx_reviews_template (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TEMPLATE INSTALLS (tracking who uses what)
CREATE TABLE IF NOT EXISTS template_installs (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  template_id CHAR(36) NOT NULL,
  operator_id CHAR(36) NOT NULL,
  
  installed_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (template_id) REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_installs_template (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PAGE TRANSLATIONS (i18n — one row per page per locale)
CREATE TABLE IF NOT EXISTS page_translations (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  page_id CHAR(36) NOT NULL,         -- parent page
  
  locale VARCHAR(5) NOT NULL,        -- 'en', 'th', 'fr', 'ru', 'zh', 'de'
  
  title VARCHAR(255),
  slug VARCHAR(255),
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- GrapesJS data for this locale
  gjs_data LONGTEXT,
  html_content LONGTEXT,
  css_content LONGTEXT,
  
  status ENUM('draft','published','archived') DEFAULT 'draft',
  
  translated_by CHAR(36),            -- user who translated
  translation_method ENUM('manual','ai','import') DEFAULT 'manual',
  translation_quality DECIMAL(3,2),  -- 0.00-1.00 confidence score
  
  published_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  UNIQUE KEY uk_page_locale (page_id, locale),
  INDEX idx_translations_page (page_id),
  INDEX idx_translations_locale (locale)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PAGE EXPORTS (generated HTML/PDF exports)
CREATE TABLE IF NOT EXISTS page_exports (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  page_id CHAR(36) NOT NULL,
  
  format ENUM('html','pdf','zip') NOT NULL,
  
  file_url TEXT NOT NULL,
  file_size INT,                     -- bytes
  
  -- What was exported
  include_header BOOLEAN DEFAULT TRUE,
  include_footer BOOLEAN DEFAULT TRUE,
  locale VARCHAR(5) DEFAULT 'en',
  
  exported_by CHAR(36),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  INDEX idx_exports_page (page_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- UNDO HISTORY (cross-session undo/redo snapshots)
CREATE TABLE IF NOT EXISTS editor_snapshots (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  page_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  
  -- Snapshot data
  gjs_data LONGTEXT NOT NULL,
  
  -- Position in history stack
  snapshot_index INT NOT NULL,
  
  -- Context
  action_label VARCHAR(200),         -- "Added hero section", "Changed colors"
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  INDEX idx_snapshots_page (page_id, user_id, snapshot_index),
  INDEX idx_snapshots_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. ARCHITECTURE DES FICHIERS

```
src/
├── app/
│   ├── dashboard/
│   │   ├── pages/                        # Pages management
│   │   │   ├── page.tsx                  # List all pages
│   │   │   ├── new/page.tsx              # Create new page
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Page details/settings
│   │   │       └── edit/page.tsx         # ← GrapesJS EDITOR
│   │   │
│   │   ├── builder/                      # Builder standalone route
│   │   │   ├── [id]/page.tsx             # Full-screen editor
│   │   │   ├── header/page.tsx           # Edit global header
│   │   │   └── footer/page.tsx           # Edit global footer
│   │   │
│   │   ├── menus/                        # Menu management
│   │   │   ├── page.tsx                  # List menus
│   │   │   └── [id]/page.tsx             # Edit menu items
│   │   │
│   │   └── media/                        # Media library
│   │       └── page.tsx                  # Upload, browse, manage
│   │
│   │   ├── analytics/                    # Page analytics
│   │   │   ├── page.tsx                  # Global analytics overview
│   │   │   └── [pageId]/page.tsx         # Single page stats
│   │   │
│   │   ├── marketplace/                  # Template marketplace
│   │   │   ├── page.tsx                  # Browse templates
│   │   │   ├── [id]/page.tsx             # Template detail
│   │   │   └── submit/page.tsx           # Submit your template
│   │   │
│   │   ├── translations/                 # i18n management
│   │   │   └── [pageId]/page.tsx         # Manage translations for a page
│   │
│   ├── api/
│   │   ├── pages/
│   │   │   ├── route.ts                  # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts              # GET, PUT, DELETE
│   │   │       ├── publish/route.ts      # POST publish
│   │   │       └── duplicate/route.ts    # POST duplicate
│   │   │
│   │   ├── builder/
│   │   │   ├── load/[id]/route.ts        # GET — GrapesJS load
│   │   │   └── save/[id]/route.ts        # POST — GrapesJS save
│   │   │
│   │   ├── menus/
│   │   │   ├── route.ts                  # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts              # GET, PUT, DELETE
│   │   │       └── items/route.ts        # GET, PUT items
│   │   │
│   │   ├── globals/
│   │   │   ├── route.ts                  # GET all globals
│   │   │   └── [type]/route.ts           # GET, PUT (header/footer)
│   │   │
│   │   └── media/
│   │       ├── route.ts                  # GET list, POST upload
│   │       └── [id]/route.ts             # DELETE
│   │
│   │   ├── analytics/
│   │   │   ├── route.ts                  # GET global stats
│   │   │   └── pages/
│   │   │       └── [id]/route.ts         # GET stats for one page
│   │   │
│   │   ├── marketplace/
│   │   │   ├── route.ts                  # GET browse, POST submit
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts              # GET detail, PUT update
│   │   │   │   ├── install/route.ts      # POST install template
│   │   │   │   └── review/route.ts       # POST leave review
│   │   │   └── featured/route.ts         # GET featured templates
│   │   │
│   │   ├── translations/
│   │   │   ├── [pageId]/route.ts         # GET all locales, POST new
│   │   │   └── [pageId]/[locale]/
│   │   │       └── route.ts              # GET, PUT, DELETE locale
│   │   │
│   │   ├── exports/
│   │   │   └── [pageId]/route.ts         # POST generate export
│   │   │
│   │   └── snapshots/
│   │       └── [pageId]/route.ts         # GET history, POST save, PUT restore
│   │
│   └── [slug]/                           # ← PUBLIC PAGES RENDERER
│       └── page.tsx                      # Dynamic page from DB
│
├── components/
│   ├── builder/
│   │   ├── MovanaEditor.tsx              # Main GrapesJS wrapper
│   │   ├── MovanaBlocks.ts              # Custom Movana blocks plugin
│   │   ├── MovanaStyles.ts              # Custom style sectors
│   │   ├── MovanaStorage.ts             # Remote storage adapter
│   │   ├── EditorToolbar.tsx            # Top bar (save, preview, publish)
│   │   ├── BlockPanel.tsx               # Left panel — blocks
│   │   ├── StylePanel.tsx               # Right panel — styles
│   │   ├── LayerPanel.tsx               # Layer manager
│   │   ├── PageSettings.tsx             # SEO, slug, meta
│   │   ├── DevicePreview.tsx            # Desktop/tablet/mobile toggle
│   │   ├── UndoRedoBar.tsx             # Cross-session undo/redo UI
│   │   ├── TranslationSwitcher.tsx     # Locale switcher in editor
│   │   └── ExportModal.tsx             # Export to HTML/PDF dialog
│   │
│   ├── analytics/
│   │   ├── PageAnalyticsDashboard.tsx   # Per-page stats overview
│   │   ├── VisitorsChart.tsx            # Views over time
│   │   ├── DeviceBreakdown.tsx          # Desktop/tablet/mobile pie
│   │   ├── TopReferrers.tsx             # Traffic sources
│   │   ├── HeatmapOverlay.tsx           # Click heatmap on page preview
│   │   └── AnalyticsTracker.tsx         # Client-side tracking script
│   │
│   ├── marketplace/
│   │   ├── TemplateBrowser.tsx           # Browse/search templates
│   │   ├── TemplateCard.tsx             # Single template preview card
│   │   ├── TemplateDetail.tsx           # Full detail + screenshots
│   │   ├── TemplateInstaller.tsx        # Install flow (select pages)
│   │   ├── TemplateSubmitForm.tsx       # Submit your template
│   │   └── ReviewStars.tsx             # Rating component
│   │
│   ├── i18n/
│   │   ├── LocaleManager.tsx            # Manage translations for a page
│   │   ├── TranslationEditor.tsx        # Side-by-side translation editor
│   │   ├── LocaleSwitcher.tsx           # Public-facing language switcher
│   │   └── AITranslateButton.tsx        # Auto-translate via API
│   │
│   ├── menus/
│   │   ├── MenuEditor.tsx               # Drag & drop menu editor
│   │   └── MenuItemForm.tsx             # Edit single item
│   │
│   └── page-renderer/
│       ├── PageRenderer.tsx             # SSR renderer from DB data
│       ├── GlobalHeader.tsx             # Renders saved header
│       └── GlobalFooter.tsx             # Renders saved footer
│
└── lib/
    └── builder/
        ├── blocks/                      # Individual block definitions
        │   ├── hero.ts                  # Hero section variants
        │   ├── features.ts             # Feature grid
        │   ├── cta.ts                  # Call to action
        │   ├── testimonials.ts         # Reviews/testimonials
        │   ├── faq.ts                  # FAQ accordion
        │   ├── gallery.ts             # Image gallery
        │   ├── pricing.ts             # Pricing table
        │   ├── team.ts                # Team members
        │   ├── contact.ts             # Contact form
        │   ├── stats.ts               # Stats/counters
        │   ├── route-cards.ts         # ← Movana-specific: route listing
        │   ├── operator-showcase.ts   # ← Movana-specific: operator cards
        │   ├── map-embed.ts           # ← Mapbox embed
        │   └── index.ts              # Register all blocks
        │
        └── config.ts                  # GrapesJS configuration
```

---

## 4. BLOCS MOVANA CUSTOM

### Catégories de blocs

```
┌─────────────────────────────────────────────────────────────────┐
│  📦 BLOCS DISPONIBLES DANS L'ÉDITEUR                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🏗️ STRUCTURE (Basic)                                          │
│  • Section (pleine largeur)                                     │
│  • Container (largeur max)                                      │
│  • Grille 2 colonnes / 3 colonnes / 4 colonnes                │
│  • Séparateur                                                   │
│  • Espacement                                                   │
│                                                                 │
│  ✏️ CONTENU (Content)                                           │
│  • Titre (H1-H6)                                               │
│  • Paragraphe                                                   │
│  • Image                                                        │
│  • Bouton (primary, secondary, outline)                        │
│  • Liste                                                        │
│  • Icône                                                        │
│  • Vidéo (YouTube/Vimeo embed)                                 │
│                                                                 │
│  🎨 SECTIONS (Pre-designed)                                     │
│  • Hero — grande image + titre + CTA                           │
│  • Hero avec recherche                                          │
│  • Feature grid (icônes + texte)                               │
│  • CTA banner (gradient + texte + boutons)                     │
│  • Témoignages (carousel ou grid)                              │
│  • FAQ (accordion)                                              │
│  • Galerie images                                               │
│  • Pricing table                                                │
│  • Stats / compteurs                                            │
│  • Équipe (photo + bio)                                        │
│  • Contact (form + map)                                        │
│  • Footer complet                                               │
│                                                                 │
│  🚴 MOVANA (Platform-specific)                                  │
│  • Route Cards Grid — affiche des routes depuis la DB          │
│  • Route Featured — mise en avant d'une route                  │
│  • Operator Card — carte opérateur                              │
│  • Operator Grid — listing opérateurs                          │
│  • Map Embed — carte Mapbox avec routes/POIs                   │
│  • Booking CTA — lien vers réservation                         │
│  • Partner Logos — grille de logos partenaires                  │
│  • Badge Movana — "Powered by Movana"                          │
│  • Search Bar — barre de recherche routes                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Exemple de bloc custom : Route Cards Grid

```typescript
// lib/builder/blocks/route-cards.ts
export const routeCardsBlock = {
  id: 'movana-route-cards',
  label: 'Route Cards',
  category: 'Movana',
  media: '<svg>...</svg>',
  content: `
    <section class="mv-route-cards" data-gjs-type="movana-route-cards"
      data-count="3" data-region="" data-difficulty="">
      <div class="mv-container">
        <h2 class="mv-section-title">Des routes prêtes à vivre</h2>
        <p class="mv-section-subtitle">
          Chaque itinéraire est testé, enrichi de stops locaux, et guidé par GPS.
        </p>
        <div class="mv-routes-grid">
          <!-- Routes loaded dynamically via API on public render -->
          <div class="mv-route-placeholder">Routes will load here...</div>
        </div>
      </div>
    </section>
  `,
  // Traits allow the user to configure the block in the right panel
  traits: [
    { type: 'number', name: 'data-count', label: 'Nombre de routes', default: 3, min: 1, max: 12 },
    { type: 'select', name: 'data-region', label: 'Région', options: [
      { value: '', name: 'Toutes' },
      { value: 'pattaya', name: 'Pattaya' },
      { value: 'rayong', name: 'Rayong' },
      { value: 'koh-samet', name: 'Koh Samet' },
    ]},
    { type: 'select', name: 'data-difficulty', label: 'Difficulté', options: [
      { value: '', name: 'Toutes' },
      { value: 'easy', name: 'Facile' },
      { value: 'moderate', name: 'Modéré' },
      { value: 'hard', name: 'Difficile' },
    ]},
  ],
};
```

---

## 5. FLUX DE DONNÉES

### 5.1 Édition (Dashboard)

```
Utilisateur ouvre l'éditeur
       │
       ▼
GET /api/builder/load/{pageId}
       │
       ▼
GrapesJS initialise avec les données JSON
       │
       ▼
Utilisateur drag & drop, édite, style
       │
       ▼
Auto-save toutes les 30 sec ou clic "Save"
       │
       ▼
POST /api/builder/save/{pageId}
  Body: { gjs_data (JSON), html (string), css (string) }
       │
       ▼
DB: UPDATE pages SET gjs_data=?, html_content=?, css_content=?
    INSERT INTO page_versions (snapshot)
```

### 5.2 Publication

```
Clic "Publish"
       │
       ▼
POST /api/pages/{pageId}/publish
       │
       ▼
DB: UPDATE pages SET status='published', published_at=NOW()
    Sauvegarde version dans page_versions
       │
       ▼
Optionnel: Revalidate Next.js ISR cache
```

### 5.3 Rendu public (SSR)

```
Visiteur accède à movana.bike/about
       │
       ▼
Next.js [slug]/page.tsx
       │
       ▼
DB: SELECT html_content, css_content FROM pages
    WHERE slug='about' AND status='published'
       │
       ▼
DB: SELECT html_content, css_content FROM global_sections
    WHERE section_type IN ('header','footer')
       │
       ▼
Rendu SSR: header + page HTML + footer
Injection CSS dans <head>
       │
       ▼
HTML complet envoyé au navigateur (SEO-friendly)
```

---

## 6. APIs DÉTAILLÉES

### Pages API

```
GET    /api/pages                 → Liste des pages (filtré par operator_id)
POST   /api/pages                 → Créer une page
GET    /api/pages/:id             → Détails d'une page
PUT    /api/pages/:id             → Mettre à jour (title, slug, meta)
DELETE /api/pages/:id             → Supprimer
POST   /api/pages/:id/publish     → Publier
POST   /api/pages/:id/unpublish   → Dépublier
POST   /api/pages/:id/duplicate   → Dupliquer
GET    /api/pages/:id/versions    → Historique des versions
POST   /api/pages/:id/restore/:v  → Restaurer une version
```

### Builder API (GrapesJS Storage)

```
GET    /api/builder/load/:id      → Charge le JSON GrapesJS
POST   /api/builder/save/:id      → Sauvegarde le JSON GrapesJS + HTML/CSS
```

### Menus API

```
GET    /api/menus                 → Liste des menus
POST   /api/menus                 → Créer un menu
GET    /api/menus/:id             → Menu + items
PUT    /api/menus/:id             → Mettre à jour le menu
DELETE /api/menus/:id             → Supprimer
PUT    /api/menus/:id/items       → Réordonner / mettre à jour les items
```

### Globals API

```
GET    /api/globals               → Tous les global sections
GET    /api/globals/:type         → Header ou Footer
PUT    /api/globals/:type         → Sauvegarder header/footer
```

### Media API

```
GET    /api/media                 → Liste des médias (pagination)
POST   /api/media                 → Upload (multipart/form-data)
DELETE /api/media/:id             → Supprimer
```

### Analytics API

```
GET    /api/analytics             → Stats globales (toutes pages)
GET    /api/analytics/pages/:id   → Stats d'une page (views, bounce, devices, referrers)
GET    /api/analytics/pages/:id?range=7d|30d|90d|custom&from=...&to=...
POST   /api/analytics/track       → Enregistrer un événement (appelé côté client)
GET    /api/analytics/export/:id  → Export CSV des stats d'une page
```

### Marketplace API

```
GET    /api/marketplace                    → Browse templates (search, filter, sort)
GET    /api/marketplace/featured           → Templates mis en avant
GET    /api/marketplace/:id                → Détail d'un template
POST   /api/marketplace                    → Soumettre un template (opérateur)
PUT    /api/marketplace/:id                → Modifier son template
POST   /api/marketplace/:id/install        → Installer un template
POST   /api/marketplace/:id/review         → Laisser un avis
GET    /api/marketplace/:id/reviews        → Voir les avis
POST   /api/marketplace/:id/approve        → Approuver (admin Movana)
POST   /api/marketplace/:id/reject         → Rejeter (admin Movana)
```

### Translations API (i18n)

```
GET    /api/translations/:pageId           → Toutes les traductions d'une page
POST   /api/translations/:pageId           → Créer une traduction (locale)
GET    /api/translations/:pageId/:locale   → Charger une traduction spécifique
PUT    /api/translations/:pageId/:locale   → Sauvegarder une traduction
DELETE /api/translations/:pageId/:locale   → Supprimer une traduction
POST   /api/translations/:pageId/:locale/publish → Publier la traduction
POST   /api/translations/:pageId/auto-translate  → Traduction auto (IA)
```

### Exports API

```
POST   /api/exports/:pageId       → Générer un export
  Body: { format: 'html'|'pdf'|'zip', locale?: string,
          include_header?: bool, include_footer?: bool }
GET    /api/exports/:pageId       → Liste des exports précédents
```

### Snapshots API (Undo/Redo global)

```
GET    /api/snapshots/:pageId              → Historique des snapshots
POST   /api/snapshots/:pageId              → Sauvegarder un snapshot
PUT    /api/snapshots/:pageId/restore/:id  → Restaurer un snapshot
DELETE /api/snapshots/:pageId/clear        → Purger l'historique (garder les 50 derniers)
```

---

## 7. PERMISSIONS

```
┌──────────────────────────────────────────────────────────────────┐
│  QUI PEUT FAIRE QUOI ?                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SUPER ADMIN MOVANA                                              │
│  • Éditer toutes les pages de movana.bike (operator_id = NULL)  │
│  • Gérer les menus globaux                                       │
│  • Éditer le header/footer global                                │
│  • Créer des block templates globaux                             │
│  • Gérer la media library globale                                │
│  • Voir/éditer les pages des opérateurs (support)               │
│  • Analytics : vue globale toutes pages + par opérateur         │
│  • Marketplace : approuver/rejeter les templates soumis          │
│  • Marketplace : créer des templates officiels                   │
│  • i18n : gérer toutes les traductions de movana.bike           │
│  • Export : exporter toute page dans tout format                │
│  • Undo/Redo : accès à l'historique complet de toute page       │
│                                                                  │
│  OPÉRATEUR T3                                                    │
│  • Éditer les pages de {slug}.movana.bike                       │
│  • Gérer ses menus                                               │
│  • Éditer son header/footer                                      │
│  • Créer des block templates privés                              │
│  • Gérer sa media library                                        │
│  • Accès aux blocs globaux (read-only) + blocs Movana           │
│  • Analytics : voir les stats de ses propres pages uniquement   │
│  • Marketplace : installer des templates                         │
│  • Marketplace : soumettre ses propres templates                │
│  • Marketplace : laisser des avis sur templates installés       │
│  • i18n : traduire ses propres pages                            │
│  • Export : exporter ses propres pages                           │
│  • Undo/Redo : historique de ses propres pages                  │
│                                                                  │
│  OPÉRATEUR T0-T2                                                 │
│  • Pas d'accès au page builder                                  │
│  • Page opérateur auto-générée (profil + routes)                │
│  • Analytics basic : vues profil uniquement (T1+)               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. CONFIGURATION GRAPESJS

```typescript
// lib/builder/config.ts
import type { EditorConfig } from 'grapesjs';

export function getEditorConfig(pageId: string, token: string): EditorConfig {
  return {
    height: '100vh',
    
    // Remote storage → notre API
    storageManager: {
      type: 'remote',
      autosave: true,
      autoload: true,
      stepsBeforeSave: 5,
      options: {
        remote: {
          urlLoad: `/api/builder/load/${pageId}`,
          urlStore: `/api/builder/save/${pageId}`,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          onStore: (data: any) => data,
          onLoad: (result: any) => result,
        },
      },
    },
    
    // Asset Manager → notre media library
    assetManager: {
      upload: '/api/media',
      uploadName: 'file',
      headers: { Authorization: `Bearer ${token}` },
      autoAdd: true,
    },
    
    // Canvas settings
    canvas: {
      styles: [
        'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
      ],
    },
    
    // Device Manager
    deviceManager: {
      devices: [
        { id: 'desktop', name: 'Desktop', width: '' },
        { id: 'tablet', name: 'Tablet', width: '768px' },
        { id: 'mobile', name: 'Mobile', width: '375px', widthMedia: '480px' },
      ],
    },
    
    // Plugins loaded separately
    plugins: [],
    pluginsOpts: {},
  };
}
```

---

## 9. PACKAGES NPM NÉCESSAIRES

```json
{
  "dependencies": {
    "grapesjs": "^0.22.x",
    "@grapesjs/react": "^2.x",
    "grapesjs-preset-webpage": "^1.x",
    "grapesjs-blocks-basic": "^1.x",
    "grapesjs-plugin-forms": "^2.x",
    "grapesjs-tui-image-editor": "^1.x",
    "grapesjs-style-bg": "^2.x"
  }
}
```

---

## 10. PLAN D'IMPLÉMENTATION

### Phase 1 — Foundation (3-4 jours)
- [ ] Migration SQL 003_page_builder.sql
- [ ] APIs CRUD pages (create, read, update, delete, list)
- [ ] API builder load/save (GrapesJS storage)
- [ ] API media upload
- [ ] Page liste dans le dashboard

### Phase 2 — Éditeur (4-5 jours)
- [ ] Composant MovanaEditor.tsx (wrapper GrapesJS + @grapesjs/react)
- [ ] Blocs de base (structure, contenu)
- [ ] Blocs sections pré-designées (hero, CTA, features, FAQ)
- [ ] Storage remote connecté à l'API
- [ ] Asset Manager connecté à la media library
- [ ] Toolbar (save, preview, publish, device toggle)

### Phase 3 — Blocs Movana (2-3 jours)
- [ ] Route Cards (dynamique — charge depuis DB)
- [ ] Operator Showcase
- [ ] Map Embed
- [ ] Search Bar
- [ ] Blocs avec le design system Movana (couleurs, fonts)

### Phase 4 — Header/Footer/Menus (2-3 jours)
- [ ] API globals (header/footer)
- [ ] Éditeur header dédié
- [ ] Éditeur footer dédié
- [ ] API menus + items
- [ ] UI gestion de menus (drag & drop items)

### Phase 5 — Rendu public (2 jours)
- [ ] Route dynamique [slug]/page.tsx
- [ ] SSR avec injection header + page + footer
- [ ] CSS scoping (isolation des styles)
- [ ] Cache/ISR pour les performances

### Phase 6 — Multi-tenant (2 jours)
- [ ] Isolation par operator_id
- [ ] {slug}.movana.bike → charge les pages de l'opérateur
- [ ] Templates de démarrage pour nouveaux opérateurs T3
- [ ] Block templates partagés vs privés

### Phase 7 — Undo/Redo global (2 jours)
- [ ] API snapshots (save, list, restore)
- [ ] Hook GrapesJS `storage:after:store` → créer un snapshot
- [ ] Composant UndoRedoBar.tsx (timeline visuelle des snapshots)
- [ ] Action labels automatiques ("Added section", "Changed style", etc.)
- [ ] Purge auto au-delà de 50 snapshots par page
- [ ] Restauration d'un snapshot → charge dans l'éditeur

### Phase 8 — Analytics par page (3-4 jours)
- [ ] Migration table `page_analytics` + `page_analytics_daily`
- [ ] API track (POST endpoint pour événements client-side)
- [ ] Composant AnalyticsTracker.tsx (script injecté dans les pages publiques)
- [ ] Tracking : pageviews, unique visitors, scroll depth, CTA clicks, time on page
- [ ] Agrégation CRON quotidienne → page_analytics_daily
- [ ] Dashboard analytics : graphiques views, devices, referrers, bounce rate
- [ ] Heatmap overlay (clic positions sur aperçu de page)
- [ ] Export CSV des stats
- [ ] Filtre par période (7j, 30j, 90j, custom)

### Phase 9 — Templates Marketplace (4-5 jours)
- [ ] Migration tables `marketplace_templates`, `template_reviews`, `template_installs`
- [ ] API marketplace CRUD + browse/search/filter
- [ ] TemplateBrowser.tsx (grille avec filtres catégorie, prix, popularité)
- [ ] TemplateDetail.tsx (screenshots, description, avis, bouton install)
- [ ] Flow d'installation (sélectionner quelles pages importer, mapping)
- [ ] Flow de soumission (opérateur T3 peut soumettre un template)
- [ ] Modération admin Movana (approve/reject avec raison)
- [ ] Système de notation (1-5 étoiles + commentaire)
- [ ] Templates officiels Movana (is_official flag)
- [ ] Templates featured sur la page d'accueil du marketplace

### Phase 10 — Export HTML/PDF (2-3 jours)
- [ ] Migration table `page_exports`
- [ ] API export endpoint
- [ ] Export HTML : page complète autonome (inline CSS, images en base64 ou URLs)
- [ ] Export PDF : rendu via Puppeteer (headless Chrome)
- [ ] Export ZIP : HTML + CSS + assets séparés
- [ ] Options : inclure header/footer, choisir la locale
- [ ] UI : ExportModal.tsx dans la toolbar de l'éditeur
- [ ] Historique des exports téléchargeables

### Phase 11 — Internationalisation i18n (3-4 jours)
- [ ] Migration table `page_translations`
- [ ] API translations CRUD par page/locale
- [ ] TranslationSwitcher.tsx dans l'éditeur (bascule entre locales)
- [ ] Éditeur side-by-side : original ↔ traduction
- [ ] Chaque locale a son propre gjs_data (layout peut varier par langue)
- [ ] Slug localisé (/about → /fr/a-propos, /th/เกี่ยวกับ)
- [ ] Rendu public : détection locale (Accept-Language, cookie, URL prefix)
- [ ] LocaleSwitcher.tsx composant public (dropdown langue)
- [ ] Traduction automatique via API Claude/OpenAI (AITranslateButton.tsx)
- [ ] Indicateur de qualité de traduction (manual > AI)
- [ ] Locales supportées : en, th, fr, ru, zh, de (configurable)

---

## 11. ESTIMATION TOTALE

| Phase | Durée | Priorité | Dépendances |
|-------|-------|----------|-------------|
| 1. Foundation (DB + APIs) | 3-4 jours | P0 | — |
| 2. Éditeur GrapesJS | 4-5 jours | P0 | Phase 1 |
| 3. Blocs Movana custom | 2-3 jours | P1 | Phase 2 |
| 4. Header/Footer/Menus | 2-3 jours | P1 | Phase 2 |
| 5. Rendu public SSR | 2 jours | P0 | Phases 1-2 |
| 6. Multi-tenant opérateurs | 2 jours | P2 | Phase 5 |
| 7. Undo/Redo global | 2 jours | P2 | Phase 2 |
| 8. Analytics par page | 3-4 jours | P2 | Phase 5 |
| 9. Templates Marketplace | 4-5 jours | P3 | Phases 2,6 |
| 10. Export HTML/PDF | 2-3 jours | P2 | Phase 5 |
| 11. Internationalisation | 3-4 jours | P3 | Phases 2,5 |
| **TOTAL** | **29-37 jours** | | |

### Roadmap visuelle

```
SEMAINE 1-2 ████████████████████  Phases 1-2 (Foundation + Éditeur)
SEMAINE 3   ██████████            Phases 3-4 (Blocs + Header/Footer)
SEMAINE 4   ██████████            Phases 5-6 (Rendu public + Multi-tenant)
SEMAINE 5   ██████████            Phases 7-8 (Undo/Redo + Analytics)
SEMAINE 6   ██████████            Phases 9-10 (Marketplace + Export)
SEMAINE 7   ████████              Phase 11 (i18n)
```

---

## 12. DÉTAIL TECHNIQUE DES NOUVELLES FEATURES

### 12.1 Undo/Redo global — Comment ça marche

```
┌─────────────────────────────────────────────────────────────────┐
│  SESSION UNDO (natif GrapesJS)                                  │
│  → Ctrl+Z / Ctrl+Y pendant l'édition                          │
│  → Perdu quand on ferme l'éditeur                              │
│                                                                 │
│  GLOBAL UNDO (notre système)                                    │
│  → Snapshot sauvegardé à chaque "Save" (auto ou manuel)        │
│  → Timeline visible dans l'éditeur                              │
│  → Restaurer n'importe quelle version même après déconnexion   │
│  → Chaque snapshot a un label auto-généré                      │
│                                                                 │
│  FLOW :                                                         │
│  1. GrapesJS auto-save → POST /api/builder/save/{id}           │
│  2. API save → INSERT snapshot dans editor_snapshots            │
│  3. Si > 50 snapshots pour cette page → purge les plus anciens │
│  4. Utilisateur clique "History" → GET /api/snapshots/{id}     │
│  5. Clic sur un snapshot → PUT restore → charge dans éditeur   │
│                                                                 │
│  DIFFÉRENCE AVEC page_versions :                                │
│  • editor_snapshots = chaque save (granulaire, auto-purgé)     │
│  • page_versions = chaque publication (permanent, pour rollback)│
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 Analytics — Architecture de tracking

```
┌─────────────────────────────────────────────────────────────────┐
│  CÔTÉ CLIENT (AnalyticsTracker.tsx)                             │
│                                                                 │
│  Injecté dans chaque page publique :                           │
│  • Pageview au chargement                                       │
│  • Scroll depth (25%, 50%, 75%, 100%)                          │
│  • Click tracking sur éléments avec data-track="cta"           │
│  • Time on page (au unload)                                    │
│  • Bounce detection (< 10s + aucun scroll)                     │
│                                                                 │
│  → POST /api/analytics/track (batch, debounced)                │
│  → Visitor ID via cookie anonyme (pas de PII)                  │
│                                                                 │
│  CÔTÉ SERVEUR                                                   │
│  • CRON quotidien : agrège page_analytics → page_analytics_daily│
│  • Purge : events raw > 90 jours supprimés                     │
│  • Dashboard lit depuis page_analytics_daily (rapide)           │
│                                                                 │
│  PRIVACY                                                        │
│  • Pas de cookies tiers                                         │
│  • IP hashé (anonymisé)                                        │
│  • Conforme PDPA (loi Thai) et GDPR                            │
│  • Opt-out possible via cookie consent                         │
└─────────────────────────────────────────────────────────────────┘
```

### 12.3 Marketplace — Flow complet

```
OPÉRATEUR CRÉE UN TEMPLATE
       │
       ▼
Dashboard > Marketplace > "Submit Template"
       │
       ▼
Remplit : nom, description, catégorie, tags, prix
Upload : screenshots, sélection des pages à inclure
       │
       ▼
POST /api/marketplace → status='pending_review'
       │
       ▼
ADMIN MOVANA reçoit notification
       │
       ▼
Review : preview, qualité, contenu approprié
       │
       ├── Approve → status='published', visible dans marketplace
       └── Reject → status='rejected' + raison envoyée à l'opérateur

OPÉRATEUR INSTALLE UN TEMPLATE
       │
       ▼
Dashboard > Marketplace > browse/search
       │
       ▼
Clic "Install" → choisit quelles pages importer
       │
       ▼
POST /api/marketplace/{id}/install
       │
       ▼
Crée les pages avec gjs_data du template
       │
       ▼
Opérateur peut customiser dans l'éditeur
```

### 12.4 Export — Formats supportés

```
┌─────────────────────────────────────────────────────────────────┐
│  FORMAT HTML                                                    │
│  → Fichier .html autonome                                      │
│  → CSS inline dans <style>                                     │
│  → Images en URLs absolues                                     │
│  → Fonts chargées depuis Google Fonts CDN                      │
│  → Header/footer inclus (optionnel)                            │
│                                                                 │
│  FORMAT PDF                                                     │
│  → Généré via Puppeteer (headless Chrome)                      │
│  → Rendu fidèle au pixel                                       │
│  → Format A4 ou responsive                                     │
│  → Utile pour : propositions commerciales, brochures           │
│                                                                 │
│  FORMAT ZIP                                                     │
│  → index.html + styles.css + /assets/                          │
│  → Images téléchargées localement                              │
│  → Prêt à héberger n'importe où                               │
│  → Utile pour : backup, migration, client qui veut son code    │
└─────────────────────────────────────────────────────────────────┘
```

### 12.5 i18n — Modèle de données

```
┌─────────────────────────────────────────────────────────────────┐
│  PAGE "About" (id: abc-123)                                     │
│  ├── Default locale: en                                         │
│  │   └── gjs_data: {...} html: "..." css: "..."                │
│  │                                                              │
│  ├── Translation: fr                                            │
│  │   └── page_translations(page_id=abc-123, locale='fr')       │
│  │       title: "À propos"                                      │
│  │       slug: "a-propos"                                       │
│  │       gjs_data: {...} ← peut avoir un layout différent      │
│  │                                                              │
│  ├── Translation: th                                            │
│  │   └── page_translations(page_id=abc-123, locale='th')       │
│  │       title: "เกี่ยวกับ"                                      │
│  │       slug: "about"                                          │
│  │       gjs_data: {...}                                        │
│  │                                                              │
│  └── Translation: ru                                            │
│      └── page_translations(page_id=abc-123, locale='ru')       │
│          title: "О нас"                                         │
│          slug: "o-nas"                                          │
│          gjs_data: {...}                                        │
│                                                                 │
│  URL ROUTING                                                    │
│  movana.bike/about          → English (default)                │
│  movana.bike/fr/a-propos    → French                           │
│  movana.bike/th/about       → Thai                             │
│  movana.bike/ru/o-nas       → Russian                          │
│                                                                 │
│  DETECTION (priority order)                                     │
│  1. URL prefix (/fr/...)                                        │
│  2. Cookie (movana_locale=fr)                                   │
│  3. Accept-Language header                                      │
│  4. Default (en)                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. CE QUI N'EST PAS INCLUS (V2+)

- Collaboration temps réel (multi-utilisateurs sur même page)
- A/B testing de pages (split traffic entre 2 versions)
- Animations avancées (timeline d'animation dans l'éditeur)
- Custom domain SSL pour opérateurs (custom.operator.com)
- E-commerce intégré (vente de produits via builder)
- Blog engine (système d'articles avec catégories/tags)
- Formulaire builder avancé (logique conditionnelle, multi-step)
```
