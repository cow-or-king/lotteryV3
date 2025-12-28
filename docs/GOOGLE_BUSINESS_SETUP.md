# Configuration Google Business Profile - Guide de Production

Ce guide explique comment configurer l'intégration Google Business Profile pour la production.

## 📋 Prérequis

- Un compte Google Cloud Platform
- Accès à la Google Search Console pour vérifier la propriété du domaine
- Un compte Google Business Profile avec au moins une location
- L'API Google My Business activée (nécessite une demande d'accès à Google)

## 🔧 Étape 1 : Configuration Google Cloud Console

### 1.1 Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Noter le **Project ID** et le **Project Number**

### 1.2 Activer les APIs nécessaires

1. Aller dans **APIs & Services** > **Library**
2. Activer les APIs suivantes :
   - ✅ **Google My Business API** (nécessite une demande d'accès)
   - ✅ **My Business Account Management API**
   - ✅ **My Business Business Information API**

**⚠️ Important pour Google My Business API :**

- Cette API est dépréciée mais toujours fonctionnelle
- Elle nécessite une **demande d'accès explicite à Google**
- Aller sur la page de l'API et cliquer sur "Demander l'accès"
- Justifier l'usage : "Gestion des avis clients pour validation de jeux-concours"
- L'activation peut prendre quelques jours

### 1.3 Configurer l'écran de consentement OAuth

1. Aller dans **APIs & Services** > **OAuth consent screen**
2. Sélectionner **External** comme type d'utilisateur
3. Remplir les informations :
   - **Nom de l'application** : ReviewLottery
   - **Email de support utilisateur** : votre email
   - **Logo** : optionnel
   - **Domaine de l'application** : votre domaine de production
   - **Domaines autorisés** : votre domaine de production
   - **Email de contact du développeur** : votre email

4. **Scopes** à ajouter :

   ```
   https://www.googleapis.com/auth/business.manage
   ```

   - Description : "Gérer les informations de votre fiche Google Business"
   - Ce scope permet de lire les avis ET d'y répondre

5. **Test users** (en mode test) :
   - Ajouter les emails des utilisateurs qui testeront l'intégration
   - En production, publier l'application pour permettre à tous les utilisateurs de se connecter

### 1.4 Créer les identifiants OAuth 2.0

1. Aller dans **APIs & Services** > **Credentials**
2. Cliquer sur **Create Credentials** > **OAuth 2.0 Client ID**
3. Type : **Web application**
4. Nom : `ReviewLottery - Production`
5. **URIs de redirection autorisés** :

   ```
   https://votre-domaine.com/api/auth/google-business/callback
   ```

   **⚠️ Important :** L'URL doit être en HTTPS en production

6. Cliquer sur **Create**
7. Noter le **Client ID** et le **Client Secret**

## 🔐 Étape 2 : Configuration Supabase (pour OAuth en production)

### 2.1 Créer un projet Supabase

1. Aller sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Noter les credentials :
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon/Public Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

### 2.2 Configurer l'authentification Supabase

1. Aller dans **Authentication** > **Providers**
2. Activer **Google** comme provider
3. Ajouter les credentials OAuth :
   - **Client ID** : celui créé dans Google Cloud Console
   - **Client Secret** : celui créé dans Google Cloud Console
4. **Authorized redirect URIs** :
   ```
   https://votre-projet.supabase.co/auth/v1/callback
   ```

### 2.3 Configurer la base de données

La table `google_business_tokens` doit exister dans Supabase :

```sql
-- Cette table est déjà créée par Prisma
-- Elle stocke les tokens OAuth Google Business par store
```

## 🌐 Étape 3 : Configuration des variables d'environnement

### 3.1 Variables Google Business

Créer un fichier `.env.production` avec :

```bash
# Google Business OAuth
GOOGLE_BUSINESS_CLIENT_ID="votre-client-id.apps.googleusercontent.com"
GOOGLE_BUSINESS_CLIENT_SECRET="votre-client-secret"

# Encryption des tokens (générer avec: openssl rand -base64 32)
GOOGLE_TOKEN_ENCRYPTION_KEY="votre-clé-de-chiffrement-32-bytes-base64"

# URL de l'application
NEXT_PUBLIC_APP_URL="https://votre-domaine.com"
```

### 3.2 Variables Supabase

Ajouter dans `.env.production` :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://votre-projet.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="votre-anon-key"
SUPABASE_SERVICE_ROLE_KEY="votre-service-role-key"

# Database (connection pooler)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

## 🚀 Étape 4 : Déploiement

### 4.1 Vérifier les variables d'environnement

Sur Vercel/Railway/Render, ajouter toutes les variables d'environnement listées ci-dessus.

### 4.2 Migrer la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy
```

### 4.3 Tester l'intégration

1. Se connecter à l'application en production
2. Aller dans **Dashboard** > **Commerces**
3. Modifier un commerce
4. Cliquer sur **Connecter Google Business**
5. Autoriser l'accès
6. Sélectionner une location Google Business
7. Vérifier que l'indicateur passe au vert

## 🧪 Étape 5 : Scripts de test (après activation de l'API)

### 5.1 Récupérer l'accountId réel

Une fois l'API Google My Business activée :

```bash
npx tsx scripts/set-google-location-manually.ts
```

Ce script :

- Récupère les comptes Google Business
- Liste les locations disponibles
- Met à jour la base de données avec le vrai `accountId`

### 5.2 Tester le fetch des avis

```bash
npx tsx scripts/test-fetch-reviews.ts
```

Ce script :

- Récupère les avis Google Business
- Affiche les détails (auteur, note, commentaire, date)
- Affiche les réponses existantes

## 📊 Quotas et limites

### Google My Business API v4

- **Lectures (reviews)** : Généralement pas de limite stricte
- **Écritures (replies)** : Limitées pour éviter le spam

### My Business Account Management API

- **Requests per minute** : Très limité (environ 1-2 requêtes/minute)
- ⚠️ Utiliser uniquement pour la configuration initiale (récupérer accountId)
- Ne PAS utiliser pour les opérations quotidiennes

## 🔧 Troubleshooting

### Erreur "API not enabled"

```
Google My Business API has not been used in project...
```

**Solution :** Demander l'accès à l'API Google My Business via la console. L'activation peut prendre quelques jours.

### Erreur "Quota exceeded"

```
Quota exceeded for quota metric 'Requests'...
```

**Solution :** Attendre 60 secondes entre les requêtes à l'Account Management API.

### Token expiré

Les access tokens expirent après 1 heure. Le service utilise automatiquement le refresh token pour obtenir un nouveau access token.

Si le refresh token expire (très rare), l'utilisateur doit se reconnecter.

## 📝 Checklist de mise en production

- [ ] Projet Google Cloud créé
- [ ] API Google My Business activée (demande acceptée par Google)
- [ ] API Account Management activée
- [ ] API Business Information activée
- [ ] OAuth consent screen configuré
- [ ] OAuth Client ID créé avec les bons redirect URIs (HTTPS)
- [ ] Projet Supabase créé
- [ ] Variables d'environnement configurées sur la plateforme de déploiement
- [ ] Clé de chiffrement générée (GOOGLE_TOKEN_ENCRYPTION_KEY)
- [ ] Migrations Prisma appliquées
- [ ] Test de connexion Google Business réussi
- [ ] Test de fetch reviews réussi
- [ ] Test de réponse à un avis réussi

## 🆘 Support

En cas de problème :

1. Vérifier les logs de l'application
2. Vérifier les quotas dans Google Cloud Console
3. Vérifier que l'API Google My Business est bien activée
4. Vérifier les variables d'environnement

## 📚 Ressources

- [Google My Business API Documentation](https://developers.google.com/my-business)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
