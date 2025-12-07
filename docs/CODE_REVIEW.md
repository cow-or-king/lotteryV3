# Code Review Workflow

## 🎯 Objectif

Établir un processus de review systématique entre les modèles Claude pour garantir :

- Cohérence architecturale
- Qualité du code
- Respect des bonnes pratiques
- Absence de régressions

## 🔄 Workflow Review

### 1. Implémentation (Sonnet)

Sonnet implémente les features en suivant :

- Architecture hexagonale (voir `/docs/architecture.md`)
- TypeScript strict (ZERO `any` types)
- Result Pattern pour gestion d'erreurs
- Branded Types pour type-safety
- Tests TDD

### 2. Review Pré-Commit (Opus)

Avant chaque commit majeur, Opus review en mode plan :

#### Checklist Architecture

- [ ] Respect de l'architecture hexagonale
- [ ] Séparation core/infrastructure/presentation
- [ ] Pas de dépendances circulaires
- [ ] Interfaces bien définies

#### Checklist Code Quality

- [ ] ZERO `any` types (TypeScript strict)
- [ ] Branded types utilisés pour les IDs
- [ ] Result Pattern pour gestion d'erreurs
- [ ] Validation avec Zod
- [ ] Pas de code dupliqué

#### Checklist Tests

- [ ] Tests unitaires pour la logique métier
- [ ] Tests d'intégration pour les APIs
- [ ] Coverage satisfaisant (>80%)
- [ ] Pas de tests flaky

#### Checklist Performance

- [ ] Pas de N+1 queries
- [ ] Index database optimisés
- [ ] Pagination implémentée si nécessaire
- [ ] Caching approprié

#### Checklist Sécurité

- [ ] Validation des inputs
- [ ] Protection contre les injections
- [ ] Gestion correcte des permissions
- [ ] Pas de secrets hardcodés

#### Checklist UX/UI

- [ ] Cohérence du design system
- [ ] Responsive mobile-first
- [ ] Loading states
- [ ] Error states
- [ ] Accessibility (a11y)

### 3. Corrections (Sonnet)

Si Opus détecte des problèmes, Sonnet corrige avant le commit.

### 4. Validation Finale (Opus)

Opus valide que toutes les corrections ont été appliquées.

## 📋 Quand faire une review ?

### Reviews Obligatoires

- ✅ Après implémentation d'une nouvelle feature
- ✅ Avant chaque commit sur main
- ✅ Après refactoring majeur
- ✅ Avant merge d'une PR

### Reviews Recommandées

- 💡 Après modifications du schema Prisma
- 💡 Après ajout de nouvelles dépendances
- 💡 Après modifications de la config (tsconfig, eslint, etc.)

## 🔍 Comment déclencher une review ?

### Commande Utilisateur

```
Passe en mode plan et review le code qui vient d'être écrit.
Vérifie la cohérence avec l'architecture initiale.
```

### Workflow Automatique (Idéal)

1. Sonnet implémente la feature
2. Sonnet demande automatiquement : "Review avant commit ?"
3. Si oui → Opus review en mode plan
4. Opus retourne la checklist avec ✅/❌
5. Si tout est ✅ → Commit
6. Si des ❌ → Sonnet corrige → Retour étape 3

## 📝 Format de la Review

Utiliser le template dans `/docs/REVIEW_TEMPLATE.md`

## 🎨 Principes de Review

### Pour Opus (Reviewer)

- ✅ Être constructif et pédagogique
- ✅ Donner des exemples concrets
- ✅ Référencer la documentation
- ✅ Prioriser les problèmes (Critical/Major/Minor)
- ❌ Pas de nitpicking excessif
- ❌ Pas de subjectivité

### Pour Sonnet (Implementer)

- ✅ Accepter le feedback positivement
- ✅ Demander des clarifications si besoin
- ✅ Corriger tous les Critical/Major
- ✅ Évaluer les Minor au cas par cas
- ❌ Pas de défensivité
- ❌ Pas ignorer les feedbacks

## 📚 Références

- `/docs/architecture.md` - Architecture du projet
- `/docs/CONVENTIONS.md` - Conventions de code
- `/docs/REVIEW_TEMPLATE.md` - Template de review

## 🚀 Évolutions Futures

- [ ] Script automatique de pre-commit review
- [ ] Integration avec les git hooks
- [ ] Metrics de qualité de code
- [ ] Dashboard de review
