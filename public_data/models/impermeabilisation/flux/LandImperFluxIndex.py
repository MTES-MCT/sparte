from django.contrib.postgres.fields import ArrayField
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers


class LandImperFluxIndex(models.Model):
    land_id = models.CharField(max_length=50)
    land_type = models.CharField(max_length=50)
    years_old = ArrayField(models.IntegerField())
    years_new = ArrayField(models.IntegerField())
    millesime_old_index = models.IntegerField()
    millesime_new_index = models.IntegerField()
    flux_imper = models.FloatField(help_text="Surface imperméabilisée en ha")
    flux_desimper = models.FloatField(help_text="Surface désimperméabilisée en ha")
    flux_imper_net = models.FloatField(help_text="Flux net d'imperméabilisation en ha")
    departements = ArrayField(models.CharField(max_length=10))

    class Meta:
        managed = False
        db_table = "public_data_landimperfluxindex"


class LandImperFluxIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandImperFluxIndex
        fields = "__all__"


class LandImperFluxIndexViewset(generics.ListAPIView):
    queryset = LandImperFluxIndex.objects.all()
    serializer_class = LandImperFluxIndexSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id", "millesime_old_index", "millesime_new_index"]
