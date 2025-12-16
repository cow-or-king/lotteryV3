# 🚀 Guide de Déploiement - ReviewLottery v3

## 📋 Table des matières

- [Prérequis](#prérequis)
- [1. Configuration Supabase](#1-configuration-supabase)
- [2. Déploiement Vercel](#2-déploiement-vercel)
- [3. Configuration Post-Déploiement](#3-configuration-post-déploiement)
- [4. Vérification](#4-vérification)

---

## Prérequis

- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [Vercel](https://vercel.com) (gratuit)
- Compte [OpenAI](https://platform.openai.com) avec API key
- Git installé localement
- Node.js 20.x ou supérieur

---

## 1. Configuration Supabase

### 1.1 Créer un nouveau projet Supabase

```bash
# Aller sur https://supabase.com/dashboard
# Cliquer sur "New Project"
# Remplir:
# - Project name: reviewlottery-prod
# - Database Password: [générer un mot de passe fort]
# - Region: eu-west-1 (ou votre région préférée)
```

### 1.2 Récupérer les credentials

Une fois le projet créé, aller dans **Settings > API**:

```env
# URL du projet
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Clé anonyme (anon/public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clé service role (Settings > API > service_role key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.3 Récupérer les URLs de la base de données

Aller dans **Settings > Database** et récupérer:

```env
# Connection pooling (avec pgbouncer) - pour les requêtes Prisma
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection (sans pgbouncer) - pour les migrations Prisma
DIRECT_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

⚠️ **Important**: Remplacer `[PASSWORD]` par le mot de passe de votre base créé à l'étape 1.1

### 1.4 Créer les Storage Buckets

Aller dans **Storage** et créer 2 buckets **publics**:

```bash
# Bucket 1: brand-logos
# - Public: ✅ Oui
# - Allowed MIME types: image/*

# Bucket 2: qr-logos
# - Public: ✅ Oui
# - Allowed MIME types: image/*
```

### 1.5 Configurer l'authentification

Aller dans **Authentication > Providers**:

```bash
# Email Provider
✅ Enable Email provider
✅ Confirm email: Désactivé (pour dev/test) ou Activé (pour prod)

# URL Configuration (Settings > Auth)
Site URL: https://votre-app.vercel.app
Redirect URLs:
  - https://votre-app.vercel.app/auth/callback
  - http://localhost:3000/auth/callback (pour dev)
```

---

## 2. Déploiement Vercel

### 2.1 Préparer le repository

```bash
# S'assurer que tout est commité
git status
git add .
git commit -m "🚀 Ready for production deployment"

# Pousser sur GitHub
git push origin main
```

### 2.2 Connecter Vercel

**Option A: Via l'interface Web**

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"Add New Project"**
3. Importer le repository GitHub
4. Configurer le projet:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (auto-détecté)
   - **Output Directory**: `.next` (auto-détecté)
   - **Install Command**: `npm install` (auto-détecté)

**Option B: Via la CLI**

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Suivre les prompts:
# - Link to existing project? No
# - Project name: reviewlottery-v3
# - Directory: ./
# - Override settings? No
```

### 2.3 Configurer les variables d'environnement

Dans Vercel Dashboard > Settings > Environment Variables, ajouter:

```env
# ============================================
# Supabase (copiés depuis l'étape 1)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUz...

# ============================================
# Database (copiés depuis l'étape 1.3)
# ============================================
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxxx:password@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

# ============================================
# OpenAI
# ============================================
OPENAI_API_KEY=sk-proj-xxxxx

# ============================================
# Encryption Key (générer avec: openssl rand -base64 32)
# ============================================
ENCRYPTION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# Application
# ============================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app

# ============================================
# Google My Business (Optionnel)
# ============================================
# GOOGLE_CLIENT_ID=xxxxx
# GOOGLE_CLIENT_SECRET=xxxxx
# GOOGLE_REDIRECT_URI=https://votre-app.vercel.app/api/auth/google/callback
```

⚠️ **Important**:

- Cocher **Production**, **Preview**, et **Development** pour chaque variable
- Ne JAMAIS commiter ces valeurs dans le code

### 2.4 Générer l'ENCRYPTION_KEY

```bash
# Sur votre machine locale
openssl rand -base64 32

# Copier le résultat dans ENCRYPTION_KEY sur Vercel
```

---

## 3. Configuration Post-Déploiement

### 3.1 Exécuter les migrations Prisma

**Méthode 1: Via script npm (recommandé)**

Ajouter ce script dans `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Puis redéployer:

```bash
git add package.json
git commit -m "Add Prisma migration to build"
git push origin main
```

**Méthode 2: Manuellement depuis votre machine**

```bash
# Se connecter à la base de production
export DATABASE_URL="postgresql://postgres.xxxxx:password@..."
export DIRECT_URL="postgresql://postgres.xxxxx:password@..."

# Exécuter les migrations
npx prisma migrate deploy

# Vérifier que les tables sont créées
npx prisma studio
```

### 3.2 Vérifier les tables créées

Sur Supabase Dashboard > Table Editor, vous devriez voir:

```
✅ User
✅ Store
✅ Brand
✅ Campaign
✅ Game
✅ Prize
✅ Participation
✅ Winner
✅ QRCode
✅ Review
✅ GoogleIntegration
✅ _prisma_migrations
```

### 3.3 Créer le premier utilisateur

```bash
# Aller sur https://votre-app.vercel.app/sign-up
# Créer un compte avec email + password

# Ou via Supabase SQL Editor:
INSERT INTO "User" (id, email, role, "createdAt", "updatedAt")
VALUES (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', -- UUID depuis Supabase Auth
  'admin@reviewlottery.com',
  'ADMIN',
  NOW(),
  NOW()
);
```

---

## 4. Vérification

### 4.1 Checklist de vérification

```bash
✅ Application accessible sur https://votre-app.vercel.app
✅ Page de login fonctionne
✅ Peut créer un compte
✅ Peut se connecter
✅ Dashboard accessible après login
✅ Peut créer une enseigne (Brand)
✅ Peut créer un commerce (Store)
✅ Peut créer une campagne
✅ QR Code se génère correctement
✅ Upload de logo fonctionne (Storage Supabase)
```

### 4.2 Vérifier les logs

**Vercel Logs:**

```bash
# Via CLI
vercel logs

# Via Dashboard
https://vercel.com/dashboard > Project > Deployments > Logs
```

**Supabase Logs:**

```bash
# Aller dans Supabase Dashboard > Logs
# Vérifier:
# - Database logs (requêtes Prisma)
# - Auth logs (connexions)
# - Storage logs (uploads)
```

### 4.3 Tester les fonctionnalités critiques

```bash
# 1. Authentification
✅ Sign up
✅ Sign in
✅ Sign out
✅ Session persistence

# 2. CRUD Enseignes
✅ Créer une enseigne
✅ Upload logo
✅ Lister les enseignes

# 3. CRUD Commerces
✅ Créer un commerce
✅ Associer à une enseigne
✅ Générer QR code

# 4. CRUD Campagnes
✅ Créer une campagne
✅ Sélectionner un jeu
✅ Configurer les prix
✅ Activer/Désactiver

# 5. Gameplay
✅ Scanner QR code (ou URL directe)
✅ Jouer au jeu
✅ Gagner un prix
✅ Partager avis Google
```

---

## 🎯 Checklist Finale

Avant de considérer le déploiement complet:

```bash
✅ Supabase configuré (Database + Auth + Storage)
✅ Migrations Prisma exécutées
✅ Variables d'environnement configurées
✅ Application déployée sur Vercel
✅ DNS configuré (si domaine custom)
✅ SSL activé (automatique avec Vercel)
✅ Premier utilisateur créé
✅ Tests manuels effectués
✅ Logs vérifiés (pas d'erreurs)
✅ Performance acceptable (<3s TTFB)
```

---

## 🔧 Troubleshooting

### Erreur: "Prisma Client not found"

```bash
# Solution: Ajouter prisma generate au build
# Dans vercel.json:
{
  "buildCommand": "prisma generate && next build"
}
```

### Erreur: "Could not connect to database"

```bash
# Vérifier les variables DATABASE_URL et DIRECT_URL
# S'assurer que ?pgbouncer=true est présent dans DATABASE_URL
# Vérifier que l'IP de Vercel n'est pas bloquée
```

### Erreur: "Storage bucket not found"

```bash
# Créer les buckets sur Supabase:
# - brand-logos (public)
# - qr-logos (public)
```

### Erreur: "Unauthorized" sur les routes

```bash
# Vérifier que le middleware est bien configuré
# Vérifier NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Next.js](https://nextjs.org/docs)

---

## 🆘 Support

En cas de problème:

1. Vérifier les logs Vercel et Supabase
2. Consulter le troubleshooting ci-dessus
3. Vérifier que toutes les variables d'environnement sont correctes
4. Tester localement avec les mêmes variables de production

---

**🎉 Félicitations! Votre application ReviewLottery v3 est en production!**
