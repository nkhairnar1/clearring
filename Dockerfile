# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# Copy workspace manifest files only (for layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/config/package.json          ./packages/config/
COPY packages/phone-utils/package.json     ./packages/phone-utils/
COPY packages/shared-types/package.json    ./packages/shared-types/
COPY packages/spam-engine/package.json     ./packages/spam-engine/
COPY packages/ui-tokens/package.json       ./packages/ui-tokens/
COPY services/api/package.json             ./services/api/

RUN pnpm install --frozen-lockfile

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

COPY --from=deps /app/node_modules         ./node_modules
COPY --from=deps /app/packages/config/node_modules       ./packages/config/node_modules
COPY --from=deps /app/packages/phone-utils/node_modules  ./packages/phone-utils/node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=deps /app/packages/spam-engine/node_modules  ./packages/spam-engine/node_modules
COPY --from=deps /app/services/api/node_modules          ./services/api/node_modules

COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY services/api/ ./services/api/

# Build internal workspace packages the API depends on
RUN pnpm --filter @clearring/config build       2>/dev/null || true
RUN pnpm --filter @clearring/phone-utils build  2>/dev/null || true
RUN pnpm --filter @clearring/shared-types build 2>/dev/null || true
RUN pnpm --filter @clearring/spam-engine build  2>/dev/null || true

# Generate Prisma client and compile the API
RUN pnpm --filter @clearring/api prisma:generate
RUN pnpm --filter @clearring/api build

# ---- Stage 3: Production image ----
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app/services/api

ENV NODE_ENV=production

# Workspace root node_modules (hoisted deps)
COPY --from=builder /app/node_modules /app/node_modules

# Built workspace packages
COPY --from=builder /app/packages/config/dist       /app/packages/config/dist
COPY --from=builder /app/packages/config/package.json /app/packages/config/package.json
COPY --from=builder /app/packages/phone-utils/dist       /app/packages/phone-utils/dist
COPY --from=builder /app/packages/phone-utils/package.json /app/packages/phone-utils/package.json
COPY --from=builder /app/packages/shared-types/dist       /app/packages/shared-types/dist
COPY --from=builder /app/packages/shared-types/package.json /app/packages/shared-types/package.json
COPY --from=builder /app/packages/spam-engine/dist       /app/packages/spam-engine/dist
COPY --from=builder /app/packages/spam-engine/package.json /app/packages/spam-engine/package.json

# API service
COPY --from=builder /app/services/api/dist         ./dist
COPY --from=builder /app/services/api/node_modules ./node_modules
COPY --from=builder /app/services/api/prisma       ./prisma
COPY --from=builder /app/services/api/package.json ./

EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
