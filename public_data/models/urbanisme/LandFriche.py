from django.contrib.gis.db.models import PointField
from django.db import models
from rest_framework import serializers

from public_data.models.administration import AdminRef

from .BaseLandFriche import BaseLandFricheSerializer, BaseLandFricheViewset
from .LandFrichePollution import LandFrichePollution
from .LandFricheStatut import LandFricheStatut
from .LandFricheSurfaceRank import LandFricheSurfaceRank
from .LandFricheType import LandFricheType
from .LandFricheZonageEnvironnementale import LandFricheZonageEnvironnementale
from .LandFricheZonageType import LandFricheZonageType


class LandFriche(models.Model):
    site_id = models.CharField(max_length=255)
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    land_name = models.CharField()
    friche_sol_pollution = models.CharField(choices=LandFrichePollution.PollutionChoices.choices)
    friche_statut = models.CharField(choices=LandFricheStatut.StatutChoices.choices)
    friche_is_in_zone_activite = models.BooleanField()
    friche_zonage_environnemental = models.CharField(
        choices=LandFricheZonageEnvironnementale.ZonageEnvironnementalChoices.choices,
    )
    friche_type_zone = models.CharField(
        choices=LandFricheZonageType.TypeZoneChoices.choices,
    )
    friche_type = models.CharField(
        choices=LandFricheType.FricheTypeChoices.choices,
    )

    friche_surface_percentile_rank = models.FloatField(
        choices=LandFricheSurfaceRank.SurfaceRankChoices.choices,
    )

    surface = models.FloatField()
    point_on_surface = PointField(srid=4326)

    class Meta:
        managed = False
        db_table = "public_data_landfriche"


class LandFricheSerializer(BaseLandFricheSerializer):
    friche_zonage_environnemental = serializers.SerializerMethodField()
    friche_type = serializers.SerializerMethodField()
    friche_sol_pollution = serializers.SerializerMethodField()

    def get_friche_zonage_environnemental(self, obj):
        return obj.get_friche_zonage_environnemental_display()

    def get_friche_type(self, obj):
        return obj.get_friche_type_display()

    def get_friche_sol_pollution(self, obj):
        return obj.get_friche_sol_pollution_display()

    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFriche


class LandFricheViewset(BaseLandFricheViewset):
    serializer_class = LandFricheSerializer
