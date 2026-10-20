# Airflow - Orchestration de données

## Stack technique

Ce projet utilise **Airflow** pour orchestrer des pipelines de données avec **DBT** (Data Build Tool) pour la transformation des données.

- **Airflow** : Orchestrateur de workflows de données
- **DBT** : Transformation et modélisation des données
- **PostgreSQL** : Base de données cible
- **Astro CLI** : Outil de développement Airflow

## Lancement en local

### 1. Installation d'Astro CLI
Le projet tourne sur Airflow 3 (Astro Runtime 3.1) : il faut Astro CLI 1.35 ou plus récent.
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
```

## Authentification

L'interface utilise l'authentification OAuth GitHub de Flask-AppBuilder (`webserver_config.py`).
Pour un projet Airflow 3, le CLI Astro impose par défaut le SimpleAuthManager avec tout visiteur
admin sans mot de passe (et le compte `admin`/`admin`), par-dessus le `.env` : le fichier
`docker-compose.override.yml`, appliqué automatiquement par `astro dev start`/`restart`, rétablit
l'auth manager FAB et l'URL publique `AIRFLOW__API__BASE_URL` du `.env`. L'URL de callback à
déclarer dans l'application OAuth GitHub est `<url airflow>/auth/oauth-authorized/github`.

Le Dockerfile désinstalle aussi le plugin Astronomer de l'image (`astronomer-runtime-extensions`),
qui ne sert qu'à l'habillage et à la télémétrie du cloud Astronomer : son middleware reconstruit les
réponses HTML sans statut ni en-têtes, ce qui transformait les redirections de connexion (302 + cookie
de session) en pages 200 vides et faisait échouer le retour OAuth (« CSRF Warning! State not equal »).

Conséquence : le CLI ne peut plus importer les pools de `airflow_settings.yaml` au démarrage
(il passe par l'API avec `admin`/`admin`). Les pools `dbt_pool` et `ocsge_staging_pool` sont
déjà en base ; sur un environnement neuf, les créer depuis l'interface ou avec
`astro dev run pools set <nom> <slots> <description>`.

## Migration Airflow 2 vers Airflow 3

Le passage de Runtime 13 (Airflow 2.11) à Runtime 3.1 migre la base de métadonnées au premier
démarrage, sans retour en arrière possible. Sur le serveur :

1. mettre les DAG en pause et attendre la fin des tâches en cours ;
2. sauvegarder la base de métadonnées ;
3. mettre à jour le `.env` (voir `.env.example` : `AIRFLOW__API__BASE_URL`,
   `AIRFLOW__FAB__UPDATE_FAB_PERMS`, suppression de `AIRFLOW__CORE__ENABLE_XCOM_PICKLING`) ;
4. reconstruire l'image et redémarrer (`astro dev restart`) ;
5. vider la table `session` de la base de métadonnées : les sessions Flask-AppBuilder créées par
   Airflow 2 ne sont plus lisibles et provoquent une erreur 500 à la connexion pour quiconque
   garde l'ancien cookie (`astro dev run db shell`, puis `delete from session;`).
