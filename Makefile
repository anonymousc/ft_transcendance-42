DOCKER=docker

CONTAINERS = $(shell ${DOCKER} ps -aq)

IMAGES= $(shell ${DOCKER} images -aq)

VOLUMES= $(shell ${DOCKER} volume ls -q)

NETWORKS= $(shell ${DOCKER} network ls -q)

COMPOSE=backend/devops/docker-compose.yml

all : 
	$(DOCKER) compose -f ${COMPOSE} build --no-cache
	$(DOCKER) compose -f ${COMPOSE} up -d
frontend:
	$(DOCKER) compose -f ${COMPOSE} build frontend
	$(DOCKER) compose -f ${COMPOSE} up frontend -d
# backend:
# 	$(DOCKER) compose -f ${COMPOSE} build backend --no-cache
# 	$(DOCKER) compose -f ${COMPOSE} up backend -d
clean :
	@echo "start cleaning"
	@$(DOCKER) compose -f ${COMPOSE} stop
	@$(DOCKER) compose -f ${COMPOSE} down --remove-orphans --rmi all -v
	@$(DOCKER) rm $(CONTAINERS) 2> /dev/null || echo "no containers to clean"
	@$(DOCKER) rmi -f $(IMAGES) 2> /dev/null || echo "no image to clean"
	@$(DOCKER) volume rm -f $(VOLUMES) 2> /dev/null || echo "no volume to clean"
	@$(DOCKER) network rm -f $(NETWORKS) 2> /dev/null || echo "no network to clean"
	@echo "cleaned"

.PHONY: frontend