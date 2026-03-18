from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class LandArtifStock(models.Model):
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
        db_table = "public_data_landartifstock"


class LandArtifStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandArtifStock
        fields = "__all__"


class LandArtifStockViewset(generics.ListAPIView):
    queryset = LandArtifStock.objects.all()
    serializer_class = LandArtifStockSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_id", "land_type"]
