"""Public data API views."""
from django.contrib.gis.geos import Polygon
from django.db.models import F, OuterRef, Subquery
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ParseError

from public_data.api.serializers import ZoneUrbaSerializer
from public_data.models import Cerema, Commune
from public_data.models.gpu import ZoneUrba

from .models import Emprise, Project
from .serializers import EmpriseSerializer, ProjectCommuneSerializer
from .views.mixins import UserQuerysetOrPublicMixin


class EmpriseViewSet(viewsets.ReadOnlyModelViewSet):
    """Endpoint that provide geojson data for a specific project"""

    queryset = Emprise.objects.all()
    serializer_class = EmpriseSerializer
    filter_field = "project_id"

    def get_queryset(self):
        """Check if an id is provided and return linked Emprises"""
        try:
            id = int(self.request.query_params["id"])
        except KeyError:
            raise ParseError("id parameter is required in query parameter.")
        except ValueError:
            raise ParseError("id parameter must be an int.")

        return self.queryset.filter(**{self.filter_field: id})


class ProjectViewSet(UserQuerysetOrPublicMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectCommuneSerializer

    @action(detail=True, methods=["get"])
    def communes(self, request, pk):
        project = self.get_object()
        sum_function = sum(
            [F(f) / 10000 for f in Cerema.get_art_field(project.analyse_start_date, project.analyse_end_date)]
        )
        sub_cerema = Cerema.objects.annotate(artif_area=sum_function)
        sub_cerema = sub_cerema.filter(city_insee=OuterRef("insee"))
        queryset = Commune.objects.annotate(
            artif_area=Subquery(sub_cerema.values("artif_area")[:1]),
            conso_1121_art=Subquery(sub_cerema.values("naf11art21")[:1]) / 10000,
            conso_1121_hab=Subquery(sub_cerema.values("art11hab21")[:1]) / 10000,
            conso_1121_act=Subquery(sub_cerema.values("art11act21")[:1]) / 10000,
        ).prefetch_related("communediff_set")

        bbox = self.request.GET.get("in_bbox", None)
        if bbox is not None and len(bbox) > 0:
            polygon_box = Polygon.from_bbox(bbox.split(","))
            queryset = queryset.filter(mpoly__bboverlaps=polygon_box)
        serializer = ProjectCommuneSerializer(queryset, many=True)
        return JsonResponse(serializer.data, status=200)

    @action(detail=True, methods=["get"])
    def zones(self, request, pk):
        project = self.get_object()
        queryset = ZoneUrba.objects.intersect(project.combined_emprise)
        serializer = ZoneUrbaSerializer(queryset, many=True)
        return JsonResponse(serializer.data, status=200)
