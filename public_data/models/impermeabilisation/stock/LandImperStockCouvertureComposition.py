from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from .BaseLandImperStockComposition import BaseLandImperStockComposition


class LandImperStockCouvertureComposition(BaseLandImperStockComposition):
    couverture = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "public_data_landimperstockcouverturecomposition"


class LandImperStockCouvertureCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandImperStockCouvertureComposition
        fields = "__all__"


class LandImperStockCouvertureCompositionViewset(generics.ListAPIView):
    queryset = LandImperStockCouvertureComposition.objects.all()
    serializer_class = LandImperStockCouvertureCompositionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id"]
