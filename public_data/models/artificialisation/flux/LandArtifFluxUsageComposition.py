from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers


class LandArtifFluxUsageComposition(models.Model):
    land_id = models.CharField(max_length=50)
    land_type = models.CharField(max_length=50)
    departement = models.CharField(max_length=10)
    year_old = models.IntegerField()
    year_new = models.IntegerField()
    millesime_old_index = models.IntegerField()
    millesime_new_index = models.IntegerField()
    usage = models.CharField(max_length=100)
    color = models.CharField()
    label_short = models.CharField()
    label = models.CharField()
    flux_artif = models.FloatField(help_text="Surface artificialisée en ha")
    flux_desartif = models.FloatField(help_text="Surface désartificialisée en ha")
    flux_artif_net = models.FloatField(help_text="Flux net d'artificialisation en ha")

    class Meta:
        managed = False
        db_table = "public_data_landartiffluxusagecomposition"


class LandArtifFluxUsageCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandArtifFluxUsageComposition
        fields = "__all__"


class LandArtifFluxUsageCompositionViewset(generics.ListAPIView):
    queryset = LandArtifFluxUsageComposition.objects.all()
    serializer_class = LandArtifFluxUsageCompositionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id", "millesime_old_index", "millesime_new_index"]
