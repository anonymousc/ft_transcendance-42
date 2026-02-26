# Google OAuth 2.0 Implementation

## Overview

Google OAuth 2.0 has been integrated into the existing NestJS backend and connected to the React frontend. The implementation follows the **Authorization Code Flow** — the most secure OAuth flow for server-side applications.

---

## Architecture

```
Frontend (React)                          Backend (NestJS)                        Google
─────────────────                         ────────────────                        ──────
1. User clicks "Sign in with Google"
   → window.location.href =
     "http://localhost:3000/auth/google"
                                          2. GET /auth/google
                                             GoogleOAuthGuard triggers
                                             Passport redirects to Google  →→→→
                                                                                 3. Google consent screen
                                                                                    User approves
                                                                                 4. Google redirects to
                                                                                    /auth/google/callback
                                          5. GET /auth/google/callback             ←←←←
                                             Passport validates code
                                             GoogleStrategy.validate() runs
                                             AuthService creates/finds user
                                             Generates JWT
                                             Redirects to frontend with token
6. /oauth-success?token=<jwt>
   OAuthSuccess component:
   - Stores token in localStorage
   - Navigates to /home
```

---

## Files Created / Modified

### New Files

| File | Purpose |
|------|---------|
| `src/prisma.service.ts` | Prisma v7 database service with `@prisma/adapter-pg` driver adapter |
| `src/auth/strategies/google.strategy.ts` | Passport Google OAuth2 strategy — validates Google profile data |
| `src/auth/guards/google-oauth.guard.ts` | Guard that triggers the Google OAuth flow |

### Modified Files

| File | Changes |
|------|---------|
| `src/auth/auth.service.ts` | Added `validateGoogleUser()` and `generateJwt()` methods |
| `src/auth/auth.controller.ts` | Added `GET /auth/google` and `GET /auth/google/callback` routes |
| `src/auth/auth.module.ts` | Registered PassportModule, JwtModule, GoogleStrategy, PrismaService |
| `src/app.module.ts` | Added `ConfigModule.forRoot()` for global env access |
| `src/main.ts` | Added `dotenv/config` import and CORS configuration |
| `tsconfig.json` | Added path alias `@generated/prisma/*` for Prisma v7 generated client |
| `.env` | Added Google OAuth, JWT, and frontend URL environment variables |

### Frontend Fix

| File | Changes |
|------|---------|
| `frontend/src/features/Login/component/LoginPage.tsx` | Fixed `handleGoogleLogin` URL from port `5000` to `3000` |

---

## Prisma Schema — No Changes Needed

The existing schema already supports OAuth perfectly:

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  hashPassword    String?   // Nullable for OAuth-only users ✓
  isEmailVerified Boolean   @default(false)
  accounts        Account[] // Supports multiple OAuth providers ✓
  profile         Profile?
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  provider          String   // "google", "42", "local" ✓
  providerAccountId String   // Google's user ID ✓
  accessToken       String?
  refreshToken      String?
  expiresAt         Int?
  user              User     @relation(...)
  @@unique([provider, providerAccountId]) // Prevents duplicate accounts ✓
}
```

**Why no changes were needed:**
- `hashPassword` is already nullable (`String?`) — OAuth users don't need a password
- The `Account` model already has `provider` + `providerAccountId` with a unique constraint
- The composite unique `@@unique([provider, providerAccountId])` prevents duplicate Google accounts
- `accessToken` and `refreshToken` fields are already present for storing Google tokens

---

## Environment Variables

These are loaded from `backend/.env` via `ConfigModule.forRoot()`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT
JWT_ACCESS_SECRET=<your-jwt-secret>
JWT_ACCESS_EXPIRES_IN=15m

# Frontend URL (for CORS and redirect)
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prisma?schema=public
```

---

## Auth Flow Detail

### 1. Google Strategy (`google.strategy.ts`)

Configures Passport with Google credentials and scopes (`email`, `profile`). On successful authentication, extracts:
- `providerAccountId` — Google's unique user ID
- `email` — User's verified email
- `displayName` — User's name
- `avatar` — Profile photo URL
- `accessToken` / `refreshToken` — Google API tokens

### 2. Auth Service (`auth.service.ts`) — `validateGoogleUser()`

Three scenarios handled:

1. **Returning user** — Account with matching `provider` + `providerAccountId` exists → update tokens, return user
2. **Existing email** — User registered with same email (e.g., locally) → link Google account to existing user
3. **New user** — Create `User` + `Account` + `Profile` in a single Prisma transaction

### 3. JWT Generation

After validation, a JWT is signed with:
```json
{
  "sub": "user.id",
  "email": "user.email"
}
```
Expires in `15m` (configurable via `JWT_ACCESS_EXPIRES_IN`).

### 4. Frontend Redirect

The callback handler redirects to:
```
http://localhost:5173/oauth-success?token=<jwt>
```

The `OAuthSuccess` React component stores the token in `localStorage` and navigates to `/home`.

---

## Installed Dependencies

```
@nestjs/passport    — NestJS Passport integration
@nestjs/jwt         — NestJS JWT module
@nestjs/config      — NestJS ConfigModule for env vars
passport            — Authentication middleware
passport-google-oauth20 — Google OAuth2 strategy
dotenv              — .env file loader
@prisma/adapter-pg  — Prisma v7 PostgreSQL driver adapter
pg                  — PostgreSQL client for Node.js
@types/passport-google-oauth20 (dev)
@types/pg (dev)
```

---

## How to Run

1. Make sure PostgreSQL is running locally
2. Set up your `backend/.env` with valid Google OAuth credentials
3. Run migrations: `npx prisma migrate dev`
4. Start the backend: `npm run start:dev`
5. Start the frontend: `cd ../frontend && npm run dev`
6. Navigate to `http://localhost:5173/login` and click "Sign in with Google"

---

## Security Notes

- JWT secret is a 128-character hex string — sufficiently strong
- Google tokens are stored in the database for potential future API access
- CORS is restricted to `FRONTEND_URL` only
- Passwords are nullable, so OAuth-only users never have a password to compromise
- The token is passed via URL query parameter to the frontend — for production, consider using HTTP-only cookies instead
