# Airflow - Orchestration de données

## Stack technique

Ce projet utilise **Airflow** pour orchestrer des pipelines de données avec **DBT** (Data Build Tool) pour la transformation des données.

- **Airflow** : Orchestrateur de workflows de données
- **DBT** : Transformation et modélisation des données
- **PostgreSQL** : Base de données cible
- **Astro CLI** : Outil de développement Airflow

## Lancement en local

### 1. Installation d'Astro CLI
```bash
# Sur macOS
brew install astro
```

### 2. Configuration
Créez un fichier `.env` en vous basant sur `env.example` :
```bash
cp env.example .env
```

### 3. Lancement
```bash
cd airflow/
astro dev start
```

### 4. Accès
```bash
http://localhost:9090
````