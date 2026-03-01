FROM node:18-alpine AS build

WORKDIR /app

COPY . .

RUN npm ci --production=false

RUN npm run build

FROM node:18-alpine

RUN apk add --no-cache curl jq 

WORKDIR /app

COPY --from=build /app/ ./

COPY --chmod=700 ./devops/tools/entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]