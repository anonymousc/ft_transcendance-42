FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY tsconfig*.json nest-cli.json ./

COPY src ./src

RUN npx nest build

FROM node:20-alpine

RUN apk add --no-cache curl jq

WORKDIR /app

COPY --from=build /app/dist ./dist

COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/package.json ./package.json

COPY prisma ./prisma

COPY --chmod=700 entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["entrypoint.sh"]
