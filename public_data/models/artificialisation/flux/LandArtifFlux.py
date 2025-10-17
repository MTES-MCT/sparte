from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers


class LandArtifFlux(models.Model):
    land_id = models.CharField(max_length=50)
    land_type = models.CharField(max_length=50)
    year_old = models.IntegerField()
    year_new = models.IntegerField()
    millesime_old_index = models.IntegerField()
    millesime_new_index = models.IntegerField()
    flux_artif = models.FloatField(help_text="Surface artificialisée en ha")
    flux_desartif = models.FloatField(help_text="Surface désartificialisée en ha")
    flux_artif_net = models.FloatField(help_text="Flux net d'artificialisation en ha")
    departement = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = "public_data_landartifflux"


class LandArtifFluxSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandArtifFlux
        fields = "__all__"


class LandArtifFluxViewset(generics.ListAPIView):
    queryset = LandArtifFlux.objects.all()
    serializer_class = LandArtifFluxSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id", "millesime_old_index", "millesime_new_index"]
