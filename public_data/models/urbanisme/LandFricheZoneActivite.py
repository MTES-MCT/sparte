from django.db import models

from .BaseLandFriche import (
    BaseLandFriche,
    BaseLandFricheSerializer,
    BaseLandFricheViewset,
)


class LandFricheZoneActivite(BaseLandFriche):
    friche_is_in_zone_activite = models.BooleanField()

    class Meta:
        managed = False
        db_table = "public_data_landfrichezoneactivite"


class LandFricheZoneActiviteSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFricheZoneActivite


class LandFricheZoneActiviteViewset(BaseLandFricheViewset):
    serializer_class = LandFricheZoneActiviteSerializer
