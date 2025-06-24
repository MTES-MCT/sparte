from django.db import models

from .BaseLandFriche import (
    BaseLandFriche,
    BaseLandFricheSerializer,
    BaseLandFricheViewset,
)


class LandFricheZonageEnvironnementale(BaseLandFriche):
    class ZonageEnvironnementalChoices(models.TextChoices):
        PROXIMITE_ZONE_RESERVE_NATURELLE = "proche d'une réserve naturelle"
        RESERVE_NATURELLE = "réserve naturelle"
        NATURA_2000 = "natura 2000"
        HORS_ZONE = "hors zone"
        ZNIEFF = "ZNIEFF"
        PROXIMITE_ZONE_ZNIEFF = "proche d'une ZNIEFF"
        PROXIMITE_ZONE_NATURA_2000 = "proche d'une zone Natura 2000"

    friche_zonage_environnemental = models.CharField(choices=ZonageEnvironnementalChoices.choices)

    class Meta:
        managed = False
        db_table = "public_data_landfrichezonageenvironnementale"


class LandFricheZonageEnvironnementaleSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFricheZonageEnvironnementale


class LandFricheZonageEnvironnementaleViewset(BaseLandFricheViewset):
    serializer_class = LandFricheZonageEnvironnementaleSerializer
