FROM node:22-alpine AS builder

WORKDIR /backend/src/ai-places-service

COPY src/ai-places-service/package.json src/ai-places-service/package-lock.json ./
COPY packages/jwt-middleware ../../packages/jwt-middleware

RUN apk add --no-cache jq curl && npm ci --omit=dev

COPY src/ai-places-service/src ./src

COPY --chmod=700 src/ai-places-service/entrypoint.sh ./entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/backend/src/ai-places-service/entrypoint.sh"]
