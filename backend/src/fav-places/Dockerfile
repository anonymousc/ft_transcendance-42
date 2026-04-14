FROM node:22-alpine AS build

WORKDIR /backend/src/fav-places

COPY src/fav-places/package.json src/fav-places/package-lock.json ./

COPY packages/jwt-middleware ../../packages/jwt-middleware

RUN npm ci

COPY src/fav-places/prisma ./prisma

RUN npx prisma generate

# runtime files

FROM node:22-alpine

RUN apk add --no-cache curl jq

WORKDIR /backend/src/fav-places

COPY --from=build /backend/src/fav-places/node_modules ./node_modules
COPY --from=build /backend/src/fav-places/package.json  ./package.json
COPY --from=build /backend/src/fav-places/package-lock.json ./package-lock.json

COPY src/fav-places/prisma  ./prisma
COPY src/fav-places/src     ./src

COPY --chmod=700 src/fav-places/entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 4002

ENTRYPOINT ["entrypoint.sh"]
