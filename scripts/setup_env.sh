#!/usr/bin/env bash
# Script pour compléter les variables d'environnement
# Appelé par `make install`
#
# Deux modes :
# 1. Coller le contenu d'un fichier .env pour compléter les valeurs manquantes
# 2. Passer et compléter les fichiers .env manuellement

set -euo pipefail

PLACEHOLDERS="PICK_A_PASSWORD|ASK_A_MAINTAINER|YOUR_EMAIL|YOUR_MATTERMOST_USERNAME|CREATE_A_SECRET_KEY"

# Couleurs
CYAN='\033[36m'
YELLOW='\033[33m'
GREEN='\033[32m'
DIM='\033[2m'
RESET='\033[0m'

# ──────────────────────────────────────────────
# Coller un fichier .env
# ──────────────────────────────────────────────

# Applique des lignes KEY=VALUE sur un fichier .env existant
apply_secrets_to_env() {
    local env_file="$1"
    local content="$2"
    local count=0

    while IFS= read -r line; do
        # Ignorer les commentaires et lignes vides
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        [[ -z "$line" ]] && continue

        local var_name="${line%%=*}"
        local var_value="${line#*=}"

        # Remplacer dans le fichier .env si la variable existe
        if grep -q "^${var_name}=" "$env_file" 2>/dev/null; then
            sed -i.bak "s|^${var_name}=.*|${var_name}=${var_value}|" "$env_file"
            rm -f "${env_file}.bak"
            count=$((count + 1))
        fi
    done <<< "$content"

    echo "$count"
}

paste_env_content() {
    local env_file="$1"
    local label="$2"

    if [ ! -f "$env_file" ]; then
        return 0
    fi

    # Vérifier s'il y a des placeholders dans ce fichier
    if ! grep -qE "$PLACEHOLDERS" "$env_file" 2>/dev/null; then
        echo -e "  ${label} : ${DIM}aucune variable à compléter${RESET}"
        return 0
    fi

    echo ""
    echo -e "  ${CYAN}── ${label} ──${RESET}"
    echo -e "  ${DIM}Collez le contenu du fichier .env (lignes KEY=VALUE),${RESET}"
    echo -e "  ${DIM}puis appuyez sur Entrée pour terminer.${RESET}"
    echo -e "  ${DIM}Appuyez directement sur Entrée pour passer.${RESET}"
    echo ""

    # Masquer la saisie pour ne pas afficher les secrets
    stty -echo 2>/dev/null || true
    local pasted_content=""
    local line_count=0
    while IFS= read -r line </dev/tty; do
        [ -z "$line" ] && break
        pasted_content+="${line}"$'\n'
        line_count=$((line_count + 1))
    done
    stty echo 2>/dev/null || true

    # Afficher un retour visuel
    if [ $line_count -gt 0 ]; then
        echo -e "  ${DIM}(${line_count} lignes reçues)${RESET}"
    fi

    # Supprimer le dernier saut de ligne
    pasted_content="${pasted_content%$'\n'}"

    if [ -z "$pasted_content" ]; then
        echo -e "  ${DIM}Aucun contenu collé, fichier non modifié.${RESET}"
        return 0
    fi

    local count
    count=$(apply_secrets_to_env "$env_file" "$pasted_content")
    echo -e "  ${GREEN}${count} variables importées dans ${label}${RESET}"
}

import_from_paste() {
    echo ""
    echo -e "${YELLOW}Import par collage de fichier .env${RESET}"
    echo -e "${DIM}Demandez le fichier .env à un mainteneur du projet, puis collez son contenu ci-dessous.${RESET}"

    paste_env_content ".env" ".env"
    paste_env_content "airflow/.env" "airflow/.env"
}

# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

echo ""
echo -e "${YELLOW}Configuration des variables d'environnement${RESET}"

# Vérifier s'il y a des placeholders à compléter
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

# Choix du mode
echo ""
echo "  Comment configurer les variables ?"
echo ""
echo -e "  ${CYAN}1${RESET}) Coller le contenu d'un fichier .env"
echo -e "  ${CYAN}2${RESET}) Passer (compléter les fichiers .env manuellement)"
echo ""
printf "  Choix [1/2] : "
read -r choice </dev/tty

case "$choice" in
    1)
        import_from_paste
        ;;
    *)
        echo ""
        echo -e "  ${DIM}Pensez à compléter .env et airflow/.env avant de lancer l'application.${RESET}"
        echo -e "  ${DIM}Voir ENV.md pour la documentation.${RESET}"
        ;;
esac

echo ""
echo -e "${DIM}Configuration terminée. Vous pouvez modifier ces valeurs à tout moment dans les fichiers .env.${RESET}"
echo ""
