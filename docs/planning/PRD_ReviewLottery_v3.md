# ReviewLottery v3.0 - Product Requirements Document

## 🚨 IMPORTANT: CONVENTIONS & STANDARDS OBLIGATOIRES

**CE DOCUMENT DÉFINIT LES STANDARDS TECHNIQUES OBLIGATOIRES pour garantir un code professionnel, maintenable et scalable. TOUTE DÉVIATION de ces standards doit être justifiée et approuvée.**

### ⚡ Principes Fondamentaux

- **ZERO `any` type** : Utilisation stricte de TypeScript avec types explicites
- **Architecture Hexagonale** : Séparation stricte des responsabilités (Domain, Application, Infrastructure, Presentation)
- **Domain-Driven Design** : Modélisation métier au centre de l'application
- **Type-Safety End-to-End** : De la base de données au frontend via tRPC
- **Test-Driven Development** : Tests unitaires, d'intégration et E2E obligatoires
- **Security by Design** : Validation, sanitization et protection à tous les niveaux

## 📋 Table des matières

1. [Standards de Code & Architecture](#standards-de-code--architecture)
2. [Vision & Objectifs](#vision--objectifs)
3. [Stack Technique Moderne](#stack-technique-moderne)
4. [Architecture Hexagonale](#architecture-hexagonale)
5. [User Personas & Flows](#user-personas--flows)
6. [Modèles de Données (Prisma)](#modèles-de-données-prisma)
7. [Stratégie de Prix](#stratégie-de-prix)
8. [Module Google Reviews](#module-google-reviews)
9. [Composants UI (Design System)](#composants-ui-design-system)
10. [Sécurité & Conformité](#sécurité--conformité)
11. [Analytics & Monitoring](#analytics--monitoring)
12. [Plan de Migration](#plan-de-migration)
13. [Roadmap](#roadmap)

---

## Standards de Code & Architecture

### Conventions de Nommage OBLIGATOIRES

```typescript
// ✅ CONVENTIONS STRICTES À SUIVRE

// Fichiers & Dossiers
user - service.ts; // kebab-case pour les fichiers
UserProfile.tsx; // PascalCase pour les composants React
format - date.ts; // kebab-case pour les utils
IUserRepository.ts; // Interface avec préfixe I

// Classes & Interfaces
class UserService {} // PascalCase
interface IUserRepository {} // Préfixe I pour interfaces
type TUserRole = 'admin' | 'user'; // Préfixe T pour types
enum ESubscriptionPlan {} // Préfixe E pour enums

// Variables & Constantes
const MAX_RETRY_ATTEMPTS = 3; // SCREAMING_SNAKE_CASE pour constantes
const getUserById = () => {}; // camelCase pour fonctions
let userCount = 0; // camelCase pour variables

// Branded Types pour la Type-Safety
type UserId = string & { __brand: 'UserId' };
type StoreId = string & { __brand: 'StoreId' };
type ClaimCode = string & { __brand: 'ClaimCode' };
```

### Pattern de Gestion d'Erreurs

```typescript
// ✅ OBLIGATOIRE: Result Pattern pour toutes les opérations

type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

// Utilisation
async function createUser(dto: CreateUserDto): Promise<Result<User>> {
  // Validation
  const validation = userSchema.safeParse(dto);
  if (!validation.success) {
    return { success: false, error: new ValidationError(validation.error) };
  }

  // Business logic
  try {
    const user = await userRepository.create(validation.data);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: new DomainError('User creation failed', error) };
  }
}

// ❌ INTERDIT
async function badExample(data: any) {
  // ❌ any type
  const user = await db.user.create(data); // ❌ Pas de validation
  return user; // ❌ Pas de gestion d'erreur
}
```

### Structure de Projet OBLIGATOIRE

```
/src
  /core                   # Domaine métier (pur, sans dépendances)
    /entities            # Entités métier
    /value-objects       # Email, Money, ClaimCode, etc.
    /repositories        # Interfaces uniquement
    /services           # Services domaine
    /errors             # Erreurs métier

  /application          # Cas d'usage
    /use-cases         # Un fichier par use case
    /dto              # Data Transfer Objects
    /mappers          # Entity ↔ DTO
    /validators       # Validation métier
    /events          # Events domaine

  /infrastructure      # Détails techniques
    /database
      /prisma         # Schéma et migrations
      /repositories   # Implémentations
      /seeders       # Data seeding
    /services
      /stripe        # Service paiement
      /google        # Google My Business
      /email        # Service email
      /storage      # R2/S3
      /cache       # Redis

  /presentation       # UI/API
    /app             # Next.js App Router
    /components
      /atoms        # Boutons, Inputs, etc.
      /molecules    # Card, FormField, etc.
      /organisms    # Header, Sidebar, etc.
      /templates    # Layouts complets
    /hooks          # Custom React hooks
    /stores        # Zustand stores
    /styles        # Global styles

  /shared            # Code partagé
    /types          # Types partagés
    /constants      # Constantes
    /utils         # Fonctions utilitaires

  /test             # Tests
    /unit          # Tests unitaires
    /integration   # Tests d'intégration
    /e2e          # Tests end-to-end
    /fixtures     # Données de test
```

---

## Vision & Objectifs

### Transformation v1.0 → v2.0

| Aspect            | v1.0 (Actuel)               | v2.0 (Objectif)                        |
| ----------------- | --------------------------- | -------------------------------------- |
| **Architecture**  | Single-tenant, setup manuel | Multi-tenant SaaS, self-service        |
| **Utilisateurs**  | Super admin uniquement      | 3 niveaux (Super Admin, Admin, Client) |
| **Inscription**   | Manuelle par super admin    | Inscription autonome avec paiement     |
| **Monétisation**  | Aucune                      | Abonnements Stripe + add-ons           |
| **Customisation** | Aucune                      | Logo, couleurs, styles de roue         |
| **UI**            | CSS custom                  | ShadcnUI + Tailwind                    |
| **Mobile**        | Responsive basique          | Mobile-first                           |
| **Reviews**       | Aucune gestion              | Import & réponse Google Reviews        |
| **Limites**       | Aucune                      | Configurables par plan                 |

### Objectifs Business

- **Revenus récurrents** : MRR via abonnements Stripe
- **Self-service** : 0 intervention pour onboarding client
- **Scalabilité** : Architecture multi-tenant performante
- **Valeur ajoutée** : Gestion reviews Google + IA (future)

---

## Stack Technique Moderne

### 🎯 Frontend (Type-Safe & Performant)

- **Framework** : Next.js 15.1+ (App Router, RSC, PPR)
- **Language** : TypeScript 5.6+ (strict mode, no-any)
- **UI Architecture** :
  - **Design System** : Radix UI Primitives + CVA (Class Variance Authority)
  - **Styling** : Tailwind CSS v4 + PostCSS + CSS Variables
  - **Components** : Atomic Design (atoms → molecules → organisms → templates)
- **State Management** :
  - **Client State** : Zustand + Immer (immutable updates)
  - **Server State** : TanStack Query v5 + tRPC client
  - **Form State** : React Hook Form + Zod resolver
- **Validation** : Zod (schemas partagés frontend/backend)
- **Auth** : Supabase Auth (OAuth + Magic Links + MFA)

### 🔧 Backend (Domain-Driven & Event-Driven)

- **API Layer** : tRPC v11 (type-safe API, no REST needed)
- **Database** :
  - **Primary** : PostgreSQL 16 via Supabase
  - **ORM** : Prisma 5.22+ (type-safe queries, migrations)
  - **Cache** : Upstash Redis (rate limiting, sessions)
- **Architecture** :
  - **Pattern** : Hexagonal Architecture + DDD
  - **Events** : EventEmitter2 (domain events)
  - **Jobs** : Inngest (background jobs, workflows)
- **Services** :
  - **Payments** : Stripe (Checkout, Billing Portal, Webhooks)
  - **Email** : Resend (transactional) + React Email (templates)
  - **Storage** : Cloudflare R2 (S3-compatible, cheaper)
  - **Search** : Typesense (if needed for reviews)

### 🚀 Infrastructure & DevOps

- **Hosting** :
  - **Application** : Vercel (Edge Runtime where possible)
  - **Database** : Supabase (managed PostgreSQL)
  - **Assets** : Cloudflare R2 + CDN
- **Monitoring & Analytics** :
  - **Errors** : Sentry (with source maps)
  - **APM** : Axiom (logs aggregation)
  - **Analytics** : PostHog (product) + Vercel Analytics (web vitals)
  - **Uptime** : Better Stack
- **CI/CD** :
  - **Pipeline** : GitHub Actions
  - **Testing** : Vitest (unit) + Playwright (E2E)
  - **Quality** : ESLint + Prettier + Husky + Commitlint
  - **Security** : Snyk + Dependabot

### 🔌 External APIs & Integrations

- **Google My Business API** : Reviews sync
- **OpenAI API** : GPT-4 for AI suggestions
- **Stripe API** : Subscription management
- **Twilio/WhatsApp Business** : Notifications (Phase 2)
- **Webhook Management** : Svix (webhook reliability)

---

## Architecture Hexagonale

### Structure de Dossiers (Clean Architecture)

```
/src
  /core                         # 🔴 DOMAIN (pur, sans dépendances)
    /entities                   # Entités métier avec logique
      user.entity.ts
      store.entity.ts
      campaign.entity.ts
    /value-objects             # Objets valeurs immutables
      email.vo.ts
      money.vo.ts
      claim-code.vo.ts
    /repositories              # Interfaces seulement
      IUserRepository.ts
      IStoreRepository.ts
    /services                  # Services domaine
      pricing-service.ts
      lottery-service.ts
    /errors                    # Erreurs métier
      domain.error.ts

  /application                 # 🔵 USE CASES (orchestration)
    /use-cases
      /user
        create-user.use-case.ts
        update-subscription.use-case.ts
      /store
        create-store.use-case.ts
      /campaign
        launch-campaign.use-case.ts
    /dto                       # Data Transfer Objects
      user.dto.ts
      store.dto.ts
    /mappers                   # Entity ↔ DTO
      user.mapper.ts
    /validators               # Validation Zod
      user.schema.ts

  /infrastructure             # 🟡 TECHNICAL (implémentations)
    /database
      /prisma
        schema.prisma
        migrations/
      /repositories           # Implémentations concrètes
        prisma-user.repository.ts
        prisma-store.repository.ts
    /services
      /stripe
        stripe-payment.service.ts
      /google
        google-reviews.service.ts
      /email
        resend-email.service.ts
    /trpc                    # API type-safe
      /routers
        user.router.ts
        store.router.ts
      app-router.ts
      context.ts

  /presentation              # 🟣 UI (Next.js)
    /app                     # App Router Next.js 15
      /(marketing)           # Landing pages
      /(auth)               # Authentication
      /(admin)              # Admin dashboard
      /(customer)           # Customer flow
    /components
      /ui                   # Radix UI primitives
      /atoms               # Boutons, inputs
      /molecules           # Cards, forms
      /organisms           # Headers, sidebars
      /templates           # Page layouts
    /hooks                 # Custom React hooks
    /stores               # Zustand stores

/app
  /(marketing)                # Landing pages publiques
    /page.tsx                 # Home page avec liste campagnes actives
    /pricing/page.tsx         # Page tarifs
    /about/page.tsx           # À propos

  /(auth)                     # Authentication
    /login/page.tsx
    /register/page.tsx
    /verify-email/page.tsx
    /forgot-password/page.tsx

  /(super-admin)              # Plateforme admin
    /dashboard/page.tsx       # MRR, ARR, metrics
    /accounts/page.tsx        # Gestion comptes
    /billing/page.tsx         # Facturation plateforme
    /analytics/page.tsx       # Analytics avancées

  /(admin)                    # Commerce admin dashboard
    /dashboard/page.tsx       # Vue d'ensemble
    /stores/page.tsx          # Liste magasins
    /stores/[storeId]/
      /settings/page.tsx      # Branding, settings
      /campaigns/page.tsx     # Gestion campagnes
      /prizes/page.tsx        # Gestion lots
      /winners/page.tsx       # Gagnants
      /reviews/page.tsx       # 🆕 Google Reviews
      /team/page.tsx          # 🆕 Équipe
    /billing/page.tsx         # Abonnement & facturation
    /onboarding/page.tsx      # Wizard setup initial

  /[storeSlug]                # Customer-facing
    /page.tsx                 # Landing page magasin
    /welcome/page.tsx         # Page d'accueil après QR scan
    /lottery/page.tsx         # Roue de la chance
    /prize/[code]/page.tsx    # Affichage gain

  /api
    /auth/[...nextauth]/route.ts
    /webhooks/stripe/route.ts
    /cron/sync-reviews/route.ts

/components
  /ui/                        # ShadcnUI base components
    /button.tsx
    /card.tsx
    /dialog.tsx
    /form.tsx
    /sheet.tsx
    /table.tsx
    /toast.tsx
    /command.tsx

  /features/                  # Feature-specific components
    /wheel-of-fortune/
      /wheel.tsx
      /wheel-styles/
        /classic.tsx
        /modern.tsx
        /neon.tsx
        /minimal.tsx
    /reviews/
      /review-card.tsx
      /review-list.tsx
      /review-response-form.tsx
      /ai-suggestion-panel.tsx  # Phase 2
    /subscription/
      /plan-card.tsx
      /upgrade-dialog.tsx
    /onboarding/
      /wizard.tsx
      /wizard-step.tsx

  /layouts/
    /super-admin-layout.tsx
    /admin-layout.tsx
    /store-layout.tsx

  /shared/
    /logo-uploader.tsx
    /color-picker.tsx
    /qr-code-generator.tsx
    /store-selector.tsx

/lib
  /actions/                   # Server Actions
    /auth.actions.ts
    /store.actions.ts
    /campaign.actions.ts
    /review.actions.ts

  /api/                       # API clients
    /google-mybusiness.ts
    /stripe.ts
    /openai.ts

  /hooks/
    /use-subscription.ts
    /use-store.ts
    /use-reviews.ts

  /stores/                    # Zustand stores
    /user-store.ts
    /ui-store.ts

  /utils/
    /cn.ts
    /date.ts
    /colors.ts

  /validations/              # Zod schemas
    /auth.schema.ts
    /store.schema.ts
    /campaign.schema.ts
    /review.schema.ts

/lib/db
  /models/
    /User.ts
    /Store.ts
    /Subscription.ts
    /Campaign.ts
    /Prize.ts
    /Winner.ts
    /GoogleReview.ts         # 🆕
  /connect.ts

/public
  /wheel-styles/             # SVG/images pour styles de roues
```

### Patterns Architecturaux

- **Multi-tenant** : Isolation des données par `storeId`
- **Server Components** : Par défaut, client components uniquement si nécessaire
- **Server Actions** : Pour mutations (création, update, delete)
- **Route Handlers** : Pour webhooks et APIs externes
- **Optimistic UI** : Updates instantanées avec rollback
- **Mobile-first** : Design responsive avec breakpoints Tailwind

---

## User Personas & Flows

### 1. Super Admin (Administrateur Plateforme)

**Rôle** : Gère la plateforme ReviewLottery

**Fonctionnalités** :

- Dashboard avec métriques MRR/ARR, churn rate
- Gestion comptes (voir, suspendre, impersonation)
- Analytics avancées (acquisition, LTV)
- Facturation plateforme
- Support clients

**Flow** :

```
Login → Dashboard →
  ├── Voir métriques business
  ├── Gérer comptes utilisateurs
  ├── Impersonate admin pour support
  └── Analyser performances plateforme
```

### 2. Admin (Propriétaire Commerce)

**Rôle** : Gère ses magasins et campagnes

**Flow Inscription (Onboarding)** :

```
Landing → Sign Up (email/password) →
Email Verification →
Choose Plan (Starter/Growth/Business) →
Stripe Payment →
Welcome Screen →
Onboarding Wizard:
  1️⃣ Créer premier magasin (nom, slug)
  2️⃣ Branding (logo, couleurs, police)
  3️⃣ Choisir style de roue
  4️⃣ Créer premier lot
  5️⃣ Créer première campagne
  6️⃣ Connecter Google My Business
  ✅ Done → Dashboard
```

**Onboarding Wizard Details** :

**Step 1 : Créer magasin**

```tsx
<WizardStep title="Créons votre premier magasin">
  <Input name="storeName" label="Nom du magasin" />
  <Input name="storeSlug" label="URL personnalisée" />
  <small>Votre page : reviewlottery.com/[slug]</small>
</WizardStep>
```

**Step 2 : Branding**

```tsx
<WizardStep title="Personnalisez votre marque">
  <LogoUploader />
  <ColorPicker name="primaryColor" label="Couleur principale" />
  <ColorPicker name="secondaryColor" label="Couleur secondaire" />
  <Select name="font">
    <option>Inter</option>
    <option>Poppins</option>
    <option>Roboto</option>
  </Select>
  <Preview /> {/* Live preview de la landing page */}
</WizardStep>
```

**Step 3 : Style de roue**

```tsx
<WizardStep title="Choisissez votre style de roue">
  <div className="grid grid-cols-2 gap-4">
    <WheelStyleCard style="classic" />
    <WheelStyleCard style="modern" />
    <WheelStyleCard style="neon" />
    <WheelStyleCard style="minimal" />
  </div>
</WizardStep>
```

**Step 4 : Premier lot**

```tsx
<WizardStep title="Créez votre premier lot">
  <Input name="prizeName" label="Nom du lot" />
  <Input name="prizeValue" label="Valeur (€)" type="number" />
  <Textarea name="prizeDescription" label="Description" />
  <ColorPicker name="prizeColor" label="Couleur sur la roue" />
</WizardStep>
```

**Step 5 : Première campagne**

```tsx
<WizardStep title="Lancez votre première campagne">
  <Input name="campaignName" label="Nom de la campagne" />
  <DatePicker name="startDate" label="Date de début" />
  <DatePicker name="endDate" label="Date de fin" />
  <Input name="totalPrizes" label="Nombre total de lots" />
</WizardStep>
```

**Step 6 : Google My Business**

```tsx
<WizardStep title="Connectez Google My Business">
  <p>Pour importer vos avis Google automatiquement</p>
  <Button onClick={connectGoogleOAuth}>Connecter Google</Button>
  <Button variant="ghost" onClick={skipStep}>
    Passer cette étape
  </Button>
</WizardStep>
```

**Dashboard Post-Onboarding** :

```
Dashboard →
  ├── Vue d'ensemble (stats campagnes actives)
  ├── Magasins (liste, créer nouveau si plan le permet)
  ├── Campagnes (créer, gérer, QR codes)
  ├── Lots (créer, modifier)
  ├── Gagnants (valider, supprimer données RGPD)
  ├── 🆕 Reviews (voir, répondre, filtrer)
  ├── 🆕 Équipe (inviter membres si plan Growth+)
  └── Facturation (upgrade, add-ons)
```

### 3. Client (Participant)

**Rôle** : Participe à la loterie

**Flow** :

```
Scan QR Code →
Landing Page Magasin (logo, couleurs custom) →
"Laissez un avis Google" (Google Sign-In) →
Redirection Google Reviews →
Retour app →
Loterie (roue style custom) →
Écran gain →
Email avec code RVW-XXXXXX →
Récupérer lot en magasin
```

**Flow Mobile (détaillé)** :

```tsx
// 1. Landing Page
<StoreLanding>
  <Logo src={store.branding.logo} />
  <h1>{store.name}</h1>
  <p>Gagnez des cadeaux en laissant un avis</p>
  <Button onClick={startFlow}>Participer</Button>
</StoreLanding>

// 2. Google Sign-In
<GoogleSignInPrompt>
  <p>Connectez-vous avec Google pour continuer</p>
  <Button onClick={signInWithGoogle}>
    Continuer avec Google
  </Button>
</GoogleSignInPrompt>

// 3. Review Prompt
<ReviewPrompt>
  <p>Partagez votre expérience chez {store.name}</p>
  <Button onClick={openGoogleReviews}>
    Laisser un avis sur Google
  </Button>
</ReviewPrompt>

// 4. Wheel
<WheelOfFortune
  style={store.branding.wheelStyle}
  animation={store.branding.wheelAnimation}
  prizes={campaign.prizes}
  onWin={handleWin}
/>

// 5. Win Screen
<WinScreen>
  <Confetti />
  <h1>Félicitations !</h1>
  <p>Vous avez gagné : {prize.name}</p>
  <p>Code : {winner.claimCode}</p>
  <Button onClick={sendEmail}>
    Recevoir par email
  </Button>
</WinScreen>
```

---

## Modèles de Données (Prisma)

### Séparation des Modèles (Domain vs Database vs DTO)

#### 1️⃣ Domain Entity (Logique Métier Pure)

```typescript
// src/core/entities/user.entity.ts
export class UserEntity {
  private readonly _id: UserId;
  private readonly _email: Email;
  private _subscription: Subscription;
  private _stores: StoreId[];

  constructor(props: UserProps) {
    this._id = props.id;
    this._email = new Email(props.email);
    this._subscription = props.subscription;
    this._stores = props.stores;
  }

  // ✅ Méthodes métier avec logique
  canCreateStore(): boolean {
    const limit = this._subscription.getStoreLimit();
    return this._stores.length < limit;
  }

  upgradeSubscription(newPlan: SubscriptionPlan): Result<void> {
    if (!this._subscription.canUpgradeTo(newPlan)) {
      return { success: false, error: new DomainError('Cannot upgrade to this plan') };
    }
    this._subscription = this._subscription.upgradeTo(newPlan);
    return { success: true, data: undefined };
  }
}
```

#### 2️⃣ Database Model (Prisma Schema)

```prisma
// src/infrastructure/database/prisma/schema.prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  emailVerified     Boolean  @default(false)
  passwordHash      String

  // Relations
  stores            Store[]
  subscription      Subscription?

  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([email])
}

model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])

  // Stripe
  stripeCustomerId  String   @unique
  stripePriceId     String

  // Plan
  plan              SubscriptionPlan
  status            SubscriptionStatus

  // Limits
  maxStores         Int
  maxCampaigns      Int

  @@index([stripeCustomerId])
}

enum SubscriptionPlan {
  STARTER
  GROWTH
  BUSINESS
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  TRIALING
}
```

#### 3️⃣ DTO (Data Transfer Object)

```typescript
// src/application/dto/user.dto.ts
export type CreateUserDTO = {
  email: string;
  password: string;
  name?: string;
  plan: 'starter' | 'growth' | 'business';
};

export type UserResponseDTO = {
  id: string;
  email: string;
  subscription: {
    plan: string;
    status: string;
    limits: {
      stores: number;
      campaigns: number;
    };
  };
  stores: Array<{
    id: string;
    name: string;
  }>;
};
```

#### 4️⃣ Validation Schema (Zod)

```typescript
// src/application/validators/user.schema.ts
export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  name: z.string().min(2).optional(),
  plan: z.enum(['starter', 'growth', 'business']),
});

export type TCreateUserInput = z.infer<typeof createUserSchema>;
```

### User Model (Complet)

```typescript
interface User {
  _id: ObjectId;
  email: string;
  emailVerified: boolean;
  password: string; // hashed
  name?: string;

  // Role & Permissions
  role: 'super_admin' | 'admin';
  permissions?: string[]; // Future: granular permissions

  // Subscription (si admin)
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  subscriptionPlan?: 'starter' | 'growth' | 'business';
  subscriptionStartedAt?: Date;
  subscriptionEndsAt?: Date;
  trialEndsAt?: Date;

  // Limits
  maxStores: number; // Selon plan
  usedStores: number; // Nombre de stores créés
  storageLimit: number; // En MB (10MB * nombre stores)
  storageUsed: number; // En MB

  // Add-ons
  addOns: {
    whiteLabel: boolean; // +30€/mo
    extraStores: number; // +15€/mo par store
    teamMembers: number; // +10€/mo par membre
    whatsapp: boolean; // +20€/mo
  };

  // Onboarding
  onboardingCompleted: boolean;
  onboardingStep: number; // 0-6

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
```

### Store

```typescript
interface Store {
  _id: ObjectId;
  ownerId: ObjectId; // ref: User

  // Basic Info
  name: string;
  slug: string; // unique, URL-safe
  description?: string;

  // Branding
  branding: {
    logo?: string; // URL Vercel Blob
    logoSize?: number; // En bytes
    primaryColor: string; // Hex
    secondaryColor: string; // Hex
    font: 'inter' | 'poppins' | 'roboto' | 'montserrat';

    // Wheel customization
    wheelStyle: 'classic' | 'modern' | 'neon' | 'minimal';
    wheelAnimation: 'spin' | 'bounce' | 'elastic';
    wheelSpeed: number; // 1-5

    // Advanced (Plan Business)
    customCSS?: string;
  };

  // Google Integration
  googleBusinessUrl: string;
  googlePlaceId?: string;
  googleCredentials?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
  lastReviewSync?: Date;

  // Settings
  settings: {
    emailNotifications: boolean;
    reviewMinRating: number; // Ex: 4 (only sync 4-5 stars)
    autoResponseEnabled: boolean; // Phase 2
    language: 'fr' | 'en';
  };

  // Status
  isActive: boolean;
  isPaid: boolean; // False si owner subscription expired

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### Subscription

```typescript
interface Subscription {
  _id: ObjectId;
  userId: ObjectId;

  // Stripe
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;

  // Plan
  plan: 'starter' | 'growth' | 'business';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

  // Billing
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;

  // Trial
  trialStart?: Date;
  trialEnd?: Date;

  // Add-ons (items Stripe)
  addOns: {
    whiteLabel: boolean;
    extraStores: number;
    teamMembers: number;
    whatsapp: boolean;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### Campaign

```typescript
interface Campaign {
  _id: ObjectId;
  storeId: ObjectId; // 🆕 ref: Store
  ownerId: ObjectId; // ref: User

  // Basic Info
  name: string;
  description?: string;

  // Dates
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  // Prize Pool
  prizePoolId: ObjectId; // ref: PrizePool
  totalPrizesAvailable: number;
  prizesDistributed: number;

  // Settings
  settings: {
    expirationDays: number; // Default: 30
    requireGoogleReview: boolean;
    minReviewRating: number; // Ex: 4
    maxWinsPerEmail: number; // Default: 1
    cooldownHours: number; // Default: 24
  };

  // QR Code
  qrCodeUrl: string;

  // Stats
  stats: {
    totalParticipants: number;
    totalSpins: number;
    conversionRate: number; // participants / spins
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### Prize

```typescript
interface Prize {
  _id: ObjectId;
  storeId: ObjectId; // 🆕 ref: Store
  ownerId: ObjectId; // ref: User

  // Basic Info
  name: string;
  description?: string;
  value?: number; // Valeur en €

  // Display
  color: string; // Couleur sur la roue
  icon?: string; // Emoji ou nom d'icône
  image?: string; // Image du lot

  // Status
  isActive: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### PrizePool

```typescript
interface PrizePool {
  _id: ObjectId;
  storeId: ObjectId; // 🆕 ref: Store
  campaignId?: ObjectId; // ref: Campaign (optionnel si pool réutilisable)

  name: string;

  prizes: Array<{
    prizeId: ObjectId; // ref: Prize
    probability: number; // 0-100
    quantity: number; // Total disponible
    remaining: number; // Restant
  }>;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### Winner

```typescript
interface Winner {
  _id: ObjectId;
  storeId: ObjectId; // 🆕 ref: Store
  campaignId: ObjectId; // ref: Campaign
  prizeId: ObjectId; // ref: Prize

  // Claim Code
  claimCode: string; // Format: RVW-XXXXXX

  // Winner Info
  clientEmail: string;
  clientName: string;
  googleAccountId?: string; // Google user ID

  // Prize Snapshot
  prizeSnapshot: {
    name: string;
    description?: string;
    value?: number;
    color: string;
  };

  // Status
  status: 'pending' | 'claimed' | 'expired';
  expiresAt: Date;
  claimedAt?: Date;
  claimedBy?: string; // Email de l'admin qui a validé

  // RGPD
  dataRetentionDate?: Date; // Date de suppression auto
  anonymized: boolean; // Si données supprimées

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### GoogleReview (🆕)

```typescript
interface GoogleReview {
  _id: ObjectId;
  storeId: ObjectId; // ref: Store

  // Google Data
  googleReviewId: string; // ID unique Google
  googlePlaceId: string;

  // Reviewer
  reviewer: {
    profilePhotoUrl?: string;
    displayName: string;
    isAnonymous: boolean;
  };

  // Review Content
  starRating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createTime: Date;
  updateTime?: Date;

  // Response
  response?: {
    text: string;
    respondedAt: Date;
    respondedBy: string; // User email
    wasAiGenerated: boolean; // Phase 2
    aiPrompt?: string; // Phase 2: prompt utilisé
  };

  // Status
  status: 'new' | 'replied' | 'flagged' | 'archived';
  flagReason?: string; // Si flagged

  // Internal Notes
  internalNotes?: string;
  tags?: string[]; // Ex: ["customer_service", "product_quality"]

  // Metadata
  createdAt: Date; // Import date
  updatedAt: Date;
  lastSyncedAt: Date;
}
```

### TeamMember (🆕 Future)

```typescript
interface TeamMember {
  _id: ObjectId;
  userId: ObjectId; // ref: User
  ownerId: ObjectId; // ref: User (admin principal)

  // Access
  email: string;
  role: 'manager' | 'viewer'; // manager: full access, viewer: read-only
  storeIds: ObjectId[]; // Stores accessibles

  // Status
  status: 'pending' | 'active' | 'suspended';
  invitedAt: Date;
  joinedAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Stratégie de Prix

### Plans

| Plan           | Prix/mois | Stores   | Campagnes | Équipe | Support          | Essai    |
| -------------- | --------- | -------- | --------- | ------ | ---------------- | -------- |
| **Free Trial** | 0€        | 1        | Illimité  | 1      | Email            | 14 jours |
| **Starter**    | 29€       | 1        | 5 actives | 1      | Email            | ✅       |
| **Growth**     | 79€       | 3        | Illimité  | 5      | Email + Chat     | ✅       |
| **Business**   | 149€      | Illimité | Illimité  | 10     | Priority + Phone | ✅       |

### Limites par Plan

| Fonctionnalité        | Starter | Growth     | Business         |
| --------------------- | ------- | ---------- | ---------------- |
| Magasins              | 1       | 3          | Illimité         |
| Campagnes simultanées | 5       | Illimité   | Illimité         |
| Lots par campagne     | 10      | Illimité   | Illimité         |
| Membres équipe        | 1       | 5          | 10               |
| Stockage total        | 10MB    | 30MB       | 100MB            |
| Branding basique      | ✅      | ✅         | ✅               |
| Logo + couleurs       | ✅      | ✅         | ✅               |
| Styles de roue        | 2       | 4          | 4 + custom       |
| Google Reviews        | ✅      | ✅         | ✅               |
| Réponses manuelles    | ✅      | ✅         | ✅               |
| Suggestions IA        | ❌      | ✅         | ✅               |
| Analytics basiques    | ✅      | ✅         | ✅               |
| Analytics avancées    | ❌      | ✅         | ✅               |
| Export données        | CSV     | CSV + JSON | CSV + JSON + API |
| Custom CSS            | ❌      | ❌         | ✅               |
| Domaine custom        | ❌      | ❌         | ✅               |
| API Access            | ❌      | ❌         | ✅               |

### Add-ons (Tous plans)

| Add-on                     | Prix/mois | Description                                  |
| -------------------------- | --------- | -------------------------------------------- |
| **Store supplémentaire**   | +15€      | Au-delà de la limite du plan                 |
| **Membre équipe**          | +10€      | Au-delà de la limite du plan                 |
| **White-label**            | +30€      | Supprimer "Powered by ReviewLottery"         |
| **Notifications WhatsApp** | +20€      | Notifications gagnants via WhatsApp Business |

### Stripe Configuration

```typescript
// Prix IDs (à créer dans Stripe Dashboard)
const STRIPE_PRICES = {
  plans: {
    starter: 'price_starter_monthly_29',
    growth: 'price_growth_monthly_79',
    business: 'price_business_monthly_149',
  },
  addOns: {
    extraStore: 'price_addon_store_15',
    teamMember: 'price_addon_team_10',
    whiteLabel: 'price_addon_whitelabel_30',
    whatsapp: 'price_addon_whatsapp_20',
  },
};

// Création subscription avec trial
async function createSubscription(userId: string, plan: string) {
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: STRIPE_PRICES.plans[plan] }],
    trial_period_days: 14,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}
```

---

## Module Google Reviews

### Phase 1 : MVP (Lancement)

**Objectif** : Permettre aux admins de voir et répondre à leurs avis Google

**Fonctionnalités** :

1. **Connexion Google My Business**
   - OAuth 2.0 flow
   - Sélection du lieu (si plusieurs)
   - Stockage tokens (encrypted)

2. **Import automatique**
   - Cron job toutes les heures
   - Sync incrémentale (depuis dernier sync)
   - Notification email pour nouveaux avis

3. **Dashboard Reviews**
   - Liste avis avec filtres :
     - Rating (1-5 étoiles)
     - Status (new, replied, flagged, archived)
     - Date range
   - Search par reviewer name ou contenu
   - Tri par date / rating

4. **Réponse manuelle**
   - Formulaire de réponse
   - Preview avant envoi
   - Publication via Google API
   - Historique réponses

**Code Implementation** :

```typescript
// lib/api/google-mybusiness.ts
import { google } from 'googleapis';

export class GoogleMyBusinessAPI {
  private oauth2Client;

  constructor(credentials: { accessToken: string; refreshToken: string }) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });
  }

  async listReviews(locationId: string, since?: Date) {
    const mybusiness = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: this.oauth2Client,
    });

    const response = await mybusiness.accounts.locations.reviews.list({
      parent: `accounts/${locationId}`,
      orderBy: 'updateTime desc',
    });

    return response.data.reviews || [];
  }

  async replyToReview(reviewName: string, comment: string) {
    const mybusiness = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: this.oauth2Client,
    });

    await mybusiness.accounts.locations.reviews.updateReply({
      name: reviewName,
      requestBody: {
        comment,
      },
    });
  }
}

// app/api/cron/sync-reviews/route.ts
export async function GET(req: NextRequest) {
  // Vérifier authorization (Vercel Cron Secret)
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  // Récupérer tous les stores avec credentials Google
  const stores = await Store.find({
    'googleCredentials.accessToken': { $exists: true },
    isActive: true,
  });

  for (const store of stores) {
    try {
      await syncStoreReviews(store._id.toString());
    } catch (error) {
      console.error(`Failed to sync reviews for store ${store._id}:`, error);
    }
  }

  return NextResponse.json({ success: true, synced: stores.length });
}

async function syncStoreReviews(storeId: string) {
  const store = await Store.findById(storeId);
  if (!store.googleCredentials) return;

  const gmb = new GoogleMyBusinessAPI(store.googleCredentials);

  const reviews = await gmb.listReviews(store.googlePlaceId, store.lastReviewSync);

  let newReviewsCount = 0;

  for (const review of reviews) {
    const existing = await GoogleReview.findOne({
      googleReviewId: review.reviewId,
    });

    if (!existing) {
      await GoogleReview.create({
        storeId: store._id,
        googleReviewId: review.reviewId,
        googlePlaceId: store.googlePlaceId,
        reviewer: {
          displayName: review.reviewer.displayName,
          profilePhotoUrl: review.reviewer.profilePhotoUrl,
          isAnonymous: review.reviewer.isAnonymous,
        },
        starRating: review.starRating,
        comment: review.comment,
        createTime: new Date(review.createTime),
        updateTime: review.updateTime ? new Date(review.updateTime) : undefined,
        status: 'new',
        lastSyncedAt: new Date(),
      });

      newReviewsCount++;
    } else {
      // Update existing
      existing.comment = review.comment;
      existing.updateTime = review.updateTime ? new Date(review.updateTime) : undefined;
      existing.lastSyncedAt = new Date();
      await existing.save();
    }
  }

  // Update store lastReviewSync
  store.lastReviewSync = new Date();
  await store.save();

  // Notify owner if new reviews
  if (newReviewsCount > 0) {
    const owner = await User.findById(store.ownerId);
    await sendEmail({
      to: owner.email,
      subject: `${newReviewsCount} nouvel(s) avis Google pour ${store.name}`,
      template: 'new-reviews',
      data: {
        storeName: store.name,
        count: newReviewsCount,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/stores/${storeId}/reviews`,
      },
    });
  }
}

// lib/actions/review.actions.ts
('use server');

import { getServerSession } from 'next-auth';

export async function replyToReview(reviewId: string, comment: string) {
  const session = await getServerSession();
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const review = await GoogleReview.findById(reviewId);
  if (!review) throw new Error('Review not found');

  const store = await Store.findById(review.storeId);
  if (!store) throw new Error('Store not found');

  // Vérifier que l'admin possède ce store
  if (store.ownerId.toString() !== session.user.id) {
    throw new Error('Unauthorized');
  }

  // Publier réponse via Google API
  const gmb = new GoogleMyBusinessAPI(store.googleCredentials);
  await gmb.replyToReview(review.googleReviewId, comment);

  // Sauvegarder réponse
  review.response = {
    text: comment,
    respondedAt: new Date(),
    respondedBy: session.user.email,
    wasAiGenerated: false,
  };
  review.status = 'replied';
  await review.save();

  return { success: true };
}
```

**UI Component** :

```tsx
// components/features/reviews/review-card.tsx
'use client';

import { useState } from 'react';
import { Star, Reply } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { replyToReview } from '@/lib/actions/review.actions';

interface ReviewCardProps {
  review: GoogleReview;
  onReplySuccess?: () => void;
}

export function ReviewCard({ review, onReplySuccess }: ReviewCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      await replyToReview(review._id, replyText);
      setIsReplying(false);
      setReplyText('');
      onReplySuccess?.();
    } catch (error) {
      alert("Erreur lors de l'envoi de la réponse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {review.reviewer.profilePhotoUrl && (
              <img
                src={review.reviewer.profilePhotoUrl}
                alt={review.reviewer.displayName}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{review.reviewer.displayName}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.starRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(review.createTime).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {/* Comment */}
        <p className="text-gray-700 mb-4">{review.comment}</p>

        {/* Response */}
        {review.response ? (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <p className="text-sm font-medium text-blue-900 mb-1">Votre réponse</p>
            <p className="text-sm text-blue-800">{review.response.text}</p>
            <p className="text-xs text-blue-600 mt-2">
              {new Date(review.response.respondedAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        ) : isReplying ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Écrivez votre réponse..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleReply} disabled={loading || !replyText.trim()}>
                {loading ? 'Envoi...' : 'Publier'}
              </Button>
              <Button variant="ghost" onClick={() => setIsReplying(false)} disabled={loading}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsReplying(true)}>
            <Reply className="w-4 h-4 mr-2" />
            Répondre
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

### Phase 2 : Intelligence Artificielle (Future)

**Fonctionnalités** :

1. **Suggestions de réponse IA**
   - Analyse du sentiment de l'avis
   - Génération de 3 propositions de réponse
   - Personnalisation selon le ton du magasin
   - Édition avant publication

2. **Templates intelligents**
   - Auto-learning des meilleures réponses
   - Suggestions basées sur avis similaires
   - Variables dynamiques (nom client, produit, etc.)

3. **Sentiment Analysis**
   - Score positif/négatif/neutre
   - Identification topics (service, produit, prix, etc.)
   - Alertes pour avis négatifs critiques

4. **Analytics avancées**
   - Évolution rating dans le temps
   - Nuage de mots-clés
   - Comparaison avec concurrents (si données publiques)

**Code Implementation Phase 2** :

```typescript
// lib/api/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateReviewResponses(
  review: GoogleReview,
  store: Store,
): Promise<string[]> {
  const prompt = `
Tu es un assistant qui aide les commerces à répondre à leurs avis Google.

Commerce: ${store.name}
Avis: ${review.starRating}/5 étoiles
Commentaire: "${review.comment}"

Génère 3 réponses professionnelles et personnalisées (ton ${store.branding.tone || 'chaleureux'}).
Format JSON: { "responses": ["réponse1", "réponse2", "réponse3"] }
  `.trim();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content);
  return result.responses;
}

export async function analyzeSentiment(comment: string) {
  const prompt = `
Analyse le sentiment de cet avis Google.
Retourne JSON: { "sentiment": "positive|negative|neutral", "score": 0-100, "topics": ["topic1", "topic2"] }

Avis: "${comment}"
  `.trim();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content);
}

// lib/actions/review.actions.ts (Phase 2)
export async function getAiSuggestions(reviewId: string) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const review = await GoogleReview.findById(reviewId);
  const store = await Store.findById(review.storeId);

  // Check plan supports AI (Growth or Business)
  const user = await User.findById(store.ownerId);
  if (!['growth', 'business'].includes(user.subscriptionPlan)) {
    throw new Error('AI suggestions require Growth or Business plan');
  }

  const suggestions = await generateReviewResponses(review, store);
  return suggestions;
}
```

**UI Component Phase 2** :

```tsx
// components/features/reviews/ai-suggestion-panel.tsx
'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAiSuggestions } from '@/lib/actions/review.actions';

export function AiSuggestionPanel({ reviewId, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getAiSuggestions(reviewId);
      setSuggestions(data);
    } catch (error) {
      alert('Erreur IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Suggestions IA
        </h4>
        <Button size="sm" variant="ghost" onClick={loadSuggestions} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Cliquez pour générer des suggestions IA</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className="p-4 cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => onSelect(suggestion)}
            >
              <p className="text-sm">{suggestion}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Composants UI (Design System)

### 🎨 Design System Neo-Brutalist (Inspiré Cadeo)

#### Principes de Design

```css
/* Design Tokens */
:root {
  /* Colors */
  --color-black: #000000;
  --color-white: #ffffff;
  --color-primary: #5b21b6; /* Purple */
  --color-accent: #facc15; /* Yellow */
  --color-error: #dc2626; /* Red */
  --color-success: #16a34a; /* Green */

  /* Borders */
  --border-width: 2px;
  --border-radius: 0px; /* Sharp corners */

  /* Shadows */
  --shadow-sm: 2px 2px 0 #313131;
  --shadow-md: 4px 4px 0 #313131;
  --shadow-lg: 6px 6px 0 #313131;

  /* Typography */
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
}

/* Neo-Brutalist Component Styles */
.btn-neo {
  border: var(--border-width) solid var(--color-black);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translate(0, 0);
    box-shadow: none;
  }
}

.card-neo {
  border: var(--border-width) solid var(--color-black);
  box-shadow: var(--shadow-md);
  background: var(--color-white);
}
```

#### Landing Page Structure (Neo-Brutalist)

```tsx
// src/presentation/app/(marketing)/page.tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h1
            className="text-7xl font-bold tracking-tight
                        border-4 border-black p-8
                        shadow-[6px_6px_0_#313131]"
          >
            Boostez vos avis Google
            <br />
            <span className="text-primary">avec la gamification</span>
          </h1>

          <div className="mt-8 flex gap-4">
            <button
              className="px-8 py-4 bg-primary text-white
                             border-2 border-black font-bold
                             shadow-[4px_4px_0_#000]
                             hover:translate-x-[-2px] hover:translate-y-[-2px]
                             hover:shadow-[6px_6px_0_#000] transition-all"
            >
              Créer mon compte gratuit
            </button>

            <button
              className="px-8 py-4 bg-white text-black
                             border-2 border-black font-bold
                             shadow-[4px_4px_0_#000]"
            >
              Voir la démo
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-2xl">
                  ⭐
                </span>
              ))}
            </div>
            <span className="font-bold">4.9/5 (1,234 avis)</span>
          </div>
        </div>

        {/* Floating Game Elements */}
        <div
          className="absolute top-10 right-10 w-32 h-32
                      border-4 border-black bg-accent
                      shadow-[4px_4px_0_#000] rotate-12"
        />
      </section>

      {/* Trust Logos */}
      <section className="border-y-4 border-black bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-center mb-8 font-bold">THEY TRUST US</p>
          <div className="flex justify-around items-center">{/* Logo carousel */}</div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="border-4 border-black p-8
                          shadow-[4px_4px_0_#000]
                          hover:shadow-[6px_6px_0_#000] transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              <div className="mt-4 text-3xl font-bold text-primary">{feature.metric}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### Base Components (Radix UI + CVA)

Installer via CLI :

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog sheet form input textarea select table toast command skeleton
```

### Custom Components

#### WheelOfFortune

```tsx
// components/features/wheel-of-fortune/wheel.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClassicWheel } from './wheel-styles/classic';
import { ModernWheel } from './wheel-styles/modern';
import { NeonWheel } from './wheel-styles/neon';
import { MinimalWheel } from './wheel-styles/minimal';

interface WheelProps {
  style: 'classic' | 'modern' | 'neon' | 'minimal';
  animation: 'spin' | 'bounce' | 'elastic';
  prizes: Prize[];
  onWin: (prize: Prize) => void;
}

export function WheelOfFortune({ style, animation, prizes, onWin }: WheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);

  const spin = async () => {
    setIsSpinning(true);

    // Call API to determine winner
    const response = await fetch('/api/lottery/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId }),
    });

    const { prize, index } = await response.json();

    // Animate wheel
    await animateWheel(index, animation);

    setIsSpinning(false);
    onWin(prize);
  };

  const WheelComponent = {
    classic: ClassicWheel,
    modern: ModernWheel,
    neon: NeonWheel,
    minimal: MinimalWheel,
  }[style];

  return (
    <div className="flex flex-col items-center gap-8">
      <WheelComponent prizes={prizes} isSpinning={isSpinning} />

      <Button size="lg" onClick={spin} disabled={isSpinning} className="px-12 py-6 text-xl">
        {isSpinning ? 'Tournez...' : 'Lancer la roue'}
      </Button>
    </div>
  );
}
```

#### LogoUploader

```tsx
// components/shared/logo-uploader.tsx
'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { put } from '@vercel/blob';

export function LogoUploader({ currentLogo, onUpload }: Props) {
  const [preview, setPreview] = useState(currentLogo);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 10 * 1024 * 1024) {
      alert('Logo trop volumineux (max 10MB)');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Format invalide (PNG, JPG, SVG uniquement)');
      return;
    }

    setUploading(true);

    try {
      // Upload to Vercel Blob
      const blob = await put(`logos/${Date.now()}-${file.name}`, file, {
        access: 'public',
      });

      setPreview(blob.url);
      onUpload(blob.url);
    } catch (error) {
      alert('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Logo</label>

      {preview ? (
        <div className="relative w-32 h-32 border-2 border-dashed rounded-lg overflow-hidden">
          <img src={preview} alt="Logo" className="w-full h-full object-cover" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-xs text-gray-500">Upload</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      )}

      {uploading && <p className="text-sm text-gray-600">Upload en cours...</p>}
    </div>
  );
}
```

#### ColorPicker

```tsx
// components/shared/color-picker.tsx
'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function ColorPicker({ value, onChange, label }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-3 px-4 py-2 border rounded-lg hover:border-blue-500 transition-colors">
            <div className="w-8 h-8 rounded border" style={{ backgroundColor: value }} />
            <span className="font-mono text-sm">{value}</span>
          </button>
        </PopoverTrigger>

        <PopoverContent>
          <HexColorPicker color={value} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

#### QRCodeGenerator

```tsx
// components/shared/qr-code-generator.tsx
'use client';

import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function QRCodeGenerator({ url, filename }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 300,
        margin: 2,
      });
    }
  }, [url]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="border rounded-lg" />
      <Button onClick={download} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Télécharger QR Code
      </Button>
    </div>
  );
}
```

---

## Sécurité & Conformité

### Authentication (NextAuth v5)

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        await dbConnect();

        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### RBAC Middleware

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Super admin routes
    if (path.startsWith('/super-admin')) {
      if (token?.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Admin routes
    if (path.startsWith('/admin')) {
      if (!['admin', 'super_admin'].includes(token?.role)) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ['/super-admin/:path*', '/admin/:path*'],
};
```

### RGPD Compliance

```typescript
// lib/actions/gdpr.actions.ts
'use server';

// Export données utilisateur
export async function exportUserData(userId: string) {
  const user = await User.findById(userId).lean();
  const stores = await Store.find({ ownerId: userId }).lean();
  const campaigns = await Campaign.find({ ownerId: userId }).lean();
  const winners = await Winner.find({ clientEmail: user.email }).lean();
  const reviews = await GoogleReview.find({
    storeId: { $in: stores.map((s) => s._id) },
  }).lean();

  return {
    user,
    stores,
    campaigns,
    winners,
    reviews,
    exportedAt: new Date().toISOString(),
  };
}

// Supprimer compte + données
export async function deleteAccount(userId: string) {
  const session = await getServerSession();
  if (session.user.id !== userId) throw new Error('Unauthorized');

  // 1. Cancel Stripe subscription
  const user = await User.findById(userId);
  if (user.stripeCustomerId) {
    await stripe.customers.del(user.stripeCustomerId);
  }

  // 2. Delete stores
  await Store.deleteMany({ ownerId: userId });

  // 3. Delete campaigns, prizes, etc.
  await Campaign.deleteMany({ ownerId: userId });
  await Prize.deleteMany({ ownerId: userId });

  // 4. Anonymize winners
  await Winner.updateMany(
    { clientEmail: user.email },
    {
      clientName: '[SUPPRIMÉ]',
      clientEmail: '[SUPPRIMÉ]',
      anonymized: true,
    },
  );

  // 5. Delete reviews
  const storeIds = await Store.find({ ownerId: userId }).distinct('_id');
  await GoogleReview.deleteMany({ storeId: { $in: storeIds } });

  // 6. Delete user
  await User.findByIdAndDelete(userId);

  return { success: true };
}

// Anonymiser gagnant après réclamation
export async function anonymizeWinner(winnerId: string) {
  const winner = await Winner.findById(winnerId);

  if (winner.status !== 'claimed') {
    throw new Error('Only claimed prizes can be anonymized');
  }

  winner.clientName = '[SUPPRIMÉ]';
  winner.clientEmail = '[SUPPRIMÉ]';
  winner.anonymized = true;
  await winner.save();

  return { success: true };
}
```

### PCI Compliance

- ✅ Aucune carte stockée (Stripe Elements + Stripe Checkout)
- ✅ HTTPS uniquement
- ✅ Tokens court terme (JWT 7 jours)
- ✅ Logs audités (Stripe webhooks)

---

## Analytics & Monitoring

### Super Admin Metrics

```typescript
// app/(super-admin)/dashboard/page.tsx
export default async function SuperAdminDashboard() {
  const metrics = await calculatePlatformMetrics();

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <MetricCard
        title="MRR"
        value={`${metrics.mrr}€`}
        change={metrics.mrrChange}
      />
      <MetricCard
        title="ARR"
        value={`${metrics.arr}€`}
        change={metrics.arrChange}
      />
      <MetricCard
        title="Active Stores"
        value={metrics.activeStores}
        change={metrics.storesChange}
      />
      <MetricCard
        title="Churn Rate"
        value={`${metrics.churnRate}%`}
        change={-metrics.churnChange}
      />
    </div>
  );
}

async function calculatePlatformMetrics() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // MRR
  const activeSubscriptions = await Subscription.find({
    status: "active",
  });

  const mrr = activeSubscriptions.reduce((sum, sub) => {
    const planPrice = { starter: 29, growth: 79, business: 149 }[sub.plan];
    const addOnsPrice =
      sub.addOns.extraStores * 15 +
      sub.addOns.teamMembers * 10 +
      (sub.addOns.whiteLabel ? 30 : 0) +
      (sub.addOns.whatsapp ? 20 : 0);
    return sum + planPrice + addOnsPrice;
  }, 0);

  // ARR
  const arr = mrr * 12;

  // Active Stores
  const activeStores = await Store.countDocuments({
    isActive: true,
    isPaid: true,
  });

  // Churn Rate
  const canceledThisMonth = await Subscription.countDocuments({
    canceledAt: { $gte: lastMonth },
  });
  const totalLastMonth = await Subscription.countDocuments({
    createdAt: { $lt: lastMonth },
  });
  const churnRate = (canceledThisMonth / totalLastMonth) * 100;

  return { mrr, arr, activeStores, churnRate };
}
```

### Admin (Commerce) Metrics

```typescript
// app/(admin)/dashboard/page.tsx
export default async function AdminDashboard() {
  const session = await getServerSession();
  const stores = await Store.find({ ownerId: session.user.id });

  const metrics = await calculateStoreMetrics(stores.map((s) => s._id));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard
          title="Participants Total"
          value={metrics.totalParticipants}
        />
        <MetricCard
          title="Taux Conversion"
          value={`${metrics.conversionRate}%`}
        />
        <MetricCard title="Lots Distribués" value={metrics.prizesDistributed} />
        <MetricCard title="Nouveaux Avis" value={metrics.newReviews} />
      </div>

      <CampaignPerformanceChart data={metrics.campaigns} />
      <ReviewsOverTimeChart data={metrics.reviewsTimeline} />
    </div>
  );
}
```

### Monitoring Tools

**Sentry (Error Tracking)** :

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

**PostHog (Product Analytics)** :

```typescript
// app/providers.tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "https://app.posthog.com",
  });
}

export function Providers({ children }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

---

## Plan de Migration

### Migration v1.0 → v2.0

```typescript
// scripts/migrate-v1-to-v2.ts
import dbConnect from '@/lib/db/connect';
import bcrypt from 'bcryptjs';

async function migrateV1ToV2() {
  await dbConnect();

  console.log('🚀 Starting migration v1.0 → v2.0\n');

  // 1. Create Super Admin
  console.log('1️⃣ Creating super admin...');
  const superAdmin = await User.create({
    email: 'admin@reviewlottery.com',
    password: await bcrypt.hash('CHANGE_ME', 10),
    emailVerified: true,
    role: 'super_admin',
    maxStores: 99999,
    onboardingCompleted: true,
  });
  console.log('✅ Super admin created\n');

  // 2. Convert old Commerces to Users + Stores
  console.log('2️⃣ Converting commerces...');
  const oldCommerces = await OldCommerce.find();

  for (const oldCommerce of oldCommerces) {
    // Create admin user
    const adminUser = await User.create({
      email: oldCommerce.email,
      password: await bcrypt.hash('temp123', 10), // Envoyer email reset password
      emailVerified: true,
      role: 'admin',
      name: oldCommerce.name,

      // Free trial
      subscriptionStatus: 'trialing',
      subscriptionPlan: 'starter',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),

      maxStores: 1,
      usedStores: 1,

      onboardingCompleted: true,
    });

    // Create store
    const store = await Store.create({
      ownerId: adminUser._id,
      name: oldCommerce.name,
      slug: oldCommerce.slug,
      googleBusinessUrl: oldCommerce.googleBusinessUrl || '',

      branding: {
        logo: oldCommerce.logo,
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        font: 'inter',
        wheelStyle: 'classic',
        wheelAnimation: 'spin',
        wheelSpeed: 3,
      },

      settings: {
        emailNotifications: true,
        reviewMinRating: 4,
        autoResponseEnabled: false,
        language: 'fr',
      },

      isActive: oldCommerce.isActive,
      isPaid: true, // Gratuit pour existants
    });

    // Migrate campaigns
    await Campaign.updateMany(
      { commerceId: oldCommerce._id },
      {
        $set: {
          storeId: store._id,
          ownerId: adminUser._id,
        },
      },
    );

    // Migrate prizes
    await Prize.updateMany(
      { commerceId: oldCommerce._id },
      {
        $set: {
          storeId: store._id,
          ownerId: adminUser._id,
        },
      },
    );

    // Migrate winners
    await Winner.updateMany({ commerceId: oldCommerce._id }, { $set: { storeId: store._id } });

    console.log(`✅ Migrated: ${oldCommerce.name}`);
  }

  console.log('\n3️⃣ Sending password reset emails...');
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await sendPasswordResetEmail(admin.email);
  }

  console.log('\n✅ Migration complete!');
  console.log(`- Super admins: 1`);
  console.log(`- Admins migrated: ${oldCommerces.length}`);
  console.log(`- Stores created: ${oldCommerces.length}`);
}

migrateV1ToV2();
```

### Deployment Strategy

**Blue-Green Deployment** :

1. **Setup v2.0** sur nouveau environnement Vercel
2. **Migrate data** avec script ci-dessus
3. **Test complet** sur v2.0 staging
4. **DNS switch** progressif :
   - 10% traffic → v2.0 (1 jour)
   - 50% traffic → v2.0 (2 jours)
   - 100% traffic → v2.0
5. **Keep v1.0** running 1 semaine en read-only backup

---

## Roadmap

### MVP - Phase 1 (4-6 semaines)

**Semaine 1-2 : Foundation**

- ✅ Setup Next.js 15 + TypeScript + ShadcnUI
- ✅ Database models
- ✅ NextAuth v5 setup
- ✅ Landing page marketing
- ✅ Sign up / Login flows

**Semaine 3-4 : Core Features**

- ✅ Onboarding wizard (6 steps)
- ✅ Stripe integration (Checkout + Webhooks)
- ✅ Store creation + branding
- ✅ Campaign management
- ✅ Prize management

**Semaine 5-6 : Customer Flow + Reviews**

- ✅ Lottery flow mobile (ShadcnUI)
- ✅ Wheel of Fortune (4 styles)
- ✅ Winner management
- ✅ Google My Business OAuth
- ✅ Review import + dashboard
- ✅ Manual response feature

### Phase 2 (2-3 semaines)

**Multi-Store & Team**

- ✅ Multi-store management
- ✅ Store selector UI
- ✅ Team invitations
- ✅ Role-based permissions

**Advanced Branding**

- ✅ 4 wheel styles + animations
- ✅ Custom fonts
- ✅ White-label option
- ✅ Preview mode

### Phase 3 (3-4 semaines)

**AI & Analytics**

- ✅ AI response suggestions (GPT-4)
- ✅ Sentiment analysis
- ✅ Auto-response templates
- ✅ Advanced analytics dashboard
- ✅ Review quality scoring

**Notifications**

- ✅ WhatsApp Business API
- ✅ SMS notifications (Twilio)
- ✅ In-app notifications

### Phase 4 (Future)

**Mobile App**

- React Native app (iOS + Android)
- Store owner management on mobile
- Push notifications

**Integrations**

- Public API (REST + GraphQL)
- Zapier integration
- Webhooks pour events

**Multi-language**

- i18n avec next-intl
- Support FR, EN, ES, DE

**Advanced Features**

- Loyalty program
- Customer profiles
- Email marketing campaigns
- A/B testing wheel styles

---

## Notes Importantes

### Points Critiques

1. **Storage Management**
   - Limiter upload logo à 10MB
   - Compression auto des images
   - Clean-up régulier des logos non utilisés

2. **Stripe Webhooks**
   - CRITIQUE : bien gérer tous les events
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

3. **Google API Quotas**
   - Limiter sync reviews à 1x/heure max
   - Caching aggressive
   - Handle rate limiting

4. **Performance**
   - Indexes MongoDB sur `storeId`, `ownerId`, `googleReviewId`
   - Server Components partout sauf interactions
   - Image optimization (Next.js Image)
   - Lazy loading composants

5. **Security**
   - Rate limiting sur API routes (Upstash Ratelimit)
   - CSRF protection (NextAuth built-in)
   - Input validation (Zod partout)
   - Sanitize user input (DOMPurify)

---

## Ressources & Documentation

### Stack Documentation

- [Next.js 15 Docs](https://nextjs.org/docs)
- [ShadcnUI Components](https://ui.shadcn.com/)
- [NextAuth v5](https://next-auth.js.org/)
- [Stripe Docs](https://stripe.com/docs)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Google My Business API](https://developers.google.com/my-business)

### Code Quality

- ESLint + Prettier
- Husky pre-commit hooks
- TypeScript strict mode
- Unit tests (Vitest)
- E2E tests (Playwright)

---

## Conclusion

Ce PRD constitue la base complète pour le développement de ReviewLottery v2.0.

**Prochaines étapes** :

1. Créer nouveau projet Next.js 15
2. Installer ShadcnUI
3. Setup database MongoDB
4. Implémenter authentification
5. Suivre roadmap Phase 1

**Contact** : Pour questions ou clarifications pendant l'implémentation.

---

**Version** : 2.0.0
**Date** : 2025-12-03
**Auteur** : ReviewLottery Team
