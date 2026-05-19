# ClearRing DevOps Engineer Skill

## Role
DevOps engineer responsible for Docker, environment variables, local setup, deployment-readiness, logs, database migrations, and runbooks.

## Infrastructure

### Local Development Stack
```
Docker Compose:
  clearring_postgres  (postgres:16-alpine, port 5432)
  clearring_redis     (redis:7-alpine, port 6379)

Native (pnpm):
  @clearring/api      (NestJS, port 3001)
  @clearring/web      (Next.js, port 3000)
  @clearring/admin    (Next.js, port 3002)
```

### Environment Files
- `.env.example` — template, committed to git
- `.env` — local values, gitignored
- `apps/android/local.properties` — Android BASE_URL, gitignored

## Runbooks

### First-Time Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file
cp .env.example .env
# Edit .env with your values (defaults work for local dev)

# 3. Start Docker services
pnpm docker:up

# 4. Wait for postgres to be ready
docker exec clearring_postgres pg_isready -U clearring -d clearring_db

# 5. Run migrations
pnpm db:migrate

# 6. Seed database
pnpm db:seed

# 7. Start services
pnpm dev:api   # Terminal 1
pnpm dev:web   # Terminal 2
pnpm dev:admin # Terminal 3
```

### Reset Everything
```bash
pnpm docker:reset     # Destroys all Docker volumes
pnpm db:migrate       # Re-run migrations
pnpm db:seed          # Re-seed
```

### Database Operations
```bash
# Open Prisma Studio (visual DB browser)
pnpm db:studio

# Connect to PostgreSQL directly
docker exec -it clearring_postgres psql -U clearring -d clearring_db

# Connect to Redis
docker exec -it clearring_redis redis-cli
```

### Check Service Health
```bash
# API health
curl http://localhost:3001/health

# Check all containers
docker ps --filter name=clearring

# Check logs
pnpm docker:logs
docker logs clearring_postgres
docker logs clearring_redis
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgres://... | Prisma connection |
| REDIS_URL | redis://localhost:6379 | Redis connection |
| API_PORT | 3001 | NestJS port |
| JWT_SECRET | (set this!) | JWT signing key |
| JWT_EXPIRES_IN | 15m | Access token TTL |
| JWT_REFRESH_EXPIRES_IN | 7d | Refresh token TTL |
| NODE_ENV | development | development/production |
| DEV_OTP | 123456 | Dev bypass OTP |
| THROTTLE_LIMIT | 100 | Rate limit per minute |
| CORS_ORIGINS | http://localhost:3000,... | Allowed origins |

## Android Backend URL

For emulator:
```
BASE_URL=http://10.0.2.2:3001/api/
```

For real device (same LAN):
```bash
# Find your computer's LAN IP
ipconfig  # Windows → IPv4 Address

# Set in apps/android/local.properties
BASE_URL=http://192.168.x.x:3001/api/
```

## Production Considerations (Future)
- Use environment-specific `.env.production`
- Use Docker secrets for JWT_SECRET
- Use `NODE_ENV=production` flag
- Enable SSL for PostgreSQL connection
- Use Redis with auth password
- Set `SWAGGER_ENABLED=false` in production
- Use PM2 or systemd for process management

## DO Rules
- Always use `.env` file, never hardcode secrets
- Always check Docker is running before starting API
- Always run migrations before seeding
- Document any new environment variables in `.env.example`

## DO NOT Rules
- Do not commit `.env` to git
- Do not commit `apps/android/local.properties` to git
- Do not run `prisma db push` in production (use `prisma migrate deploy`)
- Do not expose Redis without auth in production

## Quality Checklist
- [ ] `docker ps` shows postgres and redis containers running
- [ ] `curl http://localhost:3001/health` returns 200
- [ ] Prisma Studio opens and shows seed data
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has all required variables

## Commands
```bash
pnpm docker:up           # Start postgres + redis
pnpm docker:down         # Stop containers
pnpm docker:reset        # Destroy volumes and restart
pnpm docker:logs         # Follow container logs
pnpm db:migrate          # Run Prisma migrations
pnpm db:seed             # Run seed script
pnpm db:studio           # Open Prisma Studio
pnpm db:reset            # Reset and re-migrate database
```
