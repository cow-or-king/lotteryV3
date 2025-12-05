# 📚 ReviewLottery v3.0 - Guide de Développement Complet

## 🚨 COMPTES EXTERNES REQUIS

### 1. **Supabase** (Base de données PostgreSQL + Auth)

- **Quand**: Avant de commencer Day 2
- **URL**: https://supabase.com
- **Gratuit**: ✅ (2 projets gratuits)
- **Nécessaire pour**: Database, Authentication, Storage
- **Action**: Je te préviendrai quand créer le compte

### 2. **Stripe** (Paiements)

- **Quand**: Day 8-10 (Subscription & Billing)
- **URL**: https://stripe.com
- **Gratuit**: ✅ (mode test)
- **Nécessaire pour**: Abonnements, paiements
- **Action**: Peut attendre Phase 1

### 3. **Google Cloud** (Google Reviews API)

- **Quand**: Day 21-22
- **URL**: https://console.cloud.google.com
- **Gratuit**: ✅ (crédit de 300$)
- **Nécessaire pour**: Google My Business API
- **Action**: Peut attendre Phase 3

### 4. **Vercel** (Déploiement)

- **Quand**: Day 26-27
- **URL**: https://vercel.com
- **Gratuit**: ✅ (Hobby plan)
- **Nécessaire pour**: Hébergement production
- **Action**: Peut attendre Phase 4

---

## 🎯 PHASE ACTUELLE: Day 2 - Database & Domain Layer

### ⚡ Prochaines Étapes Immédiates

#### 1️⃣ **CRÉER UN COMPTE SUPABASE** (Maintenant)

```
1. Aller sur https://supabase.com
2. Sign up avec GitHub ou email
3. Créer un nouveau projet "reviewlottery-v3"
4. Choisir région: Europe (Frankfurt)
5. Générer un mot de passe fort pour la DB
6. Noter les credentials:
   - Project URL
   - Anon Key
   - Service Role Key
   - Database Password
```

#### 2️⃣ **Configuration Locale** (Je vais faire)

- Créer `.env.local` avec les credentials
- Initialiser Prisma
- Connecter à Supabase

#### 3️⃣ **Domain Entities** (Je vais créer)

- StoreEntity
- CampaignEntity
- PrizeEntity
- Value Objects

---

## 📋 PROGRESSION DÉTAILLÉE

### ✅ Day 1: Foundation (COMPLÉTÉ)

- [x] Next.js 16.0.7 + TypeScript ultra-strict
- [x] Architecture hexagonale
- [x] Result Pattern + Branded Types
- [x] UserEntity avec tests TDD
- [x] ESLint + Prettier + Husky
- **Résultat**: 8/8 tests ✅, 0 any types

### 🚧 Day 2: Database & Domain Layer (EN COURS)

- [ ] **Compte Supabase** ⚠️ ACTION REQUISE
- [ ] Initialiser Prisma
- [ ] Créer Domain Entities
- [ ] Implémenter Value Objects
- [ ] Définir Repository Interfaces
- [ ] Créer Prisma Schema

### 📅 Day 3: Application Layer

- [ ] Use Cases (CreateUser, etc.)
- [ ] DTOs et Mappers
- [ ] Repository Implementations
- [ ] tRPC Router setup

### 📅 Days 4-5: Authentication

- [ ] Supabase Auth integration
- [ ] Magic links
- [ ] Session management
- [ ] Protected routes

### 📅 Days 6-7: Store & Campaign

- [ ] Store management
- [ ] Campaign business rules
- [ ] Prize pool logic
- [ ] QR code generation

### 📅 Days 8-10: Subscription & Billing

- [ ] **Compte Stripe** ⚠️ ACTION REQUISE
- [ ] Plans & pricing
- [ ] Webhook handling
- [ ] Usage limits

---

## 🏗️ ARCHITECTURE RECAP

```
src/
├── core/              # ✅ Domain (Pure TypeScript, ZERO deps)
│   ├── entities/      # Business entities
│   ├── value-objects/ # Email, Money, etc.
│   ├── repositories/  # Interfaces only
│   └── services/      # Domain services
│
├── application/       # 🚧 Use cases & orchestration
│   ├── use-cases/     # Business operations
│   ├── dtos/          # Data Transfer Objects
│   └── mappers/       # Entity ↔ DTO mapping
│
├── infrastructure/    # 📅 Technical implementations
│   ├── database/      # Prisma
│   ├── repositories/  # Concrete implementations
│   ├── auth/          # Supabase Auth
│   ├── payment/       # Stripe
│   └── trpc/          # API layer
│
└── presentation/      # 📅 UI Components
    ├── components/    # React components
    ├── hooks/         # Custom hooks
    └── store/         # Zustand state
```

---

## 🔴 RÈGLES STRICTES (TOUJOURS)

### TypeScript

- **AUCUN `any`** - Utiliser `unknown` si nécessaire
- **AUCUN `@ts-ignore`** - Résoudre les erreurs
- **Types explicites** pour toutes les fonctions
- **Branded Types** pour tous les IDs

### Architecture

- **Domain Layer** = ZERO dépendances externes
- **Result Pattern** = Pas de throw dans business logic
- **Repository Pattern** = Interfaces dans Core
- **Use Cases** = Une classe par opération

### Testing

- **TDD** = Tests d'abord, code ensuite
- **Coverage** = Minimum 80%
- **Unit Tests** = Toute la logique métier
- **Integration Tests** = Use cases complets

---

## 📊 MÉTRIQUES ACTUELLES

| Métrique          | Valeur | Objectif |
| ----------------- | ------ | -------- |
| TypeScript Errors | 0      | 0        |
| Any Types         | 0      | 0        |
| Test Coverage     | 100%\* | 80%+     |
| Tests Passing     | 8/8    | 100%     |
| ESLint Issues     | 0      | 0        |

\*Sur le code écrit

---

## 🚀 COMMANDES UTILES

```bash
# Development
npm run dev           # Start dev server
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run type-check    # TypeScript check
npm run lint          # ESLint

# Database
npx prisma init       # Initialize Prisma
npx prisma db push    # Push schema to DB
npx prisma generate   # Generate client
npx prisma studio     # Visual DB editor

# Git
git status            # Check changes
git add -A           # Stage all
git commit           # Commit (hooks run)
git push             # Push to GitHub
```

---

## 🔄 WORKFLOW QUOTIDIEN

1. **Matin**: Review plan + Define tasks
2. **Code**: TDD cycle (Red-Green-Refactor)
3. **Test**: Run full test suite
4. **Type-check**: Verify TypeScript
5. **Commit**: Atomic commits with hooks
6. **Push**: Sync to GitHub
7. **Document**: Update progress

---

## 📝 NOTES IMPORTANTES

- **Supabase vs Firebase**: Choix de Supabase pour PostgreSQL (relationnel)
- **tRPC vs REST**: Type-safety end-to-end sans génération de code
- **Prisma vs TypeORM**: Meilleure DX et type-safety
- **Zustand vs Redux**: Plus simple, moins de boilerplate
- **Vitest vs Jest**: Plus rapide, config minimale

---

**Dernière mise à jour**: Day 2 - En attente création compte Supabase
**Prochaine action**: CRÉER COMPTE SUPABASE ⚠️
