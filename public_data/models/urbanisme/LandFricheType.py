from django.db import models

from .BaseLandFriche import (
    BaseLandFriche,
    BaseLandFricheSerializer,
    BaseLandFricheViewset,
)


class LandFricheType(BaseLandFriche):
    class FricheTypeChoices(models.TextChoices):
        FRICHE_LOGISTIQUE = "friche logistique"
        FRICHE_TOURISTIQUE = "friche touristique"
        FRICHE_HOSPITALIERE = "friche hospitalière"
        FRICHE_FERROVIAIRE = "friche ferroviaire"
        AUTRE = ("autre",)
        MIXTE = ("mixte",)
        FRICHE_ENSEIGNEMENT = "friche enseignement"
        FRICHE_CULTURELLE = "friche cultuelle"
        INCONNU = "inconnu"
        FRICHE_PORTUAIRE = "friche portuaire"
        FRICHE_CARRIERE_MINE = "friche carrière ou mine"
        FRICHE_AEROPORTUAIRE = "friche aéroportuaire"
        FRICHE_HABITAT = "friche d'habitat"
        FRICHE_EQUIPMENT_PUBLIC = "friche d'équipement public"
        FRICHE_LOISIR_TOURISME_HOTELLERIE = "friche loisir tourisme hôtellerie"
        FRICHE_AGRO_INDUSTRIELLE = "friche agro-industrielle"
        FRICHE_INDUSTRIELLE = "friche industrielle"
        FRICHE_COMMERCIALE = "friche commerciale"
        FRICHE_MILITAIRE = ("friche militaire",)

    friche_type = models.CharField(choices=FricheTypeChoices.choices, max_length=100)

    class Meta:
        managed = False
        db_table = "public_data_landfrichetype"


class LandFricheTypeSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFricheType


class LandFricheTypeViewset(BaseLandFricheViewset):
    serializer_class = LandFricheTypeSerializer
