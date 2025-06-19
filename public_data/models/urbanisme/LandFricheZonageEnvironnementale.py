from django.db import models

from .BaseLandFriche import (
    BaseLandFriche,
    BaseLandFricheSerializer,
    BaseLandFricheViewset,
)


class LandFricheZonageEnvironnementale(BaseLandFriche):
    class ZonageEnvironnementalChoices(models.TextChoices):
        PROXIMITE_ZONE_RESERVE_NATURELLE = "proximite_zone (reserves_naturelles)", "Proche d'une réserve naturelle"
        RESERVE_NATURELLE = "reserve_naturelle", "Réserve naturelle"
        NATURA_2000 = "natura_2000", "Natura 2000"
        HORS_ZONE = "hors zone", "Hors zone"
        ZNIEFF = "znieff", "ZNIEFF"
        PROXIMITE_ZONE_ZNIEFF = "proximite_zone (znieff)", "Proche d'une ZNIEFF"
        PROXIMITE_ZONE_NATURA_2000 = "proximite_zone (natura_2000)", "Proche d'une zone Natura 2000"

    friche_zonage_environnemental = models.CharField(choices=ZonageEnvironnementalChoices.choices)

    class Meta:
        managed = False
        db_table = "public_data_landfrichezonageenvironnementale"


class LandFricheZonageEnvironnementaleSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFricheZonageEnvironnementale


class LandFricheZonageEnvironnementaleViewset(BaseLandFricheViewset):
    serializer_class = LandFricheZonageEnvironnementaleSerializer
