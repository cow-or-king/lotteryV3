# 📊 Monitoring Setup - Production

**Objectif:** Surveillance minimale mais efficace pour déploiement rapide

---

## 🎯 METRICS CRITIQUES

### 1. Application Health

```typescript
// Créer: src/app/api/health/route.ts
export async function GET() {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      database: 'connected',
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 },
    );
  }
}
```

### 2. Error Tracking (Console logs minimum)

```typescript
// middleware.ts - Ajouter logging
export function middleware(request: NextRequest) {
  const start = Date.now();

  // ... existing code ...

  const duration = Date.now() - start;
  if (duration > 2000) {
    console.warn(`[SLOW REQUEST] ${request.url} - ${duration}ms`);
  }
}
```

---

## 📈 LOGS À SURVEILLER

### Console Output

```bash
# Dans les logs, surveiller:
✓ [ERROR] - Toute erreur
✓ [SLOW REQUEST] - Requêtes >2s
✓ [AUTH] - Échecs d'authentification
✓ [DB] - Erreurs base de données
```

### Patterns critiques

```
ALERT si détecté:
• "ECONNREFUSED" - DB déconnectée
• "UNAUTHORIZED" en masse - Auth cassée
• "Out of memory" - Problème ressources
• 500 errors répétés - Bug critique
```

---

## 🔔 ALERTS MANUELS (First 24h)

### Check toutes les 2h

```bash
# 1. Error rate
grep -i error /var/log/app.log | wc -l
# Si > 50/heure → Investiguer

# 2. Performance
# Tester homepage response time
time curl https://[domain].com
# Si > 3s → Investiguer

# 3. Database
# Vérifier connexions actives
SELECT count(*) FROM pg_stat_activity;
# Si > 50 → Possible leak
```

---

## 📊 DASHBOARD SIMPLE

### Google Sheets Tracking (Quick Win)

```
Colonnes:
- Timestamp
- Metric (errors, response_time, users)
- Value
- Status (🟢 🟡 🔴)
- Notes

Mise à jour: Toutes les 2h premiers jours
```

---

## 🚨 RESPONSE PLAN

### Severity Levels

**🔴 CRITICAL (Rollback immédiat)**

- App inaccessible >5 min
- > 50% utilisateurs impactés
- Data corruption détectée
- Security breach

**🟡 HIGH (Fix dans 1h)**

- Error rate >5%
- Performance degraded >50%
- Feature critique cassée
- <50% utilisateurs impactés

**🟢 MEDIUM (Fix dans 24h)**

- Error rate 1-5%
- Feature non-critique cassée
- Performance degraded 20-50%
- UI issues

**⚪ LOW (Fix prochain sprint)**

- Error rate <1%
- Minor UI bugs
- Non-critical features

---

## 📞 ESCALATION PATH

```
Level 1: Developer (auto-handle)
↓ (pas résolu en 30 min)
Level 2: Team Lead
↓ (pas résolu en 1h)
Level 3: CTO / Rollback decision
```

---

## 🛠️ OUTILS RECOMMANDÉS (Optional)

### Free Tier

- **Sentry:** Error tracking (5k errors/mo free)
- **Vercel Analytics:** Built-in si Vercel
- **Uptime Robot:** Uptime monitoring (50 monitors free)
- **LogRocket:** Session replay (1k sessions/mo free)

### Quick Setup Sentry

```bash
npm install @sentry/nextjs

# sentry.client.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

---

## 📝 DAILY LOG TEMPLATE

```markdown
## Monitoring Log - [DATE]

### Status: 🟢 / 🟡 / 🔴

#### Metrics (Last 24h)

- Total Requests: X
- Error Rate: X%
- Avg Response Time: Xms
- Unique Users: X

#### Issues Detected

1. [Issue description]
   - Severity: 🔴🟡🟢
   - Impact: X users
   - Status: [Investigating/Fixed/Monitoring]

#### Actions Taken

- [Action 1]
- [Action 2]

#### Next 24h Focus

- [ ] Monitor X
- [ ] Fix Y
- [ ] Test Z
```

---

## 🎯 SUCCESS METRICS (First Week)

### Must Achieve

- ✅ Uptime >99%
- ✅ Error rate <1%
- ✅ Response time <2s (p95)
- ✅ Zero critical incidents
- ✅ Zero data loss

### Nice to Have

- ⭐ Uptime >99.9%
- ⭐ Error rate <0.5%
- ⭐ Response time <1s (p95)
- ⭐ User satisfaction >90%

---

## 🔄 WEEKLY REVIEW

```markdown
### Week [X] Review

#### Uptime: X%

#### Total Errors: X

#### Top 3 Issues:

1. [Issue] - [Status]
2. [Issue] - [Status]
3. [Issue] - [Status]

#### Improvements Made:

- [Improvement 1]
- [Improvement 2]

#### Next Week Focus:

- [ ] Objective 1
- [ ] Objective 2
```

---

**Setup Time:** 30 min
**Maintenance:** 30 min/day first week, then 1h/week
**Tools Cost:** $0 (using free tiers)

**Start Date:** [DATE]
**Review Date:** +7 days
