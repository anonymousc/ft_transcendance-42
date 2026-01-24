FROM vault:1.13.3

COPY --chmod=766 tools/. /tools/

ENTRYPOINT [ "/tools/entrypoint.sh"]