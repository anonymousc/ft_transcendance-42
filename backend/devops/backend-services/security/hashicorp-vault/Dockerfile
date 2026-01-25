FROM vault:1.13.3

RUN apk add --no-cache openssl

COPY --chmod=766 tools/. /tools/

ENTRYPOINT [ "/tools/entrypoint.sh"]