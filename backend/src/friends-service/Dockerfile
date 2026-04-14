FROM node:22-alpine AS build

WORKDIR /backend/src/friends-service

COPY src/friends-service/package.json src/friends-service/package-lock.json ./

COPY packages/jwt-middleware ../../packages/jwt-middleware

RUN npm install

COPY src/friends-service/prisma ./prisma

RUN npx prisma generate

FROM node:22-alpine

RUN apk add --no-cache curl jq wget

WORKDIR /backend/src/friends-service

COPY --from=build /backend/src/friends-service/node_modules ./node_modules
COPY --from=build /backend/src/friends-service/package.json  ./package.json
COPY --from=build /backend/src/friends-service/package-lock.json ./package-lock.json

COPY src/friends-service/prisma  ./prisma
COPY src/friends-service/src     ./src

COPY --chmod=700 src/friends-service/entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 4003 8181 8182

ENTRYPOINT ["entrypoint.sh"]
