from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from .BaseLandArtifStockCompositionIndex import BaseLandArtifStockCompositionIndex


class LandArtifStockUsageCompositionIndex(BaseLandArtifStockCompositionIndex):
    usage = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "public_data_landartifstockusagecompositionindex"


class LandArtifStockUsageCompositionIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandArtifStockUsageCompositionIndex
        fields = "__all__"


class LandArtifStockUsageCompositionIndexViewset(generics.ListAPIView):
    queryset = LandArtifStockUsageCompositionIndex.objects.all()
    serializer_class = LandArtifStockUsageCompositionIndexSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id"]
