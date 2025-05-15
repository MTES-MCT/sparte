from django.contrib.gis.db.models import MultiPolygonField
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
from rest_framework import serializers, viewsets
from rest_framework.response import Response

from .Departement import Departement


class LandModel(models.Model):
    land_id = models.CharField()
    land_type = models.CharField()
    name = models.CharField()
    surface = models.FloatField()
    surface_unit = models.CharField()
    geom = MultiPolygonField()
    simple_geom = MultiPolygonField()
    surface_artif = models.FloatField()
    percent_artif = models.FloatField()
    years_artif = ArrayField(base_field=models.IntegerField())
    millesimes = ArrayField(base_field=models.JSONField())
    millesimes_by_index = ArrayField(base_field=models.JSONField())
    child_land_types = ArrayField(base_field=models.CharField())
    parent_keys = ArrayField(base_field=models.CharField())
    departements = ArrayField(base_field=models.CharField())
    is_interdepartemental = models.BooleanField()
    has_ocsge = models.BooleanField()
    has_zonage = models.BooleanField()

    class Meta:
        managed = False
        db_table = "public_data_land"

    def __str__(self):
        return self.name


class LandModelSerializer(serializers.ModelSerializer):
    def get_departement_name(self, departement_id):
        try:
            departement = Departement.objects.get(source_id=departement_id)
            return departement.name
        except Departement.DoesNotExist:
            return departement_id

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Ajouter le nom du département pour chaque millésime
        for millesime in data["millesimes"]:
            if "departement" in millesime:
                millesime["departement_name"] = self.get_departement_name(millesime["departement"])

        return data

    class Meta:
        model = LandModel
        exclude = ("geom",)


@method_decorator(cache_control(public=True, max_age=3600), name="retrieve")
@method_decorator(cache_control(public=True, max_age=3600), name="list")
class LandModelViewset(viewsets.ViewSet):
    queryset = LandModel.objects.all()
    serializer_class = LandModelSerializer

    @method_decorator(cache_page(60 * 10))
    def list(self, request):
        queryset = LandModel.objects.all()
        serializer = LandModelSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, land_type, land_id):
        queryset = LandModel.objects.get(land_id=land_id, land_type=land_type)
        serializer = LandModelSerializer(queryset)
        return Response(serializer.data)
