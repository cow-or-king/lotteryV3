# 📜 Scripts Utility - ReviewLottery V3

Collection complète de scripts utilitaires pour la gestion de la base de données, les tests, et les opérations d'administration.

---

## 📂 Organisation

```
scripts/
├── admin/          # Scripts d'administration utilisateurs
├── database/       # Scripts de base de données et migrations
├── setup/          # Scripts de configuration initiale
├── testing/        # Scripts de test et validation
└── archive/        # Scripts historiques (ne pas exécuter)
```

---

## 👨‍💼 Admin Scripts (`admin/`)

Scripts pour la gestion des utilisateurs et des permissions.

### `promote-super-admin.ts`

**Purpose**: Promouvoir un utilisateur au rôle SUPER_ADMIN

**Usage**:

```bash
npx tsx scripts/admin/promote-super-admin.ts
```

**Comportement**:

- Demande l'email de l'utilisateur de manière interactive
- Vérifie que l'utilisateur existe dans Supabase Auth
- Met à jour le rôle dans la base de données
- Confirme le changement

**Exemple**:

```
? Enter user email: dev@coworkingcafe.fr
✅ User promoted to SUPER_ADMIN
```

**Use Cases**:

- Créer le premier super admin
- Promouvoir un admin existant
- Récupération d'accès en cas de problème

---

### `check-user-status.ts`

**Purpose**: Vérifier l'état complet d'un utilisateur (Auth + Database)

**Usage**:

```bash
npx tsx scripts/admin/check-user-status.ts
```

**Comportement**:

- Demande l'email de l'utilisateur
- Vérifie l'existence dans Supabase Auth
- Vérifie l'existence dans la table User
- Affiche le statut de vérification email
- Affiche le rôle actuel

**Output Example**:

```
User: dev@coworkingcafe.fr
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Supabase Auth: ✅ Exists
  ID: 550e8400-e29b-41d4-a716-446655440000
  Email Verified: ✅ Yes

Database User: ✅ Exists
  ID: 550e8400-e29b-41d4-a716-446655440000
  Role: SUPER_ADMIN
  Created: 2025-12-10T10:30:00.000Z
```

**Use Cases**:

- Diagnostiquer des problèmes de connexion
- Vérifier la synchronisation Auth ↔ Database
- Confirmer le rôle d'un utilisateur

---

### `clear-user-session.ts`

**Purpose**: Forcer la déconnexion d'un utilisateur

**Usage**:

```bash
npx tsx scripts/admin/clear-user-session.ts
```

**Comportement**:

- Demande l'ID utilisateur
- Révoque toutes les sessions actives dans Supabase Auth
- Force une nouvelle connexion

**Use Cases**:

- Utilisateur bloqué dans un mauvais état de session
- Sécurité: forcer reconnexion après changement de permissions
- Debug de problèmes d'authentification

**⚠️ Note**: L'utilisateur devra se reconnecter immédiatement.

---

### `confirm-email.ts`

**Purpose**: Confirmer programmatiquement l'email d'un utilisateur (DEV ONLY)

**Usage**:

```bash
npx tsx scripts/admin/confirm-email.ts
```

**Comportement**:

- Demande l'email de l'utilisateur
- Force la confirmation de l'email dans Supabase Auth
- Bypasse le processus de confirmation par email

**⚠️ ATTENTION**:

- **DEV ONLY** - Ne jamais utiliser en production
- Utilisé uniquement pour accélérer le développement
- En production, les utilisateurs doivent confirmer par email

**Use Cases**:

- Tests en développement
- Création rapide de comptes de test
- Bypass du système d'email en local

---

## 🗄️ Database Scripts (`database/`)

Scripts pour la gestion de la base de données et les migrations.

### `create-ai-tables.sql`

**Purpose**: Créer les tables de configuration IA si manquantes

**Type**: SQL Script

**Usage**: Copier-coller le contenu dans Supabase SQL Editor

**Tables Créées**:

- `ai_service_config` - Configuration des providers IA (OpenAI, Anthropic)
- `ai_usage_logs` - Logs d'utilisation de l'IA pour le billing

**Structure `ai_service_config`**:

```sql
CREATE TABLE ai_service_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model TEXT,
  max_tokens INTEGER,
  temperature DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Quand l'utiliser**:

- Première configuration de l'IA
- Après un reset de la base de données
- Si erreur: "table ai_service_config does not exist"

**Commandes**:

```bash
# Voir le contenu du script
cat scripts/database/create-ai-tables.sql

# Copier dans le presse-papier (macOS)
pbcopy < scripts/database/create-ai-tables.sql
```

---

### `test-db-connection.ts`

**Purpose**: Tester la connexion à la base de données PostgreSQL

**Usage**:

```bash
npx tsx scripts/database/test-db-connection.ts
```

**Tests Effectués**:

1. Connexion au serveur PostgreSQL
2. Accès à la base de données
3. Exécution de requêtes simples
4. Vérification des permissions

**Output Success**:

```
✅ Database connection successful
✅ Can read from database
✅ Can write to database (if applicable)
```

**Output Failure**:

```
❌ Database connection failed: [error message]
```

**Use Cases**:

- Vérifier la configuration `.env`
- Diagnostiquer des problèmes de connexion
- Valider l'accès après un changement de credentials

---

### `fix-stores-schema.ts`

**Purpose**: Migration pour corriger le schéma de la table Stores

**Usage**:

```bash
npx tsx scripts/database/fix-stores-schema.ts
```

**Changements Appliqués**:

- Mise à jour de colonnes
- Ajout de contraintes
- Correction d'index

**⚠️ Attention**: Script de migration one-time, vérifier si déjà appliqué avant de lancer.

---

### `migrate.sh`

**Purpose**: Script shell pour exécuter les migrations Prisma

**Usage**:

```bash
./scripts/database/migrate.sh
```

**Actions**:

1. Vérifie l'état de la base de données
2. Exécute les migrations en attente
3. Génère le client Prisma
4. Affiche un résumé

**Équivalent à**:

```bash
npx prisma migrate dev
npx prisma generate
```

**Use Cases**:

- Appliquer les migrations en développement
- Synchroniser le schéma après un pull
- Automatisation dans des scripts

---

### `run-migration.ts`

**Purpose**: Exécuter une migration Prisma programmatiquement

**Usage**:

```bash
npx tsx scripts/database/run-migration.ts
```

**Comportement**:

- Wrapper TypeScript autour de Prisma Migrate
- Permet de scripter les migrations
- Utilisé dans les pipelines CI/CD

---

## ⚙️ Setup Scripts (`setup/`)

Scripts de configuration initiale du projet.

### `setup-supabase.sh`

**Purpose**: Configuration automatique de Supabase

**Usage**:

```bash
./scripts/setup/setup-supabase.sh
```

**Actions**:

1. Vérifie les variables d'environnement Supabase
2. Configure Supabase CLI (si installé)
3. Crée les tables initiales via Prisma
4. Configure les policies RLS
5. Crée les buckets de storage

**Prérequis**:

- Variables d'environnement configurées dans `.env`
- Supabase CLI installé (optionnel)
- Accès internet pour connexion à Supabase

**Variables Requises**:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Output**:

```
✅ Supabase configuration verified
✅ Database schema synchronized
✅ Storage buckets created
✅ RLS policies applied
```

**Use Cases**:

- Premier setup du projet
- Reset complet de l'environnement
- Configuration d'un nouvel environnement (staging, etc.)

---

### `QUICK-START.md`

**Purpose**: Documentation du quick start (référence)

**Contenu**: Guide étape par étape pour démarrer le projet

**Voir**: [../docs/QUICK-START.md](../docs/QUICK-START.md)

---

## 🧪 Testing Scripts (`testing/`)

Scripts de test et validation.

### `test-google-api.ts`

**Purpose**: Tester la connexion à Google My Business API

**Usage**:

```bash
npx tsx scripts/testing/test-google-api.ts
```

**Tests Effectués**:

1. Charge le refresh token chiffré depuis la base de données
2. Déchiffre le token avec `ENCRYPTION_SECRET_KEY`
3. Crée un client OAuth2 Google
4. Teste l'authentification
5. Liste les comptes My Business
6. Liste les locations (stores) de chaque compte
7. Affiche les détails de chaque location

**Output Example**:

```
🔐 Testing Google My Business API Connection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Refresh token loaded from database
✅ Token decrypted successfully
✅ OAuth2 client authenticated

📋 Accounts Found: 2

Account 1: My Business Name
  ID: accounts/1234567890

  Locations:
  - Café Central (locations/9876543210)
    Address: 123 Main St, Paris

  - Café Nord (locations/1111111111)
    Address: 456 North Ave, Lyon

✅ All tests passed
```

**Prérequis**:

- Store configuré avec Google OAuth (refresh token en DB)
- Variables d'environnement Google configurées:
  ```env
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  ENCRYPTION_SECRET_KEY=...
  ```

**Use Cases**:

- Valider la configuration Google OAuth
- Diagnostiquer des problèmes de synchronisation de reviews
- Vérifier les permissions de l'API
- Lister les locations disponibles

**Erreurs Communes**:

```
❌ No refresh token found in database
→ Lancez le flow OAuth dans l'application

❌ Decryption failed
→ Vérifiez ENCRYPTION_SECRET_KEY dans .env

❌ Invalid grant
→ Le refresh token a expiré, refaites le OAuth flow
```

---

## 📦 Archive Scripts (`archive/`)

Scripts historiques conservés pour référence. **NE PAS EXÉCUTER**.

### SQL Migrations (Déjà Appliquées)

Ces migrations ont déjà été appliquées en production:

- `add-role-column.sql` - Ajout de la colonne `role` à la table User
- `setup-roles.sql` - Configuration de l'enum Role et valeurs par défaut
- `set-super-admin-direct.sql` - Promotion manuelle en SUPER_ADMIN
- `remove-owner-id-from-stores.sql` - Suppression de la colonne `ownerId` obsolète
- `add-prize-templates-sets-plan-limits.sql` - Ajout des tables Prize et limites de plan

**⚠️ Ne PAS exécuter**: Ces scripts sont conservés pour:

- Historique des migrations
- Référence en cas de rollback
- Documentation de l'évolution du schéma

---

## 🔧 Utilisation des Scripts

### Scripts TypeScript

Tous les scripts TypeScript utilisent `tsx` pour l'exécution directe (pas besoin de compilation):

```bash
npx tsx scripts/[category]/[script-name].ts
```

### Scripts Shell

Les scripts shell doivent être rendus exécutables:

```bash
chmod +x scripts/[category]/[script-name].sh
./scripts/[category]/[script-name].sh
```

### Scripts SQL

Les scripts SQL sont destinés à être exécutés manuellement:

1. Ouvrir Supabase SQL Editor
2. Copier le contenu du script
3. Exécuter dans l'éditeur
4. Vérifier les résultats

```bash
# Copier dans le presse-papier (macOS)
pbcopy < scripts/database/[script-name].sql

# Afficher le contenu
cat scripts/database/[script-name].sql
```

---

## ⚠️ Bonnes Pratiques

### Avant d'Exécuter un Script

1. **Lire la documentation** du script
2. **Vérifier les prérequis** (env vars, database, etc.)
3. **Backup de la database** si le script modifie des données
4. **Tester en DEV** avant production
5. **Vérifier les permissions** requises

### Sécurité

- **Ne jamais** commiter de credentials dans les scripts
- **Utiliser** les variables d'environnement
- **Logs sensibles**: Ne pas logger de tokens ou API keys
- **Admin scripts**: Exécuter avec prudence en production

### Maintenance

- **Documenter** les nouveaux scripts dans ce README
- **Archiver** les scripts obsolètes dans `archive/`
- **Versionner** les scripts de migration
- **Tester** régulièrement que les scripts fonctionnent

---

## 📝 Créer un Nouveau Script

### Template TypeScript

```typescript
#!/usr/bin/env tsx

/**
 * Script Purpose: [Description]
 * Usage: npx tsx scripts/[category]/[name].ts
 *
 * Prerequisites:
 * - [List prerequisites]
 *
 * Environment Variables:
 * - VAR_NAME: [Description]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting script...');

    // Script logic here

    console.log('✅ Script completed successfully');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### Template Shell

```bash
#!/bin/bash

# Script Purpose: [Description]
# Usage: ./scripts/[category]/[name].sh
#
# Prerequisites:
# - [List prerequisites]

set -e  # Exit on error

echo "🚀 Starting script..."

# Script logic here

echo "✅ Script completed successfully"
```

### Après Création

1. Ajouter la documentation dans ce README
2. Tester le script en local
3. Commit avec message descriptif
4. Mettre à jour la date "Last Updated"

---

## 🔗 Liens Utiles

- [Supabase Dashboard](https://app.supabase.com/project/dhedkewujbazelsdihtr)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Google OAuth Setup](../docs/api/CURRENT-APIS.md)
- [Database Schema](../prisma/schema.prisma)

---

## 📊 Résumé des Scripts

| Script                   | Catégorie | Purpose                     | Fréquence   |
| ------------------------ | --------- | --------------------------- | ----------- |
| `promote-super-admin.ts` | Admin     | Promouvoir un utilisateur   | Rare        |
| `check-user-status.ts`   | Admin     | Vérifier statut utilisateur | Debug       |
| `clear-user-session.ts`  | Admin     | Forcer déconnexion          | Occasionnel |
| `confirm-email.ts`       | Admin     | Confirmer email (DEV)       | Dev only    |
| `create-ai-tables.sql`   | Database  | Créer tables IA             | One-time    |
| `test-db-connection.ts`  | Database  | Tester connexion DB         | Debug       |
| `fix-stores-schema.ts`   | Database  | Migration stores            | One-time    |
| `migrate.sh`             | Database  | Exécuter migrations         | Régulier    |
| `run-migration.ts`       | Database  | Migration programmatique    | CI/CD       |
| `setup-supabase.sh`      | Setup     | Configuration Supabase      | Initial     |
| `test-google-api.ts`     | Testing   | Tester Google API           | Debug       |

---

**Dernière mise à jour**: 2025-12-11
**Version**: 3.0.0
**Scripts totaux**: 11 actifs + 5 archivés
