FROM rabbitmq:3.13-alpine

# Install dependencies for Vault integration
RUN apk add --no-cache curl jq su-exec

# Copy configuration files
COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf
COPY enabled_plugins /etc/rabbitmq/enabled_plugins

# Ensure proper ownership
RUN chown -R rabbitmq:rabbitmq /etc/rabbitmq /var/lib/rabbitmq

# Copy entrypoint script
COPY --chmod=755 entrypoint.sh /usr/local/bin/custom-entrypoint.sh

# Only expose AMQP and Prometheus metrics (no management UI)
EXPOSE 5672 15692

ENTRYPOINT ["custom-entrypoint.sh"]
