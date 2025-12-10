# Guide d'Utilisation du Workflow Automatique

## 🎯 Qu'est-ce que c'est ?

Un système automatisé de développement qui fait collaborer Opus et Sonnet pour garantir un code de qualité maximale, sans intervention manuelle.

## 🔄 Comment ça marche ?

### Scénario Simple

Tu dis : **"Je veux créer une page pour gérer les campagnes"**

#### Automatiquement :

1. **🔵 Opus prend la main (Mode Plan)**

   ```
   📋 Analyse de la demande...
   ✅ Architecture existante analysée
   ✅ Plan d'implémentation créé

   Plan détaillé :
   - Entity Campaign
   - Use Cases: CreateCampaign, ListCampaigns, UpdateCampaign, DeleteCampaign
   - Router tRPC: campaign.router.ts
   - Page: /dashboard/campaigns
   - Components: CampaignCard, CampaignForm, CampaignList
   - Tests: unitaires + intégration

   ❓ Ce plan vous convient-il ?
   ```

2. **Tu valides :** "Oui, parfait"

3. **🟢 Sonnet implémente (Mode Code)**

   ```
   ✅ 1/10 - Entity Campaign créée (TDD)
   ✅ 2/10 - Use Case CreateCampaign (TDD)
   ✅ 3/10 - Use Case ListCampaigns (TDD)
   ✅ 4/10 - Use Case UpdateCampaign (TDD)
   ✅ 5/10 - Use Case DeleteCampaign (TDD)
   ✅ 6/10 - Repository implémenté
   ✅ 7/10 - Router tRPC créé
   ✅ 8/10 - Page UI créée (glassmorphism)
   ✅ 9/10 - Components créés
   ✅ 10/10 - Tests passent (Coverage 87%)

   ⏳ Demande de review à Opus...
   ```

4. **🔵 Opus review automatiquement**

   ```
   🤖 Agent Code Reviewer lancé...

   📊 Review Report:
   ✅ Architecture: PASS
   ✅ Code Quality: PASS (ZERO any types ✓)
   ✅ Tests: PASS (87% coverage)
   ✅ Performance: PASS (index DB optimisés)
   ✅ Sécurité: PASS (validations OK)
   ⚠️ UI/UX: MINOR - Ajouter feedback toast au delete

   Decision: ✅ APPROVED (avec suggestions)
   ```

5. **🔵 Opus commit automatiquement**

   ```
   ✨ Feature complétée et committée !

   Commit: a1b2c3d
   Files: 15 changed (+890, -12)
   Tests: 32 passing
   Coverage: 87%

   🎯 Ce qui a été fait:
   - ✅ CRUD complet des campagnes
   - ✅ Entity avec validation complète
   - ✅ 4 use cases testés
   - ✅ Router tRPC type-safe
   - ✅ UI glassmorphism responsive
   - ✅ Tests unitaires + intégration

   💡 Suggestion: Ajouter toast de feedback au delete (Minor)
   ```

### C'est tout ! 🎉

Tu n'as rien eu à faire d'autre que :

1. Demander la feature
2. Valider le plan
3. Profiter du code production-ready

---

## 🎬 Déclencheurs Automatiques

Le workflow se déclenche automatiquement quand tu demandes:

### ✅ Nouvelles Routes/Pages

```
"Créer une page /dashboard/analytics"
"Ajouter une route pour les rapports"
```

### ✅ Nouveaux Modèles

```
"Ajouter un modèle Prize dans Prisma"
"Créer une entité Participant"
```

### ✅ Nouvelles Features

```
"Implémenter le système de notifications"
"Ajouter l'export PDF des rapports"
```

### ✅ Refactoring

```
"Refactorer le auth system pour utiliser des ports"
"Optimiser les requêtes de la page dashboard"
```

---

## 🎯 Garanties Qualité

### Chaque commit garantit :

**Architecture**

- ✅ Architecture hexagonale respectée
- ✅ Séparation core/infrastructure/presentation
- ✅ Pas de dépendances circulaires

**Code Quality**

- ✅ ZERO `any` types (TypeScript strict)
- ✅ Branded types pour les IDs
- ✅ Result Pattern pour gestion d'erreurs
- ✅ Validation Zod partout

**Tests**

- ✅ Coverage > 80%
- ✅ Tests unitaires + intégration
- ✅ Pas de tests flaky
- ✅ TDD appliqué

**Performance**

- ✅ Pas de N+1 queries
- ✅ Index database optimisés
- ✅ Pagination implémentée

**Sécurité**

- ✅ Validation stricte des inputs
- ✅ Protection injections SQL
- ✅ Permissions vérifiées
- ✅ Pas de secrets hardcodés

**UI/UX**

- ✅ Design system cohérent (glassmorphism)
- ✅ Responsive mobile-first
- ✅ Loading/Error/Empty states
- ✅ Accessibility (a11y)

---

## 🛠️ Configuration

### Activer/Désactiver

**Vérifier l'état :**

```
Le workflow automatique est-il activé ?
```

**Désactiver temporairement :**

```
workflow: off
```

**Réactiver :**

```
workflow: on
```

### Modifier les critères

Éditer `/.workflow-config.json` :

```json
{
  "autoWorkflow": {
    "enabled": true,
    "qualityGates": {
      "minCoverage": 80, // Changer ici
      "strictTypeCheck": true,
      "zeroAnyTypes": true
    }
  }
}
```

---

## 🤖 Agents Disponibles

### 1. Architecture Planner

- **Quand :** Features complexes nécessitant design architectural
- **Rôle :** Aide Opus à concevoir la structure optimale
- **Activation :** Automatique si feature complexe

### 2. Code Reviewer

- **Quand :** Après chaque implémentation
- **Rôle :** Review exhaustive multi-niveaux
- **Activation :** Toujours

### 3. Test Generator

- **Quand :** Sur demande
- **Rôle :** Génère des tests supplémentaires si coverage < 80%
- **Activation :** Manuel ou si coverage insuffisant

### 4. Documentation Writer

- **Quand :** Avant commit
- **Rôle :** JSDoc + README + CHANGELOG
- **Activation :** Toujours

---

## 📊 Exemple Complet

### Demande Complexe

```
Créer un système complet de notifications avec:
- Notifications in-app
- Notifications email
- Préférences utilisateur
- Marquage lu/non-lu
- Pagination
```

### Workflow Automatique

#### Phase 1: Opus Planning (Mode Plan)

```
🔵 OPUS

🤖 Agent Architecture Planner lancé...

📋 Analyse de complexité: HAUTE
✅ Plan architectural créé

## Plan d'implémentation détaillé

### 1. Domain Layer
- Entity: Notification
- Entity: NotificationPreference
- Value Objects: NotificationType, NotificationChannel
- Events: NotificationCreated, NotificationRead

### 2. Use Cases
- CreateNotification
- ListNotifications (avec pagination)
- MarkAsRead
- UpdatePreferences
- GetPreferences

### 3. Infrastructure
- NotificationRepository (Prisma)
- EmailService (Adapter pour Resend)
- WebSocketService (pour real-time)

### 4. Presentation
- Router: notification.router.ts
- Hooks: useNotifications, useNotificationPreferences
- Components: NotificationBell, NotificationList, NotificationItem

### 5. Database
- Migration: add notifications table
- Migration: add notification_preferences table
- Index: userId + read status
- Index: userId + createdAt

### 6. Tests
- 12 tests unitaires (use cases)
- 8 tests d'intégration (router)
- 4 tests UI (components)

### 7. Ordre d'implémentation
1. Schema Prisma + migrations
2. Entities + Value Objects
3. Use Cases (TDD)
4. Repository
5. Services (Email, WebSocket)
6. Router tRPC
7. Hooks
8. Components UI
9. Page intégration

Estimation: ~3-4h de développement

❓ Plan validé ?
```

#### Tu valides: "Parfait, go"

#### Phase 2: Sonnet Implementation (Mode Code)

```
🟢 SONNET

Implementation TDD en cours...

✅ 1/20 - Schema Prisma + migrations
✅ 2/20 - Entity Notification (tests)
✅ 3/20 - Entity NotificationPreference (tests)
✅ 4/20 - Value Objects (tests)
✅ 5/20 - Use Case CreateNotification (TDD)
✅ 6/20 - Use Case ListNotifications (TDD)
✅ 7/20 - Use Case MarkAsRead (TDD)
✅ 8/20 - Use Case UpdatePreferences (TDD)
✅ 9/20 - Use Case GetPreferences (TDD)
✅ 10/20 - NotificationRepository impl
✅ 11/20 - EmailService adapter
✅ 12/20 - WebSocketService
✅ 13/20 - Router tRPC (tests intégration)
✅ 14/20 - Hook useNotifications
✅ 15/20 - Hook useNotificationPreferences
✅ 16/20 - Component NotificationBell
✅ 17/20 - Component NotificationList
✅ 18/20 - Component NotificationItem
✅ 19/20 - Integration page
✅ 20/20 - Tests passent (Coverage 89%)

⏳ Demande review à Opus...
```

#### Phase 3: Opus Review

```
🔵 OPUS

🤖 Agent Code Reviewer lancé...

📊 Review multi-niveaux:

🏗️ Architecture: ✅ PASS
- Hexagonal architecture respectée
- Domain entities pures
- Adapters bien implémentés

💻 Code Quality: ✅ PASS
- ZERO any types ✓
- Branded types utilisés ✓
- Result Pattern appliqué ✓
- Validations Zod complètes ✓

🧪 Tests: ✅ PASS
- 24 tests unitaires
- 8 tests d'intégration
- 4 tests UI
- Coverage: 89% ✓

⚡ Performance: ✅ PASS
- Index database optimisés
- Pagination implémentée
- Pas de N+1 queries
- WebSocket optimisé

🔒 Sécurité: ✅ PASS
- Validations strictes
- Permissions vérifiées
- XSS protection
- Rate limiting prévu

🎨 UI/UX: ⚠️ MINOR
- Design cohérent ✓
- Responsive ✓
- States complets ✓
- Suggestion: Ajouter sound notification

📊 Décision: ✅ APPROVED

Passage au commit...
```

#### Phase 4: Opus Commit

```
🔵 OPUS

🤖 Agent Documentation Writer lancé...
✅ JSDoc ajouté
✅ README mis à jour
✅ CHANGELOG mis à jour

📝 Commit créé:

✨ feat: Complete notification system with real-time updates

## Features

### Notifications In-App
- Real-time notifications via WebSocket
- Mark as read/unread
- Pagination support
- Notification bell with count

### Email Notifications
- Email service adapter (Resend)
- Configurable preferences
- Templates support

### User Preferences
- Channel preferences (in-app, email)
- Frequency settings
- Category filters

## Architecture

### Domain Layer
- Entity: Notification with validation
- Entity: NotificationPreference
- Value Objects: NotificationType, NotificationChannel
- Domain Events: NotificationCreated, NotificationRead

### Use Cases (TDD)
- CreateNotification (tested)
- ListNotifications with pagination (tested)
- MarkAsRead (tested)
- UpdatePreferences (tested)
- GetPreferences (tested)

### Infrastructure
- NotificationRepository (Prisma)
- EmailService adapter
- WebSocketService for real-time

### Presentation
- tRPC Router with type-safety
- React hooks: useNotifications, useNotificationPreferences
- Components: NotificationBell, NotificationList, NotificationItem

## Database

- notifications table with indexes
- notification_preferences table
- Optimized queries (no N+1)
- Pagination support

## Tests

- ✅ 24 unit tests (use cases)
- ✅ 8 integration tests (router)
- ✅ 4 UI tests (components)
- ✅ Coverage: 89%

## Security

- ✅ Input validation (Zod)
- ✅ Permission checks
- ✅ XSS protection
- ✅ Rate limiting ready

## Performance

- ✅ Database indexes optimized
- ✅ Pagination implemented
- ✅ WebSocket optimized
- ✅ No N+1 queries

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>

✅ Feature Complétée !

Commit: f7e8a9b
Files: 28 changed (+2,450, -45)
Tests: 36 passing
Coverage: 89%

🎯 Ce qui a été implémenté:
- ✅ Système complet de notifications
- ✅ Real-time via WebSocket
- ✅ Email notifications
- ✅ Préférences utilisateur
- ✅ UI complète glassmorphism
- ✅ Tests complets (89% coverage)

💡 Suggestions pour améliorer:
- Ajouter sound notification (UX)
- Implémenter notifications push mobile
- Ajouter analytics des notifications

🚀 Prêt pour production !
```

---

## 💡 Conseils d'Utilisation

### ✅ Do's

**Sois clair dans tes demandes**

```
✅ Bon: "Créer une page de gestion des utilisateurs avec CRUD complet"
❌ Vague: "Ajoute un truc pour les users"
```

**Fais confiance au process**

```
✅ Laisse Opus planifier
✅ Laisse Sonnet implémenter
✅ Laisse Opus reviewer
❌ N'interviens pas pendant l'implémentation
```

**Valide les plans**

```
✅ Lis le plan proposé par Opus
✅ Demande des clarifications si besoin
✅ Valide ou demande des ajustements
```

### ❌ Don'ts

**N'interromps pas le workflow**

```
❌ Pas de "fait juste ça vite" pendant l'implémentation
❌ Pas de shortcuts qui cassent le process
```

**Ne skip pas la review**

```
❌ Même si ça a l'air bon
❌ Même pour de petits changements
```

**Ne modifie pas la config à la légère**

```
❌ Ne baisse pas minCoverage < 80%
❌ Ne désactive pas zeroAnyTypes
```

---

## 🎓 Formation

### Pour bien démarrer

1. **Comprends le flow**
   - Lis ce guide
   - Lis `/docs/AUTOMATED_WORKFLOW.md`
   - Lis `/docs/CODE_REVIEW.md`

2. **Teste avec une petite feature**

   ```
   "Ajouter un bouton logout dans la sidebar"
   ```

3. **Observe le process complet**
   - Planning Opus
   - Implémentation Sonnet
   - Review Opus
   - Commit Opus

4. **Monte en complexité progressivement**

---

## 📚 Références

- `/docs/AUTOMATED_WORKFLOW.md` - Flow technique détaillé
- `/docs/CODE_REVIEW.md` - Process de review
- `/docs/REVIEW_TEMPLATE.md` - Template des reviews
- `/docs/architecture.md` - Architecture du projet
- `/.workflow-config.json` - Configuration

---

## 🎯 Résultat Final

Avec ce workflow, chaque commit est :

- ✅ Production-ready
- ✅ Testé (>80%)
- ✅ Reviewé par Opus
- ✅ Documenté
- ✅ Conforme à l'architecture
- ✅ Type-safe
- ✅ Sécurisé
- ✅ Performant

**Tu peux déployer en production les yeux fermés ! 🚀**
