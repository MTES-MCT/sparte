from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers

from public_data.models.administration import AdminRef


class BaseLandFriche(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    friche_count = models.IntegerField()
    friche_surface = models.FloatField()

    class Meta:
        abstract = True


class BaseLandFricheSerializer(serializers.ModelSerializer):
    class Meta:
        fields = "__all__"


class BaseLandFricheViewset(generics.ListAPIView):
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["land_id", "land_type"]

    def get_queryset(self):
        model_class = self.serializer_class.Meta.model
        return model_class.objects.all()

    class Meta:
        abstract = True
