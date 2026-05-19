# ClearRing MCP Operator Skill

## Role
MCP operator responsible for using available MCP servers effectively for ClearRing development.

## Available MCP Servers

| Server | Tools | When to Use |
|--------|-------|-------------|
| filesystem | Read, Write, Edit, Glob, Grep | File operations |
| playwright | browser_navigate, browser_screenshot, browser_click | UI testing |
| git | git_status, git_diff, git_commit | Version control |
| postgres | query | Database inspection |
| sequential-thinking | sequentialthinking | Complex planning |
| memory | read_graph, create_entities | Project memory |
| fetch/search | WebFetch, WebSearch | Research |

## Common MCP Workflows

### Check Database After Seed
```sql
-- Via postgres MCP or docker exec
SELECT e164_number, display_label, spam_score, risk_level, is_verified
FROM phone_numbers
ORDER BY spam_score DESC
LIMIT 20;
```

### Test Lookup API via Playwright
```javascript
// Navigate to Swagger
await page.goto('http://localhost:3001/api/docs');
// Or test via fetch
await page.evaluate(() => 
  fetch('/api/numbers/lookup?number=+914422334455').then(r => r.json())
);
```

### Verify Website Glass Effect
```javascript
// Take screenshot
await page.goto('http://localhost:3000');
await page.screenshot({ path: 'website-screenshot.png' });
// Check backdrop-filter applied
const blur = await page.locator('.glass-card').evaluate(el => 
  getComputedStyle(el).backdropFilter
);
```

### Check Admin Dashboard Renders
```javascript
await page.goto('http://localhost:3002');
// Should redirect to login
await expect(page).toHaveURL('/login');
await page.fill('[name=phone]', '+911234567890');
await page.fill('[name=otp]', '123456');
await page.click('[type=submit]');
await expect(page).toHaveURL('/dashboard');
```

## Fallback Procedures

### If Playwright MCP Unavailable
```bash
# Use Bash to run playwright directly
npx playwright test
npx playwright show-report
```

### If PostgreSQL MCP Unavailable
```bash
docker exec -it clearring_postgres psql -U clearring -d clearring_db -c "SELECT * FROM phone_numbers LIMIT 5;"
```

### If filesystem MCP Unavailable
Use Read/Write/Edit tools directly in Claude Code.

### If git MCP Unavailable
```bash
git status
git diff
git log --oneline -10
```

## Android Build via Bash
```bash
cd apps/android
./gradlew assembleDebug 2>&1 | tail -50
adb devices
adb install app/build/outputs/apk/debug/app-debug.apk
adb logcat | grep ClearRing
```

## Key File Paths to Know

| Path | Description |
|------|-------------|
| `services/api/src/main.ts` | NestJS bootstrap |
| `services/api/prisma/schema.prisma` | Database schema |
| `services/api/prisma/seed.ts` | Seed data |
| `apps/web/src/app/page.tsx` | Website home page |
| `apps/admin/src/app/page.tsx` | Admin home |
| `apps/android/app/src/main/java/.../MainActivity.kt` | Android entry |
| `packages/spam-engine/src/scorer.ts` | Spam algorithm |
| `packages/phone-utils/src/normalizer.ts` | Phone normalization |
| `docker-compose.yml` | Docker services |
| `.env.example` | Environment template |
| `docs/PROJECT_STATUS.md` | Build status |

## DO Rules
- Check if Docker is running before starting API
- Verify migrations ran before testing API endpoints
- Use playwright for visual verification of UI components
- Query postgres to verify seed data is correct
- Use sequential-thinking for debugging complex issues

## DO NOT Rules
- Do not run `pnpm db:reset` without confirming with user
- Do not run git destructive commands without user approval
- Do not push to remote without user confirmation
- Do not run `docker compose down -v` without user approval (destroys data)
