from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class LandImperStock(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    departement = models.CharField()
    year = models.IntegerField()
    surface = models.FloatField()
    percent = models.FloatField()
    millesime_index = models.IntegerField()
    # Null pour le premier millésime (index=1) car il n'y a pas de millésime précédent pour calculer le flux
    flux_surface = models.FloatField(null=True)
    flux_percent = models.FloatField(null=True)
    flux_previous_year = models.IntegerField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_landimperstock"


class LandImperStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandImperStock
        fields = "__all__"


class LandImperStockViewset(generics.ListAPIView):
    queryset = LandImperStock.objects.all()
    serializer_class = LandImperStockSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_id", "land_type"]
