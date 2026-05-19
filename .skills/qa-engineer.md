# ClearRing QA Engineer Skill

## Role
QA lead responsible for backend API tests, spam engine unit tests, admin flow tests, website Playwright tests, Android tests, and regression checks.

## Test Stack
- Backend: Jest + supertest (integration), Jest (unit)
- Shared packages: Jest + ts-jest
- Website/Admin: Playwright
- Android: JUnit4 + Espresso (unit + UI)

## Test Scope

### Spam Engine Tests (`packages/spam-engine`)
```bash
pnpm test:spam-engine
```
- Safe score with no reports → score ≤ 20
- CONFIRMED_FRAUD override → score = 95
- VERIFIED_SAFE override → score = 5
- Single fraud report → score > 60
- Fraud reporter cap (max 3) applied correctly
- Same user deduped (no double counting)
- Safe reports reduce score
- Verified business reduces score (no fraud)
- Approved disputes reduce score
- High trust reporter contributes more
- Recent reports get recency bonus
- Score always clamped [0, 100]
- OTP scam with flag increases score

### Phone Utils Tests (`packages/phone-utils`)
```bash
pnpm --filter @clearring/phone-utils test
```
- +919876543210 → valid E.164
- 9876543210 → +919876543210 (Indian default)
- +1 415 555 1234 → valid US E.164
- Invalid string → null
- isSameNumber(a, b) → true when same number, different format
- isIndianMobile → true for 6-9xxxxxx format
- isTollFree → true for 1800 numbers

### Backend API Tests (`services/api`)
```bash
pnpm test:api
```

**Auth tests**:
- POST /auth/send-otp with valid number → 200
- POST /auth/verify-otp with 123456 in dev → returns tokens
- POST /auth/verify-otp with wrong OTP → 401
- GET /auth/me without token → 401
- GET /auth/me with token → returns user

**Lookup tests**:
- GET /numbers/lookup?number=+914422334455 → verified hospital
- GET /numbers/lookup?number=+919876543210 → HIGH_RISK loan spam
- GET /numbers/lookup?number=INVALID → 400

**Report tests**:
- POST /numbers/report → creates report, recalculates score
- POST /numbers/report twice with same user and type → deduped
- POST /numbers/report without auth → 401

**Admin tests**:
- GET /admin/dashboard without admin token → 403
- GET /admin/dashboard with admin token → returns stats
- PATCH /admin/numbers/:id with override → updates score

### Website Playwright Tests (`apps/web`)
```bash
pnpm --filter @clearring/web test:e2e
```
- Home page loads (status 200)
- Hero section visible
- App screen section visible with phone mockups
- Waitlist form: enter email → success message
- Glass theme elements have backdrop-blur

### Admin Playwright Tests (`apps/admin`)
```bash
pnpm --filter @clearring/admin test:e2e
```
- Login page renders
- Login with admin credentials → redirects to dashboard
- Dashboard shows KPI cards
- Numbers table renders
- Reports table renders with pending/approved tabs

## DO Rules
- Write tests before marking a feature "done"
- Always test error cases, not just happy path
- Use fixtures/factories for test data
- Clean up test data after each test (use transactions or fresh DB)
- Check test coverage for spam engine (target 80%+)

## DO NOT Rules
- Do not test implementation details (test behavior)
- Do not leave flaky async tests without proper waits
- Do not use hardcoded sleeps — use proper awaits
- Do not skip edge cases for phone number normalization

## Quality Checklist
- [ ] Spam engine: all 12 test cases pass
- [ ] Phone utils: all normalization tests pass
- [ ] API auth flow: send OTP → verify → get me
- [ ] API lookup: verified number returns correct risk
- [ ] API report: duplicate deduplication works
- [ ] Website: renders and waitlist form works
- [ ] Admin: login and dashboard render

## Definition of Done
```bash
pnpm test        # All tests pass
pnpm build       # All packages build
pnpm lint        # No lint errors
```

## Commands
```bash
pnpm test                          # Run all tests
pnpm test:spam-engine              # Spam engine unit tests
pnpm test:api                      # Backend integration tests
npx playwright test --project=web  # Website E2E
npx playwright test --project=admin # Admin E2E
```
