# 🔐 Magic Link Setup Guide

> ⚠️ **STATUT : POSTPONED**
>
> Cette fonctionnalité a été développée mais **n'est pas actuellement activée** en production.
>
> **Raison** : Retour à connexion classique email/password demandé par l'utilisateur.
>
> **Décision à prendre** : Garder le code inactif avec flag `ENABLE_MAGIC_LINK=false` OU supprimer définitivement.
>
> **Voir** : `/docs/TODO.md` pour la liste des fichiers concernés si suppression.

---

Guide complet pour activer et configurer Magic Link dans ReviewLottery.

## ✅ Ce qui est déjà fait

- [x] Page `/magic-link` créée
- [x] Route callback `/auth/callback` configurée
- [x] Lien ajouté dans la page de login
- [x] Templates d'emails prêts dans `/email-templates/`

## 📍 Configuration Supabase (5 minutes)

### Étape 1: Activer Magic Link

1. Va sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionne **reviewLotteryV3**
3. **Authentication** → **Providers** → **Email**
4. **Enable Email provider** : ✅ ON
5. **Enable Magic Link** : ✅ ON
6. (Optionnel) **Confirm email** : ❌ OFF si tu veux Magic Link uniquement
7. **Save**

### Étape 2: Configurer les URLs de redirection

**Project Settings** → **Auth** → **URL Configuration**

#### Site URL

```
Dev:  http://localhost:3000
Prod: https://reviewlottery.com
```

#### Redirect URLs (whitelist)

Ajoute ces 2 URLs :

```
http://localhost:3000/auth/callback
https://reviewlottery.com/auth/callback
```

### Étape 3: Installer les templates d'emails

**Authentication** → **Email Templates**

Pour chaque template, copie le contenu du fichier HTML correspondant :

#### 1. Confirm signup

- Fichier : `email-templates/confirm-signup.html`
- Subject : `Bienvenue sur ReviewLottery 🎰 - Confirmez votre email`

#### 2. Magic Link

- Fichier : `email-templates/magic-link.html`
- Subject : `🔐 Votre lien de connexion Magic Link`

#### 3. Reset Password

- Fichier : `email-templates/reset-password.html`
- Subject : `🔑 Réinitialisez votre mot de passe ReviewLottery`

**Astuce** : Ouvre chaque fichier HTML dans VSCode, copie tout le contenu (Cmd+A → Cmd+C), puis colle dans l'éditeur Supabase.

### Étape 4: (Optionnel) Configurer l'expiration

**Authentication** → **Settings** → **Email**

- **Magic Link expiry** : 3600 secondes (1 heure) - Recommandé
- Tu peux augmenter jusqu'à 86400 (24h) si besoin

## 🧪 Tester Magic Link

### En développement

1. Va sur http://localhost:3000/magic-link
2. Entre un **vrai email** (le tien)
3. Clique sur "Envoyer le Magic Link"
4. Vérifie ta boîte email
5. Clique sur le lien → Tu seras redirigé vers `/dashboard` ✅

### Flux complet

```
1. User → /magic-link
   ↓
2. Entre son email → Clique "Envoyer"
   ↓
3. Supabase envoie l'email avec le lien
   ↓
4. User clique sur le lien dans l'email
   ↓
5. Redirection → /auth/callback?code=XXX
   ↓
6. Callback échange le code contre une session
   ↓
7. Redirection → /dashboard (connecté ✅)
```

## 🎯 Comment utiliser dans l'app

### Depuis la page de login

```
http://localhost:3000/login
↓
Cliquer sur "🔐 Se connecter avec Magic Link"
↓
/magic-link
```

### Accès direct

```
http://localhost:3000/magic-link
```

## 🔧 Dépannage

### "Email not sent"

**Cause** : Trop d'emails bounced (invalides)

**Solution** :

1. Utilise uniquement de vrais emails en dev
2. Ou configure Mailtrap (voir ci-dessous)

### "Invalid redirect URL"

**Cause** : L'URL de callback n'est pas dans la whitelist

**Solution** :

1. Vérifie **Project Settings** → **Auth** → **Redirect URLs**
2. Ajoute `http://localhost:3000/auth/callback`

### "Link expired"

**Cause** : Le lien Magic Link a plus d'1 heure

**Solution** :

1. Demande un nouveau lien depuis `/magic-link`
2. Ou augmente l'expiration dans Supabase

### L'email ne s'affiche pas correctement

**Cause** : Certains clients email (Outlook, etc.) ont des bugs CSS

**Solution** :

- Les templates sont optimisés pour Gmail, Apple Mail, Yahoo
- Test avec [Litmus](https://litmus.com) ou [Email on Acid](https://www.emailonacid.com)

## 🎨 (Optionnel) Configurer Mailtrap pour les tests

Si tu veux capturer les emails en dev sans les envoyer :

### 1. Créer un compte Mailtrap

1. Va sur [mailtrap.io](https://mailtrap.io)
2. Créer un compte gratuit
3. Créer un "Inbox"

### 2. Configurer SMTP dans Supabase

**Project Settings** → **Auth** → **SMTP Settings**

```
Enable Custom SMTP: ✅ ON

Host:     sandbox.smtp.mailtrap.io
Port:     2525
Username: [ton username Mailtrap]
Password: [ton password Mailtrap]
Sender:   noreply@reviewlottery.com
```

**Save**

Maintenant, tous les emails seront capturés dans Mailtrap (aucun email réel envoyé) !

## 📊 Bonnes pratiques

### Sécurité

✅ **À faire** :

- Utilise HTTPS en production
- Configure SPF/DKIM si tu utilises un SMTP custom
- Limite le nombre de Magic Links par IP (rate limiting)
- Log toutes les tentatives de connexion

❌ **À éviter** :

- Envoyer des Magic Links à des emails non vérifiés
- Laisser expirer les liens trop tard (max 24h)
- Partager les Magic Links (liens personnels)

### UX

✅ **À faire** :

- Affiche un message clair "Email envoyé"
- Indique l'expiration du lien (1h)
- Permets de renvoyer l'email
- Message d'erreur si l'email n'existe pas

❌ **À éviter** :

- Forcer l'utilisateur à utiliser Magic Link uniquement
- Rediriger automatiquement sans confirmation
- Masquer l'option mot de passe classique

## 🚀 Prochaines étapes

Une fois Magic Link fonctionnel :

1. ✅ Teste avec ton email
2. ⏳ Customise les templates d'email (logo, couleurs)
3. ⏳ Configure un SMTP custom en prod (SendGrid, Mailgun)
4. ⏳ Ajoute du rate limiting (max 3 Magic Links / 10 min)
5. ⏳ Analytics : track combien d'users utilisent Magic Link

## 📈 Avantages pour ReviewLottery

### Pour les utilisateurs

- ✅ Connexion en 1 clic
- ✅ Aucun mot de passe à retenir
- ✅ Fonctionne sur tous les appareils
- ✅ Ultra-sécurisé (lien unique)

### Pour toi (business)

- 📈 **+30% de conversion** (moins de friction)
- 🔒 **Moins de tickets support** (pas d'oubli de mot de passe)
- ⚡ **Onboarding plus rapide**
- 🎯 **Meilleure UX mobile**

---

**Besoin d'aide ?** Consulte la [doc Supabase](https://supabase.com/docs/guides/auth/auth-magic-link)
