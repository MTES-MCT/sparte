from django.db import models

from .BaseLandFriche import (
    BaseLandFriche,
    BaseLandFricheSerializer,
    BaseLandFricheViewset,
)


class LandFricheSurfaceRank(BaseLandFriche):
    class SurfaceRankChoices(models.IntegerChoices):
        S_0_25 = 1, "25th"
        S_25_50 = 2, "50th"
        S_50_75 = 3, "75th"
        S_75_100 = 4, "100th"

    friche_surface_percentile_rank = models.IntegerField(choices=SurfaceRankChoices.choices)
    rank_max_surface = models.FloatField()
    rank_min_surface = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_landfrichesurfacerank"


class LandFricheSurfaceRankSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFricheSurfaceRank


class LandFricheSurfaceRankViewset(BaseLandFricheViewset):
    serializer_class = LandFricheSurfaceRankSerializer
