FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY tsconfig*.json nest-cli.json ./

COPY src ./src

RUN npx nest build
 
# make seed scripts available in build stage
COPY scripts ./scripts

# Compile seed scripts to CommonJS so they can be run with plain Node
RUN npx tsc scripts/seed-faker.ts --outDir scripts-compiled --module commonjs --target es2020 --esModuleInterop

FROM node:20-alpine

RUN apk add --no-cache curl jq

WORKDIR /app

COPY --from=build /app/dist ./dist

COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/package.json ./package.json

COPY prisma ./prisma

# Ensure runtime has access to TypeScript seed scripts used by the entrypoint
COPY scripts ./scripts
COPY --from=build /app/scripts-compiled ./scripts-compiled

COPY --chmod=700 entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["entrypoint.sh"]
