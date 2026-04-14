FROM node:22-alpine

WORKDIR /backend/src/planner-service

COPY src/planner-service/package.json src/planner-service/package-lock.json ./
COPY packages/jwt-middleware ../../packages/jwt-middleware

COPY src/planner-service/prisma ./prisma

RUN apk add jq curl && npm ci --omit=dev && npx prisma generate

COPY src/planner-service/src ./src

COPY --chmod=700 src/planner-service/entrypoint.sh ./entrypoint.sh

EXPOSE 7000

ENTRYPOINT [ "/backend/src/planner-service/entrypoint.sh" ]
