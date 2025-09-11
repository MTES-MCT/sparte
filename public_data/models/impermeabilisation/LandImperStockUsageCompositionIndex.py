from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from .BaseLandImperStockCompositionIndex import BaseLandImperStockCompositionIndex


class LandImperStockUsageCompositionIndex(BaseLandImperStockCompositionIndex):
    usage = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "public_data_landimperstockusagecompositionindex"


class LandImperStockUsageCompositionIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandImperStockUsageCompositionIndex
        fields = "__all__"


class LandImperStockUsageCompositionIndexViewset(generics.ListAPIView):
    queryset = LandImperStockUsageCompositionIndex.objects.all()
    serializer_class = LandImperStockUsageCompositionIndexSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id"]
