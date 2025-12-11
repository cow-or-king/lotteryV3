# Guide de Configuration Supabase

## 🎯 Objectif

Reconfigurer ReviewLottery V3 avec un nouveau projet Supabase.

## 📋 Prérequis

- Compte Supabase actif
- Node.js et npm installés
- Accès au projet ReviewLottery V3

## 🚀 Étapes de Configuration

### 1. Créer un nouveau projet Supabase

1. Allez sur https://supabase.com/dashboard
2. Cliquez sur "New Project"
3. Remplissez les informations :
   - **Name** : `reviewlottery-v3`
   - **Database Password** : Créez un mot de passe fort (notez-le !)
   - **Region** : `Europe (Frankfurt)` ou plus proche de vous
4. Cliquez sur "Create new project"
5. **Attendez 2-3 minutes** que le projet soit prêt

### 2. Récupérer les informations de connexion

Une fois le projet créé, allez dans **Settings** :

#### A. Reference ID

- **Settings > General > Reference ID**
- Exemple : `abcdefghijklmnop`

#### B. Database Password

- C'est celui que vous avez créé à l'étape 1
- Si vous l'avez perdu, vous pouvez le réinitialiser dans **Settings > Database**

#### C. API Keys

- **Settings > API**
- `anon public` : Clé publique (commence par `eyJhbGc...`)
- `service_role` : Clé privée (commence par `eyJhbGc...`)

### 3. Exécuter le script de configuration

Dans le terminal, à la racine du projet :

```bash
./setup-supabase.sh PROJECT_REF DB_PASSWORD ANON_KEY SERVICE_ROLE_KEY
```

**Exemple :**

```bash
./setup-supabase.sh \
  abcdefghijklmnop \
  "MonSuperMotDePasse123!" \
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Le script va :

- ✅ Créer le fichier `.env.local` avec les bonnes valeurs
- ✅ Tester la connexion à la base de données
- ✅ Appliquer toutes les migrations Prisma
- ✅ Créer toutes les tables nécessaires

### 4. Réactiver le query menu dans le code

Éditez `/src/app/dashboard/super-admin/menu-config/page.tsx` :

```typescript
// Ligne 24-26 : Changez
const { data: dbPermissions } = api.menu.getPermissions.useQuery(undefined, {
  enabled: false, // ← Changez false en true
});

// En
const { data: dbPermissions } = api.menu.getPermissions.useQuery(undefined, {
  enabled: true, // ← Query activé
});
```

### 5. Redémarrer le serveur

```bash
# Tuer tous les processus Next.js
pkill -f "next dev"

# Redémarrer
npm run dev
```

### 6. Créer votre premier utilisateur SUPER_ADMIN

1. Allez sur http://localhost:3000
2. Cliquez sur "S'inscrire"
3. Créez un compte avec votre email

**Ensuite, passez-le en SUPER_ADMIN manuellement :**

Option A - Via Supabase Dashboard :

1. Allez dans **Table Editor > users**
2. Trouvez votre utilisateur
3. Éditez la colonne `role` : changez `USER` en `SUPER_ADMIN`

Option B - Via Prisma Studio :

```bash
npx prisma studio
```

1. Cliquez sur "User"
2. Trouvez votre utilisateur
3. Changez `role` en `SUPER_ADMIN`
4. Sauvegardez

## 🎉 Terminé !

Votre application est maintenant connectée à Supabase avec :

- ✅ Base de données configurée
- ✅ Toutes les tables créées (y compris `menu_permissions`)
- ✅ Auth Supabase configurée
- ✅ API Keys configurées

## 🔧 Dépannage

### Erreur "Can't reach database server"

**Cause** : Le projet Supabase est en pause ou les credentials sont incorrects.

**Solution** :

1. Vérifiez que le projet est actif dans le dashboard Supabase
2. Vérifiez les credentials dans `.env.local`
3. Réessayez après 2-3 minutes

### Erreur "Table does not exist"

**Cause** : Les migrations Prisma n'ont pas été appliquées.

**Solution** :

```bash
npx prisma migrate deploy
```

### Le script setup-supabase.sh ne fonctionne pas

**Cause** : Droits d'exécution manquants.

**Solution** :

```bash
chmod +x setup-supabase.sh
./setup-supabase.sh [vos paramètres]
```

## 📊 Structure de la base de données

Après la configuration, vous aurez ces tables :

- `users` - Utilisateurs avec RBAC (SUPER_ADMIN, ADMIN, USER)
- `brands` - Marques
- `stores` - Commerces
- `reviews` - Avis Google
- `ai_service_config` - Configuration IA (OpenAI, Anthropic, Google)
- `menu_permissions` - Permissions des menus par rôle
- Et bien d'autres...

## 🔐 Sécurité

⚠️ **Important** :

- Ne commitez JAMAIS le fichier `.env.local` dans Git
- Gardez vos API keys secrètes
- Utilisez des mots de passe forts
- En production, utilisez des variables d'environnement sécurisées

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Prisma avec Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Documentation du projet](./REVIEW_SESSION.md)
