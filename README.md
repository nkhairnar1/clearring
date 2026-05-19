# ClearRing — Caller Intelligence Platform

> Know who's calling before you answer.

ClearRing is a full-stack caller intelligence platform built with a native Android app, NestJS backend API, Next.js admin dashboard, and a Next.js public marketing website — all in a single pnpm monorepo.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Running Each Component](#running-each-component)
  - [Backend API](#backend-api)
  - [Admin Dashboard](#admin-dashboard)
  - [Public Website](#public-website)
  - [Android App](#android-app)
- [Test Credentials](#test-credentials)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Theme System](#theme-system)
- [Spam Scoring Engine](#spam-scoring-engine)

---

## Architecture Overview

```
ClearRing/
├── apps/
│   ├── android/          # Kotlin + Jetpack Compose Android app
│   ├── admin/            # Next.js 14 admin dashboard (port 3002)
│   └── web/              # Next.js 14 public marketing website (port 3000)
├── services/
│   └── api/              # NestJS backend API (port 3010)
├── packages/
│   ├── shared-types/     # TypeScript interfaces shared across all packages
│   ├── phone-utils/      # libphonenumber-js E.164 normalization
│   ├── spam-engine/      # Weighted spam scoring algorithm (0–100)
│   ├── ui-tokens/        # Design tokens for 5 ClearRing themes
│   └── config/           # Shared environment configuration
└── docs/                 # Architecture docs, market research, MCP setup
```

**Tech Stack:**

| Layer | Technology |
|-------|-----------|
| Android | Kotlin, Jetpack Compose, Hilt, Retrofit, Room, DataStore |
| Backend | NestJS 10, Prisma ORM, PostgreSQL, Redis, JWT |
| Admin UI | Next.js 14, Tailwind CSS, shadcn/ui components, Recharts |
| Marketing | Next.js 14, Tailwind CSS, Framer Motion, Glassmorphism |
| Monorepo | pnpm workspaces |
| Database | PostgreSQL (port 5433), Redis (port 6380) |

---

## Prerequisites

- **Node.js** v18+ (tested on v24.11.1)
- **pnpm** v8+ (`npm install -g pnpm`)
- **Docker** + Docker Compose (for PostgreSQL + Redis)
- **Java 21** with `JAVA_HOME` set to JDK root
- **Android SDK** API 34/35 (for APK build)
- **adb** (Android Debug Bridge, for device install)

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo>
cd ClearRing
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env if needed (defaults work for local dev)

# 3. Start infrastructure
docker compose up -d

# 4. Set up database
pnpm db:migrate
pnpm db:seed

# 5. Start all services
pnpm dev:api    # Terminal 1 — backend on :3010
pnpm dev:admin  # Terminal 2 — admin on :3002
pnpm dev:web    # Terminal 3 — website on :3000
```

---

## Running Each Component

### Backend API

```bash
# Start development server
pnpm dev:api
# → http://localhost:3010/api/docs  (Swagger UI)
# → http://localhost:3010/health    (health check)

# Database commands
pnpm db:migrate     # Run Prisma migrations
pnpm db:seed        # Seed 23 phone numbers + admin user
pnpm db:studio      # Open Prisma Studio (DB GUI)
pnpm db:reset       # Drop + recreate + migrate + seed

# Build for production
pnpm --filter @clearring/api build
```

**Docker services** (started by `docker compose up -d`):
- PostgreSQL on port **5433** (not 5432 to avoid conflicts)
- Redis on port **6380** (not 6379 to avoid conflicts)

### Admin Dashboard

```bash
pnpm dev:admin
# → http://localhost:3002
```

**Login credentials** (requires backend running):
- Phone: `+911234567890` (or `1234567890` — Indian format)
- OTP: `123456` (dev bypass, any number in development mode)
- Role: SUPER_ADMIN

**Admin screens:**
- `/dashboard` — KPI cards + activity charts
- `/numbers` — Phone number management
- `/reports` — Community report review
- `/business` — Business claim verification
- `/disputes` — Correction requests
- `/analytics` — Daily trends + category breakdown
- `/users` — User management + trust scores
- `/themes` — Theme preview

### Public Website

```bash
pnpm dev:web
# → http://localhost:3000
```

11-section glassmorphism marketing site with:
- Hero + animated glassmorphism cards
- CSS phone frame mockups (6 screens)
- Waitlist form (submits to backend `/api/waitlist`)
- FAQ accordion, "How It Works" flow, Business pitch

### Android App

#### Build APK

```bash
cd apps/android

# Option A: Use the Gradle wrapper (recommended)
./gradlew assembleDebug

# Option B: Windows PowerShell
.\gradlew.bat assembleDebug

# APK output:
# apps/android/app/build/outputs/apk/debug/app-debug.apk (~18 MB)
```

**Pre-built APK** is already available at:
```
apps/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Install on Device/Emulator

```bash
# Via ADB (physical device or emulator must be connected/running)
adb install apps/android/app/build/outputs/apk/debug/app-debug.apk

# Verify installation
adb shell pm list packages | grep clearring
```

#### Configure API URL

The app connects to `http://10.0.2.2:3010/api` by default (Android emulator → host machine).

For a real physical device on the same network:
```
# Edit apps/android/local.properties
BASE_URL=http://192.168.1.x:3010/api
```

Then rebuild: `./gradlew assembleDebug`

**Android screens (11 total):**
1. Splash — logo + tagline
2. Onboarding — 4-slide feature walkthrough
3. Phone Login — number entry + OTP verify
4. Permission Education — explains required permissions
5. Home — search bar, recent lookups, stats
6. Lookup Result — full caller intelligence card
7. Report Number — fraud indicator form
8. Incoming Call — screening overlay / fallback
9. Business Claim — business verification form
10. Settings — theme, privacy, account
11. Theme Preview — live theme selector

---

## Test Credentials

| Account | Phone | OTP | Role |
|---------|-------|-----|------|
| Super Admin | +911234567890 | 123456 | SUPER_ADMIN |
| Any new user | any valid Indian number | 123456 | USER (created on first login) |

> **Dev OTP bypass**: In `NODE_ENV=development`, OTP `123456` is accepted for any phone number.

**Seeded phone numbers:**

| Number | Label | Risk |
|--------|-------|------|
| +914422334455 | Apollo Hospitals Chennai | SAFE (verified) |
| +911800114477 | HDFC Bank Customer Care | SAFE (verified) |
| +919876543210 | Loan Spam | HIGH_RISK (score 88) |
| +919123456780 | UPI Payment Fraud | HIGH_RISK (score 95) |
| +919012345678 | Fake Job Scam | HIGH_RISK (score 92) |
| +919900112233 | Credit Card Sales | LIKELY_SPAM (score 72) |
| +919955667788 | Political Campaign Spam | CAUTION (score 55) |

---

## Running Tests

```bash
# All unit tests across the monorepo
pnpm test

# Individual packages
pnpm --filter @clearring/spam-engine test   # 14 spam scoring tests
pnpm --filter @clearring/phone-utils test  # 18 normalization tests
pnpm --filter @clearring/api test          # 30 service unit tests

# Playwright smoke tests (requires running servers)
pnpm --filter @clearring/web test          # Website smoke tests
pnpm --filter @clearring/admin test        # Admin smoke tests

# API tests with coverage
pnpm --filter @clearring/api test:cov
```

**Test summary:**
| Package | Tests | Coverage |
|---------|-------|----------|
| spam-engine | 14 unit tests | Scoring algorithm edge cases |
| phone-utils | 18 unit tests | E.164 normalization, Indian formats |
| api | 30 unit tests | Auth service, Numbers service with mocked Prisma/Redis |
| web | 9 smoke tests | Homepage load, CTA clicks, FAQ, responsive |
| admin | 6 smoke tests | Login page, redirect, branding |

---

## API Reference

Base URL: `http://localhost:3010/api`  
Swagger docs: `http://localhost:3010/api/docs`

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/send-otp` | Send OTP to phone number |
| POST | `/auth/verify-otp` | Verify OTP, returns JWT |
| POST | `/auth/register` | Register (creates user record) |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Current user profile |

**OTP flow:**
```bash
# Step 1: Send OTP
curl -X POST http://localhost:3010/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210"}'

# Step 2: Verify OTP (dev: use 123456)
curl -X POST http://localhost:3010/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "otp": "123456"}'
# Returns: { accessToken, refreshToken, user }
```

### Numbers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/numbers/lookup?number=+919876543210` | Lookup a number |
| GET | `/numbers/:id` | Get number by DB ID |
| POST | `/numbers/report` | Submit a community report |
| POST | `/numbers/mark-safe` | Mark a number as safe |
| POST | `/numbers/block` | Block a number |
| GET | `/numbers/:id/reports` | Get reports for a number |

**Lookup example:**
```bash
curl "http://localhost:3010/api/numbers/lookup?number=9876543210" \
  -H "Authorization: Bearer <token>"
```

### Business

| Method | Path | Description |
|--------|------|-------------|
| POST | `/business/claim` | Claim a business number |
| GET | `/business/my-claims` | My business claims |
| GET | `/business/:id` | Get business profile |

### Admin (requires ADMIN/SUPER_ADMIN role)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | KPI stats |
| GET/PUT | `/admin/numbers` | Manage phone numbers |
| GET/PUT | `/admin/reports` | Review reports |
| GET/PUT | `/admin/business` | Verify business claims |
| GET/PUT | `/admin/disputes` | Review disputes |
| GET | `/admin/analytics` | Usage analytics |
| GET | `/admin/users` | User management |
| GET | `/admin/audit-logs` | Audit trail |

### Public

| Method | Path | Description |
|--------|------|-------------|
| POST | `/waitlist` | Join the waitlist |
| GET | `/health` | Health check |

---

## Project Structure

```
services/api/src/
├── modules/
│   ├── auth/             # JWT auth, OTP flow, user creation
│   ├── numbers/          # Phone number lookup, reports, scoring
│   ├── business/         # Business profiles and verification
│   ├── disputes/         # Correction requests
│   ├── reports/          # Report management
│   ├── users/            # User profile management
│   ├── admin/            # Admin CRUD operations
│   ├── analytics/        # Usage analytics
│   ├── audit-logs/       # Audit trail
│   ├── health/           # Health endpoint
│   └── public/           # Public waitlist
└── shared/
    ├── prisma/           # PrismaService (DB client)
    └── redis/            # RedisService (cache + OTP)

packages/spam-engine/src/
├── scorer.ts             # Main scoring algorithm
├── risk-classifier.ts    # Risk level thresholds
└── types.ts              # ScoreInput, ScoreResult types

packages/phone-utils/src/
├── normalizer.ts         # toE164, normalizePhoneNumber, splitE164
├── formatter.ts          # Display formatting utilities
└── validator.ts          # isValidE164, isIndianNumber
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
# Database
DATABASE_URL=postgresql://clearring:clearring123@localhost:5433/clearring

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380

# JWT
JWT_SECRET=clearring-dev-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3010
NODE_ENV=development

# API URL (used by admin and web)
NEXT_PUBLIC_API_URL=http://localhost:3010/api
```

---

## Theme System

ClearRing has 5 built-in themes available across the admin dashboard, website, and Android app:

| Theme | Key Colors | Description |
|-------|-----------|-------------|
| Crystal Glass | Blue/purple gradients | Default — premium glassmorphism |
| Midnight Trust | Navy + electric blue | Dark premium mode |
| Clean Light | White + blue accents | Professional minimal |
| High Contrast | Black/white + yellow | Accessibility-first |
| True Signal | Green/teal + blue | Trust-first verified look |

**Risk level colors** (consistent across all themes):

| Risk Level | Score Range | Color |
|-----------|-------------|-------|
| SAFE | 0–20 | `#22c55e` (green) |
| LOW_RISK | 21–40 | `#eab308` (yellow) |
| CAUTION | 41–60 | `#f97316` (orange) |
| LIKELY_SPAM | 61–80 | `#ef4444` (red-light) |
| HIGH_RISK | 81–100 | `#dc2626` (red-dark) |
| VERIFIED | — | `#3b82f6` (blue) |
| UNKNOWN | — | `#6b7280` (gray) |

---

## Spam Scoring Engine

Located in `packages/spam-engine/`, the scoring algorithm produces a 0–100 risk score.

**Score calculation:**

```
Base score: 50 (unknown numbers)

INCREASES (per unique reporter, with trust multiplier):
  FRAUD report          +35 pts  (capped at 3 unique reporters)
  OTP_SCAM report       +30 pts  (capped at 3)
  PAYMENT_SCAM report   +28 pts  (capped at 3)
  SCAM report           +25 pts  (capped at 5)
  HARASSMENT report     +15 pts  (capped at 5)
  SPAM report           +12 pts  (capped at 10)
  TELEMARKETING report  + 5 pts  (capped at 10)

  Recency bonus: reports < 7 days old get 1.5× weight
  Trust multiplier: reporter trust score 0–100 → factor 0.6–1.3

DECREASES:
  SAFE report           -15 pts  (capped at 5)
  isVerified = true     -30 pts  (only if no FRAUD reports)
  disputeApprovedCount  - 8 pts each

ADMIN OVERRIDES (bypass all calculation):
  CONFIRMED_FRAUD       → score forced to 95
  VERIFIED_SAFE         → score forced to 5

Final score clamped to [0, 100]
```

**Risk level thresholds:**
- 0–20 → SAFE
- 21–40 → LOW_RISK
- 41–60 → CAUTION
- 61–80 → LIKELY_SPAM
- 81–100 → HIGH_RISK

---

## Troubleshooting

**Docker containers not starting:**
```bash
docker compose down -v
docker compose up -d
```

**Prisma migration errors:**
```bash
pnpm db:reset   # Full reset + reseed
```

**Android build fails (SDK not found):**
Make sure `local.properties` in `apps/android/` contains:
```
sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

**Android build fails (JAVA_HOME):**
Set JAVA_HOME to your JDK 21 root (must contain `bin/javac.exe`):
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
```

**API returns 401 on admin routes:**
Ensure you're logged in as a user with role `ADMIN`, `SUPER_ADMIN`, or `MODERATOR`.
The seeded admin user phone is `+911234567890`, OTP `123456`.

**Port already in use:**
- API: Change `PORT=3010` in `.env`
- Admin: Change port in `apps/admin/next.config.js`
- Web: Change port in `apps/web/next.config.js`

---

## Development Notes

- **OTP bypass**: `NODE_ENV=development` accepts OTP `123456` for any number (controlled in `OtpService`)
- **Redis cache**: Lookup results cached for 1 hour. Cache is invalidated on new reports
- **Android emulator**: Uses `http://10.0.2.2:3010/api` to reach the host machine's API
- **Call screening**: `ClearRingScreeningService` requires the user to set ClearRing as the default call screening app in Android Settings. The app works without it (manual lookup mode)
- **Prisma seed**: Run with `pnpm db:seed`. Seeds 1 admin + 10 verified + 10 spam + 3 unknown numbers

---

## License

Private — ClearRing startup project. All rights reserved.
