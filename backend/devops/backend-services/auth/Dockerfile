FROM node:alpine

RUN apk add jq curl && adduser -D auth 

COPY --chown=auth:auth --chmod=700 ./auth.sh /usr/local/bin/auth.sh

ENTRYPOINT ["auth.sh"]
