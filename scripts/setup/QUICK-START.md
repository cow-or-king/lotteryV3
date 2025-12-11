# 🚀 Quick Start - Configuration des rôles

## Étapes rapides (5 minutes)

### 1️⃣ Exécute le SQL dans Supabase Dashboard

Ouvre [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**

**Script 1:** Ajouter la colonne `role`

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'ADMIN';

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

**Script 2:** Configurer les rôles

```sql
-- SUPER_ADMIN: devily@ily.com
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'devily@ily.com';

-- ADMIN: milone@me.com
UPDATE users SET role = 'ADMIN' WHERE email = 'milone@me.com';

-- Vérifier
SELECT email, role FROM users WHERE email IN ('devily@ily.com', 'milone@me.com');
```

### 2️⃣ Vérifie dans le terminal

```bash
npx tsx scripts/check-user-status.ts "devily@ily.com"
npx tsx scripts/check-user-status.ts "milone@me.com"
```

### 3️⃣ Teste la connexion

1. Va sur **http://localhost:3000/login**
2. Connecte-toi avec **devily@ily.com**
3. Va sur **http://localhost:3000/admin/ai-config**
4. Tu devrais voir la page de config IA! 👑

---

## Hiérarchie finale

```
👑 SUPER_ADMIN (devily@ily.com)
   └─ /admin/ai-config (configuration IA)
   └─ 100% accès

👔 ADMIN (milone@me.com + futurs clients)
   └─ Dashboard admin complet
   └─ Peuvent créer des USERS

👤 USER (créés par ADMIN)
   └─ Accès limité
```

---

## Badges des rôles

Tu peux afficher le badge dans n'importe quelle page:

```tsx
import { RoleBadge } from '@/components/admin/RoleBadge';

<RoleBadge />;
```

Résultat:

- **SUPER_ADMIN**: 👑 Badge doré
- **ADMIN**: 🛡️ Badge violet
- **USER**: 👤 Badge gris

---

## Prochaines étapes

1. ✅ Tu te connectes en SUPER_ADMIN
2. 🔧 On configure ensemble l'interface `/admin/ai-config`
3. 👥 On implémente la création de USERS par les ADMIN
