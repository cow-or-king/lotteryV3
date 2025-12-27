# PRD : Intégration Google Business Profile Reviews

## Contexte

Application Next.js existante avec Supabase (PostgreSQL) en architecture multi-tenant.

### Structure des rôles existante

- **Super-admin** : Propriétaire de la plateforme, accès à tous les tenants
- **Admin** : Client/Commerce, accès uniquement à son tenant

### Objectif

Permettre aux admins (commerces) de :

1. Connecter leur compte Google Business Profile via OAuth
2. Visualiser leurs avis Google dans l'application
3. Répondre aux avis directement depuis l'application
4. Recevoir des notifications pour les nouveaux avis

---

## Stack technique

- **Framework** : Next.js (App Router)
- **Base de données** : Supabase (PostgreSQL)
- **Auth existante** : Supabase Auth
- **Styling** : Tailwind CSS (pas de shadcn/ui)
- **API Google** : Google Business Profile API v4

---

## 1. Configuration Google Cloud (Prérequis)

### 1.1 Projet Google Cloud

```
Projet : [NOM_APP]-production
APIs à activer :
- Google My Business API
- Google My Business Account Management API
- Google My Business Business Information API
- Google My Business Verifications API
- Google My Business Lodging API
- Google My Business Notifications API
- Google My Business Q&A API
- Google My Business Performance API
```

### 1.2 OAuth Consent Screen

```
Type : External
Scopes requis :
- https://www.googleapis.com/auth/business.manage
```

### 1.3 Credentials OAuth 2.0

```
Type : Web Application
Authorized redirect URIs :
- https://[DOMAIN]/api/auth/callback/google-business
- http://localhost:3000/api/auth/callback/google-business (dev)
```

### 1.4 Variables d'environnement à ajouter

```env
# Google Business Profile API
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=https://[DOMAIN]/api/auth/callback/google-business

# Encryption key pour les tokens (générer avec: openssl rand -base64 32)
TOKENS_ENCRYPTION_KEY=xxxxx
```

---

## 2. Schema Base de Données (Supabase)

### 2.1 Table : google_business_connections

Stocke la connexion OAuth de chaque tenant avec Google Business.

```sql
CREATE TABLE google_business_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Infos compte Google
  google_account_id VARCHAR(255) NOT NULL,
  google_email VARCHAR(255),

  -- Tokens OAuth (chiffrés)
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,

  -- Scopes accordés
  granted_scopes TEXT[],

  -- Metadata
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  sync_status VARCHAR(50) DEFAULT 'pending', -- pending, syncing, success, error
  sync_error TEXT,

  -- Constraints
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id),
  UNIQUE(google_account_id)
);

-- Index
CREATE INDEX idx_gbc_tenant ON google_business_connections(tenant_id);
CREATE INDEX idx_gbc_sync_status ON google_business_connections(sync_status);

-- RLS
ALTER TABLE google_business_connections ENABLE ROW LEVEL SECURITY;

-- Policy : Super-admin voit tout
CREATE POLICY "super_admin_all_access" ON google_business_connections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Policy : Admin voit uniquement son tenant
CREATE POLICY "admin_own_tenant" ON google_business_connections
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users
      WHERE users.id = auth.uid()
    )
  );
```

### 2.2 Table : google_business_locations

Stocke les fiches Google Business liées à chaque connexion.

```sql
CREATE TABLE google_business_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES google_business_connections(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identifiants Google
  google_location_id VARCHAR(255) NOT NULL, -- Format: locations/xxxxx
  google_account_id VARCHAR(255) NOT NULL,  -- Format: accounts/xxxxx

  -- Infos de la fiche
  name VARCHAR(500) NOT NULL,
  store_code VARCHAR(100),
  address_formatted TEXT,
  phone_number VARCHAR(50),
  website_url TEXT,

  -- Stats
  average_rating DECIMAL(2,1),
  total_reviews INTEGER DEFAULT 0,

  -- Statut
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE, -- Pour désactiver sans supprimer

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(google_location_id)
);

-- Index
CREATE INDEX idx_gbl_tenant ON google_business_locations(tenant_id);
CREATE INDEX idx_gbl_connection ON google_business_locations(connection_id);
CREATE INDEX idx_gbl_active ON google_business_locations(is_active) WHERE is_active = TRUE;

-- RLS (même logique que google_business_connections)
ALTER TABLE google_business_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_all_access" ON google_business_locations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "admin_own_tenant" ON google_business_locations
  FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users
      WHERE users.id = auth.uid()
    )
  );
```

### 2.3 Table : google_reviews

Stocke les avis synchronisés.

```sql
CREATE TABLE google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES google_business_locations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identifiant Google
  google_review_id VARCHAR(255) NOT NULL,

  -- Contenu de l'avis
  reviewer_name VARCHAR(255),
  reviewer_photo_url TEXT,
  reviewer_is_anonymous BOOLEAN DEFAULT FALSE,
  star_rating INTEGER NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
  comment TEXT,

  -- Dates Google
  google_created_at TIMESTAMPTZ NOT NULL,
  google_updated_at TIMESTAMPTZ,

  -- Réponse
  reply_comment TEXT,
  reply_updated_at TIMESTAMPTZ,
  reply_status VARCHAR(50), -- null, draft, published, failed

  -- Metadata interne
  is_read BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  internal_notes TEXT,

  -- Sync
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(google_review_id)
);

-- Index
CREATE INDEX idx_gr_tenant ON google_reviews(tenant_id);
CREATE INDEX idx_gr_location ON google_reviews(location_id);
CREATE INDEX idx_gr_rating ON google_reviews(star_rating);
CREATE INDEX idx_gr_created ON google_reviews(google_created_at DESC);
CREATE INDEX idx_gr_unread ON google_reviews(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_gr_unreplied ON google_reviews(reply_comment) WHERE reply_comment IS NULL;

-- RLS
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_all_access" ON google_reviews
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "admin_own_tenant" ON google_reviews
  FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users
      WHERE users.id = auth.uid()
    )
  );
```

### 2.4 Table : google_reviews_sync_logs

Log des synchronisations pour debug et monitoring.

```sql
CREATE TABLE google_reviews_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES google_business_connections(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,

  sync_type VARCHAR(50) NOT NULL, -- manual, scheduled, webhook
  status VARCHAR(50) NOT NULL, -- started, success, partial, error

  reviews_fetched INTEGER DEFAULT 0,
  reviews_created INTEGER DEFAULT 0,
  reviews_updated INTEGER DEFAULT 0,

  error_message TEXT,
  error_details JSONB,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- Index
CREATE INDEX idx_grsl_tenant ON google_reviews_sync_logs(tenant_id);
CREATE INDEX idx_grsl_status ON google_reviews_sync_logs(status);
CREATE INDEX idx_grsl_date ON google_reviews_sync_logs(started_at DESC);

-- Auto-cleanup des vieux logs (garder 30 jours)
-- À configurer via Supabase cron ou pg_cron
```

### 2.5 Fonction : Mise à jour automatique updated_at

```sql
-- Trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer aux tables
CREATE TRIGGER update_google_business_connections_updated_at
  BEFORE UPDATE ON google_business_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_business_locations_updated_at
  BEFORE UPDATE ON google_business_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_reviews_updated_at
  BEFORE UPDATE ON google_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. Architecture API Routes

### 3.1 Structure des fichiers

```
app/
├── api/
│   └── google-business/
│       ├── auth/
│       │   ├── connect/
│       │   │   └── route.ts          # GET: Initie OAuth flow
│       │   ├── callback/
│       │   │   └── route.ts          # GET: Callback OAuth
│       │   └── disconnect/
│       │       └── route.ts          # POST: Déconnexion
│       ├── locations/
│       │   ├── route.ts              # GET: Liste les locations
│       │   └── [locationId]/
│       │       └── route.ts          # GET: Détails location
│       ├── reviews/
│       │   ├── route.ts              # GET: Liste les avis
│       │   ├── [reviewId]/
│       │   │   ├── route.ts          # GET: Détail avis
│       │   │   └── reply/
│       │   │       └── route.ts      # POST: Répondre, PUT: Modifier, DELETE: Supprimer
│       │   └── sync/
│       │       └── route.ts          # POST: Force sync manuel
│       └── webhook/
│           └── route.ts              # POST: Webhook notifications Google
```

### 3.2 Route : Initier connexion OAuth

```typescript
// app/api/google-business/auth/connect/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Vérifier authentification et récupérer tenant_id
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Récupérer le tenant_id de l'utilisateur
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Vérifier que l'utilisateur est admin ou super_admin
  if (!['admin', 'super_admin'].includes(userData.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  // Générer state token (contient tenant_id chiffré pour le callback)
  const state = Buffer.from(
    JSON.stringify({
      tenant_id: userData.tenant_id,
      user_id: user.id,
      timestamp: Date.now(),
    }),
  ).toString('base64url');

  // Générer URL d'autorisation Google
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent', // Force le refresh token
    include_granted_scopes: true,
  });

  return NextResponse.json({ authUrl });
}
```

### 3.3 Route : Callback OAuth

```typescript
// app/api/google-business/auth/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { google } from 'googleapis';
import { encrypt } from '@/lib/encryption';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // URL de redirection après traitement
  const baseRedirectUrl = '/dashboard/settings/integrations';

  if (error) {
    return NextResponse.redirect(new URL(`${baseRedirectUrl}?error=${error}`, request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL(`${baseRedirectUrl}?error=missing_params`, request.url));
  }

  try {
    // Décoder state
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    const { tenant_id, user_id } = stateData;

    // Vérifier que le state n'est pas trop vieux (15 min max)
    if (Date.now() - stateData.timestamp > 15 * 60 * 1000) {
      return NextResponse.redirect(new URL(`${baseRedirectUrl}?error=state_expired`, request.url));
    }

    // Échanger le code contre les tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Récupérer les infos du compte Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    // Chiffrer les tokens avant stockage
    const accessTokenEncrypted = encrypt(tokens.access_token!);
    const refreshTokenEncrypted = encrypt(tokens.refresh_token!);

    const supabase = createClient();

    // Upsert la connexion
    const { data: connection, error: dbError } = await supabase
      .from('google_business_connections')
      .upsert(
        {
          tenant_id,
          google_account_id: googleUser.id,
          google_email: googleUser.email,
          access_token_encrypted: accessTokenEncrypted,
          refresh_token_encrypted: refreshTokenEncrypted,
          token_expires_at: new Date(tokens.expiry_date!).toISOString(),
          granted_scopes: tokens.scope?.split(' ') || [],
          connected_at: new Date().toISOString(),
          sync_status: 'pending',
        },
        {
          onConflict: 'tenant_id',
        },
      )
      .select()
      .single();

    if (dbError) {
      console.error('DB Error:', dbError);
      return NextResponse.redirect(new URL(`${baseRedirectUrl}?error=db_error`, request.url));
    }

    // Déclencher la sync initiale des locations (async)
    // On ne bloque pas le redirect, la sync se fait en background
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/google-business/locations/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id: connection.id }),
    }).catch(console.error);

    return NextResponse.redirect(new URL(`${baseRedirectUrl}?success=connected`, request.url));
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.redirect(new URL(`${baseRedirectUrl}?error=oauth_failed`, request.url));
  }
}
```

### 3.4 Route : Liste des avis

```typescript
// app/api/google-business/reviews/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const searchParams = request.nextUrl.searchParams;

  // Paramètres de filtrage
  const locationId = searchParams.get('location_id');
  const rating = searchParams.get('rating');
  const replied = searchParams.get('replied');
  const isRead = searchParams.get('is_read');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sortBy = searchParams.get('sort_by') || 'google_created_at';
  const sortOrder = searchParams.get('sort_order') || 'desc';

  // Vérifier authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Construire la requête
  let query = supabase.from('google_reviews').select(
    `
      *,
      location:google_business_locations(
        id,
        name,
        google_location_id
      )
    `,
    { count: 'exact' },
  );

  // Filtres
  if (locationId) {
    query = query.eq('location_id', locationId);
  }
  if (rating) {
    query = query.eq('star_rating', parseInt(rating));
  }
  if (replied === 'true') {
    query = query.not('reply_comment', 'is', null);
  } else if (replied === 'false') {
    query = query.is('reply_comment', null);
  }
  if (isRead === 'true') {
    query = query.eq('is_read', true);
  } else if (isRead === 'false') {
    query = query.eq('is_read', false);
  }

  // Tri et pagination
  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range((page - 1) * limit, page * limit - 1);

  const { data: reviews, count, error } = await query;

  if (error) {
    console.error('Query Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }

  return NextResponse.json({
    reviews,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
```

### 3.5 Route : Répondre à un avis

```typescript
// app/api/google-business/reviews/[reviewId]/reply/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleBusinessClient } from '@/lib/google-business';

export async function POST(request: NextRequest, { params }: { params: { reviewId: string } }) {
  const supabase = createClient();
  const { reviewId } = params;
  const { comment } = await request.json();

  if (!comment || comment.trim().length === 0) {
    return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
  }

  // Vérifier authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Récupérer l'avis avec sa location et connection
  const { data: review, error: reviewError } = await supabase
    .from('google_reviews')
    .select(
      `
      *,
      location:google_business_locations(
        *,
        connection:google_business_connections(*)
      )
    `,
    )
    .eq('id', reviewId)
    .single();

  if (reviewError || !review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  try {
    // Obtenir le client Google Business avec tokens rafraîchis
    const gbpClient = await getGoogleBusinessClient(review.location.connection);

    // Envoyer la réponse à Google
    const googleReviewName = `${review.location.google_account_id}/${review.location.google_location_id}/reviews/${review.google_review_id}`;

    await gbpClient.accounts.locations.reviews.updateReply({
      name: googleReviewName,
      requestBody: {
        comment: comment.trim(),
      },
    });

    // Mettre à jour en base
    const { data: updatedReview, error: updateError } = await supabase
      .from('google_reviews')
      .update({
        reply_comment: comment.trim(),
        reply_updated_at: new Date().toISOString(),
        reply_status: 'published',
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (updateError) {
      console.error('Update Error:', updateError);
      // La réponse a été envoyée à Google mais pas sauvée localement
      // On log l'erreur mais on retourne succès
    }

    return NextResponse.json({
      success: true,
      review: updatedReview || review,
    });
  } catch (error: any) {
    console.error('Google API Error:', error);

    // Sauvegarder comme draft si erreur Google
    await supabase
      .from('google_reviews')
      .update({
        reply_comment: comment.trim(),
        reply_status: 'failed',
        internal_notes: `Erreur Google: ${error.message}`,
      })
      .eq('id', reviewId);

    return NextResponse.json(
      { error: 'Failed to post reply to Google', details: error.message },
      { status: 500 },
    );
  }
}

// DELETE : Supprimer une réponse
export async function DELETE(request: NextRequest, { params }: { params: { reviewId: string } }) {
  const supabase = createClient();
  const { reviewId } = params;

  // Vérifier authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Récupérer l'avis
  const { data: review, error: reviewError } = await supabase
    .from('google_reviews')
    .select(
      `
      *,
      location:google_business_locations(
        *,
        connection:google_business_connections(*)
      )
    `,
    )
    .eq('id', reviewId)
    .single();

  if (reviewError || !review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  try {
    const gbpClient = await getGoogleBusinessClient(review.location.connection);

    const googleReviewName = `${review.location.google_account_id}/${review.location.google_location_id}/reviews/${review.google_review_id}`;

    await gbpClient.accounts.locations.reviews.deleteReply({
      name: googleReviewName,
    });

    // Mettre à jour en base
    await supabase
      .from('google_reviews')
      .update({
        reply_comment: null,
        reply_updated_at: null,
        reply_status: null,
      })
      .eq('id', reviewId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Google API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reply', details: error.message },
      { status: 500 },
    );
  }
}
```

### 3.6 Route : Synchronisation des avis

```typescript
// app/api/google-business/reviews/sync/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleBusinessClient } from '@/lib/google-business';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { location_id, force_full } = await request.json();

  // Vérifier authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Récupérer la location avec sa connection
  const { data: location, error: locationError } = await supabase
    .from('google_business_locations')
    .select(
      `
      *,
      connection:google_business_connections(*)
    `,
    )
    .eq('id', location_id)
    .single();

  if (locationError || !location) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }

  // Créer un log de sync
  const { data: syncLog } = await supabase
    .from('google_reviews_sync_logs')
    .insert({
      connection_id: location.connection.id,
      tenant_id: location.tenant_id,
      sync_type: 'manual',
      status: 'started',
    })
    .select()
    .single();

  const startTime = Date.now();
  let reviewsFetched = 0;
  let reviewsCreated = 0;
  let reviewsUpdated = 0;

  try {
    const gbpClient = await getGoogleBusinessClient(location.connection);

    const googleLocationName = `${location.google_account_id}/${location.google_location_id}`;

    // Récupérer tous les avis (avec pagination)
    let pageToken: string | undefined;
    const allReviews: any[] = [];

    do {
      const response = await gbpClient.accounts.locations.reviews.list({
        parent: googleLocationName,
        pageSize: 50,
        pageToken,
      });

      if (response.data.reviews) {
        allReviews.push(...response.data.reviews);
      }
      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    reviewsFetched = allReviews.length;

    // Upsert chaque avis
    for (const review of allReviews) {
      const reviewData = {
        location_id: location.id,
        tenant_id: location.tenant_id,
        google_review_id: review.reviewId,
        reviewer_name: review.reviewer?.displayName || 'Anonyme',
        reviewer_photo_url: review.reviewer?.profilePhotoUrl,
        reviewer_is_anonymous: review.reviewer?.isAnonymous || false,
        star_rating: convertStarRating(review.starRating),
        comment: review.comment || null,
        google_created_at: review.createTime,
        google_updated_at: review.updateTime,
        reply_comment: review.reviewReply?.comment || null,
        reply_updated_at: review.reviewReply?.updateTime || null,
        reply_status: review.reviewReply ? 'published' : null,
        last_synced_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from('google_reviews')
        .select('id')
        .eq('google_review_id', review.reviewId)
        .single();

      if (existing) {
        await supabase.from('google_reviews').update(reviewData).eq('id', existing.id);
        reviewsUpdated++;
      } else {
        await supabase.from('google_reviews').insert(reviewData);
        reviewsCreated++;
      }
    }

    // Mettre à jour les stats de la location
    const avgRating =
      allReviews.reduce((sum, r) => sum + convertStarRating(r.starRating), 0) / allReviews.length;

    await supabase
      .from('google_business_locations')
      .update({
        average_rating: avgRating.toFixed(1),
        total_reviews: allReviews.length,
      })
      .eq('id', location.id);

    // Mettre à jour le log de sync
    await supabase
      .from('google_reviews_sync_logs')
      .update({
        status: 'success',
        reviews_fetched: reviewsFetched,
        reviews_created: reviewsCreated,
        reviews_updated: reviewsUpdated,
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
      })
      .eq('id', syncLog?.id);

    // Mettre à jour la connection
    await supabase
      .from('google_business_connections')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_status: 'success',
        sync_error: null,
      })
      .eq('id', location.connection.id);

    return NextResponse.json({
      success: true,
      stats: {
        fetched: reviewsFetched,
        created: reviewsCreated,
        updated: reviewsUpdated,
        duration_ms: Date.now() - startTime,
      },
    });
  } catch (error: any) {
    console.error('Sync Error:', error);

    // Mettre à jour le log avec l'erreur
    await supabase
      .from('google_reviews_sync_logs')
      .update({
        status: 'error',
        error_message: error.message,
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
      })
      .eq('id', syncLog?.id);

    await supabase
      .from('google_business_connections')
      .update({
        sync_status: 'error',
        sync_error: error.message,
      })
      .eq('id', location.connection.id);

    return NextResponse.json({ error: 'Sync failed', details: error.message }, { status: 500 });
  }
}

// Helper pour convertir le rating Google
function convertStarRating(googleRating: string): number {
  const ratings: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return ratings[googleRating] || 0;
}
```

---

## 4. Librairies utilitaires

### 4.1 Client Google Business

```typescript
// lib/google-business.ts

import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';
import { decrypt, encrypt } from '@/lib/encryption';

interface GoogleConnection {
  id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  token_expires_at: string;
}

export async function getGoogleBusinessClient(connection: GoogleConnection) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  // Décrypter les tokens
  const accessToken = decrypt(connection.access_token_encrypted);
  const refreshToken = decrypt(connection.refresh_token_encrypted);

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: new Date(connection.token_expires_at).getTime(),
  });

  // Vérifier si le token est expiré
  const isExpired = new Date(connection.token_expires_at) < new Date();

  if (isExpired) {
    // Rafraîchir le token
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Mettre à jour en base
    const supabase = createClient();
    await supabase
      .from('google_business_connections')
      .update({
        access_token_encrypted: encrypt(credentials.access_token!),
        token_expires_at: new Date(credentials.expiry_date!).toISOString(),
      })
      .eq('id', connection.id);

    oauth2Client.setCredentials(credentials);
  }

  return google.mybusiness({ version: 'v4', auth: oauth2Client });
}
```

### 4.2 Encryption des tokens

```typescript
// lib/encryption.ts

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.TOKENS_ENCRYPTION_KEY!, 'base64');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

---

## 5. Composants UI

### 5.1 Structure des composants

```
components/
├── google-business/
│   ├── connect-button.tsx           # Bouton de connexion OAuth
│   ├── connection-status.tsx        # Statut de la connexion
│   ├── location-selector.tsx        # Sélecteur de fiche si plusieurs
│   ├── reviews-list.tsx             # Liste des avis
│   ├── review-card.tsx              # Card d'un avis
│   ├── review-reply-form.tsx        # Formulaire de réponse
│   ├── reviews-stats.tsx            # Stats (note moyenne, répartition)
│   ├── reviews-filters.tsx          # Filtres (note, répondu, date)
│   └── sync-button.tsx              # Bouton sync manuel
```

### 5.2 Composant : Bouton de connexion

```tsx
// components/google-business/connect-button.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner'; // ou votre système de toast

interface ConnectButtonProps {
  isConnected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function GoogleBusinessConnectButton({
  isConnected,
  onConnect,
  onDisconnect,
}: ConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/google-business/auth/connect');
      const { authUrl, error } = await response.json();

      if (error) {
        toast.error('Erreur lors de la connexion');
        return;
      }

      // Rediriger vers Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter votre compte Google Business ?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/google-business/auth/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Compte déconnecté');
        onDisconnect?.();
      } else {
        toast.error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <button
        onClick={handleDisconnect}
        disabled={isLoading}
        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        Déconnecter Google Business
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      Connecter Google Business
    </button>
  );
}
```

### 5.3 Composant : Liste des avis

```tsx
// components/google-business/reviews-list.tsx

'use client';

import { useState, useEffect } from 'react';
import { ReviewCard } from './review-card';
import { ReviewsFilters } from './reviews-filters';

interface ReviewsListProps {
  locationId?: string;
}

// Composant Skeleton simple
function ReviewSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function ReviewsList({ locationId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    rating: '',
    replied: '',
    isRead: '',
  });

  const fetchReviews = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(locationId && { location_id: locationId }),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.replied && { replied: filters.replied }),
        ...(filters.isRead && { is_read: filters.isRead }),
      });

      const response = await fetch(`/api/google-business/reviews?${params}`);
      const data = await response.json();

      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [locationId, filters]);

  const handleReplySuccess = (reviewId: string, reply: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, reply_comment: reply, reply_status: 'published' } : r,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReviewsFilters filters={filters} onChange={setFilters} />

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Aucun avis trouvé</div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReplySuccess={(reply) => handleReplySuccess(review.id, reply)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => fetchReviews(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => fetchReviews(pageNum)}
                      className={`w-10 h-10 text-sm rounded-lg transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {pagination.totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
              </div>

              <button
                onClick={() => fetchReviews(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

### 5.4 Composant : Card d'un avis

```tsx
// components/google-business/review-card.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReviewReplyForm } from './review-reply-form';

interface ReviewCardProps {
  review: {
    id: string;
    reviewer_name: string;
    reviewer_photo_url?: string;
    star_rating: number;
    comment?: string;
    google_created_at: string;
    reply_comment?: string;
    reply_updated_at?: string;
    is_read: boolean;
  };
  onReplySuccess: (reply: string) => void;
}

// Composant Star
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// Composant Dropdown simple
function Dropdown({ children, trigger }: { children: React.ReactNode; trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          {children}
        </div>
      )}
    </div>
  );
}

export function ReviewCard({ review, onReplySuccess }: ReviewCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const markAsRead = async () => {
    if (review.is_read) return;

    setIsMarkingRead(true);
    try {
      await fetch(`/api/google-business/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const initials = review.reviewer_name.charAt(0).toUpperCase();

  return (
    <div
      className={`bg-white rounded-lg border p-4 ${!review.is_read ? 'border-l-4 border-l-blue-600' : 'border-gray-200'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative w-10 h-10">
            {review.reviewer_photo_url ? (
              <img
                src={review.reviewer_photo_url}
                alt={review.reviewer_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                {initials}
              </div>
            )}
          </div>

          <div>
            <div className="font-medium text-gray-900">{review.reviewer_name}</div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} filled={i < review.star_rating} />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(review.google_created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Menu dropdown */}
        <Dropdown
          trigger={
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          }
        >
          {!review.is_read && (
            <button
              onClick={markAsRead}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Marquer comme lu
            </button>
          )}
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Signaler
          </button>
        </Dropdown>
      </div>

      {/* Commentaire */}
      {review.comment && <p className="mt-3 text-sm text-gray-700">{review.comment}</p>}

      {/* Réponse existante */}
      {review.reply_comment && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
              Votre réponse
            </span>
            {review.reply_updated_at && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(review.reply_updated_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{review.reply_comment}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {!review.reply_comment && !showReplyForm && (
          <button
            onClick={() => {
              setShowReplyForm(true);
              markAsRead();
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Répondre
          </button>
        )}
      </div>

      {/* Formulaire de réponse */}
      {showReplyForm && (
        <ReviewReplyForm
          reviewId={review.id}
          existingReply={review.reply_comment}
          onSuccess={(reply) => {
            onReplySuccess(reply);
            setShowReplyForm(false);
          }}
          onCancel={() => setShowReplyForm(false)}
        />
      )}
    </div>
  );
}
```

---

## 6. Pages

### 6.1 Structure des pages

```
app/
├── dashboard/
│   ├── reviews/
│   │   ├── page.tsx                 # Liste des avis
│   │   └── [reviewId]/
│   │       └── page.tsx             # Détail d'un avis (optionnel)
│   └── settings/
│       └── integrations/
│           └── page.tsx             # Page de connexion Google Business
```

### 6.2 Page : Paramètres intégrations

```tsx
// app/dashboard/settings/integrations/page.tsx

import { createClient } from '@/lib/supabase/server';
import { GoogleBusinessConnectButton } from '@/components/google-business/connect-button';
import { ConnectionStatus } from '@/components/google-business/connection-status';

export default async function IntegrationsPage() {
  const supabase = createClient();

  // Récupérer la connexion Google Business du tenant courant
  const { data: connection } = await supabase
    .from('google_business_connections')
    .select(
      `
      *,
      locations:google_business_locations(*)
    `,
    )
    .single();

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Intégrations</h1>
        <p className="text-gray-500">Connectez vos services externes</p>
      </div>

      {/* Card Google Business */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <svg className="h-8 w-8" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Google Business Profile</h2>
              <p className="text-sm text-gray-500">
                Synchronisez vos avis Google et répondez-y directement depuis l'application
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {connection ? (
            <ConnectionStatus connection={connection} />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Connectez votre compte Google Business pour :</p>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Voir tous vos avis Google en un seul endroit
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Répondre aux avis sans quitter l'application
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Recevoir des notifications pour les nouveaux avis
                </li>
              </ul>
            </div>
          )}

          <GoogleBusinessConnectButton isConnected={!!connection} />
        </div>
      </div>
    </div>
  );
}
```

### 6.3 Composant : Formulaire de réponse

```tsx
// components/google-business/review-reply-form.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ReviewReplyFormProps {
  reviewId: string;
  existingReply?: string;
  onSuccess: (reply: string) => void;
  onCancel: () => void;
}

export function ReviewReplyForm({
  reviewId,
  existingReply,
  onSuccess,
  onCancel,
}: ReviewReplyFormProps) {
  const [comment, setComment] = useState(existingReply || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error('Veuillez entrer une réponse');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/google-business/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'envoi");
      }

      toast.success('Réponse publiée avec succès');
      onSuccess(comment.trim());
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi de la réponse");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Écrivez votre réponse..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        disabled={isSubmitting}
      />

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {isSubmitting && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          Publier la réponse
        </button>
      </div>
    </form>
  );
}
```

### 6.4 Composant : Filtres des avis

```tsx
// components/google-business/reviews-filters.tsx

'use client';

interface ReviewsFiltersProps {
  filters: {
    rating: string;
    replied: string;
    isRead: string;
  };
  onChange: (filters: ReviewsFiltersProps['filters']) => void;
}

export function ReviewsFilters({ filters, onChange }: ReviewsFiltersProps) {
  const updateFilter = (key: keyof typeof filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filtre par note */}
      <select
        value={filters.rating}
        onChange={(e) => updateFilter('rating', e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Toutes les notes</option>
        <option value="5">5 étoiles</option>
        <option value="4">4 étoiles</option>
        <option value="3">3 étoiles</option>
        <option value="2">2 étoiles</option>
        <option value="1">1 étoile</option>
      </select>

      {/* Filtre répondu */}
      <select
        value={filters.replied}
        onChange={(e) => updateFilter('replied', e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Tous les avis</option>
        <option value="false">Non répondus</option>
        <option value="true">Répondus</option>
      </select>

      {/* Filtre lu/non lu */}
      <select
        value={filters.isRead}
        onChange={(e) => updateFilter('isRead', e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Tous</option>
        <option value="false">Non lus</option>
        <option value="true">Lus</option>
      </select>

      {/* Bouton reset */}
      {(filters.rating || filters.replied || filters.isRead) && (
        <button
          onClick={() => onChange({ rating: '', replied: '', isRead: '' })}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}
```

### 6.5 Composant : Statut de connexion

```tsx
// components/google-business/connection-status.tsx

'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConnectionStatusProps {
  connection: {
    google_email: string;
    connected_at: string;
    last_sync_at: string | null;
    sync_status: string;
    locations: any[];
  };
}

export function ConnectionStatus({ connection }: ConnectionStatusProps) {
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    syncing: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    success: 'Synchronisé',
    pending: 'En attente',
    syncing: 'Synchronisation...',
    error: 'Erreur',
  };

  return (
    <div className="space-y-4">
      {/* Compte connecté */}
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">Compte connecté</p>
            <p className="text-sm text-green-700">{connection.google_email}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[connection.sync_status as keyof typeof statusColors] || statusColors.pending}`}
        >
          {statusLabels[connection.sync_status as keyof typeof statusLabels] || 'Inconnu'}
        </span>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Connecté</span>
          <p className="font-medium text-gray-900">
            {formatDistanceToNow(new Date(connection.connected_at), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Dernière sync</span>
          <p className="font-medium text-gray-900">
            {connection.last_sync_at
              ? formatDistanceToNow(new Date(connection.last_sync_at), {
                  addSuffix: true,
                  locale: fr,
                })
              : 'Jamais'}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Fiches</span>
          <p className="font-medium text-gray-900">{connection.locations?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}
```

````

---

## 7. Cron Job : Synchronisation automatique

### 7.1 Via Supabase Edge Functions (recommandé)

```typescript
// supabase/functions/sync-google-reviews/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Vérifier que c'est bien un appel cron (via header secret)
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Récupérer toutes les connexions actives
  const { data: connections } = await supabase
    .from('google_business_connections')
    .select('id, tenant_id')
    .eq('sync_status', 'success')

  if (!connections) {
    return new Response(JSON.stringify({ synced: 0 }))
  }

  // Déclencher la sync pour chaque connexion
  const results = await Promise.allSettled(
    connections.map(conn =>
      fetch(`${Deno.env.get('APP_URL')}/api/google-business/reviews/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('INTERNAL_API_KEY')}`
        },
        body: JSON.stringify({ connection_id: conn.id })
      })
    )
  )

  const successful = results.filter(r => r.status === 'fulfilled').length

  return new Response(JSON.stringify({
    total: connections.length,
    synced: successful
  }))
})
````

### 7.2 Configuration cron Supabase

```sql
-- Dans Supabase Dashboard > Database > Extensions
-- Activer pg_cron

-- Planifier la sync toutes les heures
SELECT cron.schedule(
  'sync-google-reviews',
  '0 * * * *', -- Toutes les heures
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT_REF].supabase.co/functions/v1/sync-google-reviews',
    headers := '{"Authorization": "Bearer [CRON_SECRET]"}'::jsonb
  )
  $$
);
```

---

## 8. Super-Admin Features

### 8.1 Dashboard monitoring

```tsx
// app/admin/google-reviews/page.tsx (super-admin only)

import { createClient } from '@/lib/supabase/server';

// Composant Stats Card
function StatsCard({
  title,
  value,
  trend,
}: {
  title: string;
  value: number | string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {trend && <p className="mt-1 text-sm text-gray-500">{trend}</p>}
    </div>
  );
}

export default async function AdminGoogleReviewsPage() {
  const supabase = createClient();

  // Stats globales
  const { data: stats } = await supabase.rpc('get_google_reviews_admin_stats');

  // Liste des connexions avec leur statut
  const { data: connections } = await supabase
    .from('google_business_connections')
    .select(
      `
      *,
      tenant:tenants(name)
    `,
    )
    .order('created_at', { ascending: false });

  // Derniers logs de sync
  const { data: recentSyncs } = await supabase
    .from('google_reviews_sync_logs')
    .select(
      `
      *,
      tenant:tenants(name)
    `,
    )
    .order('started_at', { ascending: false })
    .limit(50);

  const statusColors: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    syncing: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
    started: 'bg-blue-100 text-blue-800',
    partial: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="container py-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Google Reviews - Admin</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Connexions actives" value={stats?.active_connections || 0} />
        <StatsCard title="Total avis" value={stats?.total_reviews || 0} />
        <StatsCard title="Avis non répondus" value={stats?.unreplied_reviews || 0} />
        <StatsCard title="Erreurs sync (24h)" value={stats?.sync_errors_24h || 0} />
      </div>

      {/* Table des connexions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Connexions</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Google
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière sync
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {connections?.map((conn) => (
                  <tr key={conn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {conn.tenant?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {conn.google_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[conn.sync_status] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {conn.sync_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {conn.last_sync_at
                        ? new Date(conn.last_sync_at).toLocaleString('fr-FR')
                        : 'Jamais'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Logs de sync */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Historique des synchronisations
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentSyncs?.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.started_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.tenant?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.sync_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[log.status] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.reviews_fetched} récupérés / {log.reviews_created} créés
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.duration_ms ? `${log.duration_ms}ms` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### 8.2 Fonction SQL pour stats admin

```sql
CREATE OR REPLACE FUNCTION get_google_reviews_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'active_connections', (
      SELECT COUNT(*) FROM google_business_connections
      WHERE sync_status = 'success'
    ),
    'total_connections', (
      SELECT COUNT(*) FROM google_business_connections
    ),
    'total_reviews', (
      SELECT COUNT(*) FROM google_reviews
    ),
    'unreplied_reviews', (
      SELECT COUNT(*) FROM google_reviews
      WHERE reply_comment IS NULL
    ),
    'unread_reviews', (
      SELECT COUNT(*) FROM google_reviews
      WHERE is_read = FALSE
    ),
    'average_rating', (
      SELECT ROUND(AVG(star_rating)::numeric, 2) FROM google_reviews
    ),
    'sync_errors_24h', (
      SELECT COUNT(*) FROM google_reviews_sync_logs
      WHERE status = 'error'
      AND started_at > NOW() - INTERVAL '24 hours'
    ),
    'reviews_today', (
      SELECT COUNT(*) FROM google_reviews
      WHERE google_created_at::date = CURRENT_DATE
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 9. Sécurité

### 9.1 Checklist sécurité

- [ ] Tokens OAuth chiffrés en base (AES-256-GCM)
- [ ] RLS activé sur toutes les tables
- [ ] Validation du state OAuth (expiration 15 min)
- [ ] Rate limiting sur les endpoints API
- [ ] Vérification des permissions (admin/super_admin)
- [ ] Logs d'audit pour les actions sensibles
- [ ] HTTPS obligatoire en production
- [ ] Variables d'environnement sécurisées

### 9.2 Middleware de vérification

```typescript
// middleware/google-business-auth.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function verifyGoogleBusinessAccess(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { user, userData };
}
```

---

## 10. Dépendances à installer

```bash
npm install googleapis
npm install date-fns
npm install sonner  # Pour les toasts (optionnel, adapter si vous avez déjà un système)
```

> Note : Pas de dépendances shadcn/ui - tous les composants utilisent Tailwind CSS natif.

---

## 11. Ordre d'implémentation recommandé

### Phase 1 : Infrastructure (1-2 jours)

1. Créer le projet Google Cloud et demander l'accès API
2. Créer les tables Supabase (migrations)
3. Implémenter le module d'encryption
4. Configurer les variables d'environnement

### Phase 2 : OAuth Flow (1 jour)

1. Route `/api/google-business/auth/connect`
2. Route `/api/google-business/auth/callback`
3. Route `/api/google-business/auth/disconnect`
4. Composant `GoogleBusinessConnectButton`
5. Page paramètres/intégrations

### Phase 3 : Sync & Affichage (2 jours)

1. Lib `google-business.ts`
2. Route sync locations
3. Route sync reviews
4. Composants UI (ReviewsList, ReviewCard, etc.)
5. Page dashboard/reviews

### Phase 4 : Réponses (1 jour)

1. Route reply (POST, DELETE)
2. Composant `ReviewReplyForm`
3. Tests manuels

### Phase 5 : Automation & Admin (1 jour)

1. Supabase Edge Function pour cron
2. Dashboard super-admin
3. Logs et monitoring

---

## 12. Tests

### 12.1 Tests à effectuer

```markdown
## OAuth Flow

- [ ] Connexion réussie avec compte Google Business
- [ ] Gestion du refus d'autorisation
- [ ] Expiration du state token
- [ ] Déconnexion

## Sync

- [ ] Sync initiale après connexion
- [ ] Sync manuelle
- [ ] Sync automatique (cron)
- [ ] Gestion des erreurs API Google
- [ ] Refresh token expiré

## Reviews

- [ ] Affichage liste des avis
- [ ] Filtres (note, répondu, lu)
- [ ] Pagination
- [ ] Marquer comme lu

## Réponses

- [ ] Poster une réponse
- [ ] Modifier une réponse
- [ ] Supprimer une réponse
- [ ] Gestion erreur Google

## Multi-tenant

- [ ] Isolation des données entre tenants
- [ ] Super-admin voit tous les tenants
- [ ] Admin voit uniquement son tenant
```

---

## Notes importantes

1. **Délai d'approbation API** : La demande d'accès à l'API Google Business Profile peut prendre plusieurs jours à plusieurs semaines. Commencer le développement UI/UX en parallèle.

2. **Quotas API** : L'API a des quotas par défaut. Monitorer l'usage et demander une augmentation si nécessaire.

3. **Tokens refresh** : Le refresh token peut être révoqué par l'utilisateur. Prévoir un mécanisme de re-connexion si le token devient invalide.

4. **Multi-locations** : Un compte Google Business peut avoir plusieurs fiches. L'UI doit permettre de gérer ce cas.
