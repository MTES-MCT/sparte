**S**ervice de **P**ortrait de l’**AR**tificialisation des **TE**rritoires
==========================================================================

# SPARTE

Le Service de Portrait de l’ARtificialisation des TErritoires (ou SPARTE) est une plateforme qui aide les collectivité à mesurer l'artificialisation de leurs sols et ainsi se conformer aux nouvelles lois.

## Installation

1. Cloner le répository git `git clone git@github.com:MTES-MCT/sparte.git` puis aller dans le dossier `cd sparte`
2. Installer les dépendances avec pipenv `pipenv install --dev`
3. Créer un fichier .env avec (à compléter avec vos crédentials, voir ci-dessous...)
4. Démarrer les bases de données `docker-compose up -d`
5. Basculer dans l'environnement virtuel `pipenv shell`
6. Migration initiale `python manage.py migrate`
7. Créer un super utilisateur `python manage.py createsuperuser`
8. Démarrer le serveur `python manage.py runserver 0.0.0.0:8080`
9. Ouvrer la home page [http://localhost:8080/](http://localhost:8080/)
10. Copier les fichiers de données OCS GE et Cérema... sur votre bucket AWS
11. Lancer l'installation des données `python scripts/cmd.py --env local rebuild`

### Variables d'environnement

Pour une installation locale, ces valeurs doivent être dans le fichier .env à la racine du projet. Pour le déploiement sur scalingo, ces variables sont à ajouter dans la section "Environnement" du container.

| Nom | description | valeur locale |
|-----|-------------|---------------|
| SECRET | salt pour django |  |
| DEBUG | salt pour django | 1 |
| DATABASE_URL | chaîne pour se connecter à la base de données Postgresql + gis | postgis://postgres:postgres@127.0.0.1:5432/postgres |
| ALLOWED_HOSTS | urls qui peuvent se connecter au site web | 127.0.0.1,localhost |
| CELERY_BROKER_URL | chaîne pour se connecter à redis | redis://127.0.0.1:6379/0 |
| CELERY_RESULT_BACKEND | chaîne pour se connecter à redis | redis://127.0.0.1:6379/0 |
| ENVIRONMENT | indique sur quel environnement est exécuté l'app. Choix possibles: local, staging, prod | local |
| ALLOWED_HOSTS | les noms de domaines utilisables | 127.0.0.1,localhost |
| DOMAIN_URL | l'url sur laquelle est branchée l'application | http://localhost:8080/ |
| AWS_ACCESS_KEY_ID | compte AWS pour stocker les données |  |
| AWS_SECRET_ACCESS_KEY | secret pour se connecter à AWS |  |
| AWS_STORAGE_BUCKET_NAME | nom du bucket de stockage | sparte-staging |
| AWS_S3_REGION_NAME | région de AWS | eu-west-3 |
| AWS_LOCATION | prefix pour ne pas avoir de collisions entre les instances de l'app | local |
| EMAIL_ENGINE | indique à l'application le backend à utiliser pour envoyer les e-mails. 2 choix disponibles : mailjet, local | local |
| MAILJET_ID | ID pour se connecter au compte mailjet |  |
| MAILJET_SECRET | secret pour se connecter au compte mailjet |  |
| DEFAULT_FROM_EMAIL |  | swann.bouviermuller@gmail.com |
| MATOMO_TOKEN | Token pour envoyer les données à Matomo |  |

Cariables d'environnement spécifique à Scalingo. Voir les valeurs sur Scalingo.

| Nom | description |
|-----|-------------|
| DISABLE_COLLECTSTATIC | Requis pour déployer correctement les buildpacks |
| GDAL_DATA | requis pour le buildpack qui install GeoDjango |
| LD_LIBRARY_PATH | requis pour le buildpack qui install GeoDjango |
| PROJ_LIB | requis pour le buildpack qui install GeoDjango |
| PYTHONPATH | Non déterminé |
| SCALINGO_POSTGRESQL_URL | Ajouté lorsque l'addon postgres est activé |
| SCALINGO_REDIS_URL | Ajouté lorsque l'addon redis est activé |


## Before commiting

Vérifier la couverture des TU: `coverage run -m pytest && coverage report -m`

Vérifier que le formatage est bon: `flake8`

Si vous souhaitez bypasser pre-commit hook (usefull pour ajouter des fichiers shapes sans les modifiers):
```
git commit --no-verify
```

## The rocky river pattern

In this project, we try to follow the rocky river pattern. Find below the order of our apps. Top app can't call below app (they don't know them)

```mermaid
graph TD;
  users-->public_data;
  public_data-->Carto;
  Carto-->project;
```

## Useful links

About pytest:

- https://pytest-django.readthedocs.io
- https://docs.pytest.org/en/6.2.x/reference.html

About customUser:

- https://testdriven.io/blog/django-custom-user-model/

Django settings & installation:

- https://djangostars.com/blog/configuring-django-settings-best-practices/
- https://django-environ.readthedocs.io
- https://python-poetry.org/docs/cli/#add
- https://github.com/makinacorpus/docker-geodjango

Flake8 linting:

- https://flake8.pycqa.org/en/3.1.1/user/options.html#cmdoption-flake8--exclude

Dashboard layout (for inspiration):

- https://appstack.bootlab.io/dashboard-default.html

About colours and gradient :

- https://github.com/vaab/colour/
- https://medium.com/the-mvp/finally-a-definitive-way-to-make-gradients-beautiful-6b27af88f5f
- https://hslpicker.com/#c0f/#e6ff00

Tuto GeoDjango

- https://www.paulox.net/2021/07/19/maps-with-django-part-2-geodjango-postgis-and-leaflet/
