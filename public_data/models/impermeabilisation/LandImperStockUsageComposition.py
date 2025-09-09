from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from .BaseLandImperStockComposition import BaseLandImperStockComposition


class LandImperStockUsageComposition(BaseLandImperStockComposition):
    usage = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "public_data_landimperstockusagecomposition"


class LandImperStockUsageCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandImperStockUsageComposition
        fields = "__all__"


class LandImperStockUsageCompositionViewset(generics.ListAPIView):
    queryset = LandImperStockUsageComposition.objects.all()
    serializer_class = LandImperStockUsageCompositionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id"]
