from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class NearestTerritories(models.Model):
    """
    Modèle représentant les territoires les plus proches géographiquement.
    Pour chaque territoire, ce modèle contient les 8 territoires les plus proches
    basés uniquement sur la distance géographique entre les centroïdes.
    """

    land_id = models.CharField()
    land_name = models.CharField(help_text="Nom du territoire source")
    land_type = models.CharField(choices=AdminRef.CHOICES)
    nearest_land_id = models.CharField()
    nearest_land_name = models.CharField(help_text="Nom du territoire le plus proche")
    distance_km = models.FloatField(help_text="Distance en kilomètres entre les centroïdes des territoires")
    distance_rank = models.IntegerField(help_text="Rang de proximité (1 = le plus proche, 8 = le 8ème plus proche)")

    class Meta:
        managed = False
        db_table = "public_data_nearestterritories"
        ordering = ["land_id", "land_type", "distance_rank"]


class NearestTerritoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = NearestTerritories
        fields = [
            "land_id",
            "land_name",
            "land_type",
            "nearest_land_id",
            "nearest_land_name",
            "distance_km",
            "distance_rank",
        ]


class NearestTerritoriesViewset(generics.ListAPIView):
    """
    API endpoint pour récupérer les territoires les plus proches.

    Les territoires les plus proches sont calculés en utilisant uniquement
    la distance géographique entre les centroïdes des territoires.

    Pour chaque territoire, retourne les 8 territoires les plus proches du même type.

    Filtres disponibles:
    - land_id: Identifiant du territoire
    - land_type: Type de territoire (COMM, EPCI, DEPART, REGION, SCOT)
    - distance_rank: Rang de proximité (1 à 8)
    """

    queryset = NearestTerritories.objects.all()
    serializer_class = NearestTerritoriesSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_id", "land_type", "distance_rank"]
