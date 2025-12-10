# 🏗️ Architecture ReviewLottery v3.0

## Vue d'ensemble

ReviewLottery utilise une **architecture hexagonale** avec **Domain-Driven Design (DDD)** pour une séparation claire des responsabilités.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRÉSENTATION LAYER                       │
│  Next.js App Router + React Components + tRPC Client        │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      API LAYER (tRPC)                       │
│  Routers: auth, dashboard, stores, reviews, admin, etc.     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    DOMAIN LAYER (Core)                      │
│  Use Cases + Entities + Value Objects + Ports               │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              INFRASTRUCTURE LAYER (Adapters)                │
│  Repositories + Services + External APIs                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Système d'Authentification

### Stack d'authentification

1. **Supabase Auth** - Service d'authentification
2. **HTTP-Only Cookies** - Stockage sécurisé des tokens
3. **PostgreSQL + Prisma** - Profils utilisateurs et données

### Architecture détaillée

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Client)                         │
│  - Login/Register forms                                      │
│  - tRPC hooks (api.auth.login.useMutation)                   │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTP Request
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE (src/middleware.ts)              │
│  - Route protection (/dashboard, /stores, etc.)              │
│  - Session validation                                        │
│  - Auto-refresh tokens                                       │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│               tRPC ROUTER (auth.router.ts)                   │
│  Endpoints:                                                  │
│  • register: Inscription                                     │
│  • login: Connexion                                          │
│  • logout: Déconnexion                                       │
│  • getMe: Récupérer utilisateur courant                      │
│  • refreshSession: Rafraîchir la session                     │
└──────────┬────────────────────────────┬──────────────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────┐      ┌──────────────────────────┐
│  SUPABASE AUTH      │      │  SESSION SERVICE         │
│  supabase-auth      │      │  session.service.ts      │
│  .service.ts        │      │                          │
│                     │      │  • createSession()       │
│  • signUp()         │      │  • getSession()          │
│  • signIn()         │      │  • refreshSession()      │
│  • verifyToken()    │      │  • destroySession()      │
│  • refreshTokens()  │      │                          │
│  • signOut()        │      │  Cookies:                │
│                     │      │  - rl-access-token       │
│                     │      │  - rl-refresh-token      │
└──────────┬──────────┘      └────────┬─────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────────┐      ┌──────────────────────────┐
│  SUPABASE AUTH DB   │      │  POSTGRESQL + PRISMA     │
│  (Externe)          │      │  (Notre DB)              │
│                     │      │                          │
│  • Credentials      │      │  • User profiles         │
│  • Email verify     │      │  • Subscriptions         │
│  • Password reset   │      │  • Brands, Stores        │
│  • OAuth tokens     │      │  • Campaigns, Reviews    │
└─────────────────────┘      └──────────────────────────┘
```

### Flux d'authentification détaillé

#### 1. **INSCRIPTION** (`/register`)

```typescript
User submits form
  ↓
tRPC: api.auth.register.useMutation()
  ↓
[1] SupabaseAuthService.signUp(email, password)
    → Crée utilisateur dans Supabase Auth
    → Envoie email de confirmation (optionnel)
    → Retourne: { id, email, emailVerified }
  ↓
[2] RegisterUserUseCase.execute({ id, email, name })
    → Crée utilisateur dans PostgreSQL (Prisma)
    → Crée subscription FREE par défaut
    → Retourne: UserEntity
  ↓
[3] SupabaseAuthService.signIn(email, password)
    → Authentifie l'utilisateur
    → Retourne: { accessToken, refreshToken }
  ↓
[4] SessionService.createSession(tokens, userId)
    → Stocke tokens dans cookies HTTP-only
    → Cookie 1: rl-access-token (expire dans 1h)
    → Cookie 2: rl-refresh-token (expire dans 30j)
  ↓
Redirect → /dashboard
```

#### 2. **CONNEXION** (`/login`)

```typescript
User submits form
  ↓
tRPC: api.auth.login.useMutation()
  ↓
[1] SupabaseAuthService.signIn(email, password)
    → Vérifie credentials dans Supabase Auth
    → Retourne: { accessToken, refreshToken, expiresIn, expiresAt }
  ↓
[2] SupabaseAuthService.verifyToken(accessToken)
    → Décode le JWT
    → Retourne: { id, email, emailVerified }
  ↓
[3] UserRepository.findById(userId)
    → Cherche l'utilisateur dans PostgreSQL
    → Si non trouvé: Crée automatiquement (sync Supabase → DB)
    → Retourne: User + Subscription
  ↓
[4] SessionService.createSession(tokens, userId)
    → Stocke tokens dans cookies HTTP-only
  ↓
Redirect → /dashboard
```

#### 3. **SESSION VALIDATION** (Middleware)

```typescript
Request → Protected Route (/dashboard, /stores, etc.)
  ↓
Middleware.hasValidSession(request)
  ↓
[1] Lire cookies: rl-access-token, rl-refresh-token
  ↓
[2] SupabaseAuthService.verifyToken(accessToken)
    → Si valide: Continue →
    → Si expiré: ↓
  ↓
[3] SupabaseAuthService.refreshTokens(refreshToken)
    → Obtient nouveaux tokens
    → Met à jour les cookies
    → Continue →
  ↓
[4] Si refresh échoue:
    → Redirect → /login?from=/dashboard
```

#### 4. **DÉCONNEXION** (`/logout`)

```typescript
User clicks "Se déconnecter"
  ↓
tRPC: api.auth.logout.useMutation()
  ↓
[1] SessionService.destroySession()
    → Récupère accessToken du cookie
    → SupabaseAuthService.signOut(accessToken)
    → Supprime les cookies (rl-access-token, rl-refresh-token)
  ↓
Redirect → /login
```

## 🗄️ Base de données (PostgreSQL + Prisma)

### Synchronisation Supabase ↔ PostgreSQL

```
SUPABASE AUTH (auth.users)          POSTGRESQL (users)
┌──────────────────────┐            ┌──────────────────────┐
│ id (UUID)            │ ──sync──→  │ id (CUID)            │
│ email                │            │ email                │
│ email_confirmed_at   │            │ emailVerified        │
│ encrypted_password   │            │ hashedPassword*      │
│ created_at           │            │ createdAt            │
│ last_sign_in_at      │            │ updatedAt            │
│ user_metadata        │            │ name, avatarUrl      │
└──────────────────────┘            └──────────────────────┘

* Le hashedPassword n'est PAS stocké dans notre DB (géré par Supabase)
```

**Synchronisation automatique:**

- À l'inscription: User créé dans Supabase → User créé dans Prisma
- À la connexion: Si User existe dans Supabase mais pas dans Prisma → Créé automatiquement
- userId: Le même ID (UUID) est utilisé dans les deux systèmes

### Modèles Prisma principaux

```prisma
User
├── Subscription (1:1)
├── Brands (1:N)
├── PrizeTemplates (1:N)
└── Reviews responded (1:N)

Brand
├── Owner: User (N:1)
├── Stores (1:N)
├── PrizeTemplates (1:N)
└── PrizeSets (1:N)

Store
├── Brand (N:1)
├── Campaigns (1:N)
├── Reviews (1:N)
└── ResponseTemplates (1:N)

Campaign
├── Store (N:1)
├── Prizes (1:N)
├── Participants (1:N)
└── Reviews (1:N)
```

## 🔑 Sécurité

### 1. **Tokens & Cookies**

- **Access Token**: JWT signé par Supabase, expire dans 1h
- **Refresh Token**: Permet de renouveler l'access token, expire dans 30j
- **HTTP-Only Cookies**: Protège contre les attaques XSS
- **SameSite=Lax**: Protège contre les attaques CSRF
- **Secure en production**: Cookies transmis uniquement via HTTPS

### 2. **API Keys chiffrées**

```typescript
// Google API Keys (stores.googlePlacesApiKey)
// AI Service API Keys (ai_service_config.apiKey)
AES-256-GCM Encryption
- Clé de chiffrement stockée dans .env (ENCRYPTION_KEY)
- IV unique pour chaque valeur chiffrée
- Auth tag pour vérifier l'intégrité
```

### 3. **Protection des routes**

```typescript
// Middleware (src/middleware.ts)
PROTECTED_ROUTES = ['/dashboard', '/stores', '/campaigns', ...]
PUBLIC_ONLY_ROUTES = ['/login', '/register']

// tRPC Procedures
publicProcedure      → Accessible sans auth
protectedProcedure   → Nécessite userId valide
superAdminProcedure  → Nécessite role = SUPER_ADMIN
```

### 4. **RBAC (Role-Based Access Control)**

```typescript
enum UserRole {
  USER         // Utilisateur standard
  SUPER_ADMIN  // Accès à /admin/ai-config
}

// Vérification dans tRPC
const enforceSuperAdmin = t.middleware(({ ctx, next }) => {
  if (user.role !== 'SUPER_ADMIN') throw FORBIDDEN;
  return next();
});
```

## 🧪 Scripts utiles

### Diagnostic utilisateur

```bash
# Vérifier le statut d'un utilisateur
npx tsx scripts/check-user-status.ts <email>

# Confirmer l'email manuellement (DEV)
npx tsx scripts/confirm-email.ts <email>

# Promouvoir en SUPER_ADMIN
npx tsx scripts/promote-super-admin.ts <email>
```

### Base de données

```bash
# Ouvrir Prisma Studio
npx prisma studio

# Synchroniser le schéma
npx prisma db push

# Créer une migration
npx prisma migrate dev --name <nom>

# Générer le client Prisma
npx prisma generate
```

## 🐛 Troubleshooting

### Problème: "Impossible de se connecter"

**Causes possibles:**

1. Email non confirmé → `npx tsx scripts/confirm-email.ts <email>`
2. Cookies corrompus → Effacer cookies navigateur + navigation privée
3. Session expirée → Le middleware refresh automatiquement
4. Mauvais mot de passe → Vérifier dans Supabase Dashboard

**Diagnostic:**

```bash
npx tsx scripts/check-user-status.ts <email>
```

### Problème: "User not found in database"

**Solution:**
L'utilisateur sera créé automatiquement au prochain login (sync automatique).

### Problème: "Session expired"

**Solution:**
Le middleware gère automatiquement le refresh. Si le refresh token est expiré:

1. L'utilisateur est redirigé vers /login
2. Il doit se reconnecter

## 📊 Monitoring

### Logs importants

```bash
# Vérifier les logs serveur
# Dans le terminal où tourne `npm run dev`

[INFO] Using MOCK Google My Business service
[AUTH] User logged in: <userId>
[AUTH] Session created: <userId>
[AUTH] Session refreshed: <userId>
```

### Supabase Dashboard

1. **Auth > Users**: Voir tous les utilisateurs
2. **Auth > Logs**: Logs d'authentification
3. **Database > users**: Table PostgreSQL

## 🚀 Déploiement

### Variables d'environnement requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=https://reviewlottery.com

# Encryption
ENCRYPTION_KEY=<32 bytes hex>
```

### Checklist de déploiement

- [ ] Variables d'env configurées
- [ ] Supabase Email Confirmation activée en production
- [ ] Cookies Secure=true en production
- [ ] Database migrations appliquées
- [ ] CORS configuré (si nécessaire)
- [ ] Rate limiting configuré

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
