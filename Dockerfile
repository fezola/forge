FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN npm install -g @nestjs/cli prisma@6 && prisma generate --schema=apps/api/prisma/schema.prisma && cd apps/api && nest build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/packages ./packages

EXPOSE ${PORT}
RUN npm install -g prisma@6
CMD prisma db push --skip-generate && node dist/main
