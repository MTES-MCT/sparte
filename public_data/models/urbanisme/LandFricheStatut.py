from django.db import models

from .BaseLandFriche import (
    BaseLandFriche,
    BaseLandFricheSerializer,
    BaseLandFricheViewset,
)


class LandFricheStatut(BaseLandFriche):
    class StatutChoices(models.TextChoices):
        FRICHE_RECONVERTIE = "friche reconvertie"
        FRICHE_AVEC_PROJET = "friche avec projet"
        FRICHE_SANS_PROJET = "friche sans projet"

    friche_statut = models.CharField(choices=StatutChoices.choices)

    class Meta:
        managed = False
        db_table = "public_data_landfrichestatut"


class LandFricheStatutSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFricheStatut


class LandFricheStatutViewset(BaseLandFricheViewset):
    serializer_class = LandFricheStatutSerializer
