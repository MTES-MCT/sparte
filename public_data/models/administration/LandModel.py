from django.contrib.gis.db.models import MultiPolygonField
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
from rest_framework import serializers, viewsets
from rest_framework.response import Response


class LandModelManager(models.Manager):
    def get_by_natural_key(self, land_id, land_type):
        return self.get(land_id=land_id, land_type=land_type)


class LandModel(models.Model):
    objects = LandModelManager()
    id = models.TextField(primary_key=True)

    class OcsgeCoverageStatus(models.TextChoices):
        COMPLETE_UNIFORM = "COMPLETE_UNIFORM", "Complet et uniforme"
        """
        All cities of the project have OCS GE data for the selected millésimes,
        and the cities spreads over only one departement. This definition could
        evolve in the future if two departements have the same millésimes
        available, and the code allow for that verification.
        """

        COMPLETE_NOT_UNIFORM = "COMPLETE_NOT_UNIFORM", "Complet mais non uniforme"
        """
        All cities of the project have OCS GE data for the selected millésimes
        but the cities spreads over more than one departement.
        """

        PARTIAL = "PARTIAL", "Partiel"
        """
        At least one city of the project have OCS GE data for the selected
        millésimes.
        """

        NO_DATA = "NO_DATA", "Aucune donnée"
        """
        0 city of the project have OCS GE data for the selected millésimes.
        """

        UNDEFINED = "UNDEFINED", "Non défini"

    class FricheStatus(models.TextChoices):
        GISEMENT_NUL_SANS_POTENTIEL = "gisement nul et sans potentiel"
        GISEMENT_NUL_POTENTIEL_EXPLOITE = "gisement nul car potentiel déjà exploité"
        GISEMENT_POTENTIEL_NON_EXPLOITE = "gisement potentiel et non exploité"
        GISEMENT_POTENTIEL_EN_COURS_EXPLOITATION = "gisement potentiel et en cours d’exploitation"

    class LogementsVacantsStatus(models.TextChoices):
        GISEMENT_NUL = "gisement nul"
        GISEMENT_POTENTIEL_DANS_LE_SOCIAL_ET_LE_PRIVE = "gisement potentiel dans le social et le privé"
        GISEMENT_POTENTIEL_DANS_LE_SOCIAL = "gisement potentiel dans le social"
        GISEMENT_POTENTIEL_DANS_LE_PRIVE = "gisement potentiel dans le privé"

    class ConsommationCorrectionStatus(models.TextChoices):
        DONNEES_CORRIGEES = "données_coriggées", "données_coriggées"
        DONNEES_INCHANGEES_AVEC_DONNEES_MANQUANTES = (
            "données_inchangées_avec_données_manquantes",
            "données_inchangées_avec_données_manquantes",
        )
        DONNEES_PARTIELLEMENT_CORRIGEES = "données_partiellement_coriggées", "données_partiellement_coriggées"
        DONNEES_INCHANGEES = "données_inchangées", "données_inchangées"
        DONNEES_MANQUANTES = "données_manquantes", "données_manquantes"

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
    surface_imper = models.FloatField()
    percent_imper = models.FloatField()
    years_imper = ArrayField(base_field=models.IntegerField())
    millesimes = ArrayField(base_field=models.JSONField())
    millesimes_by_index = ArrayField(base_field=models.JSONField())
    child_land_types = ArrayField(base_field=models.CharField())
    parent_keys = ArrayField(base_field=models.CharField())
    departements = ArrayField(base_field=models.CharField())
    is_interdepartemental = models.BooleanField()
    ocsge_status = models.TextField(choices=OcsgeCoverageStatus.choices)
    has_ocsge = models.BooleanField()
    has_zonage = models.BooleanField()
    has_friche = models.BooleanField()
    has_conso = models.BooleanField()
    friche_status = models.TextField(choices=FricheStatus.choices)
    friche_status_details = models.JSONField()
    logements_vacants_status = models.TextField(choices=LogementsVacantsStatus.choices)
    has_logements_vacants = models.BooleanField()
    logements_vacants_status_details = models.JSONField()
    bounds = ArrayField(base_field=models.FloatField())
    max_bounds = ArrayField(base_field=models.FloatField())
    conso_details = models.JSONField()
    consommation_correction_status = models.TextField(choices=ConsommationCorrectionStatus.choices)

    class Meta:
        managed = False
        db_table = "public_data_land"

    def __str__(self):
        return f"{self.name} ({self.land_id} - {self.land_type})"

    def natural_key(self):
        return (self.land_id, self.land_type)

    @property
    def territorialisation(self):
        from public_data.models.territorialisation import TerritorialisationObjectif

        objectif = self.territorialisation_objectifs.first()
        has_children = TerritorialisationObjectif.objects.filter(
            parent__land_id=self.land_id,
            parent__land_type=self.land_type,
        ).exists()

        if not objectif:
            return {
                "has_objectif": False,
                "objectif": None,
                "hierarchy": [],
                "has_children": has_children,
            }

        # Construire la hiérarchie en remontant les parents
        hierarchy = []
        current = objectif

        while current:
            hierarchy.append(
                {
                    "land_id": current.land.land_id,
                    "land_type": current.land.land_type,
                    "land_name": current.land.name,
                    "objectif": float(current.objectif_de_reduction),
                    "parent_name": current.parent.name if current.parent else None,
                    "nom_document": current.nom_document,
                    "document_url": current.document_url,
                    "document_comment": current.document_comment,
                }
            )

            # Chercher l'objectif du parent
            if current.parent:
                parent_objectif = current.parent.territorialisation_objectifs.first()
                current = parent_objectif
            else:
                current = None

        hierarchy_ordered = list(reversed(hierarchy))

        # Document source = avant-dernier de la hiérarchie (le parent qui définit l'objectif)
        source_document = None
        if len(hierarchy_ordered) >= 2:
            parent_item = hierarchy_ordered[-2]
            source_document = {
                "land_name": parent_item["land_name"],
                "nom_document": parent_item["nom_document"],
            }

        return {
            "has_objectif": True,
            "objectif": float(objectif.objectif_de_reduction),
            "hierarchy": hierarchy_ordered,
            "has_children": has_children,
            "source_document": source_document,
        }


class LandModelSerializer(serializers.ModelSerializer):
    territorialisation = serializers.DictField(read_only=True)

    class Meta:
        model = LandModel
        exclude = (
            "geom",
            "simple_geom",
        )


class LandModelGeomSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandModel
        fields = ("simple_geom",)


class LandModelGeomViewset(viewsets.ViewSet):
    queryset = LandModel.objects.all()
    serializer_class = LandModelGeomSerializer

    def retrieve(self, request, land_type, land_id):
        queryset = LandModel.objects.get(land_id=land_id, land_type=land_type)
        serializer = LandModelGeomSerializer(queryset)
        return Response(serializer.data)


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
