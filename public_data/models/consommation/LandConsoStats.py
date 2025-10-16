from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class LandConsoStats(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    comparison_level = models.CharField(choices=AdminRef.CHOICES)
    comparison_id = models.CharField()
    from_year = models.IntegerField()
    to_year = models.IntegerField()
    total = models.FloatField()
    total_percent = models.FloatField()
    activite = models.FloatField()
    activite_percent = models.FloatField()
    habitat = models.FloatField()
    habitat_percent = models.FloatField()
    mixte = models.FloatField()
    mixte_percent = models.FloatField()
    route = models.FloatField()
    route_percent = models.FloatField()
    ferroviaire = models.FloatField()
    ferroviaire_percent = models.FloatField()
    inconnu = models.FloatField()
    inconnu_percent = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_landconsostats"


class LandConsoStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandConsoStats
        fields = "__all__"


class LandConsoStatsViewset(generics.ListAPIView):
    queryset = LandConsoStats.objects.all()
    serializer_class = LandConsoStatsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_id", "land_type", "from_year", "to_year", "comparison_level", "comparison_id"]
