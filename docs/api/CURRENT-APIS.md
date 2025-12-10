# 🔌 Current API Integrations - ReviewLottery V3

**Last Update**: 2025-12-10

This document lists **ONLY** the API integrations currently used in production code.

---

## 🏢 Google My Business API (Production)

**Status**: ✅ **Active** (partial - read operations working)

### Overview

Google My Business API is used to fetch and manage reviews from Google Business Profiles. Authentication is done via OAuth2 with refresh tokens stored encrypted in the database.

### API Endpoints Used

#### 1. My Business Account Management API (v1)

**Service**: `google.mybusinessaccountmanagement`

**Endpoints**:

- `accounts.list()` - List all My Business accounts for authenticated user

**Code Location**: `src/infrastructure/services/google-my-business-production.service.ts:66`

#### 2. My Business Business Information API (v1)

**Service**: `google.mybusinessbusinessinformation`

**Endpoints**:

- `accounts.locations.list()` - List all locations (stores) under an account

**Code Location**: `src/infrastructure/services/google-my-business-production.service.ts:82`

### Authentication

**Type**: OAuth 2.0 with refresh tokens

**Flow**:

1. User initiates OAuth in admin dashboard
2. Redirected to Google consent screen
3. Google redirects back to `/api/auth/google/callback` with authorization code
4. Backend exchanges code for refresh token
5. Refresh token encrypted (AES-256-GCM) and stored in database
6. Refresh token used to generate access tokens for API calls

**Environment Variables**:

```env
GOOGLE_CLIENT_ID=467670053448-jrlbk1lsuhtvloetqhkh3usco4jn8jgd.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

**Scopes Required**:

- `https://www.googleapis.com/auth/business.manage` - Read and manage business information
- (Optionally) `https://www.googleapis.com/auth/businesscommunications` - Manage reviews

### Implementation Status

✅ **Working**:

- OAuth2 authentication flow
- Account listing
- Location listing
- Refresh token storage (encrypted)
- Credential validation

⚠️ **Partial / Stub**:

- Review fetching (deprecated API v4, returns stub data)
- Review response publishing (not yet implemented)

**Known Limitations**:

- Google My Business API v4 (reviews endpoint) is deprecated
- Need to migrate to newer API for review fetching
- Publishing responses requires full review resource name (`accounts/{accountId}/locations/{locationId}/reviews/{reviewId}`)

### Files

**Service Implementation**:

- `src/infrastructure/services/google-my-business-production.service.ts`

**Service Interface**:

- `src/core/services/google-my-business.service.interface.ts`

**tRPC Router**:

- `src/server/api/routers/review.router.ts` (sync, respond endpoints)

**Test Script**:

- `scripts/test-google-api.ts`

### Usage Example

```typescript
import { GoogleMyBusinessProductionService } from '@/infrastructure/services/google-my-business-production.service';

const googleService = new GoogleMyBusinessProductionService(encryptionService);

// Fetch reviews
const result = await googleService.fetchReviews(googlePlaceId, { apiKey: encryptedRefreshToken });

// Validate credentials
const isValid = await googleService.validateCredentials(encryptedRefreshToken);
```

### Next Steps

- [ ] Migrate to new Google Places API (New) for review fetching
- [ ] Implement `publishResponse()` method with full resource name resolution
- [ ] Test with real Google Business Profile
- [ ] Add error handling for quota limits

---

## 🤖 OpenAI API (Production)

**Status**: ✅ **Fully Operational**

### Overview

OpenAI API is used to generate AI-powered response suggestions for Google reviews. The service uses the `gpt-4o-mini` model for cost-effective, high-quality text generation.

### API Endpoints Used

#### Chat Completions API

**Endpoint**: `POST https://api.openai.com/v1/chat/completions`

**Model**: `gpt-4o-mini`

**Code Location**: `src/infrastructure/services/ai-response-generator.service.ts`

### Authentication

**Type**: API Key (Bearer token)

**Storage**: API keys are encrypted (AES-256-GCM) in database table `ai_service_config`

**Environment Variables**:

```env
ENCRYPTION_SECRET_KEY=0a4700bf8972a9933544afaf9ea3e9642ba15306e4373154d622d577fe431219
```

**Note**: OpenAI API key is **NOT** stored in `.env` file. It is configured by super-admin via dashboard UI at `/admin/ai-config`.

### Configuration

Configurable via super-admin dashboard:

**Settings**:

- **Model**: `gpt-4o-mini` (hardcoded, extensible)
- **Max Tokens**: Configurable (default: 300)
- **Temperature**: Configurable (default: 0.7)
- **System Prompt**: Fully customizable

**Default System Prompt**:

```
You are a professional customer service assistant for a local business.
Generate a polite, helpful, and professional response to customer reviews.
Always maintain a friendly and respectful tone.
```

### Implementation Status

✅ **Working**:

- AI response generation for reviews
- Tone selection (professional, friendly, apologetic)
- Language selection (fr, en)
- Emoji inclusion toggle
- Token usage tracking
- Cost estimation
- Encrypted API key storage
- Configuration dashboard
- Test connection button

### Usage Tracking

All AI API calls are logged in table `ai_usage_logs`:

**Tracked Metrics**:

- User ID
- Review ID
- Provider (openai)
- Model (gpt-4o-mini)
- Tokens used (prompt + completion)
- Estimated cost USD
- Request type
- Whether suggestion was used

**Cost Estimation**:

- Approximately $0.03 per 1,000 tokens
- Tracked per request for billing purposes

### Files

**Service Implementation**:

- `src/infrastructure/services/ai-response-generator.service.ts`

**Service Interface**:

- `src/core/services/ai-response-generator.service.interface.ts`

**Admin UI**:

- `src/app/admin/ai-config/page.tsx`

**tRPC Router**:

- `src/server/api/routers/review.router.ts` (generateAiResponse endpoint)

**Database Tables**:

- `ai_service_config` - AI provider configuration
- `ai_usage_logs` - Usage tracking

**SQL Scripts**:

- `scripts/create-ai-tables.sql` - Create tables if missing

### Usage Example

```typescript
import { AiResponseGeneratorService } from '@/infrastructure/services/ai-response-generator.service';

const aiService = new AiResponseGeneratorService(prisma, encryptionService);

// Generate AI response
const result = await aiService.generateResponse({
  reviewText: 'Great service!',
  reviewRating: 5,
  businessName: 'My Cafe',
  tone: 'friendly',
  language: 'fr',
  includeEmojis: true,
});

// Check if service is available
const isAvailable = await aiService.isAvailable();
```

### Next Steps

- [x] Configuration dashboard (done)
- [x] Test connection button (done)
- [ ] Quota management (daily limits per admin)
- [ ] Usage dashboard for admins
- [ ] Support for multiple AI providers (Anthropic Claude)

---

## 🔐 Supabase Authentication API

**Status**: ✅ **Fully Operational**

### Overview

Supabase Auth is used for user authentication with email/password. Session management uses HTTP-only cookies for security.

### API Endpoints Used

#### Auth API

**Methods**:

- `supabase.auth.signUp()` - User registration
- `supabase.auth.signInWithPassword()` - Email/password login
- `supabase.auth.signOut()` - Logout
- `supabase.auth.getSession()` - Get current session
- `supabase.auth.refreshSession()` - Refresh access token

**Code Location**: `src/infrastructure/auth/supabase-auth.service.ts`

### Authentication

**Type**: JWT with HTTP-only cookies

**Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ynrdyircogzytfgueyva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Implementation Status

✅ **Working**:

- Email/password registration
- Login
- Logout
- Session management (HTTP-only cookies)
- Protected routes (middleware)
- Role-based access control (SUPER_ADMIN, ADMIN, USER)
- Auto-confirmation in DEV mode

⏸️ **Postponed**:

- Magic Link authentication (code exists but disabled)

### Files

**Service Implementation**:

- `src/infrastructure/auth/supabase-auth.service.ts`
- `src/infrastructure/auth/session.service.ts`

**Middleware**:

- `src/middleware.ts` - Protected routes

**Auth Pages**:

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`

**API Routes**:

- `src/app/api/auth/callback/route.ts` - OAuth callback

### Next Steps

- [ ] Password reset flow
- [ ] Email verification in production
- [ ] Two-factor authentication
- [ ] Decide on Magic Link (keep or remove)

---

## 🗄️ Supabase PostgreSQL Database

**Status**: ✅ **Fully Operational**

### Overview

PostgreSQL database hosted on Supabase, accessed via Prisma ORM.

### Connection

**Pooler** (for application):

```env
DATABASE_URL=postgresql://postgres.ynrdyircogzytfgueyva:mgvDfDCMNGXkaKmq@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct** (for migrations only):

```env
DIRECT_URL=postgresql://postgres:mgvDfDCMNGXkaKmq@db.ynrdyircogzytfgueyva.supabase.co:5432/postgres
```

### Tables

**Core Tables**:

- `User` - User accounts with roles
- `Brand` - Store brands (multi-store support)
- `Store` - Individual stores
- `Review` - Google reviews
- `ResponseTemplate` - Review response templates
- `PrizeTemplate` - Lottery prizes
- `PrizeSet` - Prize sets for campaigns
- `Campaign` - Lottery campaigns (not yet implemented)
- `Participant` - Lottery participants
- `Draw` - Lottery draws
- `Winner` - Lottery winners

**AI Tables**:

- `ai_service_config` - AI provider configuration
- `ai_usage_logs` - AI usage tracking

### ORM

**Tool**: Prisma 7.1.0

**Schema**: `prisma/schema.prisma`

**Migration**: Manual via `npx prisma db push`

### Next Steps

- [ ] Add database indexes for performance
- [ ] Set up automated backups
- [ ] Add audit logs table

---

## ❌ Removed APIs

### Google Places API (New)

**Removed**: 2025-12-10

**Reason**: Test implementation, limited to 5 reviews, read-only

**Replaced By**: Google My Business API with OAuth2

### Mock Services

**Removed**: 2025-12-10

**Reason**: Test code, no longer needed

---

## 📚 Related Documentation

- **Google OAuth Setup**: See `/docs/api/` (TODO: create dedicated guide)
- **OpenAI Configuration**: See `/admin/ai-config` dashboard
- **Supabase Setup**: See `/docs/QUICK-START.md`

---

**Questions?** Check `/docs/planning/PROJECT-STATUS.md` for current implementation status.
