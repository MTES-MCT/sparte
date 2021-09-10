from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    username = None
    email = models.EmailField(_("email address"), unique=True)
    email_checked = models.DateTimeField(_("email checked"), blank=True, null=True)
    organism = models.CharField(_("Organism"), max_length=250)
    function = models.CharField(_("Function"), max_length=250)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
