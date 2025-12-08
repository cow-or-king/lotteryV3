# Guide de Production - Google My Business API

## 📋 Vue d'ensemble

Ce guide détaille le passage en production de l'intégration Google My Business pour la gestion des avis.

**⚠️ IMPORTANT:** L'implémentation actuelle est un **STUB** pour le développement. Ce guide décrit l'implémentation production complète.

---

## 🚀 Étape 1: Configuration Google Cloud Platform

### 1.1 Créer un Projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet "ReviewLottery Production"
3. Activer la facturation (nécessaire pour APIs)

### 1.2 Activer les APIs Nécessaires

#### Option A: Google Places API (Recommandé pour début)

**Avantages:**

- Setup simple (juste une API key)
- Pas besoin d'OAuth2
- Gratuit jusqu'à 100,000 requêtes/jour
- Parfait pour la lecture des avis

**Limites:**

- **Lecture seule** - impossible de publier des réponses
- Données limitées par rapport à My Business API

**Activation:**

```bash
# Via gcloud CLI
gcloud services enable places-backend.googleapis.com

# Ou via Console:
# https://console.cloud.google.com/apis/library/places-backend.googleapis.com
```

**Créer API Key:**

1. Aller dans "APIs & Services" → "Credentials"
2. "Create Credentials" → "API Key"
3. **Important:** Restreindre la clé:
   - Application restrictions: HTTP referrers ou IP addresses
   - API restrictions: Cocher "Places API"

#### Option B: Google My Business API (Pour fonctionnalités complètes)

**Avantages:**

- ✅ Lecture des avis
- ✅ Publication de réponses
- ✅ Gestion complète profil

**Limites:**

- Setup OAuth2 complexe
- Nécessite consentement propriétaire business
- Rate limits plus stricts

**Activation:**

```bash
gcloud services enable mybusiness.googleapis.com
gcloud services enable mybusinessaccountmanagement.googleapis.com
gcloud services enable mybusinessbusinessinformation.googleapis.com
```

---

## 🔐 Étape 2: Authentification

### Option A: API Key (Places API uniquement)

**Fichier:** `.env.production`

```env
GOOGLE_PLACES_API_KEY="AIza..."
```

**Implémentation:**

```typescript
// src/infrastructure/services/google-places.service.ts
import { Client } from '@googlemaps/google-maps-services-js';

export class GooglePlacesService implements IGoogleMyBusinessService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async fetchReviews(
    googlePlaceId: string,
    options?: FetchReviewsOptions,
  ): Promise<Result<readonly GoogleReviewData[]>> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: googlePlaceId,
          fields: ['reviews', 'name', 'rating'],
          key: process.env.GOOGLE_PLACES_API_KEY!,
        },
      });

      if (response.data.status !== 'OK') {
        return Result.fail(new Error(`Google API error: ${response.data.status}`));
      }

      const reviews = response.data.result.reviews || [];

      // Transform to domain format
      const googleReviews: GoogleReviewData[] = reviews.map((review) => ({
        googleReviewId: review.author_url || `${googlePlaceId}_${review.time}`,
        authorName: review.author_name,
        rating: review.rating,
        comment: review.text,
        reviewUrl: review.author_url || '',
        publishedAt: new Date(review.time * 1000), // Unix timestamp
      }));

      return Result.ok(googleReviews);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  // publishResponse NOT AVAILABLE avec Places API
  async publishResponse(): Promise<Result<void>> {
    return Result.fail(new Error('Publishing responses requires My Business API with OAuth2'));
  }
}
```

### Option B: OAuth 2.0 (My Business API)

#### 2.1 Créer OAuth 2.0 Credentials

1. Google Cloud Console → "APIs & Services" → "Credentials"
2. "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Authorized redirect URIs:
   - `https://yourdomain.com/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (dev)

5. Noter **Client ID** et **Client Secret**

#### 2.2 Obtenir Refresh Token

**Méthode 1: Via OAuth Playground**

1. Aller sur [OAuth2 Playground](https://developers.google.com/oauthplayground/)
2. Settings (⚙️) → Use your own OAuth credentials
3. Entrer Client ID et Client Secret
4. Step 1: Sélectionner scopes:
   ```
   https://www.googleapis.com/auth/business.manage
   ```
5. "Authorize APIs" → Se connecter avec compte propriétaire
6. Step 2: "Exchange authorization code for tokens"
7. Noter le **Refresh Token**

**Méthode 2: Via Application (Recommandé Production)**

Créer endpoint `/api/auth/google/connect`:

```typescript
// src/app/api/auth/google/connect/route.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export async function GET(request: Request) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force refresh token
    scope: ['https://www.googleapis.com/auth/business.manage'],
  });

  return Response.redirect(url);
}

// Callback
export async function callback(request: Request) {
  const { code } = await request.json();

  const { tokens } = await oauth2Client.getToken(code);

  // Store tokens.refresh_token encrypted in database per store
  await encryptionService.encrypt(tokens.refresh_token!);

  return Response.json({ success: true });
}
```

#### 2.3 Variables d'Environnement

```env
# OAuth 2.0
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."

# Per-Store in Database (encrypted)
# stores.googleApiKey → Stocke refresh_token chiffré
```

#### 2.4 Implémentation Service

```typescript
// src/infrastructure/services/google-my-business.service.ts
import { google } from 'googleapis';
import { ApiKeyEncryptionService } from '../security/api-key-encryption.service';

export class GoogleMyBusinessService implements IGoogleMyBusinessService {
  constructor(private readonly encryptionService: ApiKeyEncryptionService) {}

  private async getAuthClient(encryptedRefreshToken: string) {
    const refreshToken = await this.encryptionService.decrypt(encryptedRefreshToken);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    return oauth2Client;
  }

  async fetchReviews(
    googlePlaceId: string,
    options?: FetchReviewsOptions,
  ): Promise<Result<readonly GoogleReviewData[]>> {
    try {
      const auth = await this.getAuthClient(options.apiKey!);
      const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth });

      // 1. Find account
      const accountsResponse = await mybusiness.accounts.list();
      const accountId = accountsResponse.data.accounts?.[0]?.name;

      if (!accountId) {
        return Result.fail(new Error('No My Business account found'));
      }

      // 2. Find location by Place ID
      const locationsResponse = await mybusiness.accounts.locations.list({
        parent: accountId,
      });

      const location = locationsResponse.data.locations?.find(
        (loc) => loc.metadata?.placeId === googlePlaceId,
      );

      if (!location) {
        return Result.fail(new Error(`Location not found for Place ID ${googlePlaceId}`));
      }

      // 3. Fetch reviews
      const reviewsResponse = await mybusiness.accounts.locations.reviews.list({
        parent: location.name!,
        pageSize: options?.limit || 50,
      });

      const reviews = reviewsResponse.data.reviews || [];

      // Transform
      const googleReviews: GoogleReviewData[] = reviews.map((review) => ({
        googleReviewId: review.reviewId!,
        authorName: review.reviewer?.displayName || 'Anonymous',
        rating:
          review.starRating === 'FIVE'
            ? 5
            : review.starRating === 'FOUR'
              ? 4
              : review.starRating === 'THREE'
                ? 3
                : review.starRating === 'TWO'
                  ? 2
                  : 1,
        comment: review.comment || null,
        reviewUrl: review.reviewReply?.comment ? '...' : '...',
        publishedAt: new Date(review.createTime!),
      }));

      return Result.ok(googleReviews);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async publishResponse(
    googleReviewId: string,
    responseContent: string,
    apiKey: string,
  ): Promise<Result<void>> {
    try {
      const auth = await this.getAuthClient(apiKey);
      const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth });

      // Publish reply
      await mybusiness.accounts.locations.reviews.updateReply({
        name: `accounts/*/locations/*/reviews/${googleReviewId}`,
        requestBody: {
          comment: responseContent,
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async validateCredentials(apiKey: string): Promise<Result<boolean>> {
    try {
      const auth = await this.getAuthClient(apiKey);
      const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth });

      // Test API call
      await mybusiness.accounts.list();

      return Result.ok(true);
    } catch (error) {
      return Result.ok(false);
    }
  }
}
```

---

## 📦 Étape 3: Installation Dépendances

### Pour Places API

```bash
npm install @googlemaps/google-maps-services-js
```

### Pour My Business API

```bash
npm install googleapis
```

---

## 🔄 Étape 4: Migration du Code

### Remplacer le Stub

```bash
# Renommer le stub
mv src/infrastructure/services/google-my-business.service.ts \
   src/infrastructure/services/google-my-business.service.stub.ts

# Créer la vraie implémentation
# (copier le code ci-dessus)
```

### Mise à jour Dependency Injection

```typescript
// src/server/api/routers/review.router.ts

// AVANT (stub)
const googleService = new GoogleMyBusinessService();

// APRÈS (production)
import { GooglePlacesService } from '@/infrastructure/services/google-places.service';
// OU
import { GoogleMyBusinessService } from '@/infrastructure/services/google-my-business.service';

const googleService =
  process.env.USE_PLACES_API === 'true'
    ? new GooglePlacesService()
    : new GoogleMyBusinessService(encryptionService);
```

---

## ⚡ Étape 5: Rate Limiting & Retry Logic

### Implémenter Rate Limiter

```typescript
// src/infrastructure/services/rate-limiter.ts
import pLimit from 'p-limit';

export class RateLimiter {
  private limit = pLimit(10); // Max 10 concurrent requests

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.limit(fn);
  }
}

// Dans le service
export class GoogleMyBusinessService {
  private rateLimiter = new RateLimiter();

  async fetchReviews(...): Promise<Result<readonly GoogleReviewData[]>> {
    return this.rateLimiter.execute(async () => {
      // ... existing code
    });
  }
}
```

### Retry avec Backoff Exponentiel

```bash
npm install axios-retry
```

```typescript
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      error.response?.status === 429 || // Rate limit
      error.response?.status === 503
    ); // Service unavailable
  },
});
```

---

## 🧪 Étape 6: Tests

### Tests d'Intégration

```typescript
// src/test/integration/google-api.test.ts
describe('Google My Business Integration', () => {
  it('should fetch real reviews from test Place ID', async () => {
    const service = new GooglePlacesService();

    const result = await service.fetchReviews(process.env.TEST_GOOGLE_PLACE_ID!);

    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });
});
```

### Test en Staging

```bash
# .env.staging
GOOGLE_PLACES_API_KEY="test_key..."
TEST_GOOGLE_PLACE_ID="ChIJ..."
```

---

## 📊 Étape 7: Monitoring

### Logs

```typescript
// src/infrastructure/services/google-my-business.service.ts
import { logger } from '@/lib/logger';

async fetchReviews(...) {
  logger.info('Fetching reviews', {
    placeId: googlePlaceId,
    timestamp: new Date().toISOString(),
  });

  try {
    // ...
    logger.info('Reviews fetched successfully', {
      placeId: googlePlaceId,
      count: reviews.length,
    });
  } catch (error) {
    logger.error('Failed to fetch reviews', {
      placeId: googlePlaceId,
      error: error.message,
    });
  }
}
```

### Métriques

```typescript
// Track API usage
import { metrics } from '@/lib/metrics';

await metrics.increment('google_api.requests');
await metrics.increment('google_api.reviews_fetched', reviews.length);
```

---

## 💰 Étape 8: Coûts & Quotas

### Places API

**Gratuit:**

- 100,000 requêtes/jour

**Payant au-delà:**

- $0.017 par requête

**Quotas:**

- 100 requêtes/seconde par projet
- 1,000 requêtes/seconde par utilisateur

### My Business API

**Gratuit** mais avec quotas:

- 1,000 requêtes/jour par projet (default)
- Peut être augmenté sur demande

---

## ✅ Checklist Pré-Production

- [ ] Projet Google Cloud créé
- [ ] API activée (Places ou My Business)
- [ ] Credentials créées et sécurisées
- [ ] Variables d'environnement configurées
- [ ] Dépendances installées
- [ ] Code stub remplacé
- [ ] Rate limiting implémenté
- [ ] Retry logic configuré
- [ ] Tests d'intégration passent
- [ ] Logs configurés
- [ ] Monitoring actif
- [ ] Documentation à jour
- [ ] Budget Google Cloud défini

---

## 🆘 Troubleshooting

### Erreur: "API key not valid"

**Cause:** Restrictions API key mal configurées

**Solution:**

1. Vérifier restrictions dans Google Cloud Console
2. S'assurer que "Places API" est cochée
3. Vérifier HTTP referrers

### Erreur: "PERMISSION_DENIED"

**Cause:** Scopes OAuth insuffisants

**Solution:**

1. Vérifier scopes demandés include `business.manage`
2. Re-authentifier avec `prompt=consent`
3. Vérifier que le compte a accès au business

### Erreur: "QUOTA_EXCEEDED"

**Cause:** Rate limit dépassé

**Solution:**

1. Implémenter rate limiting côté serveur
2. Demander augmentation quota (formulaire Google)
3. Optimiser fréquence de sync

---

## 📚 Ressources

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Google My Business API Docs](https://developers.google.com/my-business)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Rate Limiting Best Practices](https://cloud.google.com/apis/design/design_patterns#rate_limiting)

---

**Dernière mise à jour:** 2025-01-08
**Version:** 1.0
**Statut:** Production-ready implementation guide
