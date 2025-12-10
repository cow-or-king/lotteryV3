# 📚 Documentation ReviewLottery V3

Documentation complète du projet ReviewLottery V3.

## 📂 Structure

### 🏗️ Architecture

- [ARCHITECTURE.md](./architecture/ARCHITECTURE.md) - Architecture hexagonale, DDD, patterns utilisés
- [ARCHITECTURE-MODULAIRE.md](./architecture/ARCHITECTURE-MODULAIRE.md) - Architecture modulaire du projet
- [SUPER-ADMIN-ARCHITECTURE.md](./architecture/SUPER-ADMIN-ARCHITECTURE.md) - Architecture du système d'administration

### 📅 Planning

- [ROADMAP.md](./planning/ROADMAP.md) - Feuille de route du projet, phases de développement
- [PRD_ReviewLottery_v3.md](./planning/PRD_ReviewLottery_v3.md) - Product Requirements Document
- [PROGRESS.md](./planning/PROGRESS.md) - Suivi de la progression
- [plan.md](./planning/plan.md) - Plan détaillé du développement

### 🔐 Authentication

- [MAGIC-LINK-SETUP.md](./authentication/MAGIC-LINK-SETUP.md) - Guide de configuration Magic Link (postponé)

### 💻 Development

- [DEVELOPMENT.md](./development/DEVELOPMENT.md) - Guide de développement
- [CODE-REVIEW.md](./development/CODE-REVIEW.md) - Processus de code review
- [TESTING-GUIDE.md](./development/TESTING-GUIDE.md) - Guide des tests
- [CRITICAL_FIXES_SUMMARY.md](./development/CRITICAL_FIXES_SUMMARY.md) - Résumé des correctifs critiques

### ⭐ Reviews

- [REVIEWS-TECHNICAL.md](./reviews/REVIEWS-TECHNICAL.md) - Documentation technique du système de reviews
- [REVIEW_TEMPLATE.md](./reviews/REVIEW_TEMPLATE.md) - Templates de réponses
- [README-REVIEWS-TESTING.md](./reviews/README-REVIEWS-TESTING.md) - Guide de test des reviews
- [RGPD-REVIEWS.md](./reviews/RGPD-REVIEWS.md) - Conformité RGPD pour les reviews

### 🔄 Workflows

- [WORKFLOW_GUIDE.md](./workflows/WORKFLOW_GUIDE.md) - Guide des workflows
- [AUTOMATED_WORKFLOW.md](./workflows/AUTOMATED_WORKFLOW.md) - Workflows automatisés

### 🔌 API

- [GOOGLE-API-PRODUCTION.md](./api/GOOGLE-API-PRODUCTION.md) - Configuration Google API en production

## 🎯 Informations clés

### Comptes administrateurs

- **Super Admin**: dev@coworkingcafe.fr
- **Admin**: milone.thierry@gmail.com

### Rôles système

- `SUPER_ADMIN` - Accès complet, gestion des admins
- `ADMIN` - Gestion des utilisateurs, accès dashboard
- `USER` - Accès restreint (créés par les admins)

### Stack technique

- **Frontend**: Next.js 16.0.7, React, TypeScript
- **Backend**: tRPC, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth avec cookies HTTP-only
- **State**: Zustand
- **Tests**: Vitest
- **Style**: Glassmorphism design system

## 🚀 Progression actuelle

**Phase actuelle**: Reviews & IA (80%)
**Prochaine phase**: User management par ADMIN

---

Pour plus d'informations, consultez les fichiers de documentation dans chaque dossier.
