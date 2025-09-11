from django.contrib.postgres.fields import ArrayField
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class LandImperStockIndex(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    departements = ArrayField(base_field=models.CharField())
    years = ArrayField(base_field=models.IntegerField())
    surface = models.FloatField()
    percent = models.FloatField()
    millesime_index = models.IntegerField()
    flux_surface = models.FloatField()
    flux_percent = models.FloatField()
    flux_previous_years = ArrayField(base_field=models.IntegerField())

    class Meta:
        managed = False
        db_table = "public_data_landimperstockindex"


class LandImperStockIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandImperStockIndex
        fields = "__all__"


class LandImperStockIndexViewset(generics.ListAPIView):
    queryset = LandImperStockIndex.objects.all()
    serializer_class = LandImperStockIndexSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_id", "land_type", "millesime_index"]
