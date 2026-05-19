# ClearRing Backend Engineer Skill

## Role
Senior backend engineer responsible for NestJS API, Prisma schema, auth, rate limiting, spam scoring, and tests.

## Tech Stack
- Runtime: Node.js 20+
- Framework: NestJS with TypeScript
- ORM: Prisma with PostgreSQL
- Cache: Redis (ioredis)
- Auth: JWT access (15min) + refresh (7d)
- Validation: class-validator + class-transformer
- Docs: Swagger/OpenAPI (@nestjs/swagger)
- Rate limiting: @nestjs/throttler with Redis store
- Tests: Jest + supertest

## Module Structure
```
services/api/src/
  modules/
    auth/
    users/
    numbers/
    reports/
    business/
    disputes/
    admin/
    analytics/
    audit-logs/
    health/
  shared/
    guards/           # JWT, roles, admin guards
    decorators/       # CurrentUser, Roles
    pipes/            # ValidationPipe, ParseE164Pipe
    interceptors/     # ResponseInterceptor, CacheInterceptor
    filters/          # GlobalExceptionFilter
    redis/            # Redis module
    prisma/           # PrismaService
```

## Key Patterns

### Phone Number Handling
```typescript
// Always normalize to E.164 before storing
import { toE164 } from '@clearring/phone-utils';
const e164 = toE164(input, 'IN');
if (!e164) throw new BadRequestException('Invalid phone number');
```

### Spam Score Update
```typescript
// Always recalculate after any report or admin action
import { calculateSpamScore } from '@clearring/spam-engine';
const result = calculateSpamScore({ reports, isVerified, adminOverride, disputeApprovedCount });
await prisma.phoneNumber.update({ where: { id }, data: { spamScore: result.score, riskLevel: result.riskLevel } });
```

### Cache Pattern
```typescript
const cacheKey = `lookup:${e164}`;
const cached = await redis.get(cacheKey);
if (cached) return { ...JSON.parse(cached), fromCache: true };
// ... fetch from DB
await redis.setex(cacheKey, 3600, JSON.stringify(result));
```

### OTP Dev Bypass
```typescript
if (process.env.NODE_ENV === 'development' && otp === process.env.DEV_OTP) {
  return true; // dev bypass
}
```

## DO Rules
- Normalize all phone numbers to E.164 before storing
- Validate all inputs with class-validator DTOs
- Return consistent `{ success, data, message, timestamp }` responses
- Log all admin actions to audit_logs table
- Rate limit: lookup (30/min), report (5/10min), auth (10/min)
- Recalculate spam score after every report, safe-mark, or admin override
- Invalidate Redis cache after any score change

## DO NOT Rules
- Do not store raw phone numbers without E.164 normalization
- Do not expose admin endpoints without ADMIN role guard
- Do not return full user records (mask phone digits in public responses)
- Do not allow a single user to inflate spam scores (deduplication required)
- Do not skip audit logging for admin actions

## Prisma Schema Rules
- All IDs: CUID (`@default(cuid())`)
- All timestamps: `@default(now())` and `@updatedAt`
- All phone numbers: store as `e164_number` (unique index)
- All enums: defined in Prisma schema and shared-types

## Quality Checklist
- [ ] All endpoints have Swagger docs
- [ ] All inputs validated with DTO + class-validator
- [ ] JWT guard on protected endpoints
- [ ] Role guard on admin endpoints
- [ ] Phone numbers normalized to E.164
- [ ] Spam score recalculated after reports
- [ ] Redis cache invalidated after updates
- [ ] Audit log written for admin actions
- [ ] Rate limiting on auth and report endpoints
- [ ] Tests for core flows (auth, lookup, report, admin)

## Definition of Done
- `pnpm dev:api` starts without errors
- `curl http://localhost:3001/health` returns `{ status: "ok" }`
- Swagger at `http://localhost:3001/api/docs`
- `pnpm db:seed` creates all seed data
- `pnpm test:api` passes all tests

## Commands
```bash
pnpm dev:api                                    # Start dev server
pnpm --filter @clearring/api prisma:migrate:dev # Run migrations
pnpm --filter @clearring/api prisma:seed        # Run seed
pnpm --filter @clearring/api prisma:studio      # Open Prisma Studio
pnpm test:api                                   # Run API tests
```
