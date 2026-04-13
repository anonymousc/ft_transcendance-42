FROM owasp/modsecurity:nginx-alpine

COPY default.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT [ "nginx" ]

CMD ["-g", "daemon off;"]
