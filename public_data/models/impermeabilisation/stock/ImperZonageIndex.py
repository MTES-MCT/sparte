from django.contrib.postgres.fields import ArrayField
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class ImperZonageIndex(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    departements = ArrayField(base_field=models.CharField())
    years = ArrayField(base_field=models.IntegerField())
    zonage_surface = models.FloatField()
    impermeable_surface = models.FloatField()
    zonage_type = models.CharField()
    zonage_count = models.IntegerField()
    impermeable_percent = models.FloatField()
    millesime_index = models.IntegerField()

    class Meta:
        managed = False
        db_table = "public_data_imperzonageindex"


class ImperZonageIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImperZonageIndex
        fields = "__all__"


class ImperZonageIndexViewset(generics.ListAPIView):
    queryset = ImperZonageIndex.objects.all()
    serializer_class = ImperZonageIndexSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id", "millesime_index"]
