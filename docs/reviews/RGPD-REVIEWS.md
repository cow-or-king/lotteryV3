# Documentation RGPD - Gestion des Avis Google

## 📋 Vue d'ensemble

Cette documentation détaille la conformité RGPD pour la gestion des avis Google dans ReviewLottery v3.

---

## 🔒 Données Personnelles Collectées

### 1. Données des Avis Google

**Origine:** Synchronisation depuis Google My Business API

**Données stockées:**

- `authorName` - Nom public de l'auteur de l'avis
- `authorEmail` - Email (optionnel, uniquement si fourni par Google)
- `rating` - Note sur 5 étoiles
- `comment` - Texte de l'avis
- `reviewUrl` - URL publique de l'avis sur Google
- `publishedAt` - Date de publication
- `googleReviewId` - Identifiant Google (technique)

**Base légale:** Intérêt légitime

- Les avis Google sont publics par nature
- Traitement nécessaire pour le fonctionnement du service
- L'email n'est utilisé que si l'utilisateur participe volontairement à la loterie

### 2. Données de Participation à la Loterie

**Origine:** Formulaire de participation volontaire

**Données stockées:**

- Email du participant (lié à l'avis)
- `isVerified` - Flag de vérification d'avis
- `participantId` - Lien avec l'entité Participant

**Base légale:** Consentement explicite

- Participation volontaire à la loterie
- Consentement requis avant participation
- Révocable à tout moment

---

## ⏰ Conservation des Données

### Politique de Rétention - 3 ans

**Durée de conservation:** 3 ans maximum à partir de la date de publication de l'avis

**Justification:**

- Durée cohérente avec les obligations légales de preuve
- Permet l'analyse des tendances sur le long terme
- Conforme aux recommandations CNIL

**Mécanisme de suppression automatique:**

```typescript
// Prisma Migration - Ajout d'une tâche CRON
// À exécuter mensuellement
DELETE FROM "Review"
WHERE "publishedAt" < NOW() - INTERVAL '3 years';
```

**Implémentation recommandée:**

1. Créer une tâche CRON (Vercel Cron Jobs ou similaire)
2. Exécuter tous les 1er du mois
3. Logger les suppressions pour audit
4. Notifier les propriétaires de commerces si nécessaire

---

## 🔐 Sécurité des Données

### 1. Chiffrement des API Keys

**Méthode:** AES-256-GCM

```typescript
// Implémentation dans ApiKeyEncryptionService
- Chiffrement avant stockage en base
- Déchiffrement uniquement lors de l'utilisation
- Clé de chiffrement en variable d'environnement (ENCRYPTION_KEY)
```

**Rotation des clés:**

- Recommandation: Rotation annuelle
- Process: Déchiffrer avec ancienne clé, rechiffrer avec nouvelle

### 2. Accès aux Données

**Contrôles d'accès:**

- Authentification Supabase requise
- Vérification ownership (Store → Brand → User)
- Pas d'accès cross-tenant possible

```typescript
// Exemple de vérification dans les routers
const store = await prisma.store.findUnique({
  where: { id: input.storeId },
  include: { brand: true },
});

if (store.brand.ownerId !== ctx.user.id) {
  throw new TRPCError({ code: 'FORBIDDEN' });
}
```

### 3. Logs et Audit

**Événements tracés:**

- Synchronisation d'avis (timestamp, storeId, nombre d'avis)
- Réponses publiées (timestamp, reviewId, userId)
- Suppressions manuelles d'avis

**Rétention des logs:** 1 an

---

## 👤 Droits des Personnes Concernées

### 1. Droit d'Accès

**Processus:**

1. Utilisateur contacte le support
2. Vérification identité (email + preuve)
3. Export des données en format JSON

**Données fournies:**

```json
{
  "reviews": [
    {
      "authorName": "...",
      "rating": 5,
      "comment": "...",
      "publishedAt": "...",
      "hasResponse": true,
      "responseContent": "...",
      "isVerified": false
    }
  ]
}
```

### 2. Droit de Rectification

**Limitation:** Les avis proviennent de Google

- Impossibilité de modifier les avis Google directement
- Redirection vers Google My Business pour modifications
- Synchronisation automatique après modification sur Google

### 3. Droit à l'Effacement

**Processus:**

1. Demande de suppression via support
2. Vérification légitimité (auteur de l'avis uniquement)
3. Suppression en base de données
4. Confirmation envoyée sous 48h

**Code de suppression:**

```typescript
await prisma.review.delete({
  where: { id: reviewId },
});
```

**Note:** L'avis reste sur Google, seule la copie locale est supprimée

### 4. Droit d'Opposition

**Application:**

- Opposition à l'utilisation pour la loterie: simple (flag `isVerified = false`)
- Opposition au stockage: suppression complète de l'avis local

### 5. Droit à la Portabilité

**Format d'export:** JSON
**Délai:** Sous 30 jours
**Mécanisme:** Export manuel via script ou UI admin (à implémenter)

---

## 📢 Information des Utilisateurs

### 1. Politique de Confidentialité

**Sections requises:**

- Nature des données collectées
- Finalités du traitement
- Base légale
- Durée de conservation (3 ans)
- Droits des personnes
- Contact DPO/responsable

**Emplacement:**

- Page `/legal/privacy` sur le site
- Lien dans le footer
- Mention lors de la participation à la loterie

### 2. Consentement Participation Loterie

**Formulaire obligatoire avant participation:**

```typescript
interface ConsentForm {
  email: string;
  acceptTerms: boolean; // Requis
  acceptDataProcessing: boolean; // Requis
  timestamp: Date;
}
```

**Texte du consentement:**

> "J'accepte que mon email soit utilisé pour vérifier mon éligibilité à la loterie et pour me contacter en cas de gain. Mes données seront conservées 3 ans maximum conformément au RGPD. Je peux retirer mon consentement à tout moment."

---

## 🌍 Transferts de Données

### 1. Google My Business API

**Localisation:** USA (Google Cloud)
**Mécanisme:** Clauses Contractuelles Types (SCCs)
**Protection:** TLS 1.3, OAuth 2.0

### 2. Supabase (Base de données)

**Localisation:** Configurable (recommandé: EU-West)
**Certification:** ISO 27001, SOC 2 Type II
**Chiffrement:** At-rest et in-transit

---

## 📝 Registre des Traitements

### Traitement 1: Gestion des Avis Google

| **Champ**                   | **Valeur**                                     |
| --------------------------- | ---------------------------------------------- |
| **Finalité**                | Affichage et gestion des avis clients          |
| **Base légale**             | Intérêt légitime                               |
| **Catégories de données**   | Identité (nom), avis (texte, note)             |
| **Catégories de personnes** | Clients ayant laissé un avis Google            |
| **Destinataires**           | Propriétaires de commerces uniquement          |
| **Transferts**              | Google (USA)                                   |
| **Durée de conservation**   | 3 ans                                          |
| **Mesures de sécurité**     | Authentification, chiffrement, accès restreint |

### Traitement 2: Loterie avec Vérification d'Avis

| **Champ**                   | **Valeur**                        |
| --------------------------- | --------------------------------- |
| **Finalité**                | Organisation de loteries clients  |
| **Base légale**             | Consentement                      |
| **Catégories de données**   | Email, statut de vérification     |
| **Catégories de personnes** | Participants volontaires          |
| **Destinataires**           | Propriétaires de commerces        |
| **Transferts**              | Aucun                             |
| **Durée de conservation**   | 3 ans ou retrait consentement     |
| **Mesures de sécurité**     | Consentement explicite, révocable |

---

## ✅ Checklist de Conformité

### Avant Mise en Production

- [ ] Politique de confidentialité publiée
- [ ] Mentions légales mises à jour
- [ ] Formulaire de consentement loterie implémenté
- [ ] Mécanisme suppression automatique 3 ans configuré
- [ ] ENCRYPTION_KEY configurée en production
- [ ] Logs audit activés
- [ ] Process droit d'accès documenté
- [ ] Process droit à l'effacement documenté
- [ ] Localisation Supabase en EU configurée
- [ ] Formation équipe support sur RGPD

### Maintenance Continue

- [ ] Revue annuelle de la politique de confidentialité
- [ ] Vérification mensuelle des suppressions automatiques
- [ ] Audit trimestriel des accès données
- [ ] Test annuel du process droit d'accès
- [ ] Veille réglementaire RGPD

---

## 📞 Contact

**Responsable du Traitement:**
[Nom de l'entreprise]
[Email de contact]

**DPO (si applicable):**
[Nom du DPO]
[Email DPO]

---

## 📚 Références

- [Règlement GDPR (UE) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [CNIL - Guide pratique](https://www.cnil.fr/fr/reglement-europeen-protection-donnees)
- [Google My Business API - Data Policy](https://developers.google.com/my-business/content/data-policy)

---

**Dernière mise à jour:** 2025-01-08
**Version:** 1.0
**Statut:** Draft - À valider par DPO/Juridique avant production
