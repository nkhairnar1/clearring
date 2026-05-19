# ClearRing Security & Privacy Reviewer Skill

## Role
Security and privacy reviewer responsible for privacy-first behavior, permission minimization, secure auth, anti-abuse, rate limits, audit logs, and app-store-safe choices.

## Privacy Principles

### Non-Negotiable Rules
1. No automatic contact book upload
2. No silent background data collection
3. No storing private personal names from contact books
4. Contacts permission is optional and requested with explanation
5. Call log permission is optional and requested with explanation
6. Manual lookup MUST work without any permissions
7. Users can delete their account and all reports they submitted
8. Community labels must be labeled as "community-reported"
9. Personal numbers can be disputed and removed

### Play Store Compliance
- Do not request permissions not listed in AndroidManifest.xml
- Do not request SMS permissions unless SMS filtering is explicitly offered
- Explain each permission before requesting it
- Do not silently upload contacts in background (Play Store policy violation)
- Do not use READ_PHONE_STATE to harvest IMEI/device IDs

## Auth Security

### JWT Implementation
- Access token: 15 minutes TTL (short to limit exposure)
- Refresh token: 7 days TTL, stored in Redis (revocable)
- JWT_SECRET: minimum 32 characters
- Never log JWT tokens
- Refresh token rotation (issue new refresh on each use)

### OTP Security
- OTP: 6-digit numeric code
- OTP TTL: 5 minutes in Redis
- Max OTP attempts: 3 before cooldown
- Rate limit: 3 OTP requests per phone per 10 minutes
- Dev bypass: only active when `NODE_ENV=development`

### Rate Limiting
```typescript
// Global throttler configuration
ThrottlerModule.forRoot([
  { name: 'global', ttl: 60000, limit: 100 },
  { name: 'lookup', ttl: 60000, limit: 30 },
  { name: 'report', ttl: 600000, limit: 5 },
  { name: 'auth', ttl: 60000, limit: 10 },
])
```

## Anti-Abuse Rules

### Report Spam Prevention
- Same user cannot submit more than 1 report of the same type for the same number
- User trust score starts at 50, increases with approved reports, decreases with rejected
- Low trust score reporters have lower report weight (multiplier 0.6)
- Report deduplication runs in spam engine before score calculation

### Score Inflation Prevention
- Cap fraud reporters at 3 unique users
- Cap scam reporters at 5 unique users
- Cap spam reporters at 10 unique users
- Admin can override any score (CONFIRMED_FRAUD or VERIFIED_SAFE)

## Audit Logging

All admin actions must be logged to `audit_logs`:
```typescript
// Required for:
- Admin updates a phone number label
- Admin approves/rejects a business claim
- Admin approves/rejects a report
- Admin bans a user
- Admin overrides a spam score
- Admin approves a dispute
```

Required fields: `actor_user_id`, `action`, `entity_type`, `entity_id`, `metadata`, `created_at`

## Input Validation

### Phone Number
- Always normalize to E.164 before storing
- Reject invalid phone numbers with 400 Bad Request
- Never store raw user input as phone number

### Report Inputs
- Validate `reportType` against enum
- Max notes length: 500 characters
- Sanitize all string inputs (trim, no HTML)

### SQL Injection Prevention
- Prisma uses parameterized queries (safe by default)
- Never use raw SQL with user input (`prisma.$queryRaw` template literals only)

## CORS Configuration
```typescript
// Only allow known origins
cors: {
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: true,
}
```

## Sensitive Data Handling
- Never log phone numbers of private users in plain text
- Never expose JWT_SECRET or JWT_REFRESH_SECRET in logs
- Never return OTP values in API responses
- Mask phone digits in public-facing reports

## DO Rules
- Validate all inputs at API boundary
- Rate limit all mutation endpoints
- Log all admin actions to audit table
- Check user role before every admin endpoint
- Refresh token rotation on each refresh
- Store refresh tokens in Redis (revocable)

## DO NOT Rules
- Do not log JWT tokens
- Do not log OTP codes (dev console output only, not persistent)
- Do not use eval() or dynamic code execution
- Do not allow SQL injection via raw queries with user input
- Do not expose internal error details in production responses
- Do not allow mass-assignment of sensitive fields

## Quality Checklist
- [ ] Rate limiting on auth endpoints (10/min)
- [ ] Rate limiting on report endpoint (5/10min)
- [ ] Rate limiting on lookup endpoint (30/min)
- [ ] JWT guard on all protected routes
- [ ] Role guard (ADMIN+) on all admin routes
- [ ] Audit log written for admin actions
- [ ] OTP expires in 5 minutes
- [ ] OTP attempts limited to 3
- [ ] Report deduplication prevents score inflation
- [ ] No contact book upload in Android app
- [ ] All permissions have skip option
- [ ] Personal numbers can be disputed

## Incident Response
1. If a private personal number gets high spam score:
   - User files dispute via `/disputes` endpoint
   - Admin reviews and approves → score reset, label removed
   - Number marked as `disputeStatus: APPROVED`

2. If spam score gaming is detected:
   - Admin bans reporter (PATCH /admin/users/:id)
   - Reporter's past reports get weight 0
   - Re-run score calculation for affected numbers
