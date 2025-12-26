# 📚 Documentation ReviewLottery v3.0

**Dernière mise à jour**: 2025-12-27

> **⭐ COMMENCER ICI: [`STATUS-REPORT.md`](./STATUS-REPORT.md)**
>
> **Rapport complet de situation** - Dette technique, fonctionnalités, métriques, prochaines étapes

Documentation complète du projet ReviewLottery V3 - SaaS de gestion d'avis clients avec système de loterie.

---

## 🚀 Documents Essentiels

- **[STATUS-REPORT.md](./STATUS-REPORT.md)** ⭐ Rapport de situation (COMMENCER ICI)
- **[CONVENTIONS.md](./CONVENTIONS.md)** ⚠️ Standards obligatoires (LIRE AVANT DE CODER)
- **[planning/plan.md](./planning/plan.md)** 📅 Plan développement 30 jours
- **[planning/ROADMAP.md](./planning/ROADMAP.md)** 🗺️ Roadmap par phases
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** 🚀 Guide de déploiement

---

## 📂 Documentation par Catégorie

### 🛠️ Setup & Configuration

**Installation et configuration initiale du projet**

- **[QUICK-START.md](./QUICK-START.md)** - Guide de démarrage rapide
- **[setup/SUPABASE_SETUP.md](./setup/SUPABASE_SETUP.md)** - Configuration Supabase (Database + Auth)
- **[setup/SUPABASE_STORAGE_SETUP.md](./setup/SUPABASE_STORAGE_SETUP.md)** - Configuration du stockage de fichiers

### 💻 Development

**Guides de développement et bonnes pratiques**

- **[development/DEVELOPMENT.md](./development/DEVELOPMENT.md)** - Guide complet de développement (START HERE)
- **[development/CODE_REVIEW_SUMMARY.md](./development/CODE_REVIEW_SUMMARY.md)** - Résumé des code reviews
- **[development/TESTING-GUIDE.md](./development/TESTING-GUIDE.md)** - Guide complet des tests (unit, integration, e2e)
- **[development/CRITICAL_FIXES_SUMMARY.md](./development/CRITICAL_FIXES_SUMMARY.md)** - Correctifs critiques appliqués

### 📐 Architecture

**Architecture technique et patterns de conception**

- **[architecture/ARCHITECTURE.md](./architecture/ARCHITECTURE.md)** - Architecture hexagonale complète
- **[architecture/ARCHITECTURE-MODULAIRE.md](./architecture/ARCHITECTURE-MODULAIRE.md)** - Structure modulaire du projet

### 📋 Planning & Roadmap

**État du projet et feuille de route**

- **[planning/DEVELOPMENT-TRACKER.md](./planning/DEVELOPMENT-TRACKER.md)** ⭐ **FICHIER PRINCIPAL** - Suivi temps réel (METTRE À JOUR À CHAQUE COMMIT)
- **[planning/PRD_ReviewLottery_v3.md](./planning/PRD_ReviewLottery_v3.md)** - Product Requirements Document (vision originale)
- **[planning/PROJECT-STATUS.md](./planning/PROJECT-STATUS.md)** - État détaillé (historique, référence)
- **[planning/ROADMAP.md](./planning/ROADMAP.md)** - Feuille de route originale (référence)
- **[planning/TODO.md](./planning/TODO.md)** - Liste originale des tâches (référence)
- **[planning/plan.md](./planning/plan.md)** - Plan détaillé 30 jours (référence)
- **[planning/MAGIC-LINK-DECISION.md](./planning/MAGIC-LINK-DECISION.md)** - Décision Magic Link (feature postponed)

### 🎯 Features

**Documentation des fonctionnalités principales**

#### QR Codes

- **[features/qr-codes/README.md](./features/qr-codes/README.md)** - Vue d'ensemble de la fonctionnalité QR codes
- **[features/qr-codes/GENERATION_PLAN.md](./features/qr-codes/GENERATION_PLAN.md)** - Plan de génération des QR codes
- **[features/qr-codes/STATUS.md](./features/qr-codes/STATUS.md)** - État d'avancement

#### Reviews

- **[reviews/REVIEWS-TECHNICAL.md](./reviews/REVIEWS-TECHNICAL.md)** - Documentation technique du système d'avis
- **[reviews/REVIEW_TEMPLATE.md](./reviews/REVIEW_TEMPLATE.md)** - Templates de réponses aux avis
- **[reviews/REVIEW_SESSION.md](./features/reviews/REVIEW_SESSION.md)** - Sessions de review
- **[reviews/RGPD-REVIEWS.md](./reviews/RGPD-REVIEWS.md)** - Conformité RGPD

### 📖 Guides

**Guides pratiques pour les développeurs**

- **[guides/CODING_GUIDELINES.md](./guides/CODING_GUIDELINES.md)** - Standards de code et bonnes pratiques
- **[guides/components/CONFIRM_DIALOG_USAGE.md](./guides/components/CONFIRM_DIALOG_USAGE.md)** - Utilisation du composant ConfirmDialog

### 🔐 Authentication

**Système d'authentification**

- **[authentication/MAGIC-LINK-SETUP.md](./authentication/MAGIC-LINK-SETUP.md)** - Configuration Magic Link (feature postponed)
- **[planning/MAGIC-LINK-DECISION.md](./planning/MAGIC-LINK-DECISION.md)** - Décision concernant les magic links

### 🔌 API

**Configuration des APIs externes**

- **[api/CURRENT-APIS.md](./api/CURRENT-APIS.md)** - APIs actuellement utilisées

### 🤖 AI

**Intégration Intelligence Artificielle**

- **[ai/PROMPT_SYSTEM_IA.md](./ai/PROMPT_SYSTEM_IA.md)** - Système de prompts pour l'IA

### 📦 Archive

**Documentation archivée (features non implémentées ou abandonnées)**

- **[archive/SUPER-ADMIN-ARCHITECTURE.md](./archive/SUPER-ADMIN-ARCHITECTURE.md)** - Architecture super-admin (non implémenté)
- **[archive/WORKFLOW_GUIDE.md](./archive/WORKFLOW_GUIDE.md)** - Guide des workflows
- **[archive/AUTOMATED_WORKFLOW.md](./archive/AUTOMATED_WORKFLOW.md)** - Workflows automatisés
- **[archive/eslint/](./archive/eslint/)** - Migration ESLint

---

## 🎯 Informations Clés

### Comptes Administrateurs

- **Super Admin**: dev@coworkingcafe.fr
- **Admin**: milone.thierry@gmail.com

### Système de Rôles

- **SUPER_ADMIN** - Accès complet au système, gestion des admins et configuration
- **ADMIN** - Gestion des utilisateurs, accès au dashboard, gestion des stores
- **USER** - Accès restreint aux fonctionnalités de base

### Stack Technique

#### Core

- **Framework**: Next.js 16.0.7 + React 19.2
- **Language**: TypeScript 5.x (ultra-strict mode)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma 5.22
- **API**: tRPC 11.7.2 (type-safe end-to-end)

#### UI & Design

- **Styling**: Tailwind CSS 4
- **Components**: Radix UI
- **Design System**: Glassmorphism V5
- **Icons**: Lucide React
- **Animations**: Framer Motion

#### Tools

- **Auth**: Supabase Auth avec cookies HTTP-only
- **State**: Zustand 5.0.9
- **Validation**: Zod 4.1.13
- **Testing**: Vitest 4.0.15 + Playwright
- **Linting**: ESLint + Prettier

#### External APIs

- **AI**: OpenAI (gpt-4o-mini)
- **Reviews**: Google My Business API
- **Auth**: Supabase Auth

---

## 🏗️ Architecture du Projet

### Structure des Répertoires

```
reviewLotteryV3/
├── docs/                   # Documentation complète
│   ├── ai/                # Documentation IA
│   ├── api/               # APIs externes
│   ├── architecture/      # Architecture & patterns
│   ├── authentication/    # Authentification
│   ├── development/       # Guides de développement
│   ├── features/          # Documentation par feature
│   │   ├── qr-codes/     # QR codes
│   │   └── reviews/      # Reviews
│   ├── guides/            # Guides pratiques
│   │   └── components/   # Guides composants
│   ├── planning/          # Roadmap, status, PRD
│   ├── reviews/           # Système de reviews
│   ├── setup/             # Setup guides
│   └── archive/           # Documentation archivée
├── prisma/                # Database schema & migrations
├── scripts/               # Utility scripts
│   ├── admin/            # Scripts d'administration
│   ├── database/         # Scripts de base de données
│   ├── setup/            # Scripts de configuration
│   └── testing/          # Scripts de test
├── src/                   # Code source
│   ├── app/              # Next.js App Router
│   ├── components/       # Composants UI
│   ├── core/             # Domain layer
│   ├── hooks/            # Custom React hooks
│   ├── infrastructure/   # Adapters
│   ├── lib/              # Utilitaires
│   ├── server/           # Backend (tRPC)
│   └── test/             # Tests
└── e2e/                   # Tests end-to-end
```

### Principes Architecturaux

- **Hexagonal Architecture** - Séparation stricte des couches
- **Domain-Driven Design** - Logique métier centralisée
- **ZERO `any` types** - Type-safety absolue
- **Result Pattern** - Gestion d'erreurs sans exceptions
- **Branded Types** - Type-safety pour les IDs
- **Test-Driven Development** - Tests avant le code

---

## 📊 État Actuel du Projet

**Phase**: Phase 2 - Reviews & IA (80% complété)

### Fonctionnalités Implémentées

- ✅ Authentification complète (Supabase Auth)
- ✅ Gestion des utilisateurs avec rôles
- ✅ Gestion des enseignes (Brands)
- ✅ Gestion des commerces (Stores)
- ✅ Intégration Google My Business API
- ✅ Synchronisation des avis Google
- ✅ Génération de réponses IA (OpenAI)
- ✅ Système de gains (Prizes)
- ✅ Design System Glassmorphism V5

### En Cours de Développement

- 🚧 Système de loterie (campagnes, tirages)
- 🚧 QR Codes pour réclamation de gains
- 🚧 Templates de réponses
- 🚧 Notifications email

### Prochaines Étapes

Voir [planning/ROADMAP.md](./planning/ROADMAP.md) et [planning/TODO.md](./planning/TODO.md)

---

## 📖 Guide de Navigation

### Je veux...

**...démarrer rapidement**
→ [QUICK-START.md](./QUICK-START.md)

**...comprendre l'architecture**
→ [architecture/ARCHITECTURE.md](./architecture/ARCHITECTURE.md)

**...développer une nouvelle fonctionnalité**
→ [development/DEVELOPMENT.md](./development/DEVELOPMENT.md) + [guides/CODING_GUIDELINES.md](./guides/CODING_GUIDELINES.md)

**...écrire des tests**
→ [development/TESTING-GUIDE.md](./development/TESTING-GUIDE.md)

**...configurer Supabase**
→ [setup/SUPABASE_SETUP.md](./setup/SUPABASE_SETUP.md)

**...comprendre le système de reviews**
→ [reviews/REVIEWS-TECHNICAL.md](./reviews/REVIEWS-TECHNICAL.md)

**...voir l'état d'avancement**
→ [planning/PROJECT-STATUS.md](./planning/PROJECT-STATUS.md)

**...contribuer au projet**
→ [../CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 🔗 Liens Utiles

### Ressources Externes

- **Supabase Dashboard**: https://app.supabase.com/project/dhedkewujbazelsdihtr
- **GitHub Repository**: git@github.com:cow-or-king/lotteryV3.git
- **Next.js Documentation**: https://nextjs.org/docs
- **tRPC Documentation**: https://trpc.io/docs
- **Prisma Documentation**: https://www.prisma.io/docs

### Scripts Utilitaires

Voir [../scripts/README.md](../scripts/README.md) pour la documentation complète des scripts.

---

## 📝 Conventions de Documentation

- Les fichiers README.md servent d'index pour chaque dossier
- Les guides pratiques sont dans `guides/`
- Les décisions architecturales sont dans `architecture/`
- L'état du projet est toujours à jour dans `planning/PROJECT-STATUS.md`
- Les features archivées sont dans `archive/`

---

**Dernière mise à jour**: 2025-12-11
**Version**: 3.0.0
**Statut**: Documentation complète et à jour
