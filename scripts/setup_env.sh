#!/usr/bin/env bash
# Script interactif pour compléter les variables d'environnement
# Appelé par `make install`
#
# Deux modes :
# 1. Vaultwarden : importe les secrets depuis deux secure notes Bitwarden/Vaultwarden
# 2. Interactif : demande chaque variable à compléter une par une
#
# Organisation Vaultwarden attendue :
#   - Deux secure notes contenant uniquement les variables secrètes (KEY=VALUE)
#   - Le script demande l'URL du serveur, la clé API, et les liens des deux notes
#   - Les .env sont d'abord créés depuis .env.example, puis les secrets remplacent les placeholders.

set -euo pipefail

PLACEHOLDERS="PICK_A_PASSWORD|ASK_A_MAINTAINER|YOUR_EMAIL|YOUR_MATTERMOST_USERNAME|CREATE_A_SECRET_KEY"
ENV_DOC="ENV.md"

# Couleurs
CYAN='\033[36m'
YELLOW='\033[33m'
GREEN='\033[32m'
RED='\033[31m'
DIM='\033[2m'
RESET='\033[0m'

# ──────────────────────────────────────────────
# Vaultwarden
# ──────────────────────────────────────────────

ensure_bw_cli() {
    if command -v bw &>/dev/null; then
        return 0
    fi

    echo -e "  ${DIM}Bitwarden CLI (bw) non trouvé — installation...${RESET}"
    local os
    os=$(uname -s)

    case "$os" in
        Darwin)
            if command -v brew &>/dev/null; then
                brew install bitwarden-cli
            else
                echo -e "  ${RED}Homebrew requis pour installer bw sur macOS.${RESET}"
                return 1
            fi
            ;;
        Linux)
            if command -v snap &>/dev/null; then
                sudo snap install bw
            elif command -v npm &>/dev/null; then
                npm install -g @bitwarden/cli
            else
                echo -e "  ${RED}snap ou npm requis pour installer bw sur Linux.${RESET}"
                return 1
            fi
            ;;
        MINGW*|MSYS*|CYGWIN*)
            if command -v winget &>/dev/null; then
                winget install -e --id Bitwarden.CLI
            elif command -v npm &>/dev/null; then
                npm install -g @bitwarden/cli
            else
                echo -e "  ${RED}winget ou npm requis pour installer bw sur Windows.${RESET}"
                return 1
            fi
            ;;
        *)
            echo -e "  ${RED}OS non reconnu. Installez bw manuellement : https://bitwarden.com/help/cli/${RESET}"
            return 1
            ;;
    esac

    if ! command -v bw &>/dev/null; then
        echo -e "  ${RED}Installation échouée. Installez bw manuellement : https://bitwarden.com/help/cli/${RESET}"
        return 1
    fi

    echo -e "  ${GREEN}bw installé.${RESET}"
}

# Extrait l'itemId d'un lien Vaultwarden ou retourne la valeur telle quelle si c'est déjà un ID
extract_item_id() {
    local input="$1"
    # Si c'est une URL contenant itemId=...
    if echo "$input" | grep -q 'itemId='; then
        echo "$input" | sed 's/.*itemId=\([^&]*\).*/\1/'
    else
        # Sinon c'est déjà un ID
        echo "$input"
    fi
}

bw_login() {
    local server_url="$1"
    local client_id="$2"
    local client_secret="$3"

    # Configurer le serveur
    bw config server "$server_url" >/dev/null 2>&1

    local status
    status=$(bw status 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

    case "$status" in
        unlocked)
            echo -e "  ${DIM}Coffre déjà déverrouillé.${RESET}"
            BW_SESSION=$(bw unlock --raw </dev/tty)
            ;;
        locked)
            echo -e "  ${DIM}Coffre verrouillé — déverrouillage...${RESET}"
            BW_SESSION=$(bw unlock --raw </dev/tty)
            ;;
        unauthenticated)
            echo -e "  ${DIM}Connexion avec la clé API...${RESET}"
            export BW_CLIENTID="$client_id"
            export BW_CLIENTSECRET="$client_secret"
            bw login --apikey >/dev/null 2>&1
            echo -e "  ${DIM}Déverrouillage du coffre...${RESET}"
            BW_SESSION=$(bw unlock --raw </dev/tty)
            ;;
        *)
            echo -e "${RED}Impossible de déterminer le statut de Bitwarden CLI.${RESET}"
            return 1
            ;;
    esac

    export BW_SESSION
}

# Récupère le contenu d'une secure note par son ID
bw_get_note() {
    local item_id="$1"
    bw get notes "$item_id" --session "$BW_SESSION" 2>/dev/null
}

# Applique les secrets d'une note Vaultwarden sur un fichier .env existant
# La note contient des lignes KEY=VALUE (uniquement les secrets)
apply_secrets_to_env() {
    local env_file="$1"
    local note_content="$2"
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
    done <<< "$note_content"

    echo "$count"
}

fetch_from_vaultwarden() {
    echo ""
    echo -e "${YELLOW}Import des secrets depuis Vaultwarden${RESET}"
    echo ""

    ensure_bw_cli || return 1

    # Demander les infos de connexion
    printf "  URL du serveur Vaultwarden (ex: https://vault.example.com) : "
    read -r server_url </dev/tty
    if [ -z "$server_url" ]; then
        echo -e "  ${RED}URL requise.${RESET}"
        return 1
    fi

    echo ""
    echo -e "  ${DIM}Clé API Bitwarden (Settings > Security > Keys > API Key)${RESET}"
    printf "  client_id : "
    read -r client_id </dev/tty
    printf "  client_secret : "
    read -rs client_secret </dev/tty
    echo ""

    if [ -z "$client_id" ] || [ -z "$client_secret" ]; then
        echo -e "  ${RED}client_id et client_secret requis.${RESET}"
        return 1
    fi

    bw_login "$server_url" "$client_id" "$client_secret" || return 1

    bw sync --session "$BW_SESSION" >/dev/null 2>&1

    # Demander les liens des notes
    echo ""
    echo -e "  ${DIM}Collez le lien Vaultwarden ou l'ID de chaque secure note.${RESET}"
    echo -e "  ${DIM}Appuyez sur Entrée pour passer un fichier.${RESET}"
    echo ""

    local success=0

    # .env
    printf "  Lien de la note ${CYAN}.env${RESET} : "
    read -r env_link </dev/tty
    if [ -n "$env_link" ]; then
        local env_id
        env_id=$(extract_item_id "$env_link")
        local env_content
        if env_content=$(bw_get_note "$env_id"); then
            if [ -n "$env_content" ]; then
                local count
                count=$(apply_secrets_to_env ".env" "$env_content")
                echo -e "  ${GREEN}${count} variables importées dans .env${RESET}"
                success=1
            else
                echo -e "  ${RED}Note trouvée mais vide${RESET}"
            fi
        else
            echo -e "  ${RED}Note introuvable (ID: ${env_id})${RESET}"
        fi
    fi

    # airflow/.env
    printf "  Lien de la note ${CYAN}airflow/.env${RESET} : "
    read -r airflow_link </dev/tty
    if [ -n "$airflow_link" ]; then
        local airflow_id
        airflow_id=$(extract_item_id "$airflow_link")
        local airflow_content
        if airflow_content=$(bw_get_note "$airflow_id"); then
            if [ -n "$airflow_content" ]; then
                local count
                count=$(apply_secrets_to_env "airflow/.env" "$airflow_content")
                echo -e "  ${GREEN}${count} variables importées dans airflow/.env${RESET}"
                success=1
            else
                echo -e "  ${RED}Note trouvée mais vide${RESET}"
            fi
        else
            echo -e "  ${RED}Note introuvable (ID: ${airflow_id})${RESET}"
        fi
    fi

    if [ $success -eq 0 ]; then
        echo ""
        echo -e "${RED}Aucun secret importé. Basculement vers la saisie interactive...${RESET}"
        return 1
    fi

    return 0
}

# ──────────────────────────────────────────────
# Interactif
# ──────────────────────────────────────────────

# Cherche la description d'une variable dans ENV.md
get_description() {
    local var_name="$1"
    if [ -f "$ENV_DOC" ]; then
        grep -m1 "| \`${var_name}\`" "$ENV_DOC" 2>/dev/null | sed 's/.*| `[^`]*` | \([^|]*\) |.*/\1/' | sed 's/^ *//;s/ *$//' || true
    fi
}

# Traite un fichier .env interactivement
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

interactive_setup() {
    echo ""
    echo -e "${DIM}Appuyez sur Entrée sans rien saisir pour garder la valeur actuelle.${RESET}"
    echo -e "${DIM}Les valeurs ASK_A_MAINTAINER sont à demander à un mainteneur du projet.${RESET}"

    if [ -f ".env" ]; then
        process_env_file ".env" ".env — Application"
    fi

    if [ -f "airflow/.env" ]; then
        process_env_file "airflow/.env" "airflow/.env — Airflow"
    fi
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
echo -e "  ${CYAN}1${RESET}) Saisie interactive"
echo -e "  ${CYAN}2${RESET}) Importer depuis Vaultwarden"
echo -e "  ${CYAN}3${RESET}) Passer (compléter les fichiers .env manuellement)"
echo ""
printf "  Choix [1/2/3] : "
read -r choice </dev/tty

case "$choice" in
    2)
        if ! fetch_from_vaultwarden; then
            interactive_setup
        fi
        ;;
    3)
        echo ""
        echo -e "  ${DIM}Pensez à compléter .env et airflow/.env avant de lancer l'application.${RESET}"
        echo -e "  ${DIM}Voir ENV.md pour la documentation.${RESET}"
        ;;
    *)
        interactive_setup
        ;;
esac

echo ""
echo -e "${DIM}Configuration terminée. Vous pouvez modifier ces valeurs à tout moment dans les fichiers .env.${RESET}"
echo ""
