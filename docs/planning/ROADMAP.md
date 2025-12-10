# 🗺️ Roadmap ReviewLottery v3.0

## ✅ Phase 1: Fondations (TERMINÉ)

- [x] Architecture hexagonale + DDD
- [x] Next.js 16 + TypeScript ultra-strict
- [x] Supabase Auth + PostgreSQL + Prisma
- [x] tRPC pour API type-safe
- [x] Système d'authentification complet
- [x] Gestion des rôles (USER, ADMIN, SUPER_ADMIN)

## 🚧 Phase 2: Module Reviews & IA (EN COURS)

### ✅ Déjà fait

- [x] Architecture Google My Business (mock service)
- [x] Entités Review + Use Cases
- [x] tRPC Router pour reviews
- [x] Interface /reviews avec liste des avis
- [x] Modal de réponse aux avis
- [x] Sélecteur de ton (professional, friendly, apologetic)
- [x] Système de suggestions IA
- [x] Service d'encryption pour API keys
- [x] Dashboard super-admin `/admin/ai-config`
- [x] Configuration OpenAI + Anthropic
- [x] Test de connexion IA
- [x] Auto-confirmation email en DEV
- [x] Scripts de diagnostic utilisateurs

### 🔧 À terminer

#### Reviews - Fonctionnalités manquantes

- [ ] **Filtres avancés**
  - Filtre par rating (1-5 étoiles)
  - Filtre par statut (NEW, PROCESSED, ARCHIVED)
  - Filtre par période (fromDate, toDate)
  - Filtre par campagne
  - Filtre "avec réponse" / "sans réponse"

- [ ] **Statistiques détaillées**
  - Graphique évolution des avis par mois
  - Distribution des ratings (bar chart)
  - Temps de réponse moyen
  - Taux de réponse (% avis répondus)

- [ ] **Templates de réponses**
  - Interface CRUD pour templates
  - Catégories (positive, neutral, negative)
  - Variables dynamiques ({nom_client}, {commerce}, etc.)
  - Utilisation dans le modal de réponse

- [ ] **Gestion des avis**
  - Archiver un avis
  - Marquer comme traité/non traité
  - Notes internes sur un avis
  - Export CSV/Excel des avis

#### IA - Fonctionnalités manquantes

- [ ] **Configuration IA (super-admin)**
  - ✅ CRUD des configs IA
  - ✅ Test de connexion
  - [ ] Édition du prompt système
  - [ ] Configuration des quotas (daily limits)
  - [ ] Monitoring usage temps réel
  - [ ] Logs des requêtes IA (debug)

- [ ] **Utilisation IA (admin)**
  - ✅ Génération de suggestions
  - [ ] Historique des suggestions générées
  - [ ] Régénération avec ton différent
  - [ ] Édition manuelle + amélioration IA
  - [ ] Analyse de sentiment automatique
  - [ ] Détection de thèmes (service, prix, qualité, etc.)

- [ ] **Facturation IA**
  - [ ] Tracking usage par client (AiUsageLog)
  - [ ] Dashboard usage par admin
  - [ ] Alertes quota dépassé
  - [ ] Rapport mensuel d'usage

#### Google My Business Integration

- [ ] **Migration du mock vers API réelle**
  - Implémenter GoogleMyBusinessService (API réelle)
  - OAuth 2.0 pour Google
  - Sync automatique des avis (cron job)
  - Webhooks Google pour nouveaux avis

- [ ] **Configuration par commerce**
  - Interface pour ajouter Google API key
  - Validation de la clé (test connection)
  - Encryption AES-256-GCM des clés
  - Auto-sync activé/désactivé
  - Fréquence de sync (heures)

## 📅 Phase 3: Gestion des utilisateurs (PROCHAINE)

### Dashboard Super-Admin

- [ ] **Interface dédiée `/super-admin`**
  - Vue d'ensemble de la plateforme
  - Statistiques globales (clients, commerces, avis)
  - Liste de tous les clients (ADMIN)
  - Monitoring des services (IA, Google API)
  - Logs système

- [ ] **Gestion des clients**
  - Liste des ADMIN avec filtres
  - Voir détails d'un client (commerces, usage IA, etc.)
  - Suspendre/Activer un compte
  - Changer le plan (FREE → STARTER → PRO)
  - Logs d'activité par client

- [ ] **Configuration globale**
  - ✅ Configuration IA (déjà fait)
  - Gestion des plans (FREE, STARTER, PRO)
  - Limites par plan (commerces, campagnes, IA)
  - Configuration email (SMTP)
  - Variables globales

### Dashboard Admin - Gestion des users

- [ ] **Interface `/dashboard/users`**
  - Liste des USERS créés par l'ADMIN
  - CRUD complet (Create, Read, Update, Delete)
  - Attribution de rôles/permissions par USER
  - Invitation par email

- [ ] **Permissions granulaires**
  - Lecture seule / Lecture-écriture
  - Accès par commerce (USER A → Commerce 1, 2 uniquement)
  - Accès par fonctionnalité (reviews, campaigns, lottery)
  - Logs d'activité par USER

- [ ] **Invitations**
  - Envoyer invitation par email
  - Lien unique avec token
  - Expiration 7 jours
  - Onboarding pour nouveaux USERS

## 📅 Phase 4: Campaigns & Lottery

- [ ] **Campaigns**
  - CRUD campagnes
  - Configuration roue de la fortune
  - Styles personnalisés
  - Intégration Google Reviews

- [ ] **Prizes & PrizeSets**
  - Templates de gains réutilisables
  - Lots de gains par campagne
  - Probabilités configurables
  - Gestion du stock

- [ ] **Lottery**
  - Page publique avec roue
  - Vérification avis Google
  - Tirage au sort
  - Génération code QR/lien unique
  - Claiming des gains

## 📅 Phase 5: Analytics & Reporting

- [ ] **Dashboard analytics**
  - Graphiques temps réel
  - KPIs par commerce
  - Export rapports PDF
  - Comparaison période

- [ ] **Notifications**
  - Nouvel avis Google
  - Gain réclamé
  - Quota IA atteint
  - Email + In-app

## 📅 Phase 6: Billing & Payments

- [ ] **Stripe Integration**
  - Checkout page
  - Webhooks Stripe
  - Gestion abonnements
  - Facturation automatique

- [ ] **Plans & Limits**
  - Enforcement des limites
  - Upgrade/Downgrade
  - Période d'essai

## 📅 Phase 7: Production & Deploy

- [ ] **Optimisations**
  - Code splitting
  - Image optimization
  - Caching strategy
  - CDN

- [ ] **Monitoring**
  - Sentry error tracking
  - Logging (Winston)
  - Performance monitoring
  - Uptime monitoring

- [ ] **Security**
  - Rate limiting
  - CSRF protection
  - SQL injection prevention
  - XSS protection

- [ ] **Deployment**
  - CI/CD pipeline
  - Vercel deployment
  - Database migrations
  - Environment variables

---

## 🎯 Focus actuel

**Phase 2: Reviews & IA** (80% complete)

Prochaines tâches:

1. Terminer filtres avancés reviews
2. Ajouter templates de réponses
3. Compléter dashboard config IA (quotas, logs)
4. Implémenter Google My Business API réelle

Puis → **Phase 3: Users + Dashboard Super-Admin**
