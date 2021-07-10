# **SPARTE** - **S**ervice de **P**ortrait de l’**AR**tificialisation des **TE**rritoires

Le Service de Portrait de l’ARtificialisation des TErritoires (ou SPARTE) est une plateforme qui aide les collectivité à mesurer l'artificialisation de leurs sols et ainsi se conformer aux nouvelles lois.

## Installation

1. Cloner le répository git
2. Installer les dépendances avec Poetry
3. Installer le hook des pré-comit

```
git clone ...
poetry install
poetry run pre-commit install
```

## before commiting

Check unit test coverage: `coverage run -m pytest && coverage report -m`

Check flake8 linting: `flake8`

# TODO List

- Connecté à un git remote et mettre en place les branches
- Déployer en DEV, STAGING et PROD
- Plug Sentry
- Ajouter les TU et flake8 dans le PRE-COMMIT
- Home page avec connexion

Done :

- Custom user pour associer des données telles que téléphone, date de naissance, etc...

# Useful links

About pytest:

- https://pytest-django.readthedocs.io
- https://docs.pytest.org/en/6.2.x/reference.html

About customUser:

- https://testdriven.io/blog/django-custom-user-model/

Django settings & installation:

- https://djangostars.com/blog/configuring-django-settings-best-practices/
- https://django-environ.readthedocs.io
- https://python-poetry.org/docs/cli/#add

Flake8 linting:

- https://flake8.pycqa.org/en/3.1.1/user/options.html#cmdoption-flake8--exclude
