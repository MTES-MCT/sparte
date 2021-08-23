**S**ervice de **P**ortrait de l’**AR**tificialisation des **TE**rritoires
==========================================================================

# SPARTE

Le Service de Portrait de l’ARtificialisation des TErritoires (ou SPARTE) est une plateforme qui aide les collectivité à mesurer l'artificialisation de leurs sols et ainsi se conformer aux nouvelles lois.

## Installation

1. Cloner le répository git
2. Installer les dépendances avec pipenv (Poetry n'étant pas supporté par Scalingo)

```
git clone git@github.com:MTES-MCT/sparte.git
pipenv install --dev
```

### Variables d'environnement

Pour une installation locale, ces valeurs doivent être dans le fichier .env à la racine du projet. Pour le déploiement sur scalingo, ces variables sont à ajouter dans la section "Environnement" du container.

| Nom | description | valeur locale |
|-----|-------------|---------------|
| SECRET | salt pour django | N/A |
| DEBUG | salt pour django | true |
| DATABASE_URL | chaîne pour se connecter à la base de données Postgresql + gis | postgis://sparte_user:1234@localhost:5432/sparte |
| ALLOWED_HOSTS | urls qui peuvent se connecter au site web | 127.0.0.1,localhost |
| CELERY_BROKER_URL | chaîne pour se connecter à redis | redis://localhost:6379/0 |
| CELERY_RESULT_BACKEND | chaîne pour se connecter à redis | redis://localhost:6379/0 |


## Before commiting

Check unit test coverage: `coverage run -m pytest && coverage report -m`

Check flake8 linting: `flake8`

Si vous souhaitez bypasser pre-commit hook (usefull pour ajouter des fichiers shapes sans les modifiers):
```
git commit --no-verify
```

## TODO List

- Connecté à un git remote et mettre en place les branches
- Déployer en DEV, STAGING et PROD
- Plug Sentry
- Ajouter les TU et flake8 dans le PRE-COMMIT
- Home page avec connexion

Done :

- Custom user pour associer des données telles que téléphone, date de naissance, etc...

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
