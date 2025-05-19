from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class ArtifZonage(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    departement = models.CharField()
    year = models.IntegerField()
    zonage_surface = models.FloatField()
    artificial_surface = models.FloatField()
    zonage_type = models.CharField()
    zonage_count = models.IntegerField()
    artificial_percent = models.FloatField()
    millesime_index = models.IntegerField()

    class Meta:
        managed = False
        db_table = "public_data_artifzonage"


class ArtifZonageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtifZonage
        fields = "__all__"


class ArtifZonageViewset(generics.ListAPIView):
    queryset = ArtifZonage.objects.all()
    serializer_class = ArtifZonageSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id", "millesime_index"]
