from django.db import models

from .BaseLandFriche import (
    BaseLandFriche,
    BaseLandFricheSerializer,
    BaseLandFricheViewset,
)


class LandFrichePollution(BaseLandFriche):
    class PollutionChoices(models.TextChoices):
        POLLUTION_PEU_PROBABLE = "pollution peu probable"
        POLLUTION_AVEREE = "pollution avérée"
        POLLUTION_PROBABLE = "pollution probable"
        POLLUTION_TRAITEE = "pollution traitée"
        POLLUTION_INEXISTANTE = "pollution inexistante"
        POLLUTION_SUPPOSEE = "pollution supposée"
        INCONNU = "inconnu"

    friche_sol_pollution = models.CharField(choices=PollutionChoices.choices, max_length=50)

    class Meta:
        managed = False
        db_table = "public_data_landfrichepollution"


class LandFrichePollutionSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFrichePollution


class LandFrichePollutionViewset(BaseLandFricheViewset):
    serializer_class = LandFrichePollutionSerializer
