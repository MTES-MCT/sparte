# Variables d'environnement

Le projet utilise deux fichiers `.env` :

| Fichier | Description |
|---------|-------------|
| `.env` | Variables de l'application Django et des services Docker |
| `airflow/.env` | Variables d'Airflow et des connexions aux bases de données |

Les deux fichiers sont créés automatiquement par `make install` depuis leurs `.env.example` respectifs.

Les valeurs marquées `ASK_A_MAINTAINER` sont à demander à un mainteneur du projet.

---

# `.env` — Application

## Application

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `ENVIRONMENT` | Environnement d'exécution : `local`, `staging`, `prod` | `local` |
| `SECRET` | Clé secrète Django | `CREATE_A_SECRET_KEY` |
| `DEBUG` | Activer le mode debug Django | `1` |
| `ALLOWED_HOSTS` | Hôtes autorisés à se connecter | `127.0.0.1,localhost,django,host.docker.internal` |
| `DOMAIN_URL` | URL de l'application | `http://localhost:8080/` |
| `MAINTENANCE_MODE` | Activer le mode maintenance | `0` |
| `TZ` | Fuseau horaire | `Europe/Paris` |

## Base de données

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `POSTGRES_DB` | Nom de la base de données | `postgres` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `PICK_A_PASSWORD` |
| `POSTGRES_HOST` | Hôte PostgreSQL (`db` dans Docker) | `db` |
| `DATABASE_URL` | URL de connexion complète (construit à partir des variables ci-dessus) | `postgis://postgres:...@db:5432/postgres` |
| `DB_LOGGING_LEVEL` | Niveau de log de la base de données | `WARNING` |

## Redis / Celery

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `CELERY_BROKER_URL` | URL du broker Celery (Redis) | `redis://127.0.0.1:6379/0` |
| `CELERY_RESULT_BACKEND` | URL du backend de résultats Celery | `redis://127.0.0.1:6379/0` |
| `CELERY_TASK_ALWAYS_EAGER` | Exécuter les tâches Celery de manière synchrone | `0` |
| `SCALINGO_REDIS_URL` | URL Redis (utilisée en production sur Scalingo) | `redis://127.0.0.1:6379/0` |

## Stockage S3

En local, un S3 compatible (versitygw) tourne dans Docker sur le port 7070.

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `AWS_ACCESS_KEY_ID` | Clé d'accès S3 | `localaccess` |
| `AWS_SECRET_ACCESS_KEY` | Clé secrète S3 | `localsecret` |
| `AWS_STORAGE_BUCKET_NAME` | Nom du bucket | `sparte-local` |
| `AWS_S3_REGION_NAME` | Région S3 | `us-east-1` |
| `AWS_S3_ENDPOINT_URL` | URL du endpoint S3 | `http://localhost:7070` |
| `AWS_LOCATION` | Préfixe dans le bucket (évite les collisions entre instances) | `local` |
| `LOCAL_FILE_DIRECTORY` | Répertoire local pour les fichiers (shapefiles, etc.) | `public_data/local_data` |

## Email

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `EMAIL_ENGINE` | Backend d'envoi : `local` (fichiers) ou `sendinblue` | `local` |
| `API_KEY_SENDINBLUE` | Clé API Sendinblue (Brevo) | `ASK_A_MAINTAINER` |
| `EMAIL_SMTP_KEY` | Clé SMTP Sendinblue | `ASK_A_MAINTAINER` |
| `EMAIL_HOST_USER` | Adresse email de l'expéditeur SMTP | `YOUR_EMAIL` |
| `DEFAULT_FROM_EMAIL` | Adresse email par défaut pour les envois | `YOUR_EMAIL` |
| `EMAIL_FILE_PATH` | Répertoire de stockage des emails en mode `local` | `emails/` |

## Crisp (chat support)

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `CRISP_WEBSITE_ID` | Identifiant du site Crisp | `ASK_A_MAINTAINER` |
| `CRISP_ACTIVATED` | Activer le widget Crisp | `0` |
| `CRISP_WEBHOOK_SECRET_KEY` | Clé d'authentification des webhooks Crisp | `CREATE_A_SECRET_KEY` |

## Analytics

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `MATOMO_ACTIVATE` | Activer le tracking Matomo | `0` |
| `MATOMO_SCRIPT_NAME` | Nom du script Matomo | _(vide)_ |
| `MATOMO_TOKEN` | Token d'API Matomo | _(vide)_ |
| `GOOGLE_ADWORDS_ACTIVATE` | Activer les Google Tags | `0` |

## Highcharts / Export

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `HIGHCHART_SERVER` | URL du serveur d'export Highcharts | `https://highcharts-export.osc-fr1.scalingo.io` |
| `EXPORT_SERVER_URL` | URL du serveur d'export PDF | `http://localhost:3001` |
| `EXPORT_BASE_URL` | URL de base utilisée par le serveur d'export pour accéder à Django | `http://django:8080` |

## Notifications

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `MATTERMOST_WEBHOOK` | URL du webhook Mattermost | _(webhook par défaut)_ |
| `ALERT_DIAG_MEDIUM` | Canal d'alerte diagnostics bloqués : `mattermost`, `email`, `both` | `both` |
| `ALERT_DIAG_EMAIL_RECIPIENTS` | Destinataires email des alertes | `YOUR_EMAIL` |
| `ALERT_DIAG_MATTERMOST_RECIPIENTS` | Destinataire Mattermost (`@user` ou `~channel`) | `@YOUR_MATTERMOST_USERNAME` |

## Sécurité

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `USE_SRI` | Activer les Subresource Integrity | `0` |
| `USE_CSP` | Activer les Content Security Policy | `1` |
| `DEBUG_TOOLBAR` | Activer la barre de debug Django | `1` |
| `TWO_FACTOR_ENABLED` | Activer l'authentification 2FA | `0` |

## ProConnect (OIDC)

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `PROCONNECT_DOMAIN` | Domaine ProConnect | `ASK_A_MAINTAINER` |
| `PROCONNECT_CLIENT_ID` | Client ID ProConnect | `ASK_A_MAINTAINER` |
| `PROCONNECT_SECRET` | Secret ProConnect | `ASK_A_MAINTAINER` |

## GDAL

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `GDAL_CONFIG_FILE` | Chemin du fichier de configuration GDAL | `/app/gdal_config` |

## Variables Scalingo (production)

Ces variables sont gérées automatiquement sur Scalingo.

| Variable | Description |
|----------|-------------|
| `DISABLE_COLLECTSTATIC` | Requis pour déployer correctement les buildpacks |
| `GDAL_DATA` | Requis pour le buildpack GeoDjango |
| `LD_LIBRARY_PATH` | Requis pour le buildpack GeoDjango |
| `PROJ_LIB` | Requis pour le buildpack GeoDjango |
| `SCALINGO_POSTGRESQL_URL` | Ajouté automatiquement avec l'addon PostgreSQL |
| `SCALINGO_REDIS_URL` | Ajouté automatiquement avec l'addon Redis |

---

# `airflow/.env` — Airflow

## Airflow

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `ENVIRONMENT` | Environnement : `dev`, `staging`, `prod` | `dev` |
| `AIRFLOW_HOME` | Répertoire d'installation Airflow | `/usr/local/airflow` |
| `AIRFLOW__CORE__TEST_CONNECTION` | Activer le test de connexion dans l'UI | `Enabled` |
| `AIRFLOW__SCHEDULER__DAG_DIR_LIST_INTERVAL` | Intervalle de scan des DAGs (secondes) | `3` |
| `AIRFLOW__SCHEDULER__SCHEDULE_AFTER_TASK_EXECUTION` | Relancer le scheduler après chaque tâche | `False` |
| `AIRFLOW__WEBSERVER__UPDATE_FAB_PERMS` | Mettre à jour les permissions FAB au démarrage | `True` |
| `AIRFLOW__CORE__ENABLE_XCOM_PICKLING` | Activer le pickling pour les XCom | `True` |
| `OBJC_DISABLE_INITIALIZE_FORK_SAFETY` | Contourner un crash macOS avec le fork | `YES` |

## S3 (Scaleway)

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `AIRFLOW_S3_BUCKET_NAME` | Nom du bucket S3 Airflow | `ASK_A_MAINTAINER` |
| `AIRFLOW_S3_APP_BUCKET_NAME` | Nom du bucket S3 de l'application | `ASK_A_MAINTAINER` |
| `AIRFLOW_S3_LOGIN` | Clé d'accès S3 | `ASK_A_MAINTAINER` |
| `AIRFLOW_S3_PASSWORD` | Clé secrète S3 | `ASK_A_MAINTAINER` |
| `AIRFLOW_S3_ENDPOINT` | URL du endpoint S3 | `https://s3.fr-par.scw.cloud` |
| `AIRFLOW_S3_REGION_NAME` | Région S3 | `fr-par` |

## Bases de données

Airflow se connecte à plusieurs bases de données pour les pipelines DBT.

### Matomo

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `MATOMO_DB_NAME` | Nom de la base | `ASK_A_MAINTAINER` |
| `MATOMO_DB_USER` | Utilisateur | `ASK_A_MAINTAINER` |
| `MATOMO_DB_PASSWORD` | Mot de passe | `ASK_A_MAINTAINER` |
| `MATOMO_DB_HOST` | Hôte | `ASK_A_MAINTAINER` |
| `MATOMO_DB_PORT` | Port | `ASK_A_MAINTAINER` |
| `MATOMO_DB_SCHEMA` | Schéma | `matomo` |

### DBT (base de transformation)

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `DBT_DB_NAME` | Nom de la base | `ASK_A_MAINTAINER` |
| `DBT_DB_USER` | Utilisateur | `ASK_A_MAINTAINER` |
| `DBT_DB_PASSWORD` | Mot de passe | `ASK_A_MAINTAINER` |
| `DBT_DB_HOST` | Hôte | `ASK_A_MAINTAINER` |
| `DBT_DB_PORT` | Port | `ASK_A_MAINTAINER` |
| `DBT_DB_SCHEMA` | Schéma | `public` |

### Dev (Django local)

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `DEV_DB_NAME` | Nom de la base | `synthese` |
| `DEV_DB_USER` | Utilisateur | `postgres` |
| `DEV_DB_PASSWORD` | Mot de passe | `postgres` |
| `DEV_DB_HOST` | Hôte | `host.docker.internal` |
| `DEV_DB_PORT` | Port | `5432` |
| `DEV_DB_SCHEMA` | Schéma | `public` |

### Staging

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `STAGING_DB_NAME` | Nom de la base | `ASK_A_MAINTAINER` |
| `STAGING_DB_USER` | Utilisateur | `ASK_A_MAINTAINER` |
| `STAGING_DB_PASSWORD` | Mot de passe | `ASK_A_MAINTAINER` |
| `STAGING_DB_HOST` | Hôte | `ASK_A_MAINTAINER` |
| `STAGING_DB_PORT` | Port | `ASK_A_MAINTAINER` |
| `STAGING_DB_SCHEMA` | Schéma | `public` |

### Production

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `PROD_DB_NAME` | Nom de la base | `ASK_A_MAINTAINER` |
| `PROD_DB_USER` | Utilisateur | `ASK_A_MAINTAINER` |
| `PROD_DB_PASSWORD` | Mot de passe | `ASK_A_MAINTAINER` |
| `PROD_DB_HOST` | Hôte | `ASK_A_MAINTAINER` |
| `PROD_DB_PORT` | Port | `ASK_A_MAINTAINER` |
| `PROD_DB_SCHEMA` | Schéma | `public` |

## GPU (SFTP IGN)

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `GPU_SFTP_HOST` | Hôte SFTP IGN | `sftp-public.ign.fr` |
| `GPU_SFTP_USER` | Utilisateur SFTP | `gpu_depot_exports` |
| `GPU_SFTP_PASSWORD` | Mot de passe SFTP | `ASK_A_MAINTAINER` |
| `GPU_SFTP_PORT` | Port SFTP | `2200` |
| `GPU_HOST_KEY` | Clé publique du serveur SFTP | _(clé ed25519)_ |

## Notifications

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `MATTERMOST_WEBHOOK_URL` | URL du webhook Mattermost | `ASK_A_MAINTAINER` |
| `MATTERMOST_CHANNEL` | Canal ou utilisateur Mattermost | `@YOUR_MATTERMOST_USERNAME` |

## Data.gouv

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `DATA_GOUV_API_KEY` | Clé API data.gouv.fr | `ASK_A_MAINTAINER` |
| `DATA_GOUV_API_ENDPOINT` | URL de l'API data.gouv.fr | `https://demo.data.gouv.fr/api/1` |
| `DATA_GOUV_ORGANIZATION_ID` | Identifiant de l'organisation | `ASK_A_MAINTAINER` |

## GitHub OAuth

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `GITHUB_OAUTH_APP_ID` | Client ID de l'app OAuth GitHub | `ASK_A_MAINTAINER` |
| `GITHUB_OAUTH_APP_SECRET` | Secret de l'app OAuth GitHub | `ASK_A_MAINTAINER` |

## Brevo

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `BREVO_API_KEY` | Clé API Brevo (ex-Sendinblue) | `ASK_A_MAINTAINER` |

## Crisp

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `CRISP_IDENTIFIER` | Identifiant Crisp | `ASK_A_MAINTAINER` |
| `CRISP_KEY` | Clé API Crisp | `ASK_A_MAINTAINER` |
| `CRISP_WEBSITE_ID` | Identifiant du site Crisp | `ASK_A_MAINTAINER` |
