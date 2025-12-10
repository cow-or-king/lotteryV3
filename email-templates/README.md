# 📧 Email Templates - ReviewLottery

Templates d'emails personnalisés pour Supabase Auth.

## 🎨 Templates disponibles

### 1. **confirm-signup.html** - Confirmation d'inscription

- Envoyé lors de la création de compte
- Contient le lien de vérification d'email
- Design moderne avec gradient violet/rose

### 2. **magic-link.html** - Connexion sans mot de passe

- Envoyé quand l'utilisateur demande un Magic Link
- Expire après 1 heure
- Explique les avantages du Magic Link

### 3. **reset-password.html** - Réinitialisation du mot de passe

- Envoyé quand l'utilisateur oublie son mot de passe
- Lien sécurisé temporaire
- Instructions claires

## 📍 Comment les installer

### Méthode 1 : Via Supabase Dashboard (Recommandé)

1. Va sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionne ton projet **reviewLotteryV3**
3. **Authentication** → **Email Templates**
4. Pour chaque template :
   - Clique sur le template (ex: "Confirm signup")
   - Copie le contenu du fichier HTML correspondant
   - Colle-le dans l'éditeur
   - **Subject** : Personnalise le sujet
   - **Save**

### Méthode 2 : Via Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Déployer les templates
supabase db push
```

## 🔐 Comment fonctionne Magic Link ?

### Qu'est-ce que c'est ?

Le **Magic Link** est une méthode de connexion **sans mot de passe**. L'utilisateur reçoit un lien unique par email qui le connecte automatiquement.

### Flux utilisateur

```
1. Utilisateur entre son email
   ↓
2. Supabase génère un lien unique (token)
   ↓
3. Email envoyé avec le Magic Link
   ↓
4. Utilisateur clique sur le lien
   ↓
5. Connexion automatique ✅
```

### Avantages ✅

- **Aucun mot de passe** à retenir
- **Ultra-rapide** pour l'utilisateur
- **Sécurité maximale** (lien unique et temporaire)
- **Taux de conversion élevé** (moins de friction)
- Fonctionne sur **tous les appareils**

### Inconvénients ⚠️

- Nécessite un accès email
- Expire après 1 heure (configurable)
- Peut finir dans les spams

## 🛠️ Implémentation dans ReviewLottery

### Activer Magic Link

Dans Supabase Dashboard :
**Authentication** → **Providers** → **Email** → Activer "Enable Magic Link"

### Code côté client

```typescript
// Login avec Magic Link
import { supabase } from '@/lib/supabase/client';

async function loginWithMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'https://reviewlottery.com/auth/callback',
    },
  });

  if (error) {
    console.error('Erreur:', error.message);
  } else {
    console.log('Email envoyé ! Vérifiez votre boîte de réception.');
  }
}
```

### Code côté callback

```typescript
// pages/auth/callback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase gère automatiquement le token dans l'URL
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/dashboard');
      }
    });
  }, []);

  return <div>Connexion en cours...</div>;
}
```

## 🎯 Variables disponibles dans les templates

### Variables Supabase

- `{{ .ConfirmationURL }}` - Lien de confirmation/connexion
- `{{ .Token }}` - Token brut (si besoin)
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .SiteURL }}` - URL de ton app (configuré dans Supabase)
- `{{ .TokenHash }}` - Hash du token
- `{{ .RedirectTo }}` - URL de redirection

### Exemple d'utilisation

```html
<a href="{{ .ConfirmationURL }}">Confirmer mon email</a>

<p>Bonjour {{ .Email }},</p>

<p>Retournez sur <a href="{{ .SiteURL }}">ReviewLottery</a></p>
```

## 🎨 Personnalisation avancée

### Ajouter votre logo

```html
<div style="text-align: center; margin-bottom: 20px;">
  <img
    src="https://reviewlottery.com/logo.png"
    alt="ReviewLottery"
    style="width: 120px; height: auto;"
  />
</div>
```

### Utiliser vos couleurs de marque

```html
<!-- Primary: #9333ea (violet) -->
<!-- Secondary: #ec4899 (rose) -->
<!-- Gradient: linear-gradient(135deg, #9333ea 0%, #ec4899 100%) -->
```

### Ajouter des liens sociaux

```html
<div style="text-align: center; margin: 20px 0;">
  <a href="https://twitter.com/reviewlottery" style="margin: 0 10px;">
    <img src="https://reviewlottery.com/icons/twitter.png" width="24" />
  </a>
  <a href="https://facebook.com/reviewlottery" style="margin: 0 10px;">
    <img src="https://reviewlottery.com/icons/facebook.png" width="24" />
  </a>
</div>
```

## 📊 Configuration du Site URL

**Important** : Configure le Site URL dans Supabase pour que les redirections fonctionnent :

**Project Settings** → **Auth** → **Site URL** :

- Dev : `http://localhost:3000`
- Prod : `https://reviewlottery.com`

**Redirect URLs** (whitelist) :

- `http://localhost:3000/auth/callback`
- `https://reviewlottery.com/auth/callback`

## 🧪 Tester les emails

### En développement

1. Utilise un vrai email (le tien)
2. Ou configure **Mailtrap** :
   - **SMTP Settings** dans Supabase
   - Host: `sandbox.smtp.mailtrap.io`
   - Port: `2525`

### Outils de test

- [Mailtrap](https://mailtrap.io) - Capture les emails en dev
- [Litmus](https://litmus.com) - Test de rendu sur tous les clients email
- [Mail Tester](https://www.mail-tester.com) - Score de délivrabilité

## 📈 Bonnes pratiques

### Pour éviter les spams

✅ **À faire** :

- Utilise un domaine custom (pas @gmail.com)
- Configure SPF, DKIM, DMARC
- N'envoie qu'aux emails vérifiés
- Ajoute un lien "Se désinscrire"

❌ **À éviter** :

- Trop d'images
- Mots spam ("gratuit", "urgent", etc.)
- Ratio texte/HTML déséquilibré
- Liens raccourcis (bit.ly, etc.)

### Accessibilité

- Utilise des `alt` sur les images
- Ratio de contraste suffisant (min 4.5:1)
- Taille de police >= 14px
- Liens cliquables (min 44x44px sur mobile)

## 🚀 Prochaines étapes

1. ✅ Copier les templates dans Supabase
2. ✅ Tester avec de vrais emails
3. ⏳ Configurer un SMTP custom (optionnel)
4. ⏳ Ajouter votre logo
5. ⏳ Configurer les webhooks (optionnel)

---

**Besoin d'aide ?** Consulte la [doc Supabase](https://supabase.com/docs/guides/auth/auth-email-templates)
