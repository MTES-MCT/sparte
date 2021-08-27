"""Configuration of e-mails

Several configuration are authorized, see available_engines variable below.

Local = will store email to a file (not sending)
mailjet = will use mailjet provider to send emails, it uses anymail lib, see
https://anymail.readthedocs.io/en/stable/esps/mailjet/

To set local configuration, please add to .env file following variables:
- EMAIL_ENGINE=local
- EMAIL_FILE_PATH where to store a file for each sent email

To set MailJet configuration, please add environment variables:
- EMAIL_ENGINE=mailjet
- MAILJET_ID & MAILJET_SECRET, see https://app.mailjet.com/account/api_keys
"""
from django.core.exceptions import ImproperlyConfigured
from .base import env, INSTALLED_APPS

EMAIL_ENGINE = env("EMAIL_ENGINE")

available_engines = ["local", "mailjet"]
if EMAIL_ENGINE not in available_engines:
    raise ImproperlyConfigured("E-mail backend needs to be correctly set")


if EMAIL_ENGINE == "local":
    EMAIL_BACKEND = "django.core.mail.backends.filebased.EmailBackend"
    EMAIL_FILE_PATH = env.str("EMAIL_FILE_PATH")

elif EMAIL_ENGINE == "mailjet":
    INSTALLED_APPS += [
        "anymail",
    ]
    EMAIL_BACKEND = "anymail.backends.mailjet.EmailBackend"
    ANYMAIL = {
        "MAILJET_API_KEY": env("MAILJET_ID"),
        "MAILJET_SECRET_KEY": env("MAILJET_SECRET"),
    }
