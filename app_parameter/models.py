import json

from decimal import Decimal

from django.core.exceptions import ImproperlyConfigured
from django.db import models


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

    def create_if_not_exists(self, parameter):
        try:
            param = Parameter.objects.get(slug=parameter["slug"])
            param.name = parameter["name"]
            param.value = parameter["value"]
            param.value_type = parameter["value_type"]
            param.save()
            return "Already exists, updated"
        except Parameter.DoesNotExist:
            Parameter.objects.create(**parameter)
            return "Added"


class Parameter(models.Model):

    objects = ParameterManager()

    class TYPES(models.TextChoices):
        INT = "INT", "Nombre entier"
        STR = "STR", "Chaîne de caractères"
        FLT = "FLT", "Nombre à virgule (Float)"
        DCL = "DCL", "Nombre à virgule (Decimal)"
        JSN = "JSN", "JSON"

    name = models.CharField("Nom", max_length=100)
    slug = models.SlugField(max_length=40, unique=True)
    value_type = models.CharField(
        "Type de donnée", max_length=3, choices=TYPES.choices, default=TYPES.STR
    )
    description = models.TextField("Description", blank=True)
    value = models.CharField("Valeur", max_length=250)

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

    def __str__(self):
        return self.name
