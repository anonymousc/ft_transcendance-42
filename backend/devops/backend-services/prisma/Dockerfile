
FROM node/alpine:latest

RUN apk add -U curl bash ca-certificates openssl ncurses coreutils python3 make gcc g++ libgcc linux-headers grep util-linux binutils findutils


COPY --chmod=777 ./tools/prisma.sh ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
