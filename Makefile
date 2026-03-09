.DEFAULT_GOAL := start

.PHONY: help install install-airflow \
       start stop restart \
       start-airflow stop-airflow \
       migrate makemigrations shell createsuperuser restore-db \
       build test test-backend test-frontend test-airflow lint \
       logs logs-django logs-db logs-frontend

help: ## Affiche cette aide
	@echo ""
	@echo "  Lancer \033[36mmake\033[0m pour démarrer le projet."
	@echo "  Lancer \033[36mmake install\033[0m pour la première installation."
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ──────────────────────────────────────────────
# Installation
# ──────────────────────────────────────────────

install: install-docker install-airflow ## Installe tout le projet (backend + frontend + airflow)
	@test -f .env || (cp .env.example .env && echo "Fichier .env créé depuis .env.example")
	@test -f airflow/.env || (cp airflow/.env.example airflow/.env && echo "Fichier airflow/.env créé depuis airflow/.env.example")
	@bash scripts/setup_env.sh
	docker compose build
	docker compose up -d
	@echo "Création du bucket S3 local..."
	@docker compose exec s3 sh -c 'mkdir -p /data/sparte-local' 2>/dev/null || true
	@echo "En attente du démarrage de Django (migrations + paramètres)..."
	@until docker compose exec django python -c "import django" 2>/dev/null; do sleep 2; done
	@bash scripts/restore_db.sh
	@echo "Installation terminée. Site accessible sur http://localhost:8080/"

install-airflow: install-astro-cli ## Installe et démarre Airflow
	@docker info >/dev/null 2>&1 || (echo "Erreur : Docker n'est pas lancé. Démarrez Docker puis relancez la commande." && exit 1)
	@test -f airflow/.env || (cp airflow/.env.example airflow/.env && echo "Fichier airflow/.env créé — pensez à le compléter")
	cd airflow && astro dev start

install-docker: ## Installe Docker (macOS / Linux / Windows)
	@command -v docker >/dev/null 2>&1 && echo "Docker déjà installé" || ( \
		OS=$$(uname -s); \
		if [ "$$OS" = "Darwin" ]; then \
			echo "Installation de Docker Desktop via Homebrew (macOS)..." && \
			brew install --cask docker; \
		elif [ "$$OS" = "Linux" ]; then \
			echo "Installation de Docker (Linux)..." && \
			curl -fsSL https://get.docker.com | sh; \
		else \
			echo "Installation de Docker Desktop via winget (Windows)..." && \
			winget install -e --id Docker.DockerDesktop; \
		fi \
	)

install-astro-cli: ## Installe Astro CLI (macOS / Linux / Windows)
	@command -v astro >/dev/null 2>&1 && echo "Astro CLI déjà installé" || ( \
		OS=$$(uname -s); \
		if [ "$$OS" = "Darwin" ]; then \
			echo "Installation d'Astro CLI via Homebrew (macOS)..." && \
			brew install astronomer/tap/astro; \
		elif [ "$$OS" = "Linux" ]; then \
			echo "Installation d'Astro CLI (Linux)..." && \
			curl -sSL install.astronomer.io | sudo bash -s; \
		else \
			echo "Installation d'Astro CLI via winget (Windows)..." && \
			winget install -e --id Astronomer.Astro; \
		fi \
	)

# ──────────────────────────────────────────────
# Démarrage / Arrêt
# ──────────────────────────────────────────────

start: ## Démarre tous les services
	docker compose up -d

stop: ## Arrête tous les services
	docker compose down

restart: ## Redémarre tous les services
	docker compose restart

start-airflow: ## Démarre Airflow
	cd airflow && astro dev start

stop-airflow: ## Arrête Airflow
	cd airflow && astro dev stop

# ──────────────────────────────────────────────
# Base de données
# ──────────────────────────────────────────────

restore-db: ## Restaure la BDD depuis une base distante (ex: staging Scalingo)
	@bash scripts/restore_db.sh

# ──────────────────────────────────────────────
# Django
# ──────────────────────────────────────────────

migrate: ## Applique les migrations Django
	docker compose exec django python manage.py migrate

makemigrations: ## Génère les migrations Django
	docker compose exec django python manage.py makemigrations

shell: ## Ouvre un shell Django
	docker compose exec -it django python manage.py shell

createsuperuser: ## Crée un superutilisateur Django
	docker compose exec -it django python manage.py createsuperuser

# ──────────────────────────────────────────────
# Build / Qualité
# ──────────────────────────────────────────────

build: ## Rebuild les images Docker
	docker compose build

test: ## Lance les tests Python et JS
	docker compose exec django pytest
	docker compose exec frontend npm test

test-backend: ## Lance les tests Python
	docker compose exec django pytest

test-frontend: ## Lance les tests JS
	docker compose exec frontend npm test

test-airflow: ## Lance les tests Airflow
	cd airflow && astro dev pytest

lint: ## Lance le linter frontend
	docker compose exec frontend npm run lint

# ──────────────────────────────────────────────
# Logs
# ──────────────────────────────────────────────

logs: ## Affiche les logs de tous les services
	docker compose logs -f

logs-django: ## Affiche les logs Django
	docker compose logs -f django

logs-frontend: ## Affiche les logs du frontend
	docker compose logs -f frontend

logs-db: ## Affiche les logs de PostgreSQL
	docker compose logs -f db
