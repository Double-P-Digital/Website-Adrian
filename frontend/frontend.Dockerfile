# Dockerfile pentru Next.js Frontend - OPTIMIZED
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# ============================================
# Stage 1: Install dependencies with cache
# ============================================
FROM base AS deps
RUN apk add --no-cache libc6-compat

# Copy package files from frontend directory
COPY Website-Adrian/frontend/package*.json ./

# Install with cache mount (MUCH faster rebuilds)
RUN --mount=type=cache,id=npm-frontend,target=/root/.npm \
    npm ci --prefer-offline

# ============================================
# Stage 2: Build the application
# ============================================
FROM base AS builder

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (excluding node_modules via .dockerignore)
COPY Website-Adrian/frontend/ .

# Next.js will automatically read .env.production.local during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
RUN npm run build

# ============================================
# Stage 3: Production runner (minimal)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    DOCKER_ENV=true \
    NEXT_PUBLIC_DOCKER_ENV=true \
    NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files from builder (standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT=3001 \
    HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
