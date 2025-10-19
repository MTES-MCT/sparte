from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class SimilarTerritories(models.Model):
    """
    Modèle représentant les territoires similaires en termes de population et de distance.
    Pour chaque territoire, ce modèle contient les 8 territoires les plus similaires
    basés sur la population (critère principal) et la distance géographique (critère secondaire).
    """

    land_id = models.CharField()
    land_name = models.CharField(help_text="Nom du territoire source")
    land_type = models.CharField(choices=AdminRef.CHOICES)
    similar_land_id = models.CharField()
    similar_land_name = models.CharField(help_text="Nom du territoire similaire")
    population_source = models.FloatField()
    population_similar = models.FloatField()
    population_difference = models.FloatField()
    distance_km = models.FloatField(help_text="Distance en kilomètres entre les centroïdes des territoires")
    similarity_rank = models.IntegerField()

    class Meta:
        managed = False
        db_table = "for_app_similar_territories"
        ordering = ["land_id", "land_type", "similarity_rank"]


class SimilarTerritoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimilarTerritories
        fields = [
            "land_id",
            "land_name",
            "land_type",
            "similar_land_id",
            "similar_land_name",
            "population_source",
            "population_similar",
            "population_difference",
            "distance_km",
            "similarity_rank",
        ]


class SimilarTerritoriesViewset(generics.ListAPIView):
    """
    API endpoint pour récupérer les territoires similaires.

    Les territoires similaires sont calculés en combinant deux critères :
    1. Population (critère principal)
    2. Distance géographique (critère secondaire)

    Pour chaque territoire, retourne les 8 territoires les plus similaires du même type.

    Filtres disponibles:
    - land_id: Identifiant du territoire
    - land_type: Type de territoire (COMM, EPCI, DEPART, REGION, SCOT)
    - similarity_rank: Rang de similarité (1 à 8)
    """

    queryset = SimilarTerritories.objects.all()
    serializer_class = SimilarTerritoriesSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_id", "land_type", "similarity_rank"]
