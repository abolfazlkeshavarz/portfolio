.DEFAULT_GOAL := help
SHELL := /bin/bash

.PHONY: help setup dev build deploy up up-prebuilt down restart logs ps ssl images load-images clean

help: ## Show this help
	@echo ""
	@echo "  Portfolio — abolfazlkeshavarz"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  First deploy on a fresh VPS:  ./scripts/bootstrap-vps.sh"
	@echo ""

setup: ## Create .env from .env.example
	@./scripts/setup-env.sh

dev: ## Run the Vite dev server locally (no Docker)
	@npm install && npm run dev

build: ## Build the static site locally into dist/
	@npm install && npm run build

deploy: ## Build the image and start the site
	@docker compose up -d --build
	@echo ""
	@echo "Site is running. Add TLS with: make ssl"

up: ## Start the site (building only if the image is missing)
	@docker compose up -d

up-prebuilt: ## Start the site from an already-loaded image, never building
	@docker compose up -d --no-build

down: ## Stop the site
	@docker compose down

restart: ## Restart the container
	@docker compose restart

logs: ## Follow container logs
	@docker compose logs -f --tail=100

ps: ## Show container status
	@docker compose ps

ssl: ## Configure host nginx + obtain the Let's Encrypt certificate
	@./scripts/deploy-host-nginx.sh

images: ## Build the image here and pack it into a tarball for the server
	@./scripts/build-images.sh

load-images: ## Load an image tarball on the server
	@./scripts/load-images.sh

clean: ## Remove local build output
	@rm -rf dist dist-image
	@echo "Removed dist/ and dist-image/"
