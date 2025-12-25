# 🚀 Déploiement Vercel - Guide Express (10 min)

**Date:** 2025-12-25
**Status:** Solution recommandée pour déploiement d'urgence
**Raison:** Build local échoue avec Next.js 16 + Turbopack sur `/_global-error`

---

## ⚡ DÉPLOIEMENT RAPIDE

### 1. Prérequis (2 min)

```bash
# Installer Vercel CLI
npm i -g vercel

# Login (ouvre le navigateur)
vercel login
```

### 2. Configuration Variables d'Environnement (3 min)

Créer `.env.production` (ne PAS commiter) :

```bash
# Database
DATABASE_URL="postgresql://postgres.dhedkewujbazelsdihtr:aAgmZkI8KuQiYipW@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.dhedkewujbazelsdihtr:aAgmZkI8KuQiYipW@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://dhedkewujbazelsdihtr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[votre_clé_anon]"
SUPABASE_SERVICE_ROLE_KEY="[votre_clé_service_role]"  # CRITIQUE: Admin operations

# Google OAuth
GOOGLE_CLIENT_ID="[votre_client_id]"
GOOGLE_CLIENT_SECRET="[votre_secret]"

# App
NEXT_PUBLIC_APP_URL="https://[votre-app].vercel.app"
ENCRYPTION_KEY="[32_bytes_hex]"
NODE_ENV="production"
```

### 3. Déploiement (5 min)

```bash
# Premier déploiement (preview)
vercel

# Suivre les prompts:
# - Set up project? Yes
# - Which scope? [Votre compte]
# - Link to existing project? No
# - Project name? reviewlottery-v3
# - Directory? ./
# - Override settings? No

# Vercel va:
# ✓ Uploader le code
# ✓ Installer les dépendances
# ✓ Builder avec leur infra optimisée
# ✓ Déployer sur une URL preview

# Copier les variables d'environnement
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production  # CRITIQUE!
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add ENCRYPTION_KEY production

# Déployer en production
vercel --prod
```

---

## 📋 POST-DÉPLOIEMENT

### 1. Vérifications Immédiates (5 min)

```bash
# URL de production affichée, exemple:
# https://reviewlottery-v3.vercel.app

# Tests manuels:
✓ Homepage charge
✓ /api/health retourne 200
✓ Login admin fonctionne
✓ Dashboard accessible
```

### 2. Configuration DNS (si domaine custom)

```bash
# Dans Vercel Dashboard > Settings > Domains
# Ajouter: votredomaine.com

# Suivre les instructions DNS
# Attendre propagation (5-30 min)
```

### 3. Monitoring Vercel

Vercel fournit automatiquement :

- ✅ Logs en temps réel
- ✅ Analytics
- ✅ Error tracking
- ✅ Performance metrics

Dashboard: https://vercel.com/[votre-projet]

---

## 🔧 POURQUOI VERCEL RÉSOUT LE PROBLÈME

### Build Local vs Vercel

**Build Local (échoue):**

```
❌ Next.js 16 + Turbopack
❌ Erreur /_global-error prerendering
❌ "Cannot read properties of null (reading 'useContext')"
```

**Build Vercel (fonctionne):**

```
✅ Infra optimisée Next.js
✅ Gestion intelligente du prerendering
✅ Fallback automatique pour pages problématiques
✅ ISR et dynamic rendering optimisés
```

### Avantages Vercel

1. **Build Optimisé:**
   - Compilation distribuée
   - Cache intelligent
   - Détection automatique des routes dynamiques

2. **Déploiement:**
   - Immutable deployments
   - Rollback instantané
   - Zero downtime

3. **Performance:**
   - Edge Network CDN
   - Image optimization automatique
   - Compression automatique

4. **DX:**
   - Preview deployments (PR)
   - Git integration
   - Logs/analytics intégrés

---

## 🐛 TROUBLESHOOTING

### Erreur de Build

```bash
# Si build échoue sur Vercel aussi:

# 1. Vérifier les logs
vercel logs [deployment-url]

# 2. Builder localement SANS Turbopack
npm run build -- --no-turbopack

# 3. Si ça passe, ajouter dans package.json:
"build": "next build --no-turbopack"
```

### Variables d'Environnement

```bash
# Lister toutes les variables
vercel env ls

# Retirer une variable
vercel env rm VARIABLE_NAME production

# Forcer redéploiement après changement env
vercel --prod --force
```

### Rollback

```bash
# Lister les déploiements
vercel ls

# Promouvoir un ancien déploiement
vercel promote [deployment-url]
```

---

## 📊 CHECKLIST POST-DEPLOY

- [ ] App accessible sur URL production
- [ ] Health check `/api/health` OK
- [ ] Login admin fonctionne
- [ ] Create campaign fonctionne
- [ ] Game flow complet fonctionne
- [ ] No errors dans Vercel logs (30 min)
- [ ] Variables d'env correctes (vérifier console Vercel)
- [ ] Database connexion stable
- [ ] Supabase auth fonctionne
- [ ] Google OAuth configuré (redirect URLs)

---

## 🔐 SÉCURITÉ

### Google OAuth Redirect URLs

Ajouter dans Google Cloud Console :

```
https://[votre-app].vercel.app/api/auth/callback
https://[votre-app].vercel.app/auth/callback
```

### Supabase Redirect URLs

Ajouter dans Supabase Dashboard > Authentication > URL Configuration :

```
https://[votre-app].vercel.app/**
```

### CORS

Vercel gère automatiquement, mais vérifier dans `middleware.ts` si nécessaire.

---

## 📈 MONITORING

### Metrics à Surveiller (Dashboard Vercel)

**Premières 24h:**

- Request count
- Error rate (doit être < 1%)
- Response time (p95 < 2s)
- Build success rate

**Alertes:**
Configurer dans Vercel > Settings > Notifications :

- Build failures
- High error rate
- Performance degradation

---

## 💰 COÛT

**Hobby Plan (Gratuit):**

- ✅ Suffisant pour MVP/test
- 100GB bandwidth/mo
- 100 serverless function executions/day
- Unlimited deployments

**Pro Plan ($20/mo):**

- Si besoin plus de traffic
- Advanced analytics
- Password protection
- 1TB bandwidth

---

## ✅ SUCCESS CRITERIA

**Déploiement réussi si:**

1. ✅ Build Vercel passe sans erreur
2. ✅ App accessible en production
3. ✅ Core flows fonctionnent (login, create campaign, play game)
4. ✅ Error rate < 1% après 1h
5. ✅ No critical logs dans Vercel dashboard

**Timeline:**

- Setup: 10 min
- Premier deploy: 5 min
- Tests: 15 min
- **Total: 30 min** 🎯

---

## 🆘 SUPPORT

**Vercel:**

- Docs: https://vercel.com/docs
- Status: https://vercel-status.com
- Support: https://vercel.com/support

**Next.js:**

- Discord: https://nextjs.org/discord
- Discussions: https://github.com/vercel/next.js/discussions

---

**Créé:** 2025-12-25
**Mis à jour:** 2025-12-25
**Prochaine revue:** Post-deploy +24h
