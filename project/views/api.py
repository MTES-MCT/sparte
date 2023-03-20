from django.contrib.gis.geos import Polygon
from django.db.models import F, OuterRef, Subquery
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework_gis import filters

from project.mixins import UserQuerysetOrPublicMixin
from project.models import Project
from project.serializers import ProjectCommuneSerializer
from public_data.models import Cerema, Commune


class ProjectViewSet(UserQuerysetOrPublicMixin, viewsets.ReadOnlyModelViewSet):
    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)
    queryset = Project.objects.all()
    serializer_class = ProjectCommuneSerializer

    @action(detail=True, methods=["get"])
    def communes(self, request):
        project = self.get_object()
        sum_function = sum(
            [
                F(f)
                for f in Cerema.get_art_field(
                    project.analyse_start_date, project.analyse_end_date
                )
            ]
        )
        qs = Cerema.objects.annotate(artif_area=sum_function)
        queryset = Commune.objects.annotate(
            artif_area=Subquery(
                qs.filter(city_insee=OuterRef("insee")).values("artif_area")[:1]
            )
        )
        bbox = self.request.GET.get("bbox", None)
        if bbox is not None and len(bbox) > 0:
            polygon_box = Polygon.from_bbox(bbox.split(","))
            queryset = queryset.filter(mpoly__within=polygon_box)
        serializer = ProjectCommuneSerializer(queryset, many=True)
        return JsonResponse(serializer.data, status=200)
