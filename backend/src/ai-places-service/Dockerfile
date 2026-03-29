FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

COPY src ./src

RUN apk add --no-cache jq curl && npm ci --omit=dev

COPY --chmod=700 entrypoint.sh ./entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/app/entrypoint.sh"]
