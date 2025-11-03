from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class LandPopulationDensity(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    year = models.IntegerField()
    population = models.IntegerField()
    surface = models.FloatField()
    density_ha = models.FloatField()
    density_km2 = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_landpopulationdensity"


class LandPopulationDensitySerializer(serializers.ModelSerializer):
    class Meta:
        model = LandPopulationDensity
        fields = ["land_id", "land_type", "year", "population", "surface", "density_ha", "density_km2"]


class LandPopulationDensityViewset(generics.ListAPIView):
    queryset = LandPopulationDensity.objects.all()
    serializer_class = LandPopulationDensitySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_id", "land_type", "year"]
