# 🚀 MOVANA - Guide de Setup

## 📋 Résumé de l'Architecture

```
movana/
├── apps/
│   ├── web/              # Portail public (movana.bike)
│   ├── dashboard/        # BO opérateurs (app.movana.bike)
│   ├── api/              # Backend API (api.movana.bike)
│   ├── rider/            # PWA navigation (rider.movana.bike)
│   └── operator-sites/   # Sites opérateurs (*.movana.bike)
│
├── packages/
│   ├── ui/               # Composants partagés
│   ├── database/         # Schema Drizzle + client
│   ├── config/           # Config partagée
│   └── utils/            # Helpers
│
├── turbo.json            # Turborepo config
├── package.json          # Workspace root
└── pnpm-workspace.yaml   # PNPM workspaces
```

---

## 🛠️ ÉTAPE 1 : Domaine & DNS

### 1.1 Acheter movana.bike

1. Aller sur [Cloudflare Registrar](https://dash.cloudflare.com/domains)
2. Rechercher `movana.bike`
3. Acheter (~$9/an)

### 1.2 Configurer DNS

Dans Cloudflare > movana.bike > DNS :

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | `<IP_HOSTINGER>` | ✅ |
| A | www | `<IP_HOSTINGER>` | ✅ |
| A | app | `<IP_HOSTINGER>` | ✅ |
| A | api | `<IP_HOSTINGER>` | ✅ |
| A | rider | `<IP_HOSTINGER>` | ✅ |
| A | * | `<IP_HOSTINGER>` | ✅ |

### 1.3 SSL Settings

- SSL/TLS > Overview > **Full (strict)**
- SSL/TLS > Edge Certificates > **Always Use HTTPS** ✅
- SSL/TLS > Origin Server > **Create Certificate** (pour Nginx)

---

## 🖥️ ÉTAPE 2 : Setup Hostinger VPS

### 2.1 Connexion SSH

```bash
ssh root@<IP_HOSTINGER>
```

### 2.2 Installation des dépendances

```bash
# Mise à jour système
apt update && apt upgrade -y

# Nginx
apt install -y nginx

# PostgreSQL 15
apt install -y postgresql postgresql-contrib

# Git
apt install -y git

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PNPM
npm install -g pnpm

# PM2 (process manager)
npm install -g pm2
```

### 2.3 Configuration PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer l'utilisateur et la base
CREATE USER movana WITH PASSWORD 'CHANGE_THIS_PASSWORD';
CREATE DATABASE movana_db OWNER movana;
GRANT ALL PRIVILEGES ON DATABASE movana_db TO movana;
\q
```

### 2.4 Créer les dossiers

```bash
mkdir -p /var/www/movana
mkdir -p /var/www/movana/uploads
mkdir -p /etc/ssl/movana
chown -R www-data:www-data /var/www/movana
```

### 2.5 Configurer le certificat SSL Cloudflare

1. Dans Cloudflare : SSL/TLS > Origin Server > Create Certificate
2. Copier le certificat et la clé
3. Sur le serveur :

```bash
nano /etc/ssl/movana/origin.pem
# Coller le certificat

nano /etc/ssl/movana/origin-key.pem
# Coller la clé

chmod 600 /etc/ssl/movana/origin-key.pem
```

### 2.6 Configurer Nginx

```bash
# Copier la config
nano /etc/nginx/sites-available/movana
# Coller le contenu de movana-nginx.conf

# Activer le site
ln -s /etc/nginx/sites-available/movana /etc/nginx/sites-enabled/

# Désactiver le site par défaut
rm /etc/nginx/sites-enabled/default

# Tester la config
nginx -t

# Recharger
systemctl reload nginx
```

---

## 📦 ÉTAPE 3 : Setup du Projet

### 3.1 Cloner le repo

```bash
cd /var/www/movana
git clone https://github.com/VOTRE_USERNAME/movana.git .
```

### 3.2 Installer les dépendances

```bash
pnpm install
```

### 3.3 Configurer l'environnement

```bash
cp .env.example .env
nano .env
# Remplir toutes les variables
```

Variables importantes à configurer :

```env
# Database
DATABASE_URL=postgresql://movana:VOTRE_PASSWORD@localhost:5432/movana_db

# JWT
JWT_SECRET=GENERER_UNE_CLE_RANDOM_32_CHARS

# Stripe (créer un compte sur stripe.com)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_CLIENT_ID=ca_...

# Mapbox (créer un compte sur mapbox.com)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# Resend (créer un compte sur resend.com)
RESEND_API_KEY=re_...

# Encryption
ENCRYPTION_KEY=GENERER_UNE_CLE_32_CHARS
```

### 3.4 Setup la base de données

```bash
# Générer les migrations
pnpm db:generate

# Appliquer les migrations
pnpm db:migrate

# Seed les données initiales
pnpm db:seed
```

### 3.5 Build les apps

```bash
pnpm build
```

### 3.6 Configurer PM2

```bash
# Créer le fichier ecosystem
nano ecosystem.config.js
```

Contenu :

```javascript
module.exports = {
  apps: [
    {
      name: 'movana-web',
      cwd: '/var/www/movana/apps/web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'movana-dashboard',
      cwd: '/var/www/movana/apps/dashboard',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'movana-api',
      cwd: '/var/www/movana/apps/api',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'movana-rider',
      cwd: '/var/www/movana/apps/rider',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'movana-operator-sites',
      cwd: '/var/www/movana/apps/operator-sites',
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Lancer :

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔄 ÉTAPE 4 : CI/CD (GitHub Actions)

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/movana
            git pull origin main
            pnpm install
            pnpm build
            pm2 reload all
```

Configurer les secrets dans GitHub :
- `HOST` : IP du serveur
- `USERNAME` : root
- `SSH_KEY` : Clé SSH privée

---

## ✅ CHECKLIST DE LANCEMENT

### Infrastructure
- [ ] Domaine movana.bike acheté
- [ ] DNS configuré sur Cloudflare
- [ ] SSL configuré (Full strict)
- [ ] VPS Hostinger prêt
- [ ] PostgreSQL installé et configuré
- [ ] Nginx configuré
- [ ] PM2 configuré

### Services Externes
- [ ] Compte Stripe créé (Movana platform)
- [ ] Stripe Connect activé
- [ ] Compte Mapbox créé (token API)
- [ ] Compte Resend créé (emails)
- [ ] Firebase projet créé (push notifications)

### Code
- [ ] Repo GitHub créé
- [ ] .env configuré
- [ ] Base de données migrée
- [ ] Seed exécuté
- [ ] Build réussi
- [ ] Apps démarrées avec PM2

### Tests
- [ ] movana.bike accessible
- [ ] app.movana.bike accessible
- [ ] api.movana.bike/health renvoie OK
- [ ] rider.movana.bike accessible
- [ ] freeride.movana.bike accessible (test operator)

---

## 🎨 DESIGN TOKENS (référence)

```css
/* Colors */
--teal-deep: #3B7689;
--emerald: #68B59B;
--mint: #92D99E;
--off-white: #F7FAF9;
--dark: #1F2E2B;
--secondary-text: #5E726E;
--gold: #E8B86D;
--coral: #E07A5F;

/* Fonts */
--font-heading: 'Outfit', sans-serif;
--font-body: 'Plus Jakarta Sans', sans-serif;

/* Shadows */
--shadow-sm: 0 2px 8px rgba(59, 118, 137, 0.08);
--shadow-md: 0 4px 24px rgba(59, 118, 137, 0.08);
--shadow-lg: 0 12px 40px rgba(59, 118, 137, 0.16);
--shadow-xl: 0 20px 60px rgba(59, 118, 137, 0.2);

/* Gradient */
--gradient-movana: linear-gradient(135deg, #3B7689 0%, #68B59B 50%, #92D99E 100%);
```

---

## 📞 SUPPORT

- Documentation : https://docs.movana.bike (à créer)
- Email : support@movana.bike
- GitHub Issues : https://github.com/VOTRE_USERNAME/movana/issues
