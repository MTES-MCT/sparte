Custom Django User model
========================

Ce module vise à déployer un model User personnalisé pour remplacer celui de Django.

## Modifications

- Remove username
- Custom form for sign up and login

## Prérequis

Le module attend qu'il existe un template "base.html" à étendre. Ce template doit être dans un dossier template à la racine du projet.

Crispy_form est utilisé dans les templates.

Voici les configurations à ajouter au settings:
```
from .base import INSTALLED_APPS, TEMPLATES

# Add it to installed app
INSTALLED_APPS += ["users.apps.UsersConfig"]

# indicate the new User model to Django
AUTH_USER_MODEL = "users.User"

TEMPLATES[0]["OPTIONS"]["context_processors"] += [
    "users.context_processors.add_connected_user_to_context",
]

LOGIN_REDIRECT_URL = "connected"
```

## TODO

Tâches envisagées :

- Envoyer un e-mail lorsqu'un user s'inscri pour confirmer son inscription
- optin pour être contacté en direct
