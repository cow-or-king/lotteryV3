# Documentation Technique - Système de Gestion des Avis Google

## 📋 Vue d'ensemble

Cette documentation décrit l'architecture et l'implémentation du système de gestion des avis Google dans ReviewLottery v3.

---

## 🏗️ Architecture

### Architecture Hexagonale (Clean Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ ReviewList   │  │ ReviewCard   │  │ResponseEditor│  │
│  │  Component   │  │  Component   │  │  Component   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│  ┌──────▼──────────────────▼──────────────────▼──────┐  │
│  │         React Hooks (use-reviews.ts)              │  │
│  │         (useReviewsByStore, useSyncReviews...)    │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│                    tRPC ROUTERS                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  review.router.ts (verifyParticipant, respond,  │  │
│  │  sync, getById, listByStore, getStats)          │  │
│  └──────────────────────┬───────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│                    CORE / USE CASES                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  VerifyReviewParticipantUseCase                  │  │
│  │  RespondToReviewUseCase                          │  │
│  │  SyncReviewsFromGoogleUseCase                    │  │
│  │  GetReviewByIdUseCase                            │  │
│  │  ListReviewsByStoreUseCase                       │  │
│  │  GetReviewStatsUseCase                           │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │         Domain Entities & Value Objects          │  │
│  │  - ReviewEntity (business logic)                 │  │
│  │  - GoogleReviewMetadata (value object)           │  │
│  │  - ReviewResponse (value object)                 │  │
│  └──────────────────────┬───────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│              INFRASTRUCTURE (Adapters)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Repositories (Ports Implementation)             │  │
│  │  - PrismaReviewRepository (15 méthodes)          │  │
│  │  - PrismaResponseTemplateRepository (9 méthodes) │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  External Services                               │  │
│  │  - GoogleMyBusinessService (STUB)                │  │
│  │  - ApiKeyEncryptionService (AES-256-GCM)         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Database (Prisma + PostgreSQL/Supabase)        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Principes Architecturaux

1. **Dependency Inversion:** Les use cases dépendent d'interfaces (ports), pas d'implémentations concrètes
2. **Single Responsibility:** Chaque use case a une seule responsabilité
3. **Result Pattern:** Gestion d'erreurs type-safe sans exceptions
4. **Branded Types:** Type-safety complète des IDs
5. **ZERO any types:** TypeScript strict mode

---

## 📦 Structure des Fichiers

```
src/
├── core/                                 # Domain & Use Cases
│   ├── entities/
│   │   └── review.entity.ts             # ReviewEntity avec business logic
│   ├── value-objects/
│   │   ├── google-review-metadata.vo.ts # Métadonnées Google
│   │   └── review-response.vo.ts        # Réponse à un avis
│   ├── repositories/
│   │   └── review.repository.interface.ts # Port IReviewRepository
│   ├── services/
│   │   └── google-my-business.service.interface.ts # Port IGoogleMyBusinessService
│   └── use-cases/
│       └── review/
│           ├── verify-review-participant.use-case.ts
│           ├── respond-to-review.use-case.ts
│           ├── sync-reviews-from-google.use-case.ts
│           ├── get-review-by-id.use-case.ts
│           ├── list-reviews-by-store.use-case.ts
│           └── get-review-stats.use-case.ts
│
├── infrastructure/                       # Adapters
│   ├── repositories/
│   │   ├── prisma-review.repository.ts  # Implémentation Prisma
│   │   └── mappers/
│   │       └── review.mapper.ts         # Domain ↔ Persistence
│   ├── services/
│   │   └── google-my-business.service.ts # STUB implementation
│   └── security/
│       └── api-key-encryption.service.ts # AES-256-GCM
│
├── server/api/                           # tRPC Layer
│   └── routers/
│       ├── review.router.ts              # 6 endpoints
│       └── response-template.router.ts   # 5 endpoints
│
├── hooks/                                # React Hooks
│   ├── use-reviews.ts                   # 6 hooks
│   └── use-response-templates.ts        # 6 hooks
│
└── components/reviews/                   # UI Components
    ├── ReviewCard.tsx                   # Affichage avis
    ├── ResponseEditor.tsx               # Éditeur de réponse
    ├── ReviewList.tsx                   # Liste avec filtres
    └── index.ts                         # Exports
```

---

## 🔄 Flux de Données

### 1. Synchronisation des Avis Google

```typescript
┌──────────────┐
│ UI Component │ useSyncReviews()
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ tRPC Router      │ review.sync
│ review.router.ts │
└──────┬───────────┘
       │
       ▼
┌─────────────────────────────┐
│ SyncReviewsFromGoogleUseCase│
└──────┬──────────────────────┘
       │
       ├─► 1. Validate Google Place ID
       │
       ├─► 2. Fetch from Google API
       │   ┌──────────────────────────┐
       │   │ GoogleMyBusinessService  │
       │   │ fetchReviews()           │
       │   └──────────────────────────┘
       │
       ├─► 3. Transform to domain
       │   (GoogleReviewData → CreateReviewData)
       │
       └─► 4. Upsert in DB
           ┌──────────────────────────┐
           │ PrismaReviewRepository   │
           │ upsertMany()             │
           └──────────────────────────┘
```

**Code simplifié:**

```typescript
async execute(input: SyncReviewsFromGoogleInput): Promise<Result<SyncReviewsFromGoogleOutput>> {
  // 1. Validate
  if (!this.isValidGooglePlaceId(input.googlePlaceId)) {
    return Result.fail(new InvalidGooglePlaceIdError(input.googlePlaceId));
  }

  // 2. Fetch
  const fetchResult = await this.googleService.fetchReviews(input.googlePlaceId);
  if (!fetchResult.success) return Result.fail(fetchResult.error);

  // 3. Transform
  const reviewsToSync: CreateReviewData[] = fetchResult.data.map((googleReview) => ({
    storeId: input.storeId,
    googleReviewId: googleReview.googleReviewId,
    authorName: googleReview.authorName,
    // ...
  }));

  // 4. Upsert
  const syncResult = await this.reviewRepository.upsertMany(reviewsToSync);
  if (!syncResult.success) return Result.fail(syncResult.error);

  return Result.ok({ totalFetched, synchronized, failed });
}
```

### 2. Répondre à un Avis

```typescript
┌──────────────┐
│ ResponseEditor│ useRespondToReview()
└──────┬────────┘
       │
       ▼
┌──────────────────┐
│ tRPC Router      │ review.respond
│ review.router.ts │
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ RespondToReviewUseCase│
└──────┬────────────────┘
       │
       ├─► 1. Load Review Entity
       │   ┌──────────────────────────┐
       │   │ PrismaReviewRepository   │
       │   │ findById()               │
       │   └──────────────────────────┘
       │
       ├─► 2. Business Validation
       │   - Already responded?
       │   - Response content valid?
       │
       ├─► 3. Publish to Google
       │   ┌──────────────────────────┐
       │   │ GoogleMyBusinessService  │
       │   │ publishResponse()        │
       │   └──────────────────────────┘
       │   (utilise API key chiffrée)
       │
       ├─► 4. Update Entity
       │   reviewEntity.addResponse()
       │
       ├─► 5. Increment Template Usage
       │   (si template utilisé)
       │
       └─► 6. Save
           ┌──────────────────────────┐
           │ PrismaReviewRepository   │
           │ save()                   │
           └──────────────────────────┘
```

### 3. Vérification Participant Loterie

```typescript
┌──────────────┐
│ Lottery Form │ useVerifyParticipant()
└──────┬────────┘
       │
       ▼
┌──────────────────┐
│ tRPC Router      │ review.verifyParticipant
│ review.router.ts │
└──────┬───────────┘
       │
       ▼
┌────────────────────────────┐
│ VerifyReviewParticipantUseCase│
└──────┬──────────────────────┘
       │
       ├─► 1. Validate Email
       │
       ├─► 2. Find Review by Email + Store
       │   ┌──────────────────────────┐
       │   │ PrismaReviewRepository   │
       │   │ findByEmailAndStore()    │
       │   └──────────────────────────┘
       │
       ├─► 3. Check Already Verified
       │
       ├─► 4. Mark as Verified
       │   reviewEntity.markAsVerified(participantId)
       │
       └─► 5. Save
           ┌──────────────────────────┐
           │ PrismaReviewRepository   │
           │ save()                   │
           └──────────────────────────┘
```

---

## 🗃️ Modèle de Données

### Schema Prisma

```prisma
model Review {
  id                String    @id @default(cuid())
  storeId           String
  campaignId        String?
  googleReviewId    String    @unique

  // Auteur
  authorName        String
  authorEmail       String?
  photoUrl          String?

  // Contenu
  rating            Int       // 1-5
  comment           String?   @db.Text
  reviewUrl         String
  publishedAt       DateTime

  // Réponse
  hasResponse       Boolean   @default(false)
  responseContent   String?   @db.Text
  respondedAt       DateTime?
  respondedBy       String?

  // Métadonnées
  status            String    @default("PENDING") // PENDING, PROCESSED, ARCHIVED
  sentiment         String?   // AI sentiment analysis
  isVerified        Boolean   @default(false)
  verifiedAt        DateTime?
  participantId     String?

  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  store             Store     @relation(fields: [storeId], references: [id], onDelete: Cascade)
  campaign          Campaign? @relation(fields: [campaignId], references: [id])

  @@index([storeId])
  @@index([campaignId])
  @@index([googleReviewId])
  @@index([authorEmail])
  @@index([rating])
  @@index([publishedAt])
}
```

### Domain Entity

```typescript
export class ReviewEntity {
  private constructor(
    public readonly id: ReviewId,
    public readonly storeId: StoreId,
    public readonly googleReviewId: string,
    public readonly authorName: string,
    public readonly authorEmail: string | null,
    public readonly rating: number,
    public readonly comment: string | null,
    public readonly reviewUrl: string,
    public readonly publishedAt: Date,
    public readonly hasResponse: boolean,
    public readonly responseContent: string | null,
    public readonly respondedAt: Date | null,
    public readonly isVerified: boolean,
    public readonly status: string,
    public readonly sentiment: string | null,
    public readonly campaignId: CampaignId | null,
    public readonly participantId: ParticipantId | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // Business logic methods
  public isPositive(): boolean;
  public needsAttention(): boolean;
  public canRespond(): boolean;
  public addResponse(content: string, userId: UserId): Result<ReviewEntity>;
  public markAsVerified(participantId: ParticipantId): Result<ReviewEntity>;
  public archive(): Result<ReviewEntity>;
}
```

---

## 🧪 Tests

### Couverture Actuelle

```
✅ 37/37 tests passing (100%)

- verify-review-participant.use-case.test.ts (7 tests)
- respond-to-review.use-case.test.ts (7 tests)
- sync-reviews-from-google.use-case.test.ts (6 tests)
- review-query.use-cases.test.ts (7 tests)
- response-template.use-cases.test.ts (10 tests)
```

### Stratégie TDD

1. **Red:** Écrire le test qui échoue
2. **Green:** Implémenter le code minimal
3. **Refactor:** Améliorer sans casser les tests

**Exemple:**

```typescript
describe('RespondToReviewUseCase', () => {
  it('should successfully respond to a review', async () => {
    // Arrange
    const mockReview = ReviewEntity.fromPersistence({...});
    mockReviewRepo.findById.mockResolvedValue(mockReview);
    mockGoogleService.publishResponse.mockResolvedValue(Result.ok(undefined));

    // Act
    const result = await useCase.execute({
      reviewId,
      responseContent: 'Merci pour votre avis!'
    });

    // Assert
    expect(result.success).toBe(true);
    expect(mockReviewRepo.save).toHaveBeenCalled();
  });
});
```

---

## 🔧 Configuration

### Variables d'Environnement

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Encryption (AES-256-GCM)
ENCRYPTION_KEY="base64:random_32_bytes_key..."

# Google My Business API (Production - OAuth2)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
# Refresh token is stored encrypted per store in database
```

### Génération ENCRYPTION_KEY

```bash
# Generate secure 32-byte key
node -e "console.log('base64:' + require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🚀 Déploiement

### Checklist Pre-Production

1. **Base de données**
   - [ ] Migration Prisma exécutée
   - [ ] Index créés
   - [ ] CRON job suppression 3 ans configuré

2. **Sécurité**
   - [ ] ENCRYPTION_KEY en production
   - [ ] API keys Google configurées
   - [ ] HTTPS uniquement
   - [ ] CORS configuré

3. **RGPD**
   - [ ] Politique de confidentialité publiée
   - [ ] Consentement loterie implémenté
   - [ ] Process suppression données documenté

4. **Monitoring**
   - [ ] Logs audit activés
   - [ ] Alertes configurées
   - [ ] Metrics dashboards

---

## 📊 Performance

### Optimisations

1. **Database Queries**
   - Index sur colonnes fréquemment utilisées
   - Pagination systématique
   - Eager loading des relations

2. **Cache**
   - React Query cache (tRPC)
   - Invalidation intelligente
   - Stale-while-revalidate

3. **API Calls**
   - Batch operations quand possible
   - Rate limiting Google API
   - Retry logic avec backoff exponentiel

---

## 🐛 Debugging

### Logs Utiles

```typescript
// Sync
console.log(`[SYNC] Fetched ${totalFetched} reviews for ${storeId}`);

// Response
console.log(`[RESPOND] User ${userId} responded to review ${reviewId}`);

// Verification
console.log(`[VERIFY] Participant ${participantId} verified with review ${reviewId}`);
```

### Erreurs Communes

| **Erreur**                | **Cause**                | **Solution**             |
| ------------------------- | ------------------------ | ------------------------ |
| `Review not found`        | ID invalide              | Vérifier existence en DB |
| `Already responded`       | Tentative double réponse | Check `hasResponse` flag |
| `Invalid Google Place ID` | Format incorrect         | Valider format CH...     |
| `API key not configured`  | Store sans API key       | Configurer dans settings |
| `Encryption failed`       | ENCRYPTION_KEY manquante | Définir en .env          |

---

## 📚 Ressources

- [Architecture Hexagonale](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Result Pattern](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/handling-errors-result-class/)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Dernière mise à jour:** 2025-01-08
**Version:** 1.0
