from django.db import models

from .BaseLandFriche import (
    BaseLandFriche,
    BaseLandFricheSerializer,
    BaseLandFricheViewset,
)


class LandFricheZonageType(BaseLandFriche):
    class TypeZoneChoices(models.TextChoices):
        NATUREL = "N"
        URBAIN = "U"
        AGRICOLE = "A"
        A_URBANISER = "AU"
        ZONE_CONSTRUCTIBLE = "ZC"
        ZONE_CONSTRUCTIBLE_POUR_ACTIVITE = "ZCa"
        ZONE_NON_CONSTRUCTIBLE = "ZnC"

    friche_type_zone = models.CharField(choices=TypeZoneChoices.choices)

    class Meta:
        managed = False
        db_table = "public_data_landfrichezonagetype"


class LandFricheZonageTypeSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFricheZonageType


class LandFricheZonageTypeViewset(BaseLandFricheViewset):
    serializer_class = LandFricheZonageTypeSerializer
