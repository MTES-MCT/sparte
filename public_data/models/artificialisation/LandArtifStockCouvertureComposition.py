from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from .BaseLandArtifStockComposition import BaseLandArtifStockComposition


class LandArtifStockCouvertureComposition(BaseLandArtifStockComposition):
    couverture = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "public_data_landartifstockcouverturecomposition"


class LandArtifStockCouvertureCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandArtifStockCouvertureComposition
        fields = "__all__"


class LandArtifStockCouvertureCompositionViewset(generics.ListAPIView):
    queryset = LandArtifStockCouvertureComposition.objects.all()
    serializer_class = LandArtifStockCouvertureCompositionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id"]
