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

## Before commiting

Check unit test coverage: `coverage run -m pytest && coverage report -m`

Check flake8 linting: `flake8`

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

Flake8 linting:

- https://flake8.pycqa.org/en/3.1.1/user/options.html#cmdoption-flake8--exclude

Dashboard layout (for inspiration):

- https://appstack.bootlab.io/dashboard-default.html

About colours and gradient :

- https://github.com/vaab/colour/
- https://medium.com/the-mvp/finally-a-definitive-way-to-make-gradients-beautiful-6b27af88f5f
- https://hslpicker.com/#c0f/#e6ff00
