#!/usr/bin/env bash
# Restaure une base de données distante (ex: staging Scalingo) dans le PostgreSQL local.
# Utilise pg_dump via Docker pour garantir la compatibilité de version PostgreSQL.
# Appelé par `make install` ou `make restore-db`.

set -euo pipefail

# Couleurs
CYAN='\033[36m'
YELLOW='\033[33m'
GREEN='\033[32m'
RED='\033[31m'
DIM='\033[2m'
RESET='\033[0m'

# ──────────────────────────────────────────────
# Dépendances
# ──────────────────────────────────────────────

# Version PostgreSQL utilisée (doit correspondre à celle du docker-compose.yml)
PG_VERSION="17"
PG_DOCKER_IMAGE="postgres:${PG_VERSION}-alpine"

ensure_docker() {
    if ! command -v docker &>/dev/null; then
        echo -e "  ${RED}Docker est requis pour ce script.${RESET}"
        return 1
    fi
}

# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

echo ""
echo -e "${YELLOW}Restauration de la base de données${RESET}"
echo -e "${DIM}Copie une base distante dans le PostgreSQL local via pg_dump | psql.${RESET}"
echo -e "${DIM}Privilégiez l'environnement de staging pour ne pas impacter la production.${RESET}"
echo ""
echo -e "${DIM}Le connection string est disponible sur Scalingo :${RESET}"
echo -e "${DIM}  Dashboard > App > Resources > PostgreSQL > Connection string${RESET}"
echo ""

ensure_docker || exit 1

# Demander le connection string de la base source
printf "  Connection string de la base source : "
read -r source_url </dev/tty
if [ -z "$source_url" ]; then
    echo -e "  ${RED}Connection string requis.${RESET}"
    exit 1
fi

# Vérifier la connexion à la source (via Docker pour avoir la bonne version)
echo ""
echo -e "  ${DIM}Test de connexion à la base source...${RESET}"
if ! docker run --rm --network host "$PG_DOCKER_IMAGE" psql "$source_url" -c "SELECT 1" &>/dev/null; then
    echo -e "  ${RED}Impossible de se connecter à la base source.${RESET}"
    echo -e "  ${DIM}Vérifiez le connection string et que votre IP est autorisée.${RESET}"
    exit 1
fi
echo -e "  ${GREEN}Connexion OK${RESET}"

# Lire les identifiants de la base locale depuis .env
if [ -f .env ]; then
    PGUSER=$(grep -m1 '^POSTGRES_USER=' .env | cut -d= -f2)
    PGPASSWORD=$(grep -m1 '^POSTGRES_PASSWORD=' .env | cut -d= -f2)
    PGDB=$(grep -m1 '^POSTGRES_DB=' .env | cut -d= -f2)
fi
PGUSER="${PGUSER:-postgres}"
PGPASSWORD="${PGPASSWORD:-}"
PGDB="${PGDB:-postgres}"
PGPORT="5555"  # Port exposé dans docker-compose.yml

# Arrêter Django et les autres services connectés à la base
echo -e "  ${DIM}Arrêt de Django (pour libérer les connexions à la base)...${RESET}"
docker compose stop django 2>/dev/null || true

# Vérifier que le container DB tourne
if ! docker compose ps db --status running 2>/dev/null | grep -q "db"; then
    echo -e "  ${DIM}Démarrage du container PostgreSQL...${RESET}"
    docker compose up -d db
    sleep 3
fi

# Vérifier la connexion locale
export PGPASSWORD
if ! docker run --rm --network host -e PGPASSWORD="$PGPASSWORD" "$PG_DOCKER_IMAGE" \
    psql -h localhost -p "$PGPORT" -U "$PGUSER" -d postgres -c "SELECT 1" &>/dev/null; then
    echo -e "  ${RED}Impossible de se connecter au PostgreSQL local (localhost:${PGPORT}).${RESET}"
    exit 1
fi

# Drop et recréer la base pour partir propre
echo ""
echo -e "  ${CYAN}Restauration dans la base locale (${PGDB} sur localhost:${PGPORT})...${RESET}"
echo -e "  ${DIM}Cela peut prendre plusieurs minutes selon la taille de la base.${RESET}"
echo ""

docker run --rm --network host -e PGPASSWORD="$PGPASSWORD" "$PG_DOCKER_IMAGE" \
    dropdb -h localhost -p "$PGPORT" -U "$PGUSER" --if-exists "$PGDB"
docker run --rm --network host -e PGPASSWORD="$PGPASSWORD" "$PG_DOCKER_IMAGE" \
    createdb -h localhost -p "$PGPORT" -U "$PGUSER" -T template0 "$PGDB"

# pg_dump depuis la source | psql dans la destination (via Docker pour la compatibilité de version)
# --no-owner --no-acl : ignore les rôles qui n'existent pas en local
docker run --rm --network host "$PG_DOCKER_IMAGE" \
    pg_dump "$source_url" --no-owner --no-acl --format=plain | \
    docker run --rm -i --network host -e PGPASSWORD="$PGPASSWORD" "$PG_DOCKER_IMAGE" \
    psql -h localhost -p "$PGPORT" -U "$PGUSER" -d "$PGDB" --quiet 2>&1 | \
    grep -i "error" || true

# Relancer Django
echo -e "  ${DIM}Redémarrage de Django...${RESET}"
docker compose start django 2>/dev/null || true

echo ""
echo -e "  ${GREEN}Base de données restaurée.${RESET}"
echo ""
