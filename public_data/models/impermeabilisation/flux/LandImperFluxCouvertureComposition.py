from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers


class LandImperFluxCouvertureComposition(models.Model):
    land_id = models.CharField(max_length=50)
    land_type = models.CharField(max_length=50)
    departement = models.CharField(max_length=10)
    year_old = models.IntegerField()
    year_new = models.IntegerField()
    millesime_old_index = models.IntegerField()
    millesime_new_index = models.IntegerField()
    couverture = models.CharField(max_length=100)
    color = models.CharField()
    label_short = models.CharField()
    label = models.CharField()
    flux_imper = models.FloatField(help_text="Surface imperméabilisée en ha")
    flux_desimper = models.FloatField(help_text="Surface désimperméabilisée en ha")
    flux_imper_net = models.FloatField(help_text="Flux net d'imperméabilisation en ha")

    class Meta:
        managed = False
        db_table = "public_data_landimperfluxcouverturecomposition"


class LandImperFluxCouvertureCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandImperFluxCouvertureComposition
        fields = "__all__"


class LandImperFluxCouvertureCompositionViewset(generics.ListAPIView):
    queryset = LandImperFluxCouvertureComposition.objects.all()
    serializer_class = LandImperFluxCouvertureCompositionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_type", "land_id", "millesime_old_index", "millesime_new_index"]
