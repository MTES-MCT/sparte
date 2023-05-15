"""
Les zones urbaines fournies par le Géoportail de l'urbanisme
"""
from django.contrib.gis.db import models

from utils.db import IntersectMixin


class ZoneUrbaManager(IntersectMixin, models.Manager):
    pass


class ZoneUrba(models.Model):
    gid = models.CharField("gid", max_length=80, blank=True, null=True)
    libelle = models.CharField("libelle", max_length=80, blank=True, null=True)
    libelong = models.CharField("libelong", max_length=254, blank=True, null=True)
    typezone = models.CharField("typezone", max_length=80, blank=True, null=True)
    insee = models.CharField("insee", max_length=80, blank=True, null=True)
    idurba = models.CharField("idurba", max_length=80, blank=True, null=True)
    idzone = models.CharField("idzone", max_length=80, blank=True, null=True)
    lib_idzone = models.CharField("lib_idzone", max_length=80, blank=True, null=True)
    partition = models.CharField("partition", max_length=80, blank=True, null=True)
    destdomi = models.CharField("destdomi", max_length=80, blank=True, null=True)
    nomfic = models.CharField("nomfic", max_length=80, blank=True, null=True)
    urlfic = models.CharField("urlfic", max_length=178, blank=True, null=True)
    datappro = models.CharField("datappro", max_length=80, blank=True, null=True)
    datvalid = models.CharField("datvalid", max_length=80, blank=True, null=True)

    objects = ZoneUrbaManager()

    mpoly = models.MultiPolygonField()
