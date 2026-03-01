FROM node:alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:alpine

RUN apk add jq curl

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

COPY --chmod=700 ./devops/backend-services/auth/auth.sh /usr/local/bin/auth.sh

RUN adduser -D auth && \
    chown -R auth:auth /app && \
    chown auth:auth /usr/local/bin/auth.sh

USER auth

ENTRYPOINT ["auth.sh"]
