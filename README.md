# ReviewLottery v3.0

## 🎯 Professional SaaS with Hexagonal Architecture

**Stack moderne et architecture professionnelle pour une application SaaS scalable.**

### ⚠️ Règles Strictes du Projet

- **ZERO `any` types** - TypeScript ultra-strict
- **Result Pattern** - Aucun throw dans la logique métier
- **Hexagonal Architecture** - Séparation stricte des couches
- **Test-Driven Development** - Tests avant le code
- **Branded Types** - Type-safety pour tous les IDs

### 🏗️ Architecture

```
src/
├── core/              # Domain layer (ZERO dépendances)
├── application/       # Use cases
├── infrastructure/    # Implémentations techniques
├── presentation/      # UI/Components
├── shared/           # Types partagés (Result, Branded)
└── test/             # Tests unitaires/intégration
```

### 🚀 Technologies

- **Framework**: Next.js 16.0.7 + React 19.2
- **Language**: TypeScript 5.x (ultra-strict mode)
- **Database**: PostgreSQL via Prisma
- **API**: tRPC (type-safe end-to-end)
- **Auth**: Supabase
- **State**: Zustand
- **Validation**: Zod
- **Testing**: Vitest + Testing Library
- **Design**: Tailwind CSS + Radix UI

### 📦 Installation

```bash
npm install
```

### 🔧 Commandes

```bash
npm run dev          # Développement
npm run build        # Build production
npm run test         # Tests unitaires
npm run test:coverage # Coverage report
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

### 📊 Métriques de Qualité

- ✅ **0 `any` types**
- ✅ **80%+ test coverage**
- ✅ **0 TypeScript errors**
- ✅ **0 ESLint errors**

### 📚 Documentation

- [PRD_ReviewLottery_v3.md](./PRD_ReviewLottery_v3.md) - Product Requirements
- [plan.md](./plan.md) - Development Plan
- [PROGRESS.md](./PROGRESS.md) - Daily Progress Tracker

### 🎨 Design System

Inspiré par **Cadeo.io** - Style neo-brutalist avec:
- Bordures noires épaisses
- Ombres fortes
- Gamification visuelle
- Animations dynamiques

---

**Version**: 3.0.0
**License**: Proprietary
**Author**: ReviewLottery Team