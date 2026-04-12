FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma

RUN apk add jq curl && npm ci --omit=dev && npx prisma generate

COPY src ./src

COPY --chmod=700 entrypoint.sh ./entrypoint.sh

EXPOSE 7000

ENTRYPOINT [ "/app/entrypoint.sh" ]
