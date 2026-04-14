FROM node:22-alpine AS build

WORKDIR /backend/src/review-places

COPY src/review-places/package.json src/review-places/package-lock.json ./

COPY packages/jwt-middleware ../../packages/jwt-middleware

RUN npm ci

COPY src/review-places/prisma ./prisma

# Generate Prisma client from the schema
RUN npx prisma generate

# ── Runtime ────────────────────────────────────────────────────────────────
FROM node:22-alpine

RUN apk add --no-cache curl jq

WORKDIR /backend/src/review-places

COPY --from=build /backend/src/review-places/node_modules ./node_modules
COPY --from=build /backend/src/review-places/package.json  ./package.json
COPY --from=build /backend/src/review-places/package-lock.json ./package-lock.json

COPY src/review-places/prisma  ./prisma
COPY src/review-places/src     ./src

COPY --chmod=700 src/review-places/entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 4001

ENTRYPOINT ["entrypoint.sh"]
