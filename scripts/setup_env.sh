#!/usr/bin/env bash
# Script interactif pour compléter les variables d'environnement
# Appelé par `make install`
#
# Pour chaque variable contenant un placeholder (PICK_A_PASSWORD, ASK_A_MAINTAINER,
# YOUR_EMAIL, YOUR_MATTERMOST, CREATE_A_SECRET), le script :
# 1. Cherche la description dans ENV.md
# 2. Affiche la variable et sa description
# 3. Demande à l'utilisateur de saisir la valeur (ou Entrée pour garder le placeholder)
# 4. Remplace la valeur dans le fichier .env

set -euo pipefail

PLACEHOLDERS="PICK_A_PASSWORD|ASK_A_MAINTAINER|YOUR_EMAIL|YOUR_MATTERMOST_USERNAME|CREATE_A_SECRET_KEY"
ENV_DOC="ENV.md"

# Couleurs
CYAN='\033[36m'
YELLOW='\033[33m'
DIM='\033[2m'
RESET='\033[0m'

# Cherche la description d'une variable dans ENV.md
# Format attendu : | `VAR_NAME` | Description | ...
get_description() {
    local var_name="$1"
    if [ -f "$ENV_DOC" ]; then
        grep -m1 "| \`${var_name}\`" "$ENV_DOC" 2>/dev/null | sed 's/.*| `[^`]*` | \([^|]*\) |.*/\1/' | sed 's/^ *//;s/ *$//' || true
    fi
}

# Traite un fichier .env
process_env_file() {
    local env_file="$1"
    local label="$2"
    local found=0

    # Lire le fichier via fd 3 pour laisser stdin (/dev/tty) libre pour l'utilisateur
    while IFS= read -r line <&3; do
        # Ignorer les commentaires et lignes vides
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        [[ -z "$line" ]] && continue

        # Extraire nom=valeur
        local var_name="${line%%=*}"
        local var_value="${line#*=}"

        # Vérifier si la valeur contient un placeholder
        if echo "$var_value" | grep -qE "$PLACEHOLDERS"; then
            if [ $found -eq 0 ]; then
                echo ""
                echo -e "${CYAN}── ${label} ──${RESET}"
                found=1
            fi

            local description
            description=$(get_description "$var_name")

            echo ""
            echo -e "  ${CYAN}${var_name}${RESET}"
            if [ -n "$description" ]; then
                echo -e "  ${DIM}${description}${RESET}"
            fi
            echo -e "  ${DIM}Actuel : ${var_value}${RESET}"

            printf "  Valeur : "
            read -r new_value </dev/tty

            if [ -n "$new_value" ]; then
                # Utiliser un séparateur qui n'apparaît pas dans les valeurs
                sed -i.bak "s|^${var_name}=.*|${var_name}=${new_value}|" "$env_file"
            fi
        fi
    done 3< "$env_file"

    # Nettoyer les fichiers de backup
    rm -f "${env_file}.bak"

    if [ $found -eq 0 ]; then
        echo -e "  ${label} : ${DIM}aucune variable à compléter${RESET}"
    fi
}

# Main
echo ""
echo -e "${YELLOW}Configuration des variables d'environnement${RESET}"
echo -e "${DIM}Appuyez sur Entrée sans rien saisir pour garder la valeur actuelle.${RESET}"
echo -e "${DIM}Les valeurs ASK_A_MAINTAINER sont à demander à un mainteneur du projet.${RESET}"

has_placeholders=0

for env_file in ".env" "airflow/.env"; do
    if [ -f "$env_file" ] && grep -qE "$PLACEHOLDERS" "$env_file" 2>/dev/null; then
        has_placeholders=1
    fi
done

if [ $has_placeholders -eq 0 ]; then
    echo ""
    echo -e "  ${DIM}Toutes les variables sont déjà configurées.${RESET}"
    echo ""
    exit 0
fi

if [ -f ".env" ]; then
    process_env_file ".env" ".env — Application"
fi

if [ -f "airflow/.env" ]; then
    process_env_file "airflow/.env" "airflow/.env — Airflow"
fi

echo ""
echo -e "${DIM}Configuration terminée. Vous pouvez modifier ces valeurs à tout moment dans les fichiers .env.${RESET}"
echo ""
