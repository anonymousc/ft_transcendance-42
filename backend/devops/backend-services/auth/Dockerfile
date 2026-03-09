# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for better caching
COPY backend/package.json backend/package-lock.json ./

RUN npm ci

# Copy source files
COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json ./

# Generate Prisma client
RUN npx prisma generate

# Build the entire application (includes auth-main.ts)
RUN npx nest build

# Stage 2: Production
FROM node:20-alpine

RUN apk add --no-cache jq curl ca-certificates

WORKDIR /app

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Copy entrypoint script
COPY backend/devops/backend-services/auth/auth.sh /usr/local/bin/auth.sh
RUN chmod +x /usr/local/bin/auth.sh

# Create non-root user
RUN addgroup -g 1001 auth && \
    adduser -u 1001 -G auth -s /bin/sh -D auth && \
    chown -R auth:auth /app

USER auth

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

ENTRYPOINT ["auth.sh"]
