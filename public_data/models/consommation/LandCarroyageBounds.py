from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class LandCarroyageBounds(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    destination = models.CharField()
    min_value = models.FloatField()
    max_value = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_landcarroyagebounds"


class LandCarroyageBoundsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandCarroyageBounds
        fields = "__all__"


class LandCarroyageBoundsViewset(generics.ListAPIView):
    queryset = LandCarroyageBounds.objects.all()
    serializer_class = LandCarroyageBoundsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_id", "land_type", "start_year", "end_year", "destination"]
