# 🚀 Quick Start Guide - ReviewLottery V3

## Démarrage rapide en 5 minutes

### Prérequis

- Node.js 18+
- PostgreSQL via Supabase
- Git

### Installation

```bash
# 1. Cloner le repo
git clone <url>
cd reviewLotteryV3

# 2. Installer les dépendances
npm install

# 3. Configuration .env
cp .env.example .env
# Remplir les credentials Supabase

# 4. Migration DB
npx prisma db push

# 5. Démarrer
npm run dev
```

## 📊 État Actuel du Projet

### ✅ Implémenté et Fonctionnel

- **Auth**: Supabase avec email/password + cookies HTTP-only
- **Users**: CRUD complet avec système de rôles
- **Rôles**: SUPER_ADMIN, ADMIN, USER avec badges visuels
- **Stores/Brands**: CRUD complet
- **IA OpenAI**: Configuration centralisée, génération réponses (gpt-4o-mini)
- **Google OAuth**: Setup OAuth2 pour My Business API

### ⏸️ Postponé (Code existe mais inactif)

- **Magic Link**: Authentication par email magique
  - Code prêt mais désactivé
  - Voir `/docs/authentication/MAGIC-LINK-SETUP.md`

### ❌ Supprimé (Jamais en production)

- **Google Places API**: Remplacé par My Business API
- **Mock Services**: Services de test supprimés

### 🚧 À Développer (Core Feature)

- **Système de Loteries**: CRUD campagnes, tirages au sort, notifications

## 🏗️ Architecture

**Pattern**: Hexagonal Architecture (Ports & Adapters)

```
src/
├── core/              # Domain (use cases, entities, interfaces)
├── infrastructure/    # Adapters (Prisma, APIs externes)
└── app/              # Presentation (Next.js pages, components)
```

**Règles strictes**:

- ⚠️ ZERO `any` types autorisés
- ✅ Result Pattern pour gestion d'erreurs
- ✅ Branded Types pour type-safety des IDs

## 🎨 Design System

**Style actuel**: Glassmorphism V5 UNIQUEMENT

- Fond: Gradient bleu-violet
- Cartes: backdrop-blur-xl avec borders subtils
- Inputs: Contraste élevé (text-gray-900)

## 📚 Documentation Utile

### Pour démarrer

- Architecture: `/docs/architecture/ARCHITECTURE.md`
- Dev Guide: `/docs/development/DEVELOPMENT.md`
- Tests: `/docs/development/TESTING-GUIDE.md`

### État du projet

- Status: `/docs/planning/STATUS-REPORT.md`
- Roadmap: `/docs/planning/ROADMAP.md`
- PRD: `/docs/planning/PRD_ReviewLottery_v3.md`

### Features spécifiques

- Reviews: `/docs/reviews/REVIEWS-TECHNICAL.md`
- Magic Link: `/docs/authentication/MAGIC-LINK-SETUP.md` (⏸️ POSTPONED)

## 🔑 Variables d'Environnement Essentielles

```env
# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Encryption (générer avec: openssl rand -hex 32)
ENCRYPTION_SECRET_KEY=<32-bytes-hex>

# Google OAuth (My Business API)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Mode watch
npm test -- --watch

# Coverage
npm run test:coverage
```

**Framework**: Vitest

## 👥 Comptes Admin de Test

- **Super Admin**: dev@coworkingcafe.fr
- **Admin**: milone.thierry@gmail.com

## 🆘 Problèmes Courants

### "User not found in database"

Vérifier que l'user existe dans Supabase Auth ET dans la table `User`

### Reviews ne se synchronisent pas

1. Vérifier Google OAuth credentials
2. Vérifier refresh token store en DB
3. Check console logs pour erreurs API

### AI suggestions ne fonctionnent pas

1. Vérifier OpenAI API key configurée dans admin
2. Vérifier `ai_service_config` table existe
3. Check logs OpenAI quota

## 📞 Support

Issues GitHub ou contacter l'équipe dev.

---

**Dernière mise à jour**: 2025-12-10
**Version**: 3.0
