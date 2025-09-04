<img src="https://mondiagartif.beta.gouv.fr/static/img/logo-mon-diagnostic-artificialisation.svg" />
<p align="center">
  <a href="https://github.com/MTES-MCT/sparte/stargazers/">
    <img src="https://img.shields.io/github/stars/MTES-MCT/sparte" alt="">
  </a>
  <a href='http://makeapullrequest.com'><img alt='PRs Welcome' src='https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields'/></a>
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/MTES-MCT/sparte"/>
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/MTES-MCT/sparte"/>
  <a href="https://github.com/suitenumerique/meet/blob/main/LICENSE">
    <img alt="GitHub closed issues" src="https://img.shields.io/github/license/suitenumerique/meet"/>
  </a>    
</p>

<p align="center">
 <a href="https://github.com/MTES-MCT/sparte/releases">Historique des mises à jour</a> - <a href="https://github.com/MTES-MCT/sparte/issues/new">Reporter un bug</a> 
</p>
<br/>
<p>
Mon Diagnostic Artificialisation aide les collectivités à analyser et maitriser la consommation d'espaces et l'artificialisation des sols de leur territoire, en mettant en perspective des indicateurs chiffrés au regard des exigences de la loi climat et résilience, et notamment de la ZAN.
</p
<br/>

![image](https://github.com/user-attachments/assets/05ca50f8-8d68-4226-8fa4-a0ead591452e)

----

# Documentation d'installation

## Installation backend

1. Cloner le répository `git clone git@github.com:MTES-MCT/sparte.git`
2. Aller dans le dossier `cd sparte`
3. Installer les dépendances avec pipenv `pipenv install --dev`
4. Copier le fichier .env.example et nommer la copie .env
5. Compléter les valeurs du fichier .env commençant par `YOUR`
6. Demander à un mainteneur du dépot les valeurs du fichier
.env `ASK_A_MAINTAINER`
7. Démarrer le projet `docker-compose up -d`
8. Basculer dans l'environnement virtuel `pipenv shell`
9. Faire la migration initiale `python manage.py migrate`
10. Ajouter les valeurs par défaut des paramètres requis
`python manage.py load_param --no-update --file required_parameters.json`

Le site est désormais accessible en local à cette adresse:
[http://localhost:8080/](http://localhost:8080/)


## Installation frontend

1. Installer les dépendances `npm install`
2. Lancer le build du bundle `npm run build:dev` ou `npm run build:prod` (génère un nouveau bundle à chaque mise à jour du fichier ./frontend/scripts/index.js)

### Variables d'environnement

- En **local** ces valeurs doivent être dans le fichier .env à la racine du projet.
- Pour le déploiement sur **Scalingo**, ces variables sont à ajouter dans la section "Environnement" du container.

| Nom | Description | Valeur par défaut en local |
|-----|-------------|---------------|
| ALERT_DIAG_MEDIUM | Comment envoyer les alertes des diagnostics bloqués: mattermost, email, both | |
| ALERT_DIAG_EMAIL_RECIPIENTS | Liste des adresses e-mails auxuqelles envoyées les alertes diagnostics bloqués | 127.0.0.1,localhost |
| ALERT_DIAG_MATTERMOST_RECIPIENTS | channel (~sparte) ou personne (@swann) à qui envoyer un message direct de diagnostics bloqués | 127.0.0.1,localhost |
| ALLOWED_HOSTS | urls qui peuvent se connecter au site web | 127.0.0.1,localhost |
| API_KEY_SENDINBLUE | Clé api de sendinblue | |
| AWS_ACCESS_KEY_ID | compte AWS pour stocker les données |  |
| AWS_LOCATION | prefix pour ne pas avoir de collisions entre les instances de l'app | local |
| AWS_S3_REGION_NAME | région de AWS | eu-west-3 |
| AWS_SECRET_ACCESS_KEY | secret pour se connecter à AWS |  |
| AWS_STORAGE_BUCKET_NAME | nom du bucket de stockage | sparte-staging |
| AWS_S3_ENDPOINT_URL | url de scaleway | https://s3.fr-par.scw.cloud |
| CELERY_BROKER_URL | chaîne pour se connecter à redis | redis://127.0.0.1:6379/0 |
| CELERY_RESULT_BACKEND | chaîne pour se connecter à redis | redis://127.0.0.1:6379/0 |
| CRISP_WEBHOOK_SECRET_KEY | clef qui permet à l'application d'authentifier les requêtes webhook reçues depuis CRISP |  | 
| CRISP_WEBSITE_ID | Identifiant du site sur Crisp | |
| CRISP_ACTIVATED | Active ou desactive Crisp | False |
| CELERY_TASK_ALWAYS_EAGER | Rend celery synchrone | False |
| DATABASE_URL | chaîne pour se connecter à la base de données Postgres | postgis://postgres:postgres@127.0.0.1:5432/postgres |
| DB_LOGGING_LEVEL | détermine le niveau de log de la base de données | WARNING |
| DEBUG | activer ou non les messages détaillés d'erreur | 1 |
| DEBUG_TOOLBAR | activer la barre de debug de Django | 1 |
| DEFAULT_FROM_EMAIL | Expéditeur par défaut des emails envoyés | johndoe@email.com |
| DOMAIN_URL | l'url sur laquelle est branchée l'application | http://localhost:8080/ |
| EMAIL_ENGINE | indique à l'application le backend à utiliser pour envoyer les e-mails. 2 choix disponibles : sendinblue, local | local |
| EMAIL_FILE_PATH | Uniquement utile si EMAIL_ENGINE=local. Indique l'emplacement où stocker les emails | BASE_DIR / "emails" |
| EMAIL_SMTP_KEY | mot de passe SMTP | |
| EMAIL_HOST_USER | nom d'utilisteur SMTP | |
| ENVIRONMENT | indique sur quel environnement est exécuté l'app. Choix possibles: local, staging, prod | local |
| GOOGLE_ADWORDS_ACTIVATE | indique s'il faut ajouter des google tags aux pages | 1 |
| HIGHCHART_SERVER | url pour accéder au serveur générant des images à partir de paramètres Highcharts | https://highcharts-export.osc-fr1.scalingo.io |
| LOCAL_FILE_DIRECTORY | Emplacement des données locales (utile pour charger des shapefile en local au lieu de S3) | public_data/local_data |
| MATTERMOST_WEBHOOK | Webhook personnel pour envoyer des messages dans Mattermost | https://mattermost.incubateur.net/hooks/uak581f8bidyxp5td67rurj5sh |
| MATOMO_ACTIVATE | Détermine si des infos doivent être envoyé à Matomo | 0 |
| POSTGRES_DB | Nom de la base de donnée (local uniquement) | postgres |
| POSTGRES_USER | Username par défaut de la base de donnée (local uniquement) | postgres |
| POSTGRES_PASSWORD | Password par défaut de la base de donnée (local uniquement) | postgres |
| POSTGRES_HOST | Nom de l'hôte où se trouve la base de donnée (local uniquement) | db |
| SECRET | salt pour django | |
| USE_SRI | Active l'utilisation des SRI même lorsque debug = 1 | 1 |
| USE_CSP | Active l'utilisation des CSP même lorsque debug = 1 | 1 |

Variables d'environnement spécifique à Scalingo. Voir les valeurs sur Scalingo.

| Nom | description |
|-----|-------------|
| DISABLE_COLLECTSTATIC | Requis pour déployer correctement les buildpacks |
| GDAL_DATA | requis pour le buildpack qui install GeoDjango |
| LD_LIBRARY_PATH | requis pour le buildpack qui install GeoDjango |
| PROJ_LIB | requis pour le buildpack qui install GeoDjango |
| SCALINGO_POSTGRESQL_URL | Ajouté lorsque l'addon postgres est activé |
| SCALINGO_REDIS_URL | Ajouté lorsque l'addon redis est activé |
