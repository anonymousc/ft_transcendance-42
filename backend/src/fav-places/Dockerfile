FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

# ── Runtime ────────────────────────────────────────────────────────────────
FROM node:22-alpine

RUN apk add --no-cache curl jq

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json  ./package.json

COPY prisma  ./prisma
COPY src     ./src

COPY --chmod=700 entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 4002

ENTRYPOINT ["entrypoint.sh"]
