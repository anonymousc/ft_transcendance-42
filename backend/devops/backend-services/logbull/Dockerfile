# Stage 1: Get logbull binary
FROM logbull/logbull:latest AS builder

# Stage 2: Minimal runtime image
FROM alpine:3.20

# Install only required runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1000 logbull && \
    adduser -u 1000 -G logbull -s /bin/sh -D logbull

# Create necessary directories
RUN mkdir -p /app/logs /app/config && \
    chown -R logbull:logbull /app

WORKDIR /app

# Copy only the binary from builder
COPY --from=builder /app/main /app/main

# Set proper permissions
RUN chmod +x /app/main

# Switch to non-root user
USER logbull

# Expose metrics port
EXPOSE 9100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:9100/health || exit 1

ENTRYPOINT ["/app/main"]