# ReviewLottery V3 - Roadmap

## ✅ Phase 1: Foundation & Infrastructure (COMPLETED)

### Architecture de base

- [x] Next.js 16.0.7 avec TypeScript ultra-strict (ZERO any types)
- [x] Architecture hexagonale avec DDD
- [x] Result Pattern pour gestion d'erreurs
- [x] Branded Types pour type-safety des IDs
- [x] ESLint + Prettier + Husky configurés
- [x] Vitest pour tests unitaires
- [x] Structure de dossiers complète

### Authentication & Users

- [x] Supabase Auth integration
- [x] User entity avec tests TDD
- [x] Session management
- [x] Login/Signup pages

### Database & ORM

- [x] PostgreSQL via Prisma
- [x] Models: User, Store, Review, ResponseTemplate, GoogleApiKey, etc.
- [x] Migrations initiales

### API Layer

- [x] tRPC pour API type-safe
- [x] Auth router (getMe, login, signup)
- [x] Store router (CRUD commerces)
- [x] Review router (fetch, respond)

## ✅ Phase 2: Super-Admin & RBAC (COMPLETED)

### Système de rôles et permissions

- [x] RBAC avec 3 rôles: SUPER_ADMIN, ADMIN, USER
- [x] Permissions helper (isSuperAdmin, isAdmin, canAccess)
- [x] usePermissions hook
- [x] MenuPermission Prisma model (prêt pour migration)

### Impersonation système

- [x] RoleImpersonationProvider (Context API)
- [x] RoleIndicator component (dropdown compact)
- [x] Persistance localStorage
- [x] Toggle entre vues SUPER_ADMIN/ADMIN/USER

### Menu management

- [x] Configuration menus en mémoire (menuConfig.ts)
- [x] Filtrage sidebar par rôle (getVisibleMenusForRole)
- [x] Page Super-Admin de gestion visibilité menus
- [x] Interface toggle checkboxes par rôle

### Dashboard Super-Admin

- [x] Page principale /dashboard/super-admin
- [x] Stats plateforme (users, commerces, avis, IA usage)
- [x] Quick actions (Menu Config, AI Config, Clients)
- [x] /dashboard/super-admin/menu-config
- [x] /dashboard/super-admin/ai-config

### AI Service Management

- [x] AIServiceBadge component (status + provider)
- [x] useAIServiceStatus hook
- [x] Badge sur Dashboard, Reviews, AI Config
- [x] Interface configuration IA (OpenAI, Anthropic, Google)

### Landing Page

- [x] Page publique / avec hero section
- [x] Features grid (6 features)
- [x] CTA section + Footer
- [x] Design glassmorphism moderne

## ✅ Phase 3: Google My Business Integration (COMPLETED)

### Google API Integration

- [x] GoogleMyBusinessService (production)
- [x] fetchReviews implementation
- [x] publishResponse implementation (PATCH API)
- [x] API Key encryption service
- [x] Store API key configuration

### Review Management

- [x] Page /dashboard/reviews
- [x] Liste des avis avec filtres
- [x] Génération réponse IA
- [x] Publication réponse Google
- [x] RespondToReview use case enrichi

## 🔄 Phase 4: Lottery System (EN COURS)

### Core Entities

- [ ] Prize entity (distinct de PrizeTemplate)
- [ ] Campaign entity avec status workflow
- [ ] Participant entity
- [ ] LotteryDraw entity

### Participant Workflow

- [ ] Vérification email → review Google
- [ ] Système d'éligibilité loterie
- [ ] Validation automatique des avis
- [ ] Attribution des tickets

### Game Types

- [ ] Roulette virtuelle
- [ ] Carte à gratter
- [ ] Tirage au sort classique
- [ ] Game engine avec probabilités

### QR Code System

- [ ] Génération QR codes par commerce
- [ ] Landing page scan QR
- [ ] Tracking participations
- [ ] Analytics QR codes

## 🔮 Phase 5: Campaign Builder (À VENIR)

### Campaign Creation

- [ ] Wizard multi-étapes
- [ ] Configuration prizes & probabilités
- [ ] Sélection type de jeu
- [ ] Période & conditions

### Campaign Management

- [ ] Dashboard campagnes actives
- [ ] Pause/Resume/Stop
- [ ] Édition campagnes
- [ ] Duplication template

### Analytics & Reporting

- [ ] Stats campagnes en temps réel
- [ ] Taux participation
- [ ] ROI calculator
- [ ] Export reports CSV/PDF

## 🎯 Phase 6: Advanced Features (FUTUR)

### Multi-tenancy

- [ ] Isolation données par tenant
- [ ] Plans & Subscriptions (Stripe)
- [ ] Limites par plan
- [ ] Billing management

### Notifications

- [ ] Email notifications (winners, new reviews)
- [ ] SMS notifications (optionnel)
- [ ] Push notifications web
- [ ] Notification preferences

### Advanced Analytics

- [ ] Dashboard analytics avancé
- [ ] Comparaison campagnes
- [ ] Prédictions IA
- [ ] A/B testing campaigns

### Mobile App

- [ ] React Native app (iOS/Android)
- [ ] QR code scanner natif
- [ ] Push notifications
- [ ] Offline mode

## 📋 Backlog Technique

### Tests

- [ ] Tests E2E avec Playwright
- [ ] Coverage >80% sur core use cases
- [ ] Tests d'intégration API
- [ ] Load testing

### Performance

- [ ] Optimisation bundle size
- [ ] Image optimization
- [ ] Caching strategy (Redis)
- [ ] CDN setup

### Security

- [ ] Security audit
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Input sanitization audit

### DevOps

- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Staging environment
- [ ] Monitoring (Sentry)
- [ ] Logs aggregation

---

## Notes de développement

### Tâches immédiates (Next Sprint)

1. Tester publication réponses avec vrai commerce Google
2. Implémenter Prize entity
3. Créer Participant workflow
4. Système QR Code pour commerces
5. Campaign Builder wizard

### Décisions techniques importantes

- MenuPermission: Config en mémoire → Migration BD prévue
- Google API: Utilise Business Profile API (post-2021)
- AI Services: Support multi-provider (OpenAI, Anthropic, Google)
- State management: Zustand (prévu, pas encore utilisé)

### Points d'attention

- ⚠️ Google API publishResponse non testée en production
- ⚠️ MenuPermission model créé mais migration BD non effectuée
- ⚠️ AI Config UI créée mais intégration backend manquante
- ⚠️ Plans & subscriptions UI présent mais logique manquante
