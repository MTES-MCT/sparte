from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class LandPopStats(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    comparison_level = models.CharField()
    comparison_id = models.CharField(choices=AdminRef.CHOICES)
    from_year = models.IntegerField()
    to_year = models.IntegerField()
    evolution = models.FloatField()
    evolution_percent = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_landpopstats"


class LandPopStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandPopStats
        fields = ["land_id", "land_type", "from_year", "to_year", "evolution", "evolution_percent"]


class LandPopStatsViewset(generics.ListAPIView):
    queryset = LandPopStats.objects.all()
    serializer_class = LandPopStatsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_id", "land_type", "from_year", "to_year"]
