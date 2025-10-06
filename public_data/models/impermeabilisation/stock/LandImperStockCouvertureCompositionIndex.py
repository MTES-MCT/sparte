from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from .BaseLandImperStockCompositionIndex import BaseLandImperStockCompositionIndex


class LandImperStockCouvertureCompositionIndex(BaseLandImperStockCompositionIndex):
    couverture = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "public_data_landimperstockcouverturecompositionindex"


class LandImperStockCouvertureCompositionIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandImperStockCouvertureCompositionIndex
        fields = "__all__"


class LandImperStockCouvertureCompositionIndexViewset(generics.ListAPIView):
    queryset = LandImperStockCouvertureCompositionIndex.objects.all()
    serializer_class = LandImperStockCouvertureCompositionIndexSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id"]
