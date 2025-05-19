from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from .BaseLandArtifStockComposition import BaseLandArtifStockComposition


class LandArtifStockUsageComposition(BaseLandArtifStockComposition):
    usage = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "public_data_landartifstockusagecomposition"


class LandArtifStockUsageCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandArtifStockUsageComposition
        fields = "__all__"


class LandArtifStockUsageCompositionViewset(generics.ListAPIView):
    queryset = LandArtifStockUsageComposition.objects.all()
    serializer_class = LandArtifStockUsageCompositionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id"]
