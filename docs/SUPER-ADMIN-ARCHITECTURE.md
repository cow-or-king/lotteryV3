# 🔐 Architecture Super-Admin - ReviewLottery V3

**Dernière mise à jour:** 9 Décembre 2024
**Statut:** 📋 Planification / Architecture

---

## 🎯 Vision Globale

Le **Super-Admin** est le rôle qui gère l'application SaaS ReviewLottery dans son ensemble. Il s'agit de **vous** (le propriétaire de la plateforme) qui gérez vos clients (les admins d'enseignes).

### Différence des Rôles

```
┌─────────────────────────────────────────────────────────────┐
│ SUPER-ADMIN (Vous)                                          │
│ - Gère les forfaits & pricing                               │
│ - Configure les services IA (API keys OpenAI/Claude)        │
│ - Monitore l'usage & facturation                            │
│ - Gère les promotions & codes promo                         │
│ - Support clients & gestion des comptes                     │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ gère
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ ADMIN (Vos clients)                                         │
│ - Gère ses enseignes (brands)                              │
│ - Gère ses commerces (stores)                              │
│ - Crée des campagnes & loteries                            │
│ - Répond aux avis Google (avec IA)                         │
│ - Paie un abonnement mensuel/annuel                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ possède
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PARTICIPANTS (Clients finaux)                              │
│ - Participent aux loteries                                 │
│ - Laissent des avis Google                                 │
│ - Gagnent des prix                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Multi-Tenant

ReviewLottery est une application **multi-tenant** où :

- **1 Super-Admin** (vous) gère **N Admins** (vos clients)
- **Chaque Admin** gère **N Brands** (ses enseignes)
- **Chaque Brand** gère **N Stores** (ses commerces)

### Modèle de Facturation

**Super-Admin facture les Admins** pour :

- Abonnement mensuel/annuel (plans: FREE, STARTER, PRO, ENTERPRISE)
- Usage IA (génération de réponses aux avis)
- Features avancées (analytics, API access, custom branding)
- Stores & brands supplémentaires

**Admins ne gèrent PAS** :

- Les API keys IA (centralisées chez super-admin)
- Les configurations serveur
- Les tarifs des plans
- Les promotions globales

---

## 📊 Dashboard Super-Admin

### 1. 💰 Gestion des Forfaits & Pricing

**Route:** `/super-admin/pricing`

#### Features

```typescript
interface PlanConfig {
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

  // Pricing
  priceMonthly: number;
  priceYearly: number;
  discount?: number; // % discount for yearly

  // Limites
  maxBrands: number;
  maxStoresPerBrand: number;
  maxPrizeTemplates: number;
  maxPrizeSets: number;
  maxCampaigns: number;
  maxParticipants: number;

  // Features
  customBranding: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  aiResponsesEnabled: boolean;

  // AI Quotas
  aiResponsesPerMonth: number | null; // null = illimité
}
```

**Actions possibles :**

- ✅ Créer/Modifier/Supprimer un plan
- ✅ Définir les prix (mensuel/annuel)
- ✅ Configurer les limites par plan
- ✅ Activer/Désactiver des features
- ✅ Voir les clients par plan
- ✅ Historique des changements de tarifs

**Exemple d'interface :**

```
┌────────────────────────────────────────────────────────────┐
│ Plans & Pricing                                    [+ Nouveau Plan]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ FREE              STARTER           PRO             ENTERPRISE │
│ 0€/mois          29€/mois        99€/mois       Sur devis    │
│ ────────────────────────────────────────────────────────  │
│ ✓ 1 Brand        ✓ 3 Brands      ✓ 10 Brands    ✓ Illimité  │
│ ✓ 1 Store        ✓ 5 Stores      ✓ 20 Stores    ✓ Illimité  │
│ ✗ IA Responses   ✓ 50 IA/mois    ✓ 500 IA/mois  ✓ Illimité  │
│ ✗ Analytics      ✗ Analytics     ✓ Analytics    ✓ Analytics │
│ ✗ API            ✗ API           ✓ API          ✓ API       │
│                                                            │
│ 👥 12 clients    👥 45 clients    👥 8 clients   👥 2 clients │
│                                                            │
│ [Modifier]       [Modifier]      [Modifier]     [Modifier] │
└────────────────────────────────────────────────────────────┘
```

---

### 2. 🤖 Configuration des Services IA

**Route:** `/super-admin/ai-config`

#### Features

**Gestion des API Keys :**

```typescript
interface AiServiceConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string; // CHIFFRÉ AES-256-GCM
  apiKeyStatus: 'active' | 'inactive' | 'error';

  // Configuration
  model: string; // "gpt-4", "claude-3-opus", etc.
  maxTokens: number;
  temperature: number;
  systemPrompt: string | null;

  // Quotas & Monitoring
  isActive: boolean;
  dailyQuotaLimit: number | null;
  totalRequestsCount: number;
  totalTokensUsed: number;

  // Errors
  lastErrorAt: Date | null;
  lastErrorMessage: string | null;
}
```

**Actions possibles :**

- ✅ Configurer API key OpenAI
- ✅ Configurer API key Anthropic (Claude)
- ✅ Choisir le modèle par défaut (GPT-4, Claude 3 Opus, etc.)
- ✅ Définir le system prompt global
- ✅ Activer/Désactiver le service IA
- ✅ Définir quotas quotidiens globaux
- ✅ Voir statistiques d'usage temps réel
- ✅ Tester la configuration (call API de test)
- ✅ Voir historique des erreurs
- ✅ Switch entre providers (OpenAI ↔ Anthropic)

**Exemple d'interface :**

```
┌────────────────────────────────────────────────────────────┐
│ Configuration des Services IA                    [Tester]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Provider Actif: ◉ OpenAI  ◯ Anthropic                     │
│                                                            │
│ API Key OpenAI:  ●●●●●●●●●●●●●●●●●●●●sk-abc123  [Modifier] │
│ Status:          🟢 Active                                 │
│ Dernière utilisation: Il y a 5 minutes                    │
│                                                            │
│ Configuration:                                             │
│ • Modèle:        gpt-4                          [Changer]  │
│ • Max Tokens:    500                                       │
│ • Temperature:   0.7                                       │
│                                                            │
│ Quotas & Usage:                                            │
│ • Quota journalier: 10,000 requêtes/jour                  │
│ • Utilisé aujourd'hui: 3,247 (32%)                        │
│ • Total tokens utilisés: 1.2M                             │
│ • Coût estimé ce mois: ~$145 USD                          │
│                                                            │
│ System Prompt Global:                           [Éditer]  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Tu es un assistant IA spécialisé dans...            │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 3. 📈 Analytics & Monitoring Globaux

**Route:** `/super-admin/analytics`

#### Métriques Clés

**Revenue Metrics:**

- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn rate
- ARPU (Average Revenue Per User)
- Lifetime Value (LTV)

**Usage Metrics:**

- Nombre total d'admins
- Répartition par plan (FREE/STARTER/PRO/ENTERPRISE)
- Nombre total de brands
- Nombre total de stores
- Nombre total de campaigns actives
- Nombre total de participants

**AI Metrics:**

- Requêtes IA totales (ce mois)
- Coût IA total
- Répartition par client (qui consomme le plus ?)
- Taux d'utilisation des suggestions IA
- Performance par modèle (OpenAI vs Anthropic)

**Exemple d'interface :**

```
┌────────────────────────────────────────────────────────────┐
│ Dashboard Analytics                         Dernière 30j   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 💰 Revenue                                                 │
│ MRR: 4,580€ (+12% vs mois dernier)                        │
│ ARR: ~55,000€                                              │
│ Churn: 2.3%                                                │
│                                                            │
│ 👥 Clients                                                 │
│ Total: 67 admins (+5 ce mois)                             │
│ • FREE: 12 (18%)                                          │
│ • STARTER: 45 (67%)                                       │
│ • PRO: 8 (12%)                                            │
│ • ENTERPRISE: 2 (3%)                                      │
│                                                            │
│ 🤖 Usage IA                                                │
│ Requêtes ce mois: 12,450                                  │
│ Coût estimé: $187 USD                                     │
│ Top 5 utilisateurs:                                       │
│   1. client-abc (1,245 requêtes)                          │
│   2. client-def (892 requêtes)                            │
│   ...                                                      │
│                                                            │
│ 📊 Graphiques:                                             │
│ [Graphe évolution MRR]                                    │
│ [Graphe répartition clients par plan]                    │
│ [Graphe usage IA quotidien]                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 4. 🎁 Gestion des Promotions

**Route:** `/super-admin/promotions`

#### Features

```typescript
interface Promotion {
  id: string;
  code: string; // "NOEL2024", "LAUNCH50", etc.
  type: 'percentage' | 'fixed_amount' | 'trial_extension';

  // Discount
  discountPercent?: number; // 20% off
  discountAmount?: number; // -10€
  trialDays?: number; // +30 jours d'essai

  // Conditions
  applicablePlans: ('STARTER' | 'PRO' | 'ENTERPRISE')[];
  minMonths?: number; // Minimum 3 mois
  newCustomersOnly: boolean;

  // Limites
  maxUses: number | null; // null = illimité
  currentUses: number;

  // Validité
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  // Métadonnées
  createdAt: Date;
  createdBy: string; // Super-admin user ID
}
```

**Actions possibles :**

- ✅ Créer code promo
- ✅ Définir % ou montant fixe
- ✅ Limiter par plan
- ✅ Limiter nombre d'utilisations
- ✅ Définir période de validité
- ✅ Activer/Désactiver
- ✅ Voir statistiques d'usage
- ✅ Export liste clients ayant utilisé le code

**Exemple d'interface :**

```
┌────────────────────────────────────────────────────────────┐
│ Codes Promotionnels                        [+ Nouveau Code] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Code         Réduction   Utilisations   Validité   Status │
│ ──────────────────────────────────────────────────────────│
│ NOEL2024     -20%        12/100        31 Dec      🟢 Actif│
│ LAUNCH50     -50%        ∞/∞           31 Jan      🟢 Actif│
│ BLACKFRIDAY  -30%        156/200       Expiré      🔴 Inactif│
│ TRIAL30      +30j trial  45/∞          30 Jun      🟢 Actif│
│                                                            │
│ [Détails] [Modifier] [Désactiver]                         │
└────────────────────────────────────────────────────────────┘
```

---

### 5. 👤 Gestion des Comptes Clients

**Route:** `/super-admin/customers`

#### Features

**Vue Liste Clients :**

```typescript
interface AdminCustomer {
  id: string;
  email: string;
  name: string;

  // Abonnement
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  currentPeriodEnd: Date;

  // Usage
  brandsCount: number;
  storesCount: number;
  campaignsCount: number;
  aiUsageThisMonth: number;

  // Facturation
  mrr: number; // Monthly Recurring Revenue
  totalRevenue: number; // Lifetime
  lastPaymentDate: Date | null;

  // Metadata
  createdAt: Date;
  lastLoginAt: Date | null;
}
```

**Actions possibles :**

- ✅ Voir liste de tous les clients
- ✅ Filtrer par plan / statut
- ✅ Rechercher par email/nom
- ✅ Voir détails d'un client
- ✅ Changer le plan d'un client manuellement
- ✅ Suspendre/Réactiver un compte
- ✅ Voir historique des paiements
- ✅ Voir usage détaillé (brands, stores, IA)
- ✅ Se connecter en tant que client (impersonate)
- ✅ Envoyer notification/email
- ✅ Ajouter note interne

**Exemple d'interface :**

```
┌────────────────────────────────────────────────────────────┐
│ Clients                    [Recherche: ___________] [Filtres] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Client                Plan       MRR    Usage IA   Status │
│ ──────────────────────────────────────────────────────────│
│ 📧 jean@example.com   PRO        99€    245/500   🟢 Actif │
│    • 3 brands, 8 stores                                   │
│    • Créé: 15 Jan 2024 • Dernière connexion: 1h          │
│    [Détails] [Impersonate] [Suspendre]                   │
│                                                            │
│ 📧 marie@cafe.fr      STARTER    29€    12/50     🟢 Actif │
│    • 1 brand, 2 stores                                    │
│    • Créé: 3 Fev 2024 • Dernière connexion: 2j           │
│    [Détails] [Upgrade vers PRO]                          │
│                                                            │
│ 📧 alex@resto.com     FREE       0€     0/0       🟠 Trial │
│    • Trial expire dans 7 jours                            │
│    • 1 brand, 1 store                                     │
│    [Détails] [Envoyer reminder upgrade]                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 6. 🛠️ Configuration Système

**Route:** `/super-admin/system`

#### Features

- **Variables d'environnement** (lecture seule sauf API keys)
- **Maintenance mode** (activer/désactiver)
- **Feature flags** (activer features beta pour certains clients)
- **Email templates** (personnaliser emails transactionnels)
- **Webhooks Stripe** (configuration paiements)
- **Logs système** (erreurs, warnings)
- **Backup database** (manuel ou automatique)
- **Migrations** (historique + rollback)

---

### 7. 📧 Support & Communication

**Route:** `/super-admin/support`

#### Features

- **Inbox tickets support**
- **Chat temps réel** avec clients
- **Base de connaissances** (FAQ, guides)
- **Notifications push** vers les clients
- **Emails groupés** (newsletters, annonces)
- **Notes internes** par client

---

## 🔒 Sécurité & Accès

### Authentication

```typescript
// Middleware route protection
if (userRole !== 'SUPER_ADMIN') {
  throw new UnauthorizedError('Super-admin access required');
}
```

### Audit Log

Toutes les actions super-admin sont loggées :

```typescript
interface AuditLog {
  id: string;
  superAdminId: string;
  action: string; // "updated_plan_pricing", "suspended_user", etc.
  targetType: 'plan' | 'user' | 'ai_config' | 'promotion';
  targetId: string;
  changes: Record<string, unknown>; // Avant/Après
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

---

## 🚀 Roadmap Implémentation

### Phase 1 - Fondations ✅ (Actuel)

- ✅ Schema Prisma (AiServiceConfig, AiUsageLog, PlanLimits)
- ✅ Architecture IA multi-tenant
- ✅ Use-cases & Services IA

### Phase 2 - API & Frontend ⏳ (En cours)

- ⏳ Endpoints tRPC review responses + IA
- ⏳ Hook useReviewResponse
- ⏳ UI composants ResponseModal + IA suggestions
- ⏳ Templates avec émojis

### Phase 3 - Dashboard Super-Admin

- [ ] Route `/super-admin/pricing` (gestion plans)
- [ ] Route `/super-admin/ai-config` (config IA)
- [ ] Route `/super-admin/analytics` (stats globales)
- [ ] Route `/super-admin/promotions` (codes promo)
- [ ] Route `/super-admin/customers` (gestion clients)
- [ ] Middleware auth super-admin
- [ ] Audit logging

### Phase 4 - Facturation Stripe

- [ ] Integration Stripe webhooks
- [ ] Gestion abonnements
- [ ] Invoicing automatique
- [ ] Gestion méthodes de paiement
- [ ] Dunning (récupération paiements échoués)

### Phase 5 - Analytics Avancés

- [ ] Dashboards graphiques (Chart.js / Recharts)
- [ ] Export CSV/Excel
- [ ] Rapports automatiques mensuels
- [ ] Alertes (churn, quota IA dépassé, etc.)

---

## 📁 Structure des Routes

```
/dashboard           → Admin clients (enseignes, commerces, loteries)
  /brands
  /stores
  /campaigns
  /prizes
  /reviews

/super-admin         → Super-Admin (gestion plateforme)
  /overview          → Vue d'ensemble
  /pricing           → Gestion forfaits
  /ai-config         → Configuration IA
  /analytics         → Analytics globales
  /promotions        → Codes promo
  /customers         → Gestion clients
  /support           → Support & tickets
  /system            → Configuration système
```

---

## 💡 Bonnes Pratiques

1. **Séparation des préoccupations**
   - Admin clients : gère SES données
   - Super-admin : gère LA PLATEFORME

2. **Sécurité first**
   - Middleware strict sur routes `/super-admin/*`
   - Audit log de toutes les actions sensibles
   - API keys IA JAMAIS exposées aux clients

3. **Billing transparent**
   - Clients voient leur usage IA en temps réel
   - Alertes avant dépassement de quota
   - Historique facturation accessible

4. **Monitoring proactif**
   - Alertes si service IA down
   - Dashboard temps réel
   - Logs centralisés

---

**Prochaines étapes :**

1. ✅ Compléter Phase 2 (API + UI réponses IA)
2. Implémenter routes `/super-admin/pricing` et `/super-admin/ai-config`
3. Intégration Stripe pour facturation
4. Dashboard analytics complet

---

**Dernière mise à jour:** 9 Décembre 2024
**Version:** 1.0 - Planning
