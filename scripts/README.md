# 📜 Scripts Utility - ReviewLottery V3

Utility scripts for database management, testing, and admin operations.

---

## 🗄️ Database Scripts

### Active SQL Scripts

#### `create-ai-tables.sql`

**Purpose**: Create AI service configuration tables if missing

**Usage**: Run manually in Supabase SQL Editor when deploying AI features

**Tables Created**:

- `ai_service_config` - AI provider configuration (OpenAI, Anthropic)
- `ai_usage_logs` - Track AI API usage for billing

**When to Use**: If error "table ai_service_config does not exist" occurs

```bash
# Copy-paste content into Supabase SQL Editor
cat scripts/create-ai-tables.sql
```

---

### Archived SQL Scripts

Located in `scripts/archive/` - **DO NOT RUN** (already applied in production)

- `add-role-column.sql` - Added role column to User table (already done)
- `setup-roles.sql` - Setup role enum and defaults (already done)
- `set-super-admin-direct.sql` - Promote user to SUPER_ADMIN (already done)
- `remove-owner-id-from-stores.sql` - Migration (already done)
- `add-prize-templates-sets-plan-limits.sql` - Migration (already done)

---

## 🧪 Testing Scripts

### `test-google-api.ts`

**Purpose**: Test Google My Business API OAuth2 connection

**Usage**:

```bash
npx tsx scripts/test-google-api.ts
```

**What it does**:

1. Loads encrypted refresh token from database
2. Tests OAuth client authentication
3. Lists My Business accounts
4. Lists locations (stores) under accounts
5. Validates credentials

**Prerequisites**:

- Store with Google OAuth completed (refresh token in DB)
- `.env` with Google OAuth credentials configured

---

## 👨‍💼 Admin Utility Scripts

### `promote-super-admin.ts`

**Purpose**: Promote a user to SUPER_ADMIN role

**Usage**:

```bash
npx tsx scripts/promote-super-admin.ts
```

**Interactive**: Prompts for user email

**Example**:

```
? Enter user email: dev@coworkingcafe.fr
✅ User promoted to SUPER_ADMIN
```

---

### `check-user-status.ts`

**Purpose**: Check user status (auth + database)

**Usage**:

```bash
npx tsx scripts/check-user-status.ts
```

**Interactive**: Prompts for user email

**Shows**:

- Supabase Auth status
- Email verified status
- Database User record
- Current role

**Example Output**:

```
User: dev@coworkingcafe.fr
Supabase Auth: ✅ Exists
Email Verified: ✅ Yes
Database User: ✅ Exists
Role: SUPER_ADMIN
```

---

### `clear-user-session.ts`

**Purpose**: Clear user session (force logout)

**Usage**:

```bash
npx tsx scripts/clear-user-session.ts
```

**Interactive**: Prompts for user ID

**Use Case**: When user stuck in bad session state

---

### `confirm-email.ts`

**Purpose**: Confirm user email programmatically (DEV only)

**Usage**:

```bash
npx tsx scripts/confirm-email.ts
```

**Interactive**: Prompts for user email

**⚠️ DEV ONLY**: Should not be used in production

---

## 📝 Notes

- All TypeScript scripts use `tsx` (no compilation needed)
- SQL scripts are meant for manual execution in Supabase SQL Editor
- Admin scripts modify production data - **use with caution**
- Archive folder contains historical migrations for reference only

---

**Last Updated**: 2025-12-10
