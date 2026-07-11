# =============================================================================
# Forge Dashboard — Next.js multi-stage Docker build (standalone output)
# =============================================================================

# ── Base ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate
WORKDIR /app

# ── Dependencies ────────────────────────────────────────────────────────────
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

# ── Builder ─────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN pnpm --filter @forge/dashboard run build

# ── Runner ──────────────────────────────────────────────────────────────────
FROM node:20-alpine-slim AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=builder /app/apps/dashboard/.next/standalone ./
RUN mkdir -p apps/dashboard/.next
COPY --from=builder /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT} || exit 1

EXPOSE ${PORT}
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/dashboard/server.js"]
