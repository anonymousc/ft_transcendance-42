FROM logbull/logbull:latest AS builder

FROM alpine:3.18

COPY --from=builder /app/ /app/

ENTRYPOINT ["/app/main"]