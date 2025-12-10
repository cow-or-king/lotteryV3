# Guide de Test - Système Avis Google

## 🎯 Vue d'ensemble

Ce guide explique comment tester le système de gestion des avis Google **sans avoir besoin de configurer les Google APIs**.

---

## ✅ Configuration Actuelle

Le système est configuré pour utiliser un **service mock** qui génère des faux avis pour tester l'interface.

### Variable d'environnement

Dans `.env` :

```env
USE_MOCK_GOOGLE_SERVICE="true"
```

- ✅ `true` = Mode développement avec fake reviews (configuration actuelle)
- ❌ `false` = Mode production avec vraies Google APIs (nécessite credentials)

---

## 📦 Étape 1: Migration Base de Données

### Option A: Via Supabase Dashboard (RECOMMANDÉ)

1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard)
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `prisma/manual-migration-reviews.sql`
4. Cliquer sur **RUN**

### Option B: Via Prisma (si connexion fonctionne)

```bash
npx prisma migrate dev --name add_reviews_system
```

### Vérification

Dans Prisma Studio ou Supabase Dashboard, vérifier que les tables existent :

- ✅ `Review`
- ✅ `ResponseTemplate`

---

## 🎬 Étape 2: Tester l'UI avec Fake Reviews

### 2.1 Lancer l'application

```bash
npm run dev
```

Vous devriez voir dans la console :

```
[INFO] Using MOCK Google My Business service with fake reviews
```

### 2.2 Créer un Store avec Google Place ID

Le mock service accepte **n'importe quel Google Place ID** valide.

**Exemple de Place ID valide :**

```
ChIJN1t_tDeuEmsRUsoyG83frY4
```

Via l'UI :

1. Se connecter (Supabase Auth)
2. Créer une Brand
3. Créer un Store avec :
   - Nom: "Mon Restaurant Test"
   - Google Place ID: `ChIJN1t_tDeuEmsRUsoyG83frY4`
   - API Key (optionnel en mode mock): `mock_test_key_12345`

### 2.3 Synchroniser les avis

Une fois le Store créé :

1. Aller dans la section **Avis**
2. Cliquer sur **"Synchroniser"**

Le mock service va générer **10 fake reviews** avec :

- ⭐⭐⭐⭐⭐ 5 étoiles (4 avis)
- ⭐⭐⭐⭐ 4 étoiles (2 avis)
- ⭐⭐⭐ 3 étoiles (2 avis)
- ⭐⭐ 2 étoiles (1 avis)
- ⭐ 1 étoile (1 avis)

Avec des commentaires variés en français.

### 2.4 Tester les fonctionnalités

**Filtres :**

- ✅ Filtrer par note (1-5 étoiles)
- ✅ Filtrer par statut réponse (avec/sans)
- ✅ Pagination

**Actions :**

- ✅ Répondre à un avis
- ✅ Utiliser un template de réponse
- ✅ Voir les statistiques (total, sans réponse, attention requise)

**Vérification Participant :**

```typescript
// Via tRPC
const result = await trpc.review.verifyParticipant.query({
  email: 'sophie.martin@example.com', // Nom d'auteur d'un fake review
  storeId: 'store_xxx',
});
```

---

## 🧪 Étape 3: Tests Automatisés

Les tests utilisent des repositories et use cases avec mocks.

```bash
# Lancer tous les tests
npm test

# Tests spécifiques reviews
npm test -- review

# Mode watch
npm test -- --watch
```

**Tests actuels : 37/37 ✅**

---

## 📊 Données Mock Disponibles

Le service mock génère ces 10 reviews automatiquement :

| ID             | Auteur          | Note | Commentaire                      |
| -------------- | --------------- | ---- | -------------------------------- |
| mock_review_1  | Sophie Martin   | 5⭐  | Service exceptionnel !           |
| mock_review_2  | Thomas Dubois   | 5⭐  | Excellent rapport qualité-prix.  |
| mock_review_3  | Marie Lefebvre  | 4⭐  | Très bon accueil.                |
| mock_review_4  | Pierre Bernard  | 3⭐  | Correct sans plus.               |
| mock_review_5  | Julie Moreau    | 2⭐  | Déçue par le service.            |
| mock_review_6  | Lucas Petit     | 1⭐  | Très mauvaise expérience.        |
| mock_review_7  | Emma Roux       | 5⭐  | Parfait ! Tout était impeccable. |
| mock_review_8  | Antoine Laurent | 4⭐  | Bonne prestation.                |
| mock_review_9  | Camille Simon   | 5⭐  | _(sans commentaire)_             |
| mock_review_10 | Nicolas Michel  | 3⭐  | Moyen.                           |

---

## 🔄 Passer en Mode Production

Quand vous êtes prêt à utiliser les vraies Google APIs :

### 1. Obtenir Credentials Google

Suivre le guide complet : `docs/api/GOOGLE-API-PRODUCTION.md`

**Résumé :**

- Créer projet Google Cloud
- Activer **Google My Business API**
- Configurer OAuth2 credentials
- Obtenir refresh token

### 2. Configurer .env

```env
USE_MOCK_GOOGLE_SERVICE="false"

# Google My Business API (OAuth2)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
# Refresh token stored encrypted per store in database
```

### 3. Mise à jour du code

Remplacer dans `review.router.ts` :

```typescript
const googleService = useMockService
  ? new GoogleMyBusinessMockService()
  : new GoogleMyBusinessProductionService(encryptionService);
```

Voir implémentation complète dans `GOOGLE-API-PRODUCTION.md`.

---

## 🆘 Troubleshooting

### Les fake reviews n'apparaissent pas

**Vérifier :**

1. `.env` contient `USE_MOCK_GOOGLE_SERVICE="true"`
2. Console affiche `[INFO] Using MOCK Google My Business service`
3. Tables `Review` et `ResponseTemplate` existent dans DB
4. Store a un `googlePlaceId` valide (format `ChIJ...`)

### Erreur "Review_storeId_fkey constraint failed"

**Cause :** Le Store n'existe pas dans la DB

**Solution :**

```sql
-- Vérifier que le store existe
SELECT id, name FROM "Store" WHERE id = 'store_xxx';
```

### Mock service retourne 0 reviews

**Vérifier dans les logs :**

```
[MOCK] Fetching reviews for place ChIJ...
[MOCK] Returning X mock reviews
```

Si `X = 0`, le service mock n'est peut-être pas initialisé correctement.

**Solution :**

```typescript
// Dans google-my-business-mock.service.ts
resetMockData(); // Réinitialiser les données
```

---

## 📚 Ressources

- [Architecture Technique](./REVIEWS-TECHNICAL.md)
- [RGPD & Conformité](./RGPD-REVIEWS.md)
- [Production Google API](./GOOGLE-API-PRODUCTION.md)
- [Tests Guide](../README.md#tests)

---

## 🎉 Quick Start

**TL;DR - Tester en 3 minutes :**

```bash
# 1. Vérifier .env
grep USE_MOCK_GOOGLE_SERVICE .env
# Doit afficher: USE_MOCK_GOOGLE_SERVICE="true"

# 2. Migration DB (copier SQL dans Supabase Dashboard)
cat prisma/manual-migration-reviews.sql

# 3. Lancer app
npm run dev

# 4. Dans l'UI :
# - Créer Store avec Place ID: ChIJN1t_tDeuEmsRUsoyG83frY4
# - Cliquer "Synchroniser" dans l'onglet Avis
# - ✅ 10 fake reviews apparaissent !
```

---

**Dernière mise à jour:** 2025-01-08
**Statut:** Prêt pour tests en développement
