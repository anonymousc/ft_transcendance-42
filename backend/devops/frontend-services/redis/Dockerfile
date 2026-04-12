FROM redis:alpine3.21

RUN apk add --no-cache curl jq

COPY --chmod=700 entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]