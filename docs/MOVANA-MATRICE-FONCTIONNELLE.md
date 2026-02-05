# MOVANA — Matrice Fonctionnelle Exhaustive

> **Version** : 1.0 — 5 Février 2026
> **Objectif** : Lister TOUTES les fonctionnalités, par rôle, par tier, sans rien oublier

---

## 1. RÔLES & ACCÈS

### Hiérarchie des rôles

```
MOVANA (Plateforme)
├── ADM  Super Admin Movana      — Staff interne, tout contrôle
│
OPÉRATEUR (par agence/loueur)
├── OWN  Owner                   — Propriétaire du compte, facturation
├── OPA  Operator Admin          — Gère tout sauf facturation
├── OPM  Operator Manager        — Opérations quotidiennes
├── OPS  Operator Staff          — Actions assignées (réservations)
├── GUI  Guide                   — Voit ses missions uniquement
│
PARTENAIRE LOCAL (par agence)
├── PTR  Partner                 — Resto, hôtel, café lié à un opérateur
│
PUBLIC
├── USR  User (Rider)            — Compte optionnel (avis, historique)
└── PUB  Public                  — Visiteur anonyme
```

---

## 2. MATRICE PAR ESPACE

### 🌐 A — PORTAIL PUBLIC (movana.bike)

**Accessible : Tout le monde**

| # | Fonctionnalité | Détail | Rôle |
|---|---------------|--------|------|
| A01 | Homepage | Landing animée, hero, search, routes featured, régions, CTA | PUB |
| A02 | Discovery Hub (/explore) | Recherche + filtres multi-critères | PUB |
| A03 | Filtres discovery | Région, thématique (prioritaire), difficulté, type vélo, distance, durée, note, langue guide | PUB |
| A04 | Carte interactive | Toutes les routes sur carte Mapbox, clusters, filtrable | PUB |
| A05 | Fiche route | Cover, stats, tracé carte, POIs, avis, "Powered by [Opérateur]", CTA réserver | PUB |
| A06 | Fiche opérateur | Logo, description, routes publiées, avis global, badge tier, lien site dédié si T3 | PUB |
| A07 | Annuaire opérateurs | Liste tous les opérateurs, filtrable par région/spécialité | PUB |
| A08 | Avis routes | Lire les avis, notes 5 critères (paysage, difficulté, navigation, POIs, global) | PUB |
| A09 | Poster un avis | Compte optionnel (magic link), noter + commenter + photos | USR |
| A10 | Blog SEO | Articles par région, thématique, tips cyclisme en Thaïlande | PUB |
| A11 | FAQ | Questions fréquentes opérateurs + riders | PUB |
| A12 | Pages légales | CGU, Privacy, Cookies | PUB |
| A13 | Inscription opérateur | Formulaire onboarding → création compte T0 | PUB |
| A14 | Login / Register rider | Magic link ou email/password, optionnel | PUB/USR |
| A15 | i18n | EN (défaut), TH, FR, RU — switchable | PUB |
| A16 | SEO | Meta tags, structured data, sitemap, og:image par route | PUB |
| A17 | Notifications push web | Nouvelles routes dans ta région, promos | USR |

---

### 🔐 B — DASHBOARD OPÉRATEUR (app.movana.bike)

#### B.1 — Commun à tous les tiers (T0+)

| # | Fonctionnalité | Détail | Rôle min |
|---|---------------|--------|----------|
| B01 | Dashboard home | Vue d'ensemble avec métriques clés selon tier | OWN |
| B02 | Profil opérateur | Nom, logo, cover, description (EN+TH), coordonnées, adresse, horaires | OWN |
| B03 | Gestion abonnement | Voir tier actuel, upgrade/downgrade, historique factures | OWN |
| B04 | Facturation Movana | Paiement abo via Stripe (carte de l'opérateur → Movana) | OWN |
| B05 | Paramètres compte | Langue, timezone, devise affichée, notifications email | OWN |
| B06 | Notifications | Fil de notifications in-app, marquage lu/non-lu | OPS+ |
| B07 | Audit log | Journal des actions (qui a fait quoi, quand) | OPA+ |

#### B.2 — Tier 1 : Visibility (299 ฿/mois)

| # | Fonctionnalité | Détail | Rôle min |
|---|---------------|--------|----------|
| B10 | Visibilité boostée | Priorité affichage dans l'annuaire + badge "Verified" | auto |
| B11 | Analytics basiques | Vues profil, clics "contact", sources trafic (7/30 jours) | OWN |
| B12 | Badge confiance | "Verified Partner" affiché sur profil public | auto |

#### B.3 — Tier 2 : Experience (999 ฿/mois)

| # | Fonctionnalité | Détail | Rôle min |
|---|---------------|--------|----------|
| **ROUTES** | | | |
| B20 | Liste mes routes | Tableau : titre, statut, vues, note, date création | OPM+ |
| B21 | Créer route (Route Builder) | Éditeur carte Mapbox : clic tracé, snap-to-road, 3D, satellite | OPM+ |
| B22 | Import GPX | Upload fichier GPX → auto-tracé + snap | OPM+ |
| B23 | GPS Recording | Enregistrer un parcours en temps réel depuis mobile (PWA) | OPM+ |
| B24 | Éditer route | Modifier tracé, infos, POIs, cover, galerie | OPM+ |
| B25 | POIs sur route | Ajouter/éditer/supprimer des points d'intérêt sur le tracé | OPM+ |
| B26 | Catégories POI | Café, restaurant, temple, viewpoint, beach, market, museum, park, shop, hotel, autre | OPM+ |
| B27 | Thématiques route | Beach & Coast, Temples, Nature, Food, Villages, Island, Night Ride, Family | OPM+ |
| B28 | Publish / Draft | Basculer entre brouillon et publié | OPM+ |
| B29 | Preview route | Voir la route comme un visiteur avant publication | OPM+ |
| B30 | QR Code route | Génération automatique QR → lien rider.movana.bike/r/{code} | OPM+ |
| B31 | Profil élévation | Graphe altitude auto-calculé depuis le tracé | auto |
| **IA ROUTES** | | | |
| B32 | IA : Optimisation parcours | Suggérer des variantes de tracé (plus scenic, plus court, éviter trafic) | OPM+ |
| B33 | IA : Suggestion POIs | Recommander des POIs pertinents sur/près du tracé (API Google/Mapbox + IA) | OPM+ |
| B34 | IA : Description auto | Générer description route EN/TH depuis tracé + POIs | OPM+ |
| B35 | IA : Difficulté estimée | Calculer la difficulté à partir de distance, dénivelé, surface | auto |
| **PARTENAIRES LOCAUX** | | | |
| B40 | Liste partenaires locaux | Restos, cafés, hôtels liés à mes routes | OPM+ |
| B41 | Créer partenaire | Fiche : nom, catégorie, logo, contact, GPS, remise offerte | OPM+ |
| B42 | Lier partenaire à POI | Associer un partenaire local à un POI de route | OPM+ |
| B43 | Offres partenaires | Créer des promos (ex: -10% chez ce café pour les riders) | OPM+ |
| **ANALYTICS ROUTES** | | | |
| B50 | Stats par route | Vues, QR scans, rides commencés/terminés, note, avis | OPM+ |
| B51 | Heatmap parcours | Où les riders s'arrêtent, quels POIs sont visités | OPA+ |
| B52 | Comparaison routes | Comparer performance de mes routes entre elles | OPA+ |

#### B.4 — Tier 3 : Operator (2499 ฿/mois)

| # | Fonctionnalité | Détail | Rôle min |
|---|---------------|--------|----------|
| **FLOTTE** | | | |
| B60 | Liste véhicules | Cards visuelles : photo, nom, type, statut, prix, stock | OPM+ |
| B61 | Ajouter véhicule | Fiche complète : type, specs (batterie, autonomie, poids max), pricing (½ j, j, sem, mois), galerie | OPM+ |
| B62 | Statuts véhicule | Available, Rented, Maintenance, Retired — changement visuel | OPM+ |
| B63 | Calendrier flotte | Vue calendrier : quel vélo dispo du X au Y, vue semaine/mois | OPM+ |
| B64 | Tarification flexible | Par demi-journée, journée, semaine, mois + dépôt | OPM+ |
| B65 | Catégories véhicules | E-bike, road, mountain, gravel, city, scooter, tandem, cargo, kids | OPM+ |
| **IA FLOTTE** | | | |
| B66 | IA : Maintenance prédictive | Alertes basées sur km parcourus, nb locations, dernière maintenance | auto |
| B67 | IA : Tarification dynamique | Suggestion prix selon saison, demande, concurrence locale | OPA+ |
| B68 | IA : Optimisation stock | Recommander ajout/retrait véhicules selon tendances location | OPA+ |
| **RÉSERVATIONS** | | | |
| B70 | Liste réservations | Tableau avec filtres : statut, date, client, véhicule | OPS+ |
| B71 | Détail réservation | Infos complètes : client, véhicule(s), dates, add-ons, paiement, notes | OPS+ |
| B72 | Workflow statuts | pending → confirmed → ready → delivered → active → completed (+ cancelled, no_show) | OPS+ |
| B73 | Créer résa manuelle | Staff crée une résa depuis le dashboard (walk-in, téléphone) | OPS+ |
| B74 | Calendrier réservations | Vue calendrier de toutes les résas, drag-and-drop pour changer dates | OPM+ |
| B75 | Vue Kanban résas | Colonnes par statut, drag entre colonnes | OPM+ |
| **TUNNEL RÉSERVATION PUBLIC** | | | |
| B80 | Wizard booking (8 étapes) | 1. Type expérience → 2. Véhicule → 3. Quantité → 4. Dates/slots → 5. Add-ons → 6. Livraison → 7. Infos client → 8. Paiement | PUB |
| B81 | Sélection véhicule | Cards visuelles avec prix, dispo live, specs | PUB |
| B82 | Slots horaires | Matin (8h-12h), après-midi (13h-17h), journée complète, custom | PUB |
| B83 | Add-ons | Siège bébé, siège enfant, batterie sup, support téléphone, GPS tracker, sacoches, casque (gratuit), antivol | PUB |
| B84 | Livraison | Type lieu (hôtel, villa, airbnb, condo), adresse, GPS, notes, pricing par zone | PUB |
| B85 | Zones de livraison | Définir zones géographiques avec tarifs différents (polygones ou cercles) | OPA+ |
| B86 | Calcul prix dynamique | Total auto : véhicules × durée + add-ons + livraison - réduction | auto |
| B87 | Codes promo | Créer codes : % ou montant fixe, dates validité, usage max, par véhicule ou global | OPA+ |
| **GUIDES** | | | |
| B90 | Liste guides | Photo, langues, spécialités, disponibilités, note | OPM+ |
| B91 | Profil guide | Bio, photo, langues parlées, certifications, zones couvertes | OPM+ |
| B92 | Disponibilités guide | Calendrier par guide, bloquer dates | GUI+ |
| B93 | Assigner guide à résa | Lors de la résa ou après, choisir un guide dispo | OPM+ |
| B94 | Dashboard guide | Le guide voit SES tours assignés, détails, contact client, confirmer/décliner | GUI |
| B95 | Tarifs guide | Demi-journée, journée, multi-jours, par langue | OPA+ |
| **ASSURANCE** | | | |
| B96 | Plans assurance | Basic, Premium — couvertures (vol, dommages, responsabilité civile), prix/jour, franchise | OPA+ |
| B97 | Assurance dans booking | Proposé comme add-on dans le wizard, calcul auto selon durée | PUB |
| **CLIENTS (CRM LIGHT)** | | | |
| B100 | Liste clients | Tableau : nom, email, téléphone, nationalité, total résas, total dépensé | OPM+ |
| B101 | Fiche client | Historique réservations, notes, passeport, fidélité | OPM+ |
| B102 | Import/Export clients | CSV import/export | OPA+ |
| **PAIEMENTS** | | | |
| B110 | Config Stripe Connect | OAuth en 1 clic → connecter son Stripe → paiement direct | OWN |
| B111 | Config PayPal | OAuth connexion | OWN |
| B112 | Config PromptPay | Numéro, nom affiché, QR code auto | OWN |
| B113 | Config virement | Banque, compte, IBAN, SWIFT, instructions | OWN |
| B114 | Paiement sur place | Activer/désactiver : cash, carte, PromptPay, crypto | OWN |
| B115 | Devise par défaut | THB, EUR, USD + devises acceptées | OWN |
| B116 | Acompte | Activer, % du total (ex: 30%) | OWN |
| B117 | Politique d'annulation | Flexible (24h), Modérée (48h), Stricte (7j), Custom — remboursement auto ou manuel | OWN |
| **MOVANA NE PREND 0% COMMISSION (MVP)** | Abonnement fixe uniquement | | |
| **PROMOTIONS** | | | |
| B120 | Codes promo opérateur | %, montant fixe, dates, usage max | OPA+ |
| B121 | Promos auto | Happy hour, early bird, last minute (règles configurables) | OPA+ |
| B122 | Promos partenaires locaux | Remises chez les POIs partenaires, affichées aux riders | OPM+ |
| **ÉQUIPE** | | | |
| B130 | Gestion membres | Inviter par email, assigner rôle (admin, manager, staff, guide) | OWN |
| B131 | Permissions par rôle | Matrice permissions : qui voit quoi, qui édite quoi | OWN |
| B132 | Multi-utilisateurs | Plusieurs personnes connectées en même temps | tous |
| **ANALYTICS AVANCÉS** | | | |
| B140 | Revenue dashboard | Chiffre d'affaires, panier moyen, top véhicules, tendances | OPA+ |
| B141 | Occupancy rate | Taux d'occupation flotte par période | OPA+ |
| B142 | Customer analytics | Nationalités, récurrence, canaux d'acquisition | OPA+ |
| B143 | Seasonal insights | Comparaison périodes, prédiction saisonnalité | OPA+ |
| B144 | Export rapports | PDF / CSV des analytics | OPA+ |

#### B.5 — Tier 3 : Site Dédié (inclus dans T3 Operator)

| # | Fonctionnalité | Détail | Rôle min |
|---|---------------|--------|----------|
| **SITE BUILDER** | | | |
| B150 | Site sous-domaine | {slug}.movana.bike — automatique à l'activation T3 | auto |
| B151 | Domain custom | Connecter son propre domaine (freeride-jomtien.com) — config DNS guidée | OWN |
| B152 | Page builder visuel | GrapesJS : drag & drop, blocs pré-faits Movana, preview live | OPA+ |
| B153 | Blocs Movana | Hero, Routes Grid, Fleet Showcase, Booking Widget, Testimonials, Team, FAQ, CTA, Contact, Map, Gallery, Partners, Stats, Pricing | OPA+ |
| B154 | Pages illimitées | Accueil, À propos, Flotte, Routes, Réservation, Contact, FAQ, CGV, custom | OPA+ |
| B155 | Header/Footer éditables | Éditeur visuel pour header et footer, logo, menu, couleurs | OPA+ |
| B156 | Gestion menus | Menus de navigation custom (header, footer, mobile) | OPA+ |
| B157 | Médiathèque | Upload images, gestion fichiers, galeries | OPM+ |
| B158 | Branding | Logo, couleurs primaire/secondaire, favicon, polices custom | OPA+ |
| B159 | SEO par page | Meta title, description, og:image par page | OPA+ |
| B160 | Versioning pages | Historique des versions, rollback en 1 clic | OPA+ |
| B161 | Blocs réutilisables | Sauvegarder un bloc custom pour le réutiliser sur d'autres pages | OPA+ |
| B162 | Intégration booking | Widget de réservation intégrable sur n'importe quelle page du site | auto |
| B163 | Intégration routes | Grid de routes filtrable intégrable | auto |
| B164 | Google Analytics / Tag Manager | Coller son ID pour tracking externe | OPA+ |
| B165 | Chatbot / WhatsApp | Intégrer widget chat (lien WhatsApp, Messenger, ou custom) | OPA+ |
| **IA SITE** | | | |
| B166 | IA : Génération contenu | Générer textes pages (about, FAQ) depuis profil opérateur | OPA+ |
| B167 | IA : Suggestion layout | Proposer un template de site basé sur le type d'activité | OPA+ |
| B168 | IA : Traduction auto | Traduire les pages EN ↔ TH ↔ FR ↔ RU | OPA+ |

---

### 📱 C — RIDER APP (PWA — rider.movana.bike)

**Accessible via QR code, lien booking, ou directement — PAS DE COMPTE REQUIS**

| # | Fonctionnalité | Détail |
|---|---------------|--------|
| **ACCÈS** | | |
| C01 | Accès QR code | Scanner QR → landing route → ouvrir dans PWA |
| C02 | Accès booking | Lien dans email confirmation → PWA avec route pré-chargée |
| C03 | Accès direct | rider.movana.bike → liste routes à proximité |
| C04 | Install PWA | Prompt "Ajouter à l'écran d'accueil" (iOS + Android) |
| C05 | Pas de compte obligatoire | Navigation complète sans inscription |
| C06 | Compte optionnel | Magic link pour sauver historique et poster avis |
| **NAVIGATION** | | |
| C10 | Carte route | Tracé sur Mapbox, orientation heading-up |
| C11 | Position GPS live | Dot bleu, suivi temps réel |
| C12 | Turn-by-turn | Bandeau instruction style Waze : flèche, distance, nom rue |
| C13 | Instructions vocales | Multi-langue, activable/désactivable |
| C14 | Vibration alertes | Vibre avant chaque manœuvre |
| C15 | Navigation vers départ | Si rider > 200m du départ → proposer itinéraire vers point de départ (vélo ou voiture via Maps/Waze) |
| C16 | Transition départ→route | Tracé bleu pointillé vers départ, vert une fois sur la route |
| C17 | Re-routing | Si rider s'écarte du tracé → alerte + suggestion retour |
| **MODE TERRAIN** | | |
| C20 | Offline complet | Route + carte pré-téléchargées, fonctionne sans réseau |
| C21 | POIs interactifs | Voir détails, photos, promos au tap |
| C22 | Notification POI | Alerte automatique à 200m d'un POI |
| C23 | Promos partenaires | Afficher les offres des partenaires locaux en contexte |
| C24 | Progression | % parcouru, temps restant estimé, distance restante |
| C25 | Profil élévation live | Position actuelle sur le graphe altitude |
| C26 | Météo | Conditions actuelles + prévisions sur le parcours |
| C27 | Bouton SOS | Appel urgence (police/ambulance), partage position GPS, contact opérateur |
| **FIN DE RIDE** | | |
| C30 | Stats récap | Distance, durée, dénivelé, vitesse moy/max |
| C31 | Carte du parcours réel | Tracé GPS enregistré vs tracé prévu |
| C32 | Photos ride | Option ajouter photos depuis galerie |
| C33 | Partage social | Partager stats + carte sur Instagram, Facebook, Line |
| C34 | Poster avis | Notation 5 critères + commentaire + photos |
| C35 | Découvrir d'autres routes | Suggestions routes similaires ou à proximité |
| C36 | Réserver encore | CTA vers booking de l'opérateur |
| **DONNÉES COLLECTÉES (ANONYMES)** | | |
| C40 | Tracé GPS | GeoJSON du parcours réel |
| C41 | Temps aux POIs | Durée d'arrêt par POI |
| C42 | Vitesses | Moyenne, max, par segment |
| C43 | Complétion | Route terminée ou abandonnée, point d'abandon |
| C44 | Device info | Mobile/desktop, OS, navigateur |

---

### ⚙️ D — SUPER ADMIN MOVANA (admin.movana.bike ou section dans app.movana.bike)

| # | Fonctionnalité | Détail |
|---|---------------|--------|
| D01 | Dashboard global | Nombre opérateurs, routes, riders actifs, revenus abos |
| D02 | Gestion opérateurs | Liste, détails, changer tier manuellement, suspendre, supprimer |
| D03 | Validation opérateurs | Vérifier et approuver les nouveaux inscrits |
| D04 | Gestion régions | CRUD régions (nom EN/TH, slug, cover, coordonnées GPS) |
| D05 | Gestion thématiques | CRUD thématiques routes (nom EN/TH, icône, couleur) |
| D06 | Modération avis | Voir tous les avis, masquer les abusifs |
| D07 | Page builder Movana | Éditer les pages de movana.bike (landing, about, FAQ, blog) via GrapesJS |
| D08 | Blog management | CRUD articles, catégories, auteurs, SEO |
| D09 | Gestion médias | Médiathèque globale Movana |
| D10 | Analytics plateforme | Vue globale : top routes, top opérateurs, géographie riders |
| D11 | Gestion abonnements | Voir tous les abos, revenus, MRR, churn |
| D12 | Config Stripe Movana | Gestion des plans, prix, coupons pour les abos opérateurs |
| D13 | Notifications système | Envoyer notifications à tous les opérateurs ou ciblé |
| D14 | Newsletter | Gestion abonnés newsletter, envoi via Resend |
| D15 | Audit log global | Toutes les actions sur la plateforme |
| D16 | Config i18n | Gérer les traductions |
| D17 | Badges opérateurs | Créer/assigner des badges (Verified, Top Rated, New, etc.) |
| D18 | Feature flags | Activer/désactiver des features par tier ou globalement |
| D19 | Santé système | Health check DB, API, services externes, erreurs |
| D20 | Seed data FreeRide | Pré-remplir les données de FreeRide comme opérateur test T3 |

---

## 3. CE QUE TU OUBLIAIS

| Feature | Pourquoi c'est important |
|---------|-------------------------|
| **Politique d'annulation configurable** | Chaque opérateur a sa propre politique, impact sur les remboursements |
| **Acompte/dépôt configurable** | Certains veulent 30% à la résa, d'autres 100% |
| **Multi-devises côté opérateur** | Un loueur à Phuket peut vouloir facturer en EUR aux touristes |
| **Badges/certifications opérateur** | Social proof : Verified, Top Rated, Eco-friendly, etc. |
| **Feature flags** | Déployer progressivement les features sans casser |
| **Audit log** | Qui a modifié quoi — essentiel multi-utilisateurs |
| **Export rapports** | Les opérateurs veulent des PDF/CSV pour leur comptabilité |
| **Chatbot/WhatsApp widget** | Canal de contact rapide sur le site opérateur |
| **Google Analytics sur site opérateur** | L'opérateur veut tracker son propre trafic |
| **Notifications email transactionnelles** | Confirmation résa, rappel, annulation — via Resend |
| **Re-routing rider** | Si le rider se perd, l'app doit réagir |
| **Assurance dans le booking** | Revenue stream pour l'opérateur + protection |
| **Réservation manuelle (walk-in)** | Le staff à la boutique doit pouvoir créer une résa sans passer par le site |
| **Promos automatiques** | Happy hour, early bird, last minute — moteur de règles |
| **Gestion retours véhicules** | Point de retour différent du départ |
| **IA maintenance prédictive** | Alerter avant la panne, pas après |
| **IA suggestion de prix** | Optimiser les revenus selon la demande |
| **IA génération contenu site** | Les opérateurs n'aiment pas écrire — l'IA fait le gros du travail |
| **Webhooks sortants** | Permettre aux opérateurs tech de connecter leurs outils (Zapier, n8n) |
| **API publique (future)** | Pour les opérateurs qui veulent intégrer Movana dans leur système existant |

---

## 4. IA — DÉTAIL DES FONCTIONNALITÉS

| # | Module | Feature IA | Input | Output | API/Modèle |
|---|--------|-----------|-------|--------|------------|
| IA01 | Routes | Optimisation tracé | GeoJSON tracé | 2-3 variantes (scenic, court, sécurisé) | Mapbox Directions + Claude |
| IA02 | Routes | Suggestion POIs | GeoJSON tracé + rayon | Liste POIs pertinents sur/près du tracé | Mapbox Geocoding + Google Places + Claude ranking |
| IA03 | Routes | Description auto | Tracé + POIs + difficulté | Texte EN + TH descriptif et marketing | Claude |
| IA04 | Routes | Estimation difficulté | Distance, dénivelé, surface, virages | Score easy/moderate/challenging/expert | Calcul algorithmique |
| IA05 | Flotte | Maintenance prédictive | km parcourus, nb locations, âge véhicule, dernière maintenance | Alerte + recommandation action | Règles métier + Claude analyse |
| IA06 | Flotte | Tarification dynamique | Historique résas, saison, météo, events locaux | Prix suggéré par véhicule/période | Modèle statistique + Claude |
| IA07 | Flotte | Optimisation stock | Données résa 6 mois, saisonnalité | Recommandation achat/retrait véhicules | Claude analyse |
| IA08 | Site | Génération contenu | Profil opérateur, spécialités, région | Textes pages (about, FAQ, descriptions) | Claude |
| IA09 | Site | Suggestion layout | Type activité, contenus existants | Template de site recommandé | Claude |
| IA10 | Site | Traduction auto | Texte source (toute langue) | Traductions EN/TH/FR/RU | Claude |
| IA11 | Analytics | Insights automatiques | Données analytics 30j | Résumé texte des tendances et recommandations | Claude |
| IA12 | Booking | Suggestion up-sell | Panier résa en cours | Add-ons pertinents ("riders who booked X also added Y") | Analyse stats + Claude |

---

## 5. MATRICE TIER ↔ FONCTIONNALITÉS (RÉSUMÉ)

```
LÉGENDE:  ✅ = Inclus    ❌ = Non disponible    💰 = Add-on payant

                            T0      T1      T2       T3
                           FREE   VISIBILITY EXPERIENCE OPERATOR
──────────────────────────────────────────────────────────────
PROFIL & ANNUAIRE
  Profil public              ✅      ✅      ✅       ✅
  Visibilité boostée         ❌      ✅      ✅       ✅
  Badge Verified             ❌      ✅      ✅       ✅
  Badge Premium              ❌      ❌      ❌       ✅

ROUTES
  Créer routes               ❌      ❌      ✅       ✅
  Route Builder              ❌      ❌      ✅       ✅
  Import GPX                 ❌      ❌      ✅       ✅
  GPS Recording              ❌      ❌      ✅       ✅
  QR Codes                   ❌      ❌      ✅       ✅
  Routes illimitées          ❌      ❌      ✅       ✅
  IA Routes                  ❌      ❌      ✅       ✅

PARTENAIRES LOCAUX
  Gérer partenaires          ❌      ❌      ✅       ✅
  Offres/Promos POI          ❌      ❌      ✅       ✅

FLOTTE
  Gestion véhicules          ❌      ❌      ❌       ✅
  Calendrier flotte          ❌      ❌      ❌       ✅
  IA Maintenance             ❌      ❌      ❌       ✅
  IA Tarification            ❌      ❌      ❌       ✅

RÉSERVATIONS
  Booking engine             ❌      ❌      ❌       ✅
  Wizard public              ❌      ❌      ❌       ✅
  Résa manuelle              ❌      ❌      ❌       ✅
  Add-ons                    ❌      ❌      ❌       ✅
  Guides                     ❌      ❌      ❌       ✅
  Assurance                  ❌      ❌      ❌       ✅
  Codes promo                ❌      ❌      ❌       ✅

PAIEMENTS
  Config Stripe Connect      ❌      ❌      ❌       ✅
  Multi-méthodes             ❌      ❌      ❌       ✅

SITE DÉDIÉ
  Sous-domaine               ❌      ❌      ❌       ✅
  Domain custom              ❌      ❌      ❌       💰
  Page builder               ❌      ❌      ❌       ✅
  IA Contenu site            ❌      ❌      ❌       ✅

CLIENTS
  CRM light                  ❌      ❌      ❌       ✅
  Export CSV                  ❌      ❌      ❌       ✅

ÉQUIPE
  Multi-utilisateurs         ❌      ❌      ❌       ✅
  Rôles & permissions        ❌      ❌      ❌       ✅

ANALYTICS
  Vues profil                ❌      ✅      ✅       ✅
  Stats routes               ❌      ❌      ✅       ✅
  Revenue dashboard          ❌      ❌      ❌       ✅
  Occupancy rate             ❌      ❌      ❌       ✅
  IA Insights                ❌      ❌      ❌       ✅
  Export rapports             ❌      ❌      ❌       ✅

NOTIFICATIONS
  In-app                     ✅      ✅      ✅       ✅
  Email transactionnel       ❌      ❌      ✅       ✅
  Push (FCM)                 ❌      ❌      ❌       ✅

i18n                         ✅      ✅      ✅       ✅
──────────────────────────────────────────────────────────────
PRIX                         0      299฿    999฿    2499฿
                                    /mois   /mois    /mois
```

---

## 6. DÉCISIONS VALIDÉES (5 Février 2026)

| # | Question | Décision | Détail |
|---|----------|----------|--------|
| Q1 | Domain custom T3 | **Add-on +500฿/mois** | Inclus gratuitement dans T4 White Label |
| Q2 | Limite routes T2 | **Illimité** | Les routes = contenu hub, push T3 par la valeur (booking/flotte) |
| Q3 | Commission future | **0% MVP**, à réévaluer post-launch | Restera probablement 0% (argument commercial fort) |
| Q4 | PWA rider branding | **Logo opérateur** | Movana discret en footer uniquement |
| Q5 | API publique | **Incluse T3** | Clés API dans le dashboard |
| Q6 | Webhooks | **Post-launch V2** | Pas dans le MVP |
| Q7 | Marque blanche | **T4 White Label — 4999฿/mois** | Nouveau tier : 0 mention Movana + domain custom inclus |
| Q8 | IA features | **Crédits prépayés** | Packs 199-3999฿ + 20 crédits offerts onboarding T2+ |
| Q9 | POI auto-completion | **IA (2 crédits/route)** | Pipeline : Mapbox + Google Places + Claude enrichissement |
| Q10 | Accès API IA opérateur | **Oui, via même crédits** | L'opérateur peut appeler l'API IA avec sa clé + ses crédits |
