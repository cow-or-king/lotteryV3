# 📝 TODO - ReviewLottery V3

## 🔴 Priorité HAUTE

### 1. Système de Loteries (Core Feature)

**Status**: ❌ Non commencé
**Priorité**: 🔴 CRITIQUE

- [ ] CRUD Campagnes (Campaign entity + use cases)
- [ ] Association Reviews → Campaigns
- [ ] Système de tirages au sort (algorithme)
- [ ] Notifications gagnants (email)
- [ ] Dashboard campagnes admin
- [ ] Historique tirages

**Estimation**: 15-20h

### 2. Implémenter My Business API Write

**Status**: ⚠️ Partiellement implémenté (lecture OK, écriture à faire)
**Priorité**: 🟠 HAUTE

- [ ] Endpoint "Publier réponse" (POST)
- [ ] Workflow validation réponses
- [ ] Tests avec vrai commerce
- [ ] Gestion erreurs API Google

**Estimation**: 8-10h

### 3. Tests Automatisés Critiques

**Status**: ⚠️ Infrastructure prête, tests manquants
**Priorité**: 🟡 MOYENNE

- [ ] Tests use cases critiques (loteries, reviews, auth)
- [ ] Tests repositories Prisma
- [ ] Tests integration APIs (Google, OpenAI)
- [ ] E2E tests principaux flows

**Estimation**: 10-12h

## 🟡 Priorité MOYENNE

### 4. Email Notifications

**Status**: ❌ Non commencé
**Priorité**: 🟡 MOYENNE

Templates créés mais non intégrés:

- `/email-templates/confirm-signup.html`
- `/email-templates/reset-password.html`
- `/email-templates/magic-link.html`

**À faire**:

- [ ] Intégrer service emailing (Resend? SendGrid?)
- [ ] Emails gagnants loterie
- [ ] Emails confirmation actions (review répondue, etc.)

**Estimation**: 5-8h

### 5. Participants & Verification

**Status**: ⚠️ Code existant mais non testé
**Priorité**: 🟡 MOYENNE

- [ ] Vérifier workflow verification participant (email matching)
- [ ] Tester association Review → Participant
- [ ] Tester éligibilité loterie
- [ ] Ajouter UI pour gestion participants

**Estimation**: 6-8h

## 🟢 Priorité BASSE

### 6. Magic Link Authentication

**Status**: ⏸️ **POSTPONED** - Code existe mais désactivé
**Priorité**: 🟢 BASSE (ou supprimer définitivement)

**Décision à prendre**:

- [ ] **Option A**: Garder avec flag `ENABLE_MAGIC_LINK=false` (actuellement)
- [ ] **Option B**: Supprimer complètement le code

**Si garder (Option A)**:

- [x] Code déjà implémenté et testé
- [x] Prêt à activer en 15-30 min si besoin
- [ ] Ajouter lien UI "Se connecter par email" (caché par défaut)
- [ ] Configurer service emailing

**Si supprimer (Option B)**:

- [ ] Supprimer `/src/app/(auth)/magic-link/`
- [ ] Supprimer `/src/lib/supabase/client.ts`
- [ ] Supprimer `/email-templates/magic-link.html`
- [ ] Supprimer `/docs/authentication/MAGIC-LINK-SETUP.md`
- [ ] Supprimer `/docs/planning/MAGIC-LINK-DECISION.md`

**Fichiers concernés (si suppression)**:

```
src/app/(auth)/magic-link/page.tsx
src/lib/supabase/client.ts
email-templates/magic-link.html
docs/authentication/MAGIC-LINK-SETUP.md
docs/planning/MAGIC-LINK-DECISION.md
```

⚠️ **NE PAS supprimer** `/src/app/api/auth/callback/route.ts` (utilisé par auth classique aussi!)

**Estimation si suppression**: 30 min

### 7. Cleanup Code Mineurs

**Status**: 🟢 Optionnel
**Priorité**: 🟢 BASSE

- [ ] Supprimer `/src/app/dashboard/stores/page.tsx.backup` si plus utile
- [ ] Cleanup console.logs en production
- [ ] Vérifier tous les TODO dans le code

**Estimation**: 1-2h

## 📅 Rappels Importants

### Décision Magic Link

**⏰ Deadline suggérée**: Avant Phase 2 (loteries terminées)

**Contexte**:

- User a dit: "revenons à la connexion classique on verra ca plus tard"
- Code fonctionnel mais non utilisé (250 lignes)
- Décision à prendre: garder ou supprimer

**Action recommandée**:
Réévaluer à la fin de Phase 1 (loteries fonctionnelles) pour décider si Magic Link est toujours souhaité ou à supprimer définitivement.

### Documentation Google API

**✅ FAIT**: Documentation Places API supprimée
**✅ FAIT**: Documentation Mock services supprimée
**Reste à faire**: Créer documentation My Business API production (voir analysis report)

---

## 📊 Métriques Projet

**Fonctionnalités terminées**: ~40%

- ✅ Auth système complet
- ✅ Users CRUD + Rôles
- ✅ Stores/Brands CRUD
- ✅ AI OpenAI intégration
- ✅ Google OAuth setup (lecture reviews)

**Core feature manquante**: Système de loteries (60% du projet)

**Tests**: Infrastructure prête, tests à écrire

**Documentation**: En cours de cleanup et mise à jour

---

**Dernière mise à jour**: 2025-12-10
