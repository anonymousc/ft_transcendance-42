FROM node:alpine3.18

RUN apk add postgresql

COPY --chmod=777 tools/prisma.sh ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

