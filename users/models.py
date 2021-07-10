from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    username = None
    email = models.EmailField(_("email address"), unique=True)
    email_checked = models.BooleanField(_("email checked"), default=False)
    creation_date = models.DateTimeField(_("creation date"), auto_now_add=True)
    phone = models.CharField(_("phone number"), blank=True, null=True, max_length=50)
    postal_address = models.CharField(
        _("postal address"), blank=True, null=True, max_length=250
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
