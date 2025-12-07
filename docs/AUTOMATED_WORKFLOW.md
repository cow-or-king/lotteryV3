# Workflow Automatisé Opus ↔ Sonnet

## 🎯 Objectif

Automatiser complètement le processus de développement avec rotation automatique entre Opus (architecture/review) et Sonnet (implémentation) pour garantir un code de qualité maximale sans intervention manuelle.

## 🔄 Workflow Complet

### Phase 1: Planification (Opus - Mode Plan)

**Déclencheurs automatiques:**

- Nouvelle feature demandée par l'utilisateur
- Nouvelle route/page à créer
- Nouveau modèle de données
- Refactoring majeur

**Actions Opus:**

1. **Analyse de la demande**
   - Comprendre les besoins utilisateur
   - Identifier les impacts sur l'architecture
   - Vérifier la cohérence avec l'existant

2. **Design architectural**
   - Définir la structure des dossiers
   - Identifier les entités/use cases nécessaires
   - Planifier les routes tRPC
   - Designer le schema Prisma si nécessaire
   - Définir les components UI

3. **Plan d'implémentation détaillé**

   ```markdown
   ## Feature: [Nom de la feature]

   ### 1. Architecture

   - [ ] Entities: [Liste]
   - [ ] Use Cases: [Liste]
   - [ ] Repositories: [Liste]
   - [ ] tRPC Routers: [Liste]

   ### 2. Database

   - [ ] Schema Prisma: [Modifications]
   - [ ] Migrations: [À créer]
   - [ ] Seeds: [Si nécessaire]

   ### 3. API

   - [ ] Routes tRPC: [Détails]
   - [ ] Validations Zod: [Schemas]
   - [ ] Error handling: [Types d'erreurs]

   ### 4. UI/UX

   - [ ] Pages: [Liste avec chemins]
   - [ ] Components: [Liste]
   - [ ] States: Loading/Error/Empty

   ### 5. Tests

   - [ ] Unit tests: [Liste]
   - [ ] Integration tests: [Liste]
   - [ ] E2E tests: [Si nécessaire]

   ### 6. Ordre d'implémentation

   1. [Étape 1]
   2. [Étape 2]
      ...
   ```

4. **Validation utilisateur**
   - Présenter le plan complet
   - Demander confirmation avant de passer à Sonnet
   - Ajuster selon feedback

**Output:** Plan d'implémentation détaillé validé

---

### Phase 2: Implémentation (Sonnet - Mode Code)

**Déclenchement:** Après validation du plan par utilisateur + Opus

**Actions Sonnet:**

1. **Setup initial**
   - Créer la structure de dossiers
   - Générer les fichiers squelettes
   - Setup tests

2. **Implémentation TDD**

   ```
   Pour chaque module:
   1. Écrire les tests d'abord (Red)
   2. Implémenter le minimum pour passer (Green)
   3. Refactorer (Refactor)
   4. Passer au module suivant
   ```

3. **Ordre d'implémentation stricte**

   ```
   1. Domain Layer (Core)
      - Entities avec validation
      - Value Objects
      - Domain Events si nécessaire

   2. Use Cases (Core)
      - Business logic pure
      - Result Pattern
      - Tests unitaires

   3. Infrastructure Layer
      - Repositories implémentation
      - Database migrations
      - External services

   4. Presentation Layer
      - tRPC routers
      - Zod validations
      - Tests d'intégration

   5. UI Layer
      - Components
      - Pages
      - Hooks
      - Tests UI
   ```

4. **Standards de code OBLIGATOIRES**
   - ✅ ZERO `any` types
   - ✅ Branded types pour IDs
   - ✅ Result Pattern partout
   - ✅ Validation Zod
   - ✅ JSDoc pour fonctions publiques
   - ✅ Tests coverage > 80%

5. **Checkpoints automatiques**
   Après chaque module majeur:
   ```typescript
   // Sonnet s'auto-vérifie
   - [ ] Tests passent (npm run test)
   - [ ] Type check OK (npm run type-check)
   - [ ] Lint OK (npm run lint)
   - [ ] Build OK (npm run build)
   ```

**Output:** Code implémenté avec tests

---

### Phase 3: Review Automatique (Opus - Mode Plan)

**Déclenchement:** Automatique après implémentation par Sonnet

**Actions Opus:**

1. **Utiliser Agent Review**

   ```typescript
   // Opus lance l'agent de review
   Agent: code-reviewer
   Tâche: Review complète du code implémenté
   Template: /docs/REVIEW_TEMPLATE.md
   ```

2. **Review multi-niveaux**

   **Niveau 1: Architecture**

   ```bash
   - Vérifier respect architecture hexagonale
   - Vérifier séparation des couches
   - Vérifier pas de dépendances circulaires
   ```

   **Niveau 2: Code Quality**

   ```bash
   - Vérifier ZERO any types
   - Vérifier Branded types utilisés
   - Vérifier Result Pattern appliqué
   - Vérifier validations Zod
   ```

   **Niveau 3: Tests**

   ```bash
   - Vérifier coverage > 80%
   - Vérifier tests unitaires présents
   - Vérifier tests intégration présents
   - Vérifier pas de tests flaky
   ```

   **Niveau 4: Performance**

   ```bash
   - Vérifier pas de N+1 queries
   - Vérifier index database
   - Vérifier pagination
   ```

   **Niveau 5: Sécurité**

   ```bash
   - Vérifier validation inputs
   - Vérifier permissions
   - Vérifier pas de secrets hardcodés
   ```

   **Niveau 6: UI/UX**

   ```bash
   - Vérifier design system respecté
   - Vérifier responsive
   - Vérifier loading/error/empty states
   - Vérifier accessibility
   ```

3. **Génération du rapport**
   Utiliser `/docs/REVIEW_TEMPLATE.md` et remplir:
   - ✅ Points validés
   - ❌ Issues détectées (Critical/Major/Minor)
   - 💡 Suggestions d'amélioration

4. **Décision automatique**
   ```typescript
   if (criticalIssues > 0) {
     return 'REJECTED - Retour à Sonnet pour corrections';
   } else if (majorIssues > 3) {
     return 'NEEDS CHANGES - Retour à Sonnet pour corrections';
   } else {
     return 'APPROVED - Passage au commit';
   }
   ```

**Output:** Rapport de review + Décision

---

### Phase 4A: Corrections (Sonnet - Mode Code)

**Déclenchement:** Si Opus a retourné REJECTED ou NEEDS CHANGES

**Actions Sonnet:**

1. **Analyser le rapport Opus**
   - Lire tous les Critical
   - Lire tous les Major
   - Évaluer les Minor

2. **Corrections prioritaires**

   ```
   1. Corriger TOUS les Critical
   2. Corriger TOUS les Major
   3. Corriger les Minor si pertinent
   ```

3. **Re-test complet**

   ```bash
   npm run test
   npm run type-check
   npm run lint
   npm run build
   ```

4. **Demander nouvelle review à Opus**
   Retour automatique à Phase 3

**Loop:** Phase 3 ↔ Phase 4A jusqu'à APPROVED

---

### Phase 4B: Commit (Opus - Mode Plan)

**Déclenchement:** Après APPROVED de la review

**Actions Opus:**

1. **Générer message de commit**
   Format standardisé:

   ```
   ✨ [Type]: [Description courte]

   ## [Catégorie]

   ### [Sous-catégorie 1]
   - Point 1
   - Point 2

   ### [Sous-catégorie 2]
   - Point 1
   - Point 2

   ## Features
   - ✅ Feature 1
   - ✅ Feature 2

   ## Tests
   - ✅ Tests unitaires
   - ✅ Tests intégration
   - ✅ Coverage > 80%

   🤖 Generated with Claude Code
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

2. **Commit automatique**

   ```bash
   git add -A
   git commit -m "[message généré]"
   ```

3. **Afficher résumé**

   ```markdown
   ## ✅ Feature Complétée

   **Commit:** [hash]
   **Files changed:** [nombre]
   **Tests:** [nombre] passing
   **Coverage:** [pourcentage]%

   ### 🎯 Ce qui a été fait

   - [Liste des accomplissements]

   ### 🚀 Prochaines étapes suggérées

   - [Suggestions]
   ```

**Output:** Code committé + Résumé

---

## 🤖 Agents Utilisés

### Agent 1: Architecture Planner

**Rôle:** Aide Opus à designer l'architecture
**Quand:** Phase 1 - Pour features complexes
**Tâches:**

- Analyser l'architecture existante
- Proposer des structures
- Vérifier la cohérence

### Agent 2: Code Reviewer

**Rôle:** Aide Opus à faire la review
**Quand:** Phase 3 - Toujours
**Tâches:**

- Review automatisée du code
- Vérification des standards
- Détection des problèmes

### Agent 3: Test Generator

**Rôle:** Aide Sonnet à générer les tests
**Quand:** Phase 2 - Si demandé
**Tâches:**

- Générer tests unitaires
- Générer tests d'intégration
- Vérifier coverage

### Agent 4: Documentation Writer

**Rôle:** Générer la documentation
**Quand:** Phase 4B - Avant commit
**Tâches:**

- Générer JSDoc
- Mettre à jour README
- Mettre à jour CHANGELOG

---

## 🎬 Exemple de Flow Complet

### Demande Utilisateur

```
"Je veux créer une page pour gérer les campagnes"
```

### Phase 1: Opus Planning

```
🔵 OPUS (Mode Plan)

Analyse de la demande...
✅ Page campagnes identifiée
✅ Analyse de l'architecture existante
✅ Identification des besoins:
   - Entity: Campaign
   - Use Cases: CreateCampaign, ListCampaigns, UpdateCampaign
   - Router: campaign.router.ts
   - Page: /dashboard/campaigns

📋 Plan d'implémentation:
[Plan détaillé généré]

❓ Validation requise: Le plan vous convient-il ?
```

### Validation Utilisateur

```
"Oui, parfait"
```

### Phase 2: Sonnet Implementation

```
🟢 SONNET (Mode Code)

Passage automatique à l'implémentation...

✅ 1/8 - Entity Campaign créée
✅ 2/8 - Use Cases implémentés (TDD)
✅ 3/8 - Repository implémenté
✅ 4/8 - Router tRPC créé
✅ 5/8 - Validations Zod ajoutées
✅ 6/8 - Page UI créée
✅ 7/8 - Components créés
✅ 8/8 - Tests passent (Coverage 85%)

Demande de review automatique à Opus...
```

### Phase 3: Opus Review

```
🔵 OPUS (Mode Plan)

Lancement de l'agent de review...

📊 Review Report:
✅ Architecture: PASS
✅ Code Quality: PASS
✅ Tests: PASS (85% coverage)
✅ Performance: PASS
⚠️ Sécurité: MINOR - Ajouter rate limiting
✅ UI/UX: PASS

🟡 1 Minor issue détecté
✅ APPROVED (avec suggestions)

Passage au commit...
```

### Phase 4B: Opus Commit

```
🔵 OPUS (Mode Plan)

Génération du message de commit...
Commit automatique...

✅ Feature Complétée

Commit: a1b2c3d
Files: 12 changed
Tests: 24 passing
Coverage: 85%

🎯 Ce qui a été fait:
- ✅ Entity Campaign avec validation
- ✅ CRUD complet des campagnes
- ✅ Page UI glassmorphism
- ✅ Tests unitaires + intégration

🚀 Suggestions pour la suite:
- Implémenter le rate limiting (Minor issue)
- Ajouter les filtres avancés
- Implémenter l'export CSV
```

---

## 🔧 Configuration

### Activer le workflow automatique

Créer `/docs/.workflow-config.json`:

```json
{
  "autoWorkflow": {
    "enabled": true,
    "triggers": {
      "newFeature": true,
      "newRoute": true,
      "newModel": true,
      "refactoring": true
    },
    "rotation": {
      "planning": "opus",
      "implementation": "sonnet",
      "review": "opus",
      "commit": "opus"
    },
    "agents": {
      "architecturePlanner": true,
      "codeReviewer": true,
      "testGenerator": false,
      "documentationWriter": true
    },
    "autoCommit": true,
    "minCoverage": 80,
    "strictMode": true
  }
}
```

### Désactiver temporairement

```
"workflow: off"
```

### Réactiver

```
"workflow: on"
```

---

## 📊 Métriques de Qualité

Le workflow automatique garantit:

- ✅ 100% des features passent par review Opus
- ✅ 0 commit sans tests
- ✅ 0 commit avec `any` types
- ✅ 0 commit sans validation Zod
- ✅ Coverage toujours > 80%
- ✅ Architecture toujours respectée

---

## 🎯 Avantages

### Pour le code

- ✅ Qualité maximale garantie
- ✅ Architecture cohérente
- ✅ Tests complets
- ✅ Documentation à jour

### Pour le développement

- ✅ Pas de va-et-vient manuel
- ✅ Process automatisé
- ✅ Review systématique
- ✅ Standards respectés

### Pour l'utilisateur

- ✅ Transparence totale du process
- ✅ Code production-ready
- ✅ Confiance maximale
- ✅ Moins d'intervention requise

---

## 🚀 Prochaines Étapes

- [ ] Implémenter le script d'activation
- [ ] Créer les agents nécessaires
- [ ] Intégrer avec git hooks
- [ ] Dashboard de métriques
