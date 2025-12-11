# ReviewLottery v3.0

## 🎯 Professional SaaS with Hexagonal Architecture

**Stack moderne et architecture professionnelle pour une application SaaS scalable de gestion d'avis clients avec système de loterie.**

---

## 🚀 État Actuel

- **Phase**: Phase 2 - Reviews & IA (80% complété)
- **Authentification**: ✅ Complète (Supabase Auth + Sessions sécurisées)
- **Database**: ✅ PostgreSQL (Supabase) + Prisma ORM
- **API**: ✅ tRPC avec 25+ endpoints type-safe
- **UI**: ✅ Glassmorphism V5 Design System
- **IA**: ✅ OpenAI Integration (génération de réponses)
- **Google**: ✅ My Business API OAuth2
- **Serveur**: http://localhost:3000 🚀

---

## ✅ Fonctionnalités Principales

### Authentification & Utilisateurs

- Email/Password login (Supabase Auth)
- Session management avec cookies HTTP-only
- Système de rôles (SUPER_ADMIN, ADMIN, USER)
- Protected routes avec middleware
- Gestion complète des utilisateurs

### Gestion des Enseignes & Commerces

- CRUD complet pour Brands (multi-enseignes)
- CRUD complet pour Stores (commerces)
- Association Google Place ID
- Logo et branding personnalisé
- Dashboard par commerce

### Avis Google

- Intégration Google My Business API
- Synchronisation des avis
- Statistiques détaillées
- Filtres et pagination
- Génération de réponses IA (OpenAI gpt-4o-mini)

### Système de Gains

- Templates de gains (communs ou par enseigne)
- Sets de gains avec probabilités
- 11 icônes de gains disponibles
- Fourchettes de prix configurables

---

## ⚠️ Principes Fondamentaux

### Règles de Code

- **ZERO `any` types** - TypeScript ultra-strict
- **Result Pattern** - Gestion d'erreurs sans exceptions
- **Hexagonal Architecture** - Séparation stricte des couches
- **Branded Types** - Type-safety pour tous les IDs
- **Test-Driven Development** - Tests avant le code

### Architecture

```
src/
├── app/              # Next.js App Router (Pages & Layouts)
├── components/       # Composants UI réutilisables
├── core/            # Domain layer (Entities, Use Cases, Ports)
├── hooks/           # Custom React hooks par feature
├── infrastructure/  # Adapters (Prisma, APIs, Services)
├── lib/             # Utilitaires et configuration
├── server/          # Backend (tRPC routers)
└── test/            # Tests unitaires et d'intégration
```

### Organisation Projet

```
reviewLotteryV3/
├── docs/            # Documentation complète
│   ├── architecture/    # Architecture & Design patterns
│   ├── development/     # Guides de développement
│   ├── features/        # Documentation par feature
│   ├── guides/          # Coding guidelines
│   ├── planning/        # Roadmap, PRD, Status
│   └── setup/           # Setup guides (Supabase, etc.)
├── prisma/          # Database schema & migrations
├── scripts/         # Utility scripts (admin, database, testing)
│   ├── admin/          # Scripts d'administration
│   ├── database/       # Scripts de base de données
│   ├── setup/          # Scripts de configuration
│   └── testing/        # Scripts de test
├── src/             # Code source
└── e2e/             # Tests end-to-end (Playwright)
```

---

## 🚀 Technologies

### Core Stack

- **Framework**: Next.js 16.0.7 + React 19.2
- **Language**: TypeScript 5.x (strict mode)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma 5.22
- **API**: tRPC 11.7.2 (type-safe end-to-end)
- **Auth**: Supabase Auth + HTTP-only cookies

### UI & Design

- **Styling**: Tailwind CSS 4
- **Components**: Radix UI
- **Design System**: Glassmorphism V5
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Development Tools

- **Testing**: Vitest 4.0.15 + Testing Library
- **E2E**: Playwright
- **Validation**: Zod 4.1.13
- **State**: Zustand 5.0.9
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky

### External APIs

- **AI**: OpenAI (gpt-4o-mini)
- **Reviews**: Google My Business API
- **Auth**: Supabase Auth

---

## 📦 Installation

### Prérequis

- Node.js 18+
- PostgreSQL via Supabase
- Git

### Setup rapide

```bash
# 1. Cloner le repository
git clone <url>
cd reviewLotteryV3

# 2. Installer les dépendances
npm install

# 3. Configuration environnement
cp .env.example .env
# Remplir les credentials (voir docs/setup/)

# 4. Setup database
npx prisma db push
npx prisma generate

# 5. Démarrer le serveur
npm run dev
```

Voir [docs/QUICK-START.md](./docs/QUICK-START.md) pour un guide détaillé.

---

## 🔧 Commandes

### Development

```bash
npm run dev              # Serveur de développement
npm run build            # Build production
npm run start            # Démarrer en production
npm run lint             # Vérifier ESLint
npm run type-check       # Vérifier TypeScript
```

### Testing

```bash
npm run test             # Tests unitaires
npm run test:ui          # Interface UI des tests
npm run test:coverage    # Rapport de couverture
npm run test:watch       # Mode watch
npm run test:e2e         # Tests end-to-end
npm run test:e2e:ui      # E2E en mode UI
```

### Database

```bash
npx prisma studio        # Interface graphique DB
npx prisma db push       # Synchroniser schema
npx prisma generate      # Générer client Prisma
npx prisma migrate dev   # Créer migration
```

### Utility Scripts

```bash
# Admin
npx tsx scripts/admin/promote-super-admin.ts
npx tsx scripts/admin/check-user-status.ts

# Database
npx tsx scripts/database/test-db-connection.ts
./scripts/database/migrate.sh

# Testing
npx tsx scripts/testing/test-google-api.ts
```

Voir [scripts/README.md](./scripts/README.md) pour la documentation complète.

---

## 📊 Métriques de Qualité

- ✅ **0 `any` types**
- ✅ **~85% test coverage** (sur le code testé)
- ✅ **0 TypeScript errors**
- ✅ **0 ESLint errors**
- ✅ **Architecture hexagonale** strictement respectée

---

## 📚 Documentation

### Pour démarrer

- **[docs/QUICK-START.md](./docs/QUICK-START.md)** - Démarrage rapide en 5 minutes
- **[docs/README.md](./docs/README.md)** - Index complet de la documentation
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guide de contribution

### Développement

- [docs/development/DEVELOPMENT.md](./docs/development/DEVELOPMENT.md) - Guide complet de développement
- [docs/development/TESTING-GUIDE.md](./docs/development/TESTING-GUIDE.md) - Guide des tests
- [docs/guides/CODING_GUIDELINES.md](./docs/guides/CODING_GUIDELINES.md) - Standards de code

### Architecture

- [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) - Architecture hexagonale
- [docs/architecture/ARCHITECTURE-MODULAIRE.md](./docs/architecture/ARCHITECTURE-MODULAIRE.md) - Structure modulaire

### Planning

- [docs/planning/PROJECT-STATUS.md](./docs/planning/PROJECT-STATUS.md) - État actuel du projet
- [docs/planning/ROADMAP.md](./docs/planning/ROADMAP.md) - Feuille de route
- [docs/planning/PRD_ReviewLottery_v3.md](./docs/planning/PRD_ReviewLottery_v3.md) - Product Requirements

### Setup & Configuration

- [docs/setup/SUPABASE_SETUP.md](./docs/setup/SUPABASE_SETUP.md) - Configuration Supabase
- [docs/setup/SUPABASE_STORAGE_SETUP.md](./docs/setup/SUPABASE_STORAGE_SETUP.md) - Configuration Storage

---

## 🎨 Design System

**Glassmorphism V5** - Style moderne et élégant:

- **Glass effect** avec backdrop-blur
- **Gradients** violet/bleu subtils
- **Transparence** et profondeur
- **Animations** fluides
- **Blobs animés** en arrière-plan

**Note**: Style Glassmorphism V5 UNIQUEMENT (ne pas utiliser d'autres styles)

---

## 🔑 Comptes de Test

- **Super Admin**: dev@coworkingcafe.fr
- **Admin**: milone.thierry@gmail.com

---

## 🤝 Contribution

Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour:

- Standards de code
- Workflow Git (branches, commits, PR)
- Process de review
- Comment contribuer

---

## 📝 License

Proprietary - ReviewLottery Team

---

**Version**: 3.0.0
**Dernière mise à jour**: 2025-12-11
**Status**: En développement actif
