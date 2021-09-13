import json

from decimal import Decimal

from django.core.exceptions import ImproperlyConfigured
from django.db import models
from django.utils.translation import gettext_lazy as _


class ParameterManager(models.Manager):
    def get_from_slug(self, slug):
        """Send ImproperlyConfigured exception if parameter is not in DB"""
        try:
            return super().get(slug=slug)
        except Parameter.DoesNotExist as e:
            raise ImproperlyConfigured(f"{slug} parameters need to be set") from e

    def int(self, slug):
        return self.get_from_slug(slug).int()

    def float(self, slug):
        return self.get_from_slug(slug).float()

    def str(self, slug):
        return self.get_from_slug(slug).str()

    def decimal(self, slug):
        return self.get_from_slug(slug).decimal()

    def json(self, slug):
        return self.get_from_slug(slug).json()


class Parameter(models.Model):

    objects = ParameterManager()

    class TYPES(models.TextChoices):
        INT = "INT", _("Integer")
        STR = "STR", _("String")
        FLT = "FLT", _("Float")
        DCL = "DCL", _("Decimal")
        JSN = "JSN", _("JSON")

    name = models.CharField(_("name"), max_length=100)
    slug = models.SlugField(max_length=40, unique=True)
    value_type = models.CharField(
        _("Casting type"), max_length=3, choices=TYPES.choices, default=TYPES.STR
    )
    description = models.TextField(_("description"), blank=True)
    value = models.CharField(_("value"), max_length=250)

    def int(self):
        return int(self.value)

    def str(self):
        return self.value

    def float(self):
        return float(self.value)

    def decimal(self):
        return Decimal(self.value)

    def json(self):
        return json.loads(self.value)
