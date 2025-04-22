from django.contrib.postgres.fields import ArrayField
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class ArtifZonageIndex(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    departements = ArrayField(base_field=models.CharField())
    years = ArrayField(base_field=models.IntegerField())
    zonage_surface = models.FloatField()
    artificial_surface = models.FloatField()
    zonage_type = models.CharField()
    zonage_count = models.IntegerField()
    artificial_percent = models.FloatField()
    millesime_index = models.IntegerField()

    class Meta:
        managed = False
        db_table = "public_data_artifzonageindex"


class ArtifZonageIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtifZonageIndex
        fields = "__all__"


class ArtifZonageIndexViewset(generics.ListAPIView):
    queryset = ArtifZonageIndex.objects.all()
    serializer_class = ArtifZonageIndexSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id", "millesime_index"]
