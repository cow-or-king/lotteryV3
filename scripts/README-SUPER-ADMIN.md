# 👑 Configuration des rôles (SUPER_ADMIN + ADMIN)

## Hiérarchie des rôles

```
SUPER_ADMIN (devily@ily.com) 👑
  └─ Propriétaire ReviewLottery
  └─ Interface dédiée /admin/ai-config
  └─ 100% accès à tout

ADMIN (milone@me.com + clients) 👔
  └─ Dashboard admin complet
  └─ Peuvent créer des USERS
  └─ Gèrent leurs commerces/campagnes

USER (créés par ADMIN) 👤
  └─ Accès restreint configuré par ADMIN
  └─ Interface limitée
```

## Problème rencontré

Le champ `role` était manquant dans le schéma Prisma. J'ai ajouté le champ, mais la connexion à Supabase est temporairement indisponible pour faire la migration automatique.

## ✅ Solution : Migration manuelle via Supabase Dashboard

### Étape 1: Ajouter la colonne `role`

1. Va sur **[Supabase Dashboard](https://supabase.com/dashboard)**
2. Sélectionne ton projet **`reviewLotteryV3`**
3. Dans le menu latéral: **SQL Editor**
4. Copie-colle le contenu du fichier **`scripts/add-role-column.sql`**
5. Clique sur **Run** (ou Ctrl+Enter)

**Résultat attendu:**

```
✅ Colonne 'role' ajoutée
✅ Index créé
✅ Liste des utilisateurs affichée
```

### Étape 2: Configurer les rôles (SUPER_ADMIN + ADMIN)

1. Toujours dans **SQL Editor**
2. Copie-colle le contenu du fichier **`scripts/setup-roles.sql`**
3. Clique sur **Run**

**Résultat attendu:**

```
email            | role         | description                       | created_at
-----------------|--------------|-----------------------------------|--------------------
devily@ily.com   | SUPER_ADMIN  | 👑 Propriétaire ReviewLottery     | ...
milone@me.com    | ADMIN        | 👔 Gérant de commerce             | ...
```

### Étape 3: Vérifier

Retourne dans le terminal et vérifie les deux comptes:

```bash
# Vérifier devily@ily.com (SUPER_ADMIN)
npx tsx scripts/check-user-status.ts "devily@ily.com"

# Vérifier milone@me.com (ADMIN)
npx tsx scripts/check-user-status.ts "milone@me.com"
```

Tu devrais voir:

```
# Pour devily@ily.com
Rôle: SUPER_ADMIN 👑

# Pour milone@me.com
Rôle: ADMIN 👔
```

### Étape 4: Tester l'accès

1. Va sur **http://localhost:3000/admin/ai-config**
2. Tu devrais avoir accès à la page de configuration IA
3. Si tu vois une erreur 403 (Forbidden) → Déconnecte-toi et reconnecte-toi

## 🎯 Comment vérifier que tu es SUPER_ADMIN

### Méthode 1: Script de diagnostic

```bash
npx tsx scripts/check-user-status.ts "ton-email@example.com"
```

Cherche la ligne:

```
Rôle: SUPER_ADMIN 👑
```

### Méthode 2: Supabase Dashboard

1. **Database** → **Table Editor**
2. Sélectionne la table **`users`**
3. Trouve ta ligne (email)
4. Regarde la colonne **`role`** → doit afficher `SUPER_ADMIN`

### Méthode 3: Accès à la page admin

1. Va sur **http://localhost:3000/admin/ai-config**
2. Si tu vois la page de configuration IA → ✅ Tu es SUPER_ADMIN
3. Si tu vois une erreur 403 → ❌ Tu n'es pas SUPER_ADMIN

### Méthode 4: Console navigateur

1. Ouvre la page de l'app (http://localhost:3000/dashboard)
2. Ouvre la console (F12)
3. Tape:
   ```javascript
   fetch('/api/trpc/auth.getMe')
     .then((r) => r.json())
     .then(console.log);
   ```
4. Cherche le champ `role` dans la réponse

## 🔧 Troubleshooting

### "Je suis SUPER_ADMIN mais je n'ai pas accès à /admin/ai-config"

**Solution:** Déconnecte-toi et reconnecte-toi. Les tokens JWT contiennent le rôle, ils doivent être rafraîchis.

```bash
# Dans le navigateur:
# 1. Va sur /logout
# 2. Reconnecte-toi avec ton email/mot de passe
# 3. Retourne sur /admin/ai-config
```

### "La colonne 'role' existe déjà"

**Solution:** C'est bon signe! Passe directement à l'étape 2 (promouvoir en SUPER_ADMIN).

### "User not found"

**Solution:** Vérifie l'email dans le script SQL. Il doit correspondre EXACTEMENT à l'email dans Supabase.

```sql
-- Voir tous les emails dans la base
SELECT email FROM users ORDER BY created_at DESC;
```

## 📊 Alternative: Prisma Studio

Si Supabase est de nouveau accessible plus tard:

```bash
# 1. Appliquer la migration
npx prisma db push

# 2. Promouvoir en SUPER_ADMIN
npx tsx scripts/promote-super-admin.ts "ton-email@example.com"

# 3. Vérifier
npx tsx scripts/check-user-status.ts "ton-email@example.com"
```

## 🎉 Une fois SUPER_ADMIN

Tu auras accès à:

- **`/admin/ai-config`** - Configuration des services IA (OpenAI, Anthropic)
  - Ajouter/Modifier/Supprimer des configs IA
  - Tester les connexions API
  - Voir les statistiques d'utilisation

Tous les autres utilisateurs verront une erreur 403 (Forbidden) sur cette page.
