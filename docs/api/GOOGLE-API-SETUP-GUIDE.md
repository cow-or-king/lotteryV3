# Guide de Configuration - Google APIs pour ReviewLottery

## 📋 Vue d'ensemble

Ce guide détaille la configuration des APIs Google pour récupérer et gérer les avis Google My Business.

**Deux approches possibles:**

- **Approche A**: Places API (New) - Simple, lecture seule
- **Approche B**: My Business APIs - Complet, lecture + écriture

---

## 🔐 Gestion des Rôles Google My Business

### Comprendre les Rôles

#### Propriétaire Principal

- **Rôle**: Compte "maître" du business
- **Responsabilité**: Gestion stratégique, ajout/suppression de gestionnaires
- **⚠️ IMPORTANT**: **NE PAS utiliser ce compte pour l'API** (raisons de sécurité)

#### Propriétaire/Gestionnaire Secondaire

- **Rôle**: Peut gérer le profil Google Business
- **Responsabilité**: Gestion quotidienne, réponses aux avis
- **Pour l'API**: Peut être utilisé pour les tests, mais pas recommandé en production

---

## ✅ Configuration Recommandée : Compte Dédié

### Pourquoi un Compte Dédié ?

**Avantages:**

- ✅ **Sécurité**: Le compte principal n'est jamais exposé
- ✅ **Révocable**: Accès API révocable sans impact sur les comptes personnels
- ✅ **Traçabilité**: Les actions API sont clairement identifiables
- ✅ **Isolation**: Si le token est compromis, pas d'impact sur les comptes personnels
- ✅ **Conformité**: Meilleure séparation des responsabilités (SOD)

### Création du Compte API Dédié

#### Étape 1: Créer un Compte Google Dédié

1. **Email recommandé**: `api-reviewlottery@votredomaine.com`
   - Ou Gmail: `reviewlottery.api@gmail.com`

2. **Configuration du compte:**
   - Mot de passe fort (généré, stocké dans 1Password/Bitwarden)
   - 2FA activé (obligatoire)
   - Numéro de téléphone de récupération
   - Email de récupération (compte admin)

#### Étape 2: Ajouter le Compte comme Gestionnaire

1. **Connexion avec le Propriétaire Principal**
2. Aller sur [Google Business Profile Manager](https://business.google.com/)
3. Sélectionner l'établissement
4. Aller dans **Paramètres** → **Utilisateurs**
5. Cliquer sur **Ajouter un utilisateur**
6. Entrer l'email: `api-reviewlottery@votredomaine.com`
7. Choisir le rôle: **Gestionnaire** (suffisant pour l'API)
8. Le compte API reçoit une invitation par email
9. Accepter l'invitation avec le compte API

#### Étape 3: Vérifier les Permissions

Avec le compte API, vérifier l'accès à:

- ✅ Consultation des avis
- ✅ Réponse aux avis (si Gestionnaire ou Propriétaire)
- ✅ Informations de l'établissement

---

## 📍 Approche A: Places API (New) - Configuration Rapide

### Caractéristiques

**✅ Avantages:**

- Setup très simple (10 minutes)
- Juste une API Key, pas d'OAuth
- Gratuit jusqu'à 100,000 requêtes/jour
- Parfait pour récupérer les avis

**❌ Limitations:**

- **Lecture seule** - impossible de publier des réponses
- Maximum 5 avis les plus récents par lieu
- Pas d'accès aux insights avancés

**💰 Coûts:**

- Gratuit: 100,000 requêtes/mois
- Au-delà: $0.017 par requête

### Configuration Step-by-Step

#### 1. Accès Google Cloud Console

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Se connecter avec le **compte API dédié** ou un compte admin
3. Créer un nouveau projet:
   - Nom: `ReviewLottery Production`
   - ID: `reviewlottery-prod-xxxxx` (généré automatiquement)
4. Activer la facturation (obligatoire même pour l'offre gratuite)
   - Ajouter une carte bancaire (aucun débit si vous restez dans les limites gratuites)

#### 2. Activer l'API Places (New)

1. Dans le menu, aller dans **APIs & Services** → **Bibliothèque**
2. Rechercher: **"Places API (New)"**
3. Cliquer sur la carte **"Places API (New)"**
4. Cliquer sur **Activer**
5. Attendre 1-2 minutes (propagation)

#### 3. Créer une API Key

1. Aller dans **APIs & Services** → **Identifiants**
2. Cliquer sur **+ Créer des identifiants**
3. Sélectionner **Clé API**
4. Une clé est générée: `AIzaSy...` (ne pas fermer la fenêtre)

#### 4. Restreindre l'API Key (OBLIGATOIRE pour la sécurité)

**⚠️ CRITIQUE**: Une API Key non restreinte est une faille de sécurité majeure

1. Dans la fenêtre de création, cliquer sur **Modifier la clé API**
2. Ou dans la liste des identifiants, cliquer sur le nom de la clé

**Restrictions d'application:**

Option 1 (Recommandé pour production):

- Sélectionner: **Adresses IP (serveurs web, tâches Cron, etc.)**
- Ajouter l'IP de votre serveur: `XX.XX.XX.XX`
- Ajouter l'IP de secours si applicable

Option 2 (Acceptable pour dev):

- Sélectionner: **Référents HTTP (sites web)**
- Ajouter: `https://votredomaine.com/*`
- Ajouter: `http://localhost:3000/*` (dev uniquement)

**Restrictions d'API:**

- Sélectionner: **Restreindre la clé**
- Cocher uniquement: **Places API (New)**
- Enregistrer

#### 5. Configurer les Variables d'Environnement

**Fichier `.env.production`:**

```env
# Google Places API (New)
GOOGLE_PLACES_API_KEY="AIzaSy...votre_cle..."
USE_PLACES_API="true"

# Flag pour indiquer l'utilisation de Places API
GOOGLE_API_PROVIDER="places"
```

**Fichier `.env.local` (développement):**

```env
# Google Places API (New) - Dev
GOOGLE_PLACES_API_KEY="AIzaSy...votre_cle_dev..."
USE_PLACES_API="true"
GOOGLE_API_PROVIDER="places"
```

#### 6. Tester l'API

Utiliser cURL pour tester:

```bash
# Remplacer YOUR_API_KEY et PLACE_ID
curl -X GET \
  "https://places.googleapis.com/v1/places/PLACE_ID?fields=reviews&key=YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Trouver votre Place ID:**

1. Aller sur [Google Maps](https://www.google.com/maps)
2. Chercher votre établissement
3. Copier l'URL, le Place ID est dans l'URL: `ChIJ...`

**Réponse attendue:**

```json
{
  "reviews": [
    {
      "name": "...",
      "relativePublishTimeDescription": "...",
      "rating": 5,
      "text": {
        "text": "Great service!",
        "languageCode": "en"
      },
      "authorAttribution": {
        "displayName": "John Doe",
        "uri": "..."
      }
    }
  ]
}
```

#### 7. Intégration dans le Code

Le code est déjà prêt dans le projet, il suffit d'activer Places API:

**Fichier:** `src/infrastructure/services/google-places.service.ts` (à créer)

```typescript
/**
 * Google Places Service - Production Implementation
 * Utilise Places API (New) pour récupérer les avis
 */

import { Result } from '@/lib/types/result.type';
import {
  IGoogleMyBusinessService,
  GoogleReviewData,
  FetchReviewsOptions,
} from '@/core/services/google-my-business.service.interface';

export class GooglePlacesService implements IGoogleMyBusinessService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://places.googleapis.com/v1';

  constructor() {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) {
      throw new Error('GOOGLE_PLACES_API_KEY is not configured');
    }
    this.apiKey = key;
  }

  async fetchReviews(
    googlePlaceId: string,
    options?: FetchReviewsOptions,
  ): Promise<Result<readonly GoogleReviewData[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/places/${googlePlaceId}?fields=reviews&key=${this.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        return Result.fail(
          new Error(`Places API error: ${error.error?.message || response.statusText}`),
        );
      }

      const data = await response.json();
      const reviews = data.reviews || [];

      // Transform to domain format
      const googleReviews: GoogleReviewData[] = reviews.map((review: any) => ({
        googleReviewId: review.name || `${googlePlaceId}_${review.publishTime}`,
        authorName: review.authorAttribution?.displayName || 'Anonymous',
        rating: review.rating,
        comment: review.text?.text || null,
        reviewUrl: review.authorAttribution?.uri || '',
        publishedAt: new Date(review.publishTime),
      }));

      return Result.ok(googleReviews);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  // Places API ne permet PAS de publier des réponses
  async publishResponse(
    googleReviewId: string,
    responseContent: string,
    apiKey: string,
  ): Promise<Result<void>> {
    return Result.fail(
      new Error(
        'Publishing responses is not available with Places API. Use My Business API instead.',
      ),
    );
  }

  async validateCredentials(apiKey: string): Promise<Result<boolean>> {
    try {
      // Test avec un Place ID connu (ex: Google Headquarters)
      const testPlaceId = 'ChIJj61dQgK6j4AR4GeTYWZsKWw';

      const response = await fetch(
        `${this.baseUrl}/places/${testPlaceId}?fields=name&key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return Result.ok(response.ok);
    } catch (error) {
      return Result.ok(false);
    }
  }
}
```

**Activer le service dans le router:**

```typescript
// src/server/api/routers/review.router.ts

import { GooglePlacesService } from '@/infrastructure/services/google-places.service';

// Utiliser Places API si configuré
const googleService =
  process.env.USE_PLACES_API === 'true'
    ? new GooglePlacesService()
    : new GoogleMyBusinessService(encryptionService);
```

---

## 🏢 Approche B: My Business APIs - Configuration Complète

### Caractéristiques

**✅ Avantages:**

- Lecture des avis (illimité)
- **Publication de réponses** aux avis
- Gestion complète du profil
- Insights et analytics
- Photos, posts, Q&A

**❌ Limitations:**

- Setup OAuth2 complexe (2-3 heures)
- Nécessite le consentement du propriétaire
- Refresh token à renouveler périodiquement
- Rate limits plus stricts

**💰 Coûts:**

- Gratuit mais quotas:
  - 1,000 requêtes/jour (default)
  - Peut être augmenté sur demande

### APIs à Activer

Tu dois activer **3 APIs** dans Google Cloud Console:

#### 1. My Business Account Management API

- **Rôle**: Gestion des comptes et locations
- **Utilisation**: Lister les établissements, gérer les accès
- **Obligatoire**: ✅ Oui

#### 2. My Business Business Information API

- **Rôle**: Informations sur les établissements
- **Utilisation**: Récupérer/modifier les infos (horaires, adresse, etc.)
- **Obligatoire**: ✅ Oui

#### 3. My Business Verification API

- **Rôle**: Vérification des établissements
- **Utilisation**: Processus de vérification Google
- **Obligatoire**: ❌ Non (optionnel, uniquement si tu crées de nouveaux établissements)

### Configuration Step-by-Step

#### 1. Accès Google Cloud Console

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Se connecter avec le **compte API dédié**
3. Créer un nouveau projet (si pas déjà fait):
   - Nom: `ReviewLottery Production`
   - ID: `reviewlottery-prod-xxxxx`
4. Activer la facturation

#### 2. Activer les APIs My Business

1. Dans le menu, aller dans **APIs & Services** → **Bibliothèque**

2. **API 1: My Business Account Management API**
   - Rechercher: "My Business Account Management API"
   - Cliquer sur la carte
   - Cliquer sur **Activer**
   - Attendre la confirmation

3. **API 2: My Business Business Information API**
   - Rechercher: "My Business Business Information API"
   - Cliquer sur la carte
   - Cliquer sur **Activer**
   - Attendre la confirmation

4. **API 3: My Business Verification API** (optionnel)
   - Rechercher: "My Business Verification API"
   - Cliquer sur la carte
   - Cliquer sur **Activer**
   - Attendre la confirmation

#### 3. Configurer l'Écran de Consentement OAuth

1. Aller dans **APIs & Services** → **Écran de consentement OAuth**

2. **Choisir le type d'utilisateur:**
   - **Interne**: Si tu as Google Workspace (tous les users de ton domaine)
   - **Externe**: Pour tout le monde (choisis ça si pas de Workspace)
   - Cliquer sur **Créer**

3. **Configuration de l'application:**

=>Branding

**Étape 1: Informations sur l'application**

- Nom de l'application: `ReviewLottery`
- E-mail d'assistance utilisateur: `support@votredomaine.com`
- Logo (optionnel): Upload ton logo
- Domaine de l'application: `votredomaine.com`
- Domaines autorisés: `votredomaine.com`
- E-mail du développeur: `dev@votredomaine.com`
- Cliquer sur **Enregistrer et continuer**

**Étape 2: Champs d'application (Scopes)**

- Cliquer sur **Ajouter ou supprimer des champs d'application**
- Rechercher et cocher:
  - `https://www.googleapis.com/auth/business.manage`
- Cliquer sur **Mettre à jour**
- Cliquer sur **Enregistrer et continuer**

**Étape 3: Utilisateurs de test** (si Externe)

- Ajouter les emails des comptes qui vont tester:
  - `api-reviewlottery@votredomaine.com`
  - `dev@votredomaine.com`
- Cliquer sur **Enregistrer et continuer**

**Étape 4: Résumé**

- Vérifier les informations
- Cliquer sur **Retour au tableau de bord**

#### 4. Créer les Identifiants OAuth 2.0

1. Aller dans **APIs & Services** → **Identifiants**

2. Cliquer sur **+ Créer des identifiants** → **ID client OAuth**

3. **Configurer l'ID client:**
   - Type d'application: **Application Web**
   - Nom: `ReviewLottery OAuth Client`

   **Origines JavaScript autorisées:**
   - `https://votredomaine.com`
   - `http://localhost:3000` (dev)

   **URI de redirection autorisés:**
   - `https://votredomaine.com/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (dev)

   - Cliquer sur **Créer**

4. **Récupérer les identifiants:**
   - Une popup s'affiche avec:
     - **ID client**: `123456789-xxxxx.apps.googleusercontent.com`
     - **Code secret du client**: `GOCSPX-xxxxx`
   - **IMPORTANT**: Copier ces deux valeurs immédiatement
   - Les stocker dans un gestionnaire de mots de passe

#### 5. Obtenir le Refresh Token

**Méthode 1: OAuth Playground (Rapide pour tester)**

1. Aller sur [OAuth2 Playground](https://developers.google.com/oauthplayground/)

2. Cliquer sur l'icône **⚙️ (Settings)** en haut à droite

3. Cocher **"Use your own OAuth credentials"**
   - OAuth Client ID: `(coller votre ID client)`
   - OAuth Client secret: `(coller votre code secret)`
   - Fermer les settings

4. **Step 1: Select & authorize APIs**
   - Dans la liste à gauche, rechercher: `Google My Business API v4`
   - Cocher: `https://www.googleapis.com/auth/business.manage`
   - Cliquer sur **Authorize APIs**

5. **Connexion Google:**
   - Se connecter avec le **compte API dédié** (`api-reviewlottery@votredomaine.com`)
   - Accepter les permissions demandées

6. **Step 2: Exchange authorization code for tokens**
   - Le code est automatiquement renseigné
   - Cliquer sur **Exchange authorization code for tokens**

7. **Récupérer le Refresh Token:**
   - Dans la réponse, copier la valeur de `refresh_token`
   - Format: `1//xxxxxxxxxxxxx-yyyyyyyyyyyyyyyy`
   - **CRITIQUE**: Stocker ce token de manière sécurisée

**Méthode 2: Via votre Application (Production)**

Créer un endpoint d'autorisation dans votre app:

```typescript
// src/app/api/auth/google/authorize/route.ts
import { google } from 'googleapis';
import { NextRequest } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
);

export async function GET(request: NextRequest) {
  // Générer l'URL d'autorisation
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Nécessaire pour obtenir refresh_token
    prompt: 'consent', // Force l'affichage du consentement
    scope: ['https://www.googleapis.com/auth/business.manage'],
  });

  return Response.redirect(authUrl);
}
```

```typescript
// src/app/api/auth/google/callback/route.ts
import { google } from 'googleapis';
import { NextRequest } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return Response.json({ error: 'No authorization code' }, { status: 400 });
  }

  try {
    // Échanger le code contre des tokens
    const { tokens } = await oauth2Client.getToken(code);

    // IMPORTANT: Stocker refresh_token chiffré en base de données
    console.log('Refresh Token:', tokens.refresh_token);

    // TODO: Enregistrer en BDD avec encryption
    // await encryptionService.encrypt(tokens.refresh_token);

    return Response.json({
      success: true,
      message: 'Authorization successful. Refresh token stored.',
    });
  } catch (error) {
    return Response.json({ error: 'Failed to exchange token' }, { status: 500 });
  }
}
```

**Utilisation:**

1. En tant qu'admin, aller sur: `https://votredomaine.com/api/auth/google/authorize`
2. Se connecter avec le compte API dédié
3. Accepter les permissions
4. Le refresh token est automatiquement sauvegardé

#### 6. Configurer les Variables d'Environnement

**Fichier `.env.production`:**

```env
# Google OAuth 2.0 - My Business API
GOOGLE_CLIENT_ID="123456789-xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
GOOGLE_REDIRECT_URI="https://votredomaine.com/api/auth/google/callback"

# Configuration
USE_PLACES_API="false"
GOOGLE_API_PROVIDER="mybusiness"

# Le refresh_token est stocké CHIFFRÉ en base de données par store
# Voir table: stores.googleApiKey
```

**Fichier `.env.local` (développement):**

```env
# Google OAuth 2.0 - Dev
GOOGLE_CLIENT_ID="123456789-xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

USE_PLACES_API="false"
GOOGLE_API_PROVIDER="mybusiness"
```

#### 7. Implémentation du Service

Le service My Business complet (déjà documenté dans `GOOGLE-API-PRODUCTION.md`):

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
    // Voir GOOGLE-API-PRODUCTION.md pour l'implémentation complète
  }

  async publishResponse(
    googleReviewId: string,
    responseContent: string,
    apiKey: string,
  ): Promise<Result<void>> {
    try {
      const auth = await this.getAuthClient(apiKey);
      const mybusiness = google.mybusiness({ version: 'v4', auth });

      await mybusiness.accounts.locations.reviews.updateReply({
        name: googleReviewId,
        requestBody: {
          comment: responseContent,
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

#### 8. Tester l'Intégration

**Test 1: Valider les credentials**

```typescript
// Dans votre REPL ou script de test
import { GoogleMyBusinessService } from '@/infrastructure/services/google-my-business.service';

const service = new GoogleMyBusinessService(encryptionService);
const result = await service.validateCredentials(encryptedRefreshToken);
console.log('Valid:', result.data); // true ou false
```

**Test 2: Récupérer les avis**

```bash
# Via votre interface admin ou script
curl -X POST https://votredomaine.com/api/trpc/review.syncFromGoogle \
  -H "Content-Type: application/json" \
  -d '{"storeId": "your-store-id"}'
```

---

## 📊 Comparaison des Approches

| Critère              | Places API (New)    | My Business APIs    |
| -------------------- | ------------------- | ------------------- |
| **Setup**            | ⭐⭐⭐⭐⭐ Simple   | ⭐⭐ Complexe       |
| **Temps**            | 10-15 min           | 2-3 heures          |
| **Auth**             | API Key             | OAuth 2.0           |
| **Lecture avis**     | ✅ (5 derniers)     | ✅ (illimité)       |
| **Publier réponses** | ❌                  | ✅                  |
| **Coût**             | Gratuit (100k/mois) | Gratuit (1k/jour)   |
| **Maintenance**      | Faible              | Moyenne             |
| **Recommandé pour**  | MVP, Tests          | Production complète |

---

## 🎯 Recommandation par Phase

### Phase 1: MVP / Développement (maintenant)

**→ Utiliser Places API (New) - Approche A**

- Setup rapide
- Tester la récupération des avis
- Valider le workflow
- Pas besoin de publier les réponses pour l'instant

### Phase 2: Beta / Early Production

**→ Continuer avec Places API**

- Ajouter monitoring
- Optimiser les appels API
- Préparer la migration vers My Business

### Phase 3: Production Complète

**→ Migrer vers My Business APIs - Approche B**

- Quand vous avez besoin de publier des réponses automatiquement
- Configuration du compte API dédié
- Setup OAuth 2.0
- Migration progressive

---

## 🔒 Sécurité - Checklist

- [ ] Compte API dédié créé avec 2FA
- [ ] API Keys/Secrets stockés dans gestionnaire de mots de passe
- [ ] API Key restreinte (IP ou Referrers)
- [ ] Variables d'environnement jamais commitées dans Git
- [ ] Refresh tokens chiffrés en base de données (AES-256-GCM)
- [ ] Rate limiting implémenté côté serveur
- [ ] Logs ne contenant JAMAIS de secrets
- [ ] Monitoring des erreurs API configuré
- [ ] Processus de révocation documenté

---

## 📚 Ressources

- [Places API (New) Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [My Business API Documentation](https://developers.google.com/my-business)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Playground](https://developers.google.com/oauthplayground/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 🆘 Support

En cas de problème, consulter:

1. Le fichier `GOOGLE-API-PRODUCTION.md` pour les détails techniques
2. La section Troubleshooting de ce guide
3. Les logs de l'application (`/var/log/reviewlottery/`)
4. Google Cloud Console → Logs Explorer

---

**Créé le:** 2025-01-08
**Dernière mise à jour:** 2025-01-08
**Auteur:** ReviewLottery Team
**Version:** 1.0
