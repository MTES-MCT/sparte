from django.contrib.gis.db.models import PointField
from django.contrib.postgres.fields import ArrayField
from django.db import models

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
    site_nom = models.CharField(max_length=255)
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

    surface_artif = models.FloatField()
    percent_artif = models.FloatField()
    years_artif = ArrayField(base_field=models.IntegerField())

    surface_imper = models.FloatField()
    percent_imper = models.FloatField()
    years_imper = ArrayField(base_field=models.IntegerField())

    class Meta:
        managed = False
        db_table = "public_data_landfriche"


class LandFricheSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFriche


class LandFricheViewset(BaseLandFricheViewset):
    serializer_class = LandFricheSerializer
