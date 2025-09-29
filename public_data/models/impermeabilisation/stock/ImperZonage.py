from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class ImperZonage(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    departement = models.CharField()
    year = models.IntegerField()
    zonage_surface = models.FloatField()
    impermeablesurface = models.FloatField()
    zonage_type = models.CharField()
    zonage_count = models.IntegerField()
    impermeablepercent = models.FloatField()
    millesime_index = models.IntegerField()

    class Meta:
        managed = False
        db_table = "public_data_imperzonage"


class ImperZonageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImperZonage
        fields = "__all__"


class ImperZonageViewset(generics.ListAPIView):
    queryset = ImperZonage.objects.all()
    serializer_class = ImperZonageSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id", "millesime_index"]
