# 🔧 Google Business Profile API - Setup Guide

**Date**: 2025-12-27
**Statut**: En cours d'implémentation

---

## 📋 Prérequis

- ✅ Compte Google avec accès Google Business Profile
- ✅ Compte Google Cloud (gratuit)
- ✅ Node.js installé
- ✅ Application Next.js configurée

---

## 🎯 Étape 1: Configuration Google Cloud

### 1.1 Créer un Projet Google Cloud

1. **Aller sur**: [Google Cloud Console](https://console.cloud.google.com/)

2. **Créer un nouveau projet**:
   - Cliquer sur le sélecteur de projet (en haut)
   - "New Project"
   - Nom: `ReviewLottery-Production` (ou autre)
   - Cliquer "Create"

3. **Sélectionner le projet** (vérifier que c'est bien celui-ci qui est actif)

### 1.2 Activer Google Business Profile API

1. **Navigation**: `APIs & Services` → `Library`

2. **Rechercher**: `Google Business Profile API`

3. **Activer**: Cliquer sur "Enable"

⏱️ Temps: ~30 secondes

### 1.3 Créer les Credentials OAuth 2.0

1. **Navigation**: `APIs & Services` → `Credentials`

2. **Créer OAuth consent screen** (si première fois):
   - User Type: `External` (sauf si Google Workspace)
   - Cliquer "Create"

   **App information**:
   - App name: `ReviewLottery`
   - User support email: `ton-email@example.com`
   - Developer contact: `ton-email@example.com`

   **Scopes**:
   - Ajouter: `https://www.googleapis.com/auth/business.manage`

   **Test users** (pour développement):
   - Ajouter ton email Google Business

   Cliquer "Save and Continue"

3. **Créer OAuth Client ID**:
   - Cliquer "Create Credentials" → "OAuth client ID"
   - Application type: `Web application`
   - Name: `ReviewLottery Web Client`

   **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/google-business/callback`
   - Production: `https://ton-domaine.com/api/auth/google-business/callback`

   Cliquer "Create"

4. **Récupérer les credentials**:
   - ✅ Client ID (commence par xxx.apps.googleusercontent.com)
   - ✅ Client Secret

   **⚠️ IMPORTANT**: Copier ces valeurs immédiatement !

### 1.4 Ajouter au .env.local

```bash
# Google Business Profile API
GOOGLE_BUSINESS_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_BUSINESS_CLIENT_SECRET="GOCSPX-xxxxx"
GOOGLE_BUSINESS_REDIRECT_URI="http://localhost:3000/api/auth/google-business/callback"

# Encryption key pour les tokens (générer avec: openssl rand -base64 32)
GOOGLE_TOKEN_ENCRYPTION_KEY="votre-clé-générée-ici"
```

Générer la clé de chiffrement:

```bash
openssl rand -base64 32
```

---

## 🔐 Étape 2: Sécurité des Tokens

### 2.1 Pourquoi Chiffrer les Tokens?

Les tokens Google donnent accès complet au Google Business Profile.

**Risques si non chiffrés**:

- ❌ Exposition en cas de dump DB
- ❌ Logs accidentels
- ❌ Accès non autorisé

**Solution**: AES-256-GCM encryption

### 2.2 Schéma DB - Table `google_business_tokens`

```prisma
model GoogleBusinessToken {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Tokens chiffrés
  accessToken  String   @db.Text
  refreshToken String   @db.Text

  // Métadonnées
  accountId    String?
  locationId   String?
  locationName String?

  expiresAt    DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("google_business_tokens")
}
```

---

## 📊 Étape 3: Flow OAuth (Diagramme)

```
1. User clique "Connecter Google Business"
   ↓
2. Redirection vers Google OAuth
   (scope: business.manage)
   ↓
3. User accepte les permissions
   ↓
4. Google redirige vers /api/auth/google-business/callback
   avec un code temporaire
   ↓
5. Backend échange code → tokens
   (access_token + refresh_token)
   ↓
6. Backend chiffre les tokens
   ↓
7. Backend stocke tokens en DB
   ↓
8. Backend récupère les locations Google
   ↓
9. User sélectionne son commerce
   ↓
10. Backend stocke accountId + locationId
   ↓
✅ Connexion terminée
```

---

## 🧪 Étape 4: Test de la Configuration

### 4.1 Vérifier l'API est activée

```bash
# Dans Google Cloud Console
gcloud services list --enabled | grep mybusiness
```

Ou visuellement:
`APIs & Services` → `Dashboard` → Voir "Google Business Profile API" actif

### 4.2 Tester OAuth (sans code)

URL de test:

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=VOTRE_CLIENT_ID&
  redirect_uri=http://localhost:3000/api/auth/google-business/callback&
  response_type=code&
  scope=https://www.googleapis.com/auth/business.manage&
  access_type=offline&
  prompt=consent
```

Remplacer `VOTRE_CLIENT_ID` et tester dans le navigateur.

**Résultat attendu**:

- Redirection vers Google
- Écran de consentement
- Demande d'autorisation pour Google Business

---

## ⚠️ Limitations & Quotas

### Quotas par Défaut

- **Requests per day**: 10,000 (largement suffisant)
- **Requests per 100 seconds**: 1,000
- **Requests per second**: 100

### Mode Développement

- ✅ Quotas identiques
- ✅ Gratuit
- ⚠️ Limité à 100 test users

### Mode Production

- ✅ Après validation Google
- ✅ Quotas augmentables gratuitement
- ✅ Utilisateurs illimités

---

## 📝 Checklist de Validation

Avant de passer au code:

- [ ] Projet Google Cloud créé
- [ ] Google Business Profile API activée
- [ ] OAuth consent screen configuré
- [ ] OAuth client ID créé
- [ ] Redirect URIs ajoutées
- [ ] CLIENT_ID et CLIENT_SECRET récupérés
- [ ] Variables d'environnement ajoutées
- [ ] Clé de chiffrement générée
- [ ] Test OAuth manuel réussi

---

## 🚀 Prochaines Étapes

Une fois cette configuration terminée:

1. ✅ Créer le service d'encryption
2. ✅ Implémenter les routes OAuth
3. ✅ Créer le tRPC router
4. ✅ Implémenter le frontend

---

## 📚 Ressources

- [Google Business Profile API Docs](https://developers.google.com/my-business/reference/rest)
- [OAuth 2.0 for Web Server Apps](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Temps total estimé**: 15-20 minutes
**Prochaine étape**: Implémentation backend
