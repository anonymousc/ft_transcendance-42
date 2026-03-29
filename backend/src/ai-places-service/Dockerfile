FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

COPY src ./src

RUN npm ci --omit=dev

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY src/server.js ./src/server.js

EXPOSE 4000

CMD ["node", "src/server.js"]
