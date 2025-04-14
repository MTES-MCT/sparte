from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from .BaseLandArtifStockCompositionIndex import BaseLandArtifStockCompositionIndex


class LandArtifStockCouvertureCompositionIndex(BaseLandArtifStockCompositionIndex):
    couverture = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "public_data_landartifstockcouverturecompositionindex"


class LandArtifStockCouvertureCompositionIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandArtifStockCouvertureCompositionIndex
        fields = "__all__"


class LandArtifStockCouvertureCompositionIndexViewset(generics.ListAPIView):
    queryset = LandArtifStockCouvertureCompositionIndex.objects.all()
    serializer_class = LandArtifStockCouvertureCompositionIndexSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id"]
