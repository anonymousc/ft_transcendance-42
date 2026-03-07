FROM node:20-alpine AS build

WORKDIR /app

COPY . .

RUN npm ci && npx nest build

FROM node:20-alpine

RUN apk add --no-cache curl jq 

WORKDIR /app

COPY --from=build /app/ ./

COPY --chmod=700 ./devops/tools/entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]