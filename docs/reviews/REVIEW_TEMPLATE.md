# Code Review Template

## 📊 Review Summary

**Date:** [Date de la review]
**Reviewer:** [Opus/Sonnet]
**Feature:** [Nom de la feature reviewée]
**Commit/PR:** [Hash ou numéro]
**Status:** ✅ APPROVED / ⚠️ NEEDS CHANGES / ❌ REJECTED

---

## 🏗️ Architecture Review

### Cohérence Architecture Hexagonale

- [ ] ✅/❌ Séparation core/infrastructure/presentation respectée
- [ ] ✅/❌ Pas de dépendances core → infrastructure
- [ ] ✅/❌ Interfaces ports/adapters bien définies
- [ ] ✅/❌ Domain entities pures (sans dépendances externes)

**Observations:**

```
[Détails des observations architecturales]
```

**Actions requises:**

```
- [ ] [Action 1]
- [ ] [Action 2]
```

---

## 💻 Code Quality

### TypeScript Strict

- [ ] ✅/❌ ZERO `any` types
- [ ] ✅/❌ Branded types pour IDs
- [ ] ✅/❌ Inférence de types correcte
- [ ] ✅/❌ Pas de `@ts-ignore` ou `@ts-expect-error`

### Result Pattern

- [ ] ✅/❌ Gestion d'erreurs avec Result<T, Error>
- [ ] ✅/❌ Pas de `throw` dans la logique métier
- [ ] ✅/❌ Error types bien définis

### Validation

- [ ] ✅/❌ Validation Zod pour tous les inputs
- [ ] ✅/❌ Messages d'erreur clairs et utiles
- [ ] ✅/❌ Validation côté client ET serveur

**Observations:**

```
[Détails sur la qualité du code]
```

**Actions requises:**

```
- [ ] [Action 1]
- [ ] [Action 2]
```

---

## 🧪 Tests

### Coverage

- [ ] ✅/❌ Tests unitaires pour logique métier
- [ ] ✅/❌ Tests d'intégration pour APIs
- [ ] ✅/❌ Coverage > 80%
- [ ] ✅/❌ Pas de tests flaky

### Qualité Tests

- [ ] ✅/❌ Tests clairs et maintenables
- [ ] ✅/❌ Arrange-Act-Assert pattern
- [ ] ✅/❌ Pas de dépendances entre tests
- [ ] ✅/❌ Mocks appropriés

**Observations:**

```
[Détails sur les tests]
```

**Actions requises:**

```
- [ ] [Action 1]
- [ ] [Action 2]
```

---

## ⚡ Performance

### Database

- [ ] ✅/❌ Pas de N+1 queries
- [ ] ✅/❌ Index appropriés
- [ ] ✅/❌ Pagination implémentée
- [ ] ✅/❌ Transactions optimisées

### Caching

- [ ] ✅/❌ Caching approprié
- [ ] ✅/❌ Invalidation correcte
- [ ] ✅/❌ Pas de cache stale

**Observations:**

```
[Détails sur la performance]
```

**Actions requises:**

```
- [ ] [Action 1]
- [ ] [Action 2]
```

---

## 🔒 Sécurité

### Validation & Sanitization

- [ ] ✅/❌ Validation stricte des inputs
- [ ] ✅/❌ Protection contre injections SQL
- [ ] ✅/❌ Protection contre XSS
- [ ] ✅/❌ CSRF protection si nécessaire

### Permissions

- [ ] ✅/❌ Vérification des permissions
- [ ] ✅/❌ Isolation des données utilisateurs
- [ ] ✅/❌ Pas de données sensibles exposées

### Secrets

- [ ] ✅/❌ Pas de secrets hardcodés
- [ ] ✅/❌ Variables d'environnement correctes
- [ ] ✅/❌ .env.example à jour

**Observations:**

```
[Détails sur la sécurité]
```

**Actions requises:**

```
- [ ] [Action 1]
- [ ] [Action 2]
```

---

## 🎨 UI/UX

### Design System

- [ ] ✅/❌ Cohérence avec le design system
- [ ] ✅/❌ Glassmorphism appliqué correctement
- [ ] ✅/❌ Couleurs/spacing/typography cohérents
- [ ] ✅/❌ Animations fluides et appropriées

### Responsive

- [ ] ✅/❌ Mobile-first approach
- [ ] ✅/❌ Breakpoints appropriés
- [ ] ✅/❌ Touch-friendly sur mobile

### States

- [ ] ✅/❌ Loading states
- [ ] ✅/❌ Error states
- [ ] ✅/❌ Empty states
- [ ] ✅/❌ Success feedback

### Accessibility

- [ ] ✅/❌ Contraste suffisant
- [ ] ✅/❌ Navigation clavier
- [ ] ✅/❌ ARIA labels appropriés
- [ ] ✅/❌ Semantic HTML

**Observations:**

```
[Détails sur UI/UX]
```

**Actions requises:**

```
- [ ] [Action 1]
- [ ] [Action 2]
```

---

## 📝 Documentation

- [ ] ✅/❌ Code commenté où nécessaire
- [ ] ✅/❌ JSDoc pour fonctions publiques
- [ ] ✅/❌ README mis à jour si nécessaire
- [ ] ✅/❌ CHANGELOG mis à jour

**Observations:**

```
[Détails sur la documentation]
```

---

## 🐛 Issues Détectées

### 🔴 Critical (MUST FIX)

```
1. [Description du problème critique]
   Fichier: [chemin/fichier.ts:ligne]
   Raison: [Pourquoi c'est critique]
   Solution: [Comment corriger]
```

### 🟠 Major (SHOULD FIX)

```
1. [Description du problème majeur]
   Fichier: [chemin/fichier.ts:ligne]
   Raison: [Pourquoi c'est important]
   Solution: [Comment corriger]
```

### 🟡 Minor (NICE TO HAVE)

```
1. [Description de l'amélioration]
   Fichier: [chemin/fichier.ts:ligne]
   Raison: [Pourquoi ce serait mieux]
   Solution: [Comment améliorer]
```

---

## ✨ Points Positifs

```
- [Ce qui a été bien fait]
- [Bonnes pratiques observées]
- [Innovations intéressantes]
```

---

## 📋 Actions Requises (Checklist)

### Critical (Avant Commit)

- [ ] [Action critique 1]
- [ ] [Action critique 2]

### Major (Avant Merge)

- [ ] [Action majeure 1]
- [ ] [Action majeure 2]

### Minor (Backlog)

- [ ] [Amélioration 1]
- [ ] [Amélioration 2]

---

## 🎯 Décision Finale

**Status:** ✅ APPROVED / ⚠️ NEEDS CHANGES / ❌ REJECTED

**Justification:**

```
[Explication de la décision]
```

**Next Steps:**

```
1. [Prochaine étape]
2. [Prochaine étape]
```

---

## 📎 Références

- Architecture: `/docs/architecture.md`
- Conventions: `/docs/CONVENTIONS.md`
- Related Issues: #[numéro]
- Related PRs: #[numéro]

---

**Reviewer Signature:** [Nom du modèle]
**Date:** [Date]
