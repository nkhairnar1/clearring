# ClearRing Architecture Decisions

## ADR-001: Monorepo with pnpm Workspaces
**Date**: 2026-05-06  
**Status**: Accepted

**Decision**: Use pnpm workspaces monorepo instead of Turborepo or separate repositories.

**Reasoning**:
- Native pnpm workspace protocol for internal package linking
- Simpler than Turborepo for this project scope
- Single `pnpm install` installs all dependencies
- Shared TypeScript configs and linting
- Easy to run `pnpm -r build` across all packages

**Trade-offs**:
- No incremental build caching (Turborepo has this)
- All packages built together by default

---

## ADR-002: NestJS for Backend
**Date**: 2026-05-06  
**Status**: Accepted

**Decision**: Use NestJS with TypeScript for the backend API.

**Reasoning**:
- Modular architecture maps cleanly to product domains (auth, numbers, reports, admin)
- Built-in Swagger/OpenAPI generation
- Excellent Prisma integration
- Dependency injection for testability
- Throttler for rate limiting
- Guards for RBAC

**Trade-offs**:
- More boilerplate than Express
- Larger bundle size than Fastify
- Learning curve for NestJS decorators

---

## ADR-003: Prisma ORM
**Date**: 2026-05-06  
**Status**: Accepted

**Decision**: Use Prisma as the ORM for PostgreSQL.

**Reasoning**:
- Fully type-safe queries
- Auto-generated migrations
- Prisma Studio for database inspection
- Excellent DX
- Good PostgreSQL support

**Trade-offs**:
- Some N+1 query footguns (use `include` carefully)
- Not as flexible as raw SQL for complex aggregations

---

## ADR-004: Redis for Caching and OTP
**Date**: 2026-05-06  
**Status**: Accepted

**Decision**: Use Redis (ioredis) for lookup result caching and OTP storage.

**Reasoning**:
- Fast in-memory cache for lookup results (1-hour TTL)
- OTP with automatic expiry (5-minute TTL)
- Rate limiting via throttler (Redis store)
- Standard for Node.js caching

**Implementation**:
- Lookup key: `lookup:{e164_number}`
- OTP key: `otp:{e164_number}`
- Dev OTP: `123456` accepted for any number in `NODE_ENV=development`

---

## ADR-005: Android-First Mobile Strategy
**Date**: 2026-05-06  
**Status**: Accepted

**Decision**: Build Android app first with Kotlin + Jetpack Compose. iOS deferred.

**Reasoning**:
- Android has 95%+ market share in India (primary target market)
- Android supports full call screening via `CallScreeningService`
- iOS CallKit severely limits background call identification
- Compose is modern, maintainable declarative UI
- Single APK for easy distribution and testing

**iOS Strategy (future)**:
- Manual lookup without call screening
- Pre-downloaded database approach (like Whoscall)
- iOS CallKit extension with cached database

---

## ADR-006: Privacy-First Data Architecture
**Date**: 2026-05-06  
**Status**: Accepted

**Decision**: No automatic contact book upload. All data collection is explicit and opt-in.

**Reasoning**:
- Truecaller's contact harvesting is its biggest reputational liability
- Play Store policies are tightening on bulk contact access
- DPDP Act 2023 (India) and GDPR require explicit consent
- Privacy-first is a genuine product differentiator

**Implementation**:
- `READ_CONTACTS` permission: optional, user-initiated
- `READ_CALL_LOG` permission: optional, with clear explanation
- All reports: explicit user action only
- Community labels: always marked as "community-reported"
- Personal numbers can be disputed and removed

---

## ADR-007: Spam Score Algorithm
**Date**: 2026-05-06  
**Status**: Accepted

**Decision**: Custom weighted scoring algorithm in `@clearring/spam-engine` package.

**Fraud weights**:
- FRAUD/FAKE_BANK: 35 points (max 3 unique reporters)
- SCAM/OTP_SCAM/PAYMENT_SCAM: 25-30 points (max 5 reporters)
- SPAM: 15 points (max 10 reporters)
- HARASSMENT: 10 points
- TELEMARKETING: 5 points
- SAFE: -20 points (max 5 reporters)

**Multipliers**:
- Recent reports (< 7 days): 1.5x
- High trust reporter (80+): 1.3x
- Low trust reporter (< 20): 0.6x

**Overrides**:
- Admin CONFIRMED_FRAUD: forced to 95
- Admin VERIFIED_SAFE: forced to 5
- Verified business + no fraud: -30

---

## ADR-008: JWT Authentication
**Date**: 2026-05-06  
**Status**: Accepted

**Decision**: JWT access tokens (15min) + refresh tokens (7d) stored in Redis.

**Dev credentials**:
- OTP: `123456` for any phone number in development
- Admin seed: `+911234567890`

**Reasoning**:
- Stateless for API scalability
- Short access token TTL reduces token theft impact
- Refresh tokens allow staying logged in without re-OTP

---

## ADR-009: Theme System
**Date**: 2026-05-06  
**Status**: Accepted

**Decision**: 5 themes using CSS custom properties on web, DataStore on Android.

**Themes**:
1. Crystal Glass (default) — glassmorphism
2. Midnight Trust — dark premium
3. Clean Light — professional
4. High Contrast — accessibility
5. True Signal — trust/green

**Implementation**:
- Web: Tailwind CSS classes + CSS custom properties
- Admin: Light/dark toggle (Tailwind dark mode)
- Android: DataStore preference → Compose MaterialTheme

---

## ADR-010: Android Call Screening Approach
**Date**: 2026-05-06  
**Status**: Accepted

**Decision**: Implement `CallScreeningService` with graceful fallback.

**Full functionality requires**:
- User sets ClearRing as default phone app, OR
- User grants `BIND_SCREENING_SERVICE` + `READ_CALL_LOG`
- Android 10+ (API 29+)

**Fallback behavior** (when permissions not granted):
- Manual number lookup still fully functional
- User can search any number from Home screen
- Clear messaging explaining how to enable call screening
- `PermissionEducationScreen` explains each permission

---

*All decisions documented here should be updated if they change during implementation.*
