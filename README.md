**S**ervice de **P**ortrait de l’**AR**tificialisation des **TE**rritoires
==========================================================================

# SPARTE

Le Service de Portrait de l’ARtificialisation des TErritoires (ou SPARTE)
est une plateforme qui aide les collectivité à mesurer l'artificialisation
de leurs sols et ainsi se conformer aux nouvelles lois.

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

### Optionnel

11. Créer un super utilisateur `python manage.py createsuperuser` (pour accéder à l'interface d'administration)
12. Copier les fichiers de données OCS GE et Cérema sur votre bucket AWS (étapes décrites ci-dessous)
13. Lancer l'installation des données `python scripts/cmd.py --env local rebuild`

## Installation frontend
1. Installer les dépendances `npm install`
2. Lancer le build du bundle `npm run build:dev` ou `npm run build:prod` (génère un nouveau bundle à chaque mise à jour du fichier ./assets/scripts/index.js)

### Variables d'environnement

- En **local** ces valeurs doivent être dans le fichier .env à la racine du projet.
- Pour le déploiement sur **scalingo**, ces variables sont à ajouter dans la section "Environnement" du container.

| Nom | Description | Valeur locale |
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
| CELERY_BROKER_URL | chaîne pour se connecter à redis | redis://127.0.0.1:6379/0 |
| CELERY_RESULT_BACKEND | chaîne pour se connecter à redis | redis://127.0.0.1:6379/0 |
| DATABASE_URL | chaîne pour se connecter à la base de données Postgresql + gis | postgis://postgres:postgres@127.0.0.1:54321/postgres |
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
| MATTERMOST_WEBHOOK | Webhook personnel pour envoyer des messages dans Mattermost | https://mattermost.incubateur.net/hooks/uak581f8bidyxp5td67rurj5sh |
| MATOMO_ACTIVATE | Détermine si des infos doivent être envoyé à Matomo | 0 |
| MATOMO_SCRIPT_NAME | | |
| MATOMO_TOKEN | Token pour envoyer les données à Matomo |  |
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


## Contribution

### Lint
- Depuis le shell pipenv, installer la configuration pre-commit sur votre dépot git local : `pre-commit install`
- Il est aussi possible de lancer le pre-commit manuellement sans l'installer : `pre-commit run --all-file`

De cette manière, vos changements seront évalués automatiquement selon notre coding style (voir le fichier `.pre-commit.config.yaml` pour le détail).

### Test

- Avant chaque commit, lancer manuellement depuis le containeur de l'application les tests et l'analyse de la couverture de tests: `coverage run -m pytest && coverage report -m`


### Récupérer un backup de production

1. Récupérer un backup sur scalingo en parcourant le menu: app > ressources > pg dashboard > backup, download last backup (par exemple 20220830000404_sparte_1396.tar.gz)
2. Décompresser le backup `tar -xf 20220830000404_sparte_1396.tar.gz`
3. Charger le backup dans la base de donnée  `pg_restore --clean --if-exists --no-owner --no-privileges --no-comments --dbname postgres://postgres:postgres@127.0.0.1:5432/postgres 20220830000404_sparte_1396.pgsql`


### Update OCS GE

The process is not stable yet. Use it with caution.

1. Download shape files from IGN's website [https://geoservices.ign.fr](https://geoservices.ign.fr) "Catalogue > OCS GE"
2. Extract shape files and zip them by name, remove anysubfolder, the zip should contain only files
3. Name zip file accordingly to expected name in [public_data/management/commands/load_ocsge.py](public_data/management/commands/load_ocsge.py). If you want to update 2016 Gers millesime, name it accordingly to what you will find in class **GersOcsge2016** and the property **shape_file_path** (which is gers_ocsge_2016.zip when writhing those lines)
4. Upload the zip in the bucket, in data folder.
5. Trigger the loading with the command `python scripts/cmd.py --env prod load-ocsge --item .....`, replace ... by the item you want to load (following previous example it's `python scripts/cmd.py --env local load-ocsge --item GersOcsge2016`). Obviously test it in staging first.
6. Update all precalculated data: build_commune_data, build_artificial_area, set_density
7. Update official data origin in [gitbook](https://app.gitbook.com/o/-MMQU-ngAOgQAqCm4mf3/s/OgEtEJQsOvgZrMPdWEIo/)
8. Update admin's [Départements](https://sparte.beta.gouv.fr/admin/public_data/departement/) if new OCS GE has been added

Example, update Gers OCS GE with 2022-06 data:
```bash
export ENV='local'
python scripts/cmd.py --env $ENV load-ocsge --item GersOcsge2016 && \
python scripts/cmd.py --env $ENV load-ocsge --item GersOcsge2019 && \
python scripts/cmd.py --env $ENV load-ocsge --item GersZoneConstruite2016 && \
python scripts/cmd.py --env $ENV load-ocsge --item GersZoneConstruite2019 && \
python scripts/cmd.py --env $ENV load-ocsge --item GersOcsgeDiff && \
python scripts/cmd.py --env $ENV run 'python manage.py build_commune_data --departement Gers' && \
python scripts/cmd.py --env $ENV run 'python manage.py build_artificial_area --departement Gers' && \
python scripts/cmd.py --env $ENV run 'python manage.py set_density --reset --departement Gers'
```


## Migration Cerema avec données 2021 (réalisée en septembre 2023)

On ne peut pas exécuter le code de migration directement sur le serveur car il n'y a pas assez de RAM.

1. Mettre l'application en mode maintenance: `/admin/django_app_parameter/parameter/11/change/`
2. Via git, merger la branche staging dans master
3. Attendre la fin du déploiement
4. Ouvrir un tunnel vers la db de prod: `scalingo --app sparte-staging --region osc-fr1 db-tunnel DATABASE_URL`
5. Modifier le .env pour utiliser la db de prod depuis votre poste postgis://username:password@127.0.0.1:10000/dbname?sslmode=prefer
6. Dans un terminal, sourcer le .env pour être sûr de tapper dans la db de prod
7. Charger les données du Cerema `scalingo --app sparte-staging --region osc-fr1 run 'python manage.py load_cerema'`
7. Exécuter les scripts de migration `python manage.py update_administration_layer`
