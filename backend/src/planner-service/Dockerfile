FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev && npx prisma generate

COPY src ./src

EXPOSE 7000

CMD ["node", "src/server.js"]
