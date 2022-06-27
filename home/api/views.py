# from django.db.models import Subquery, OuterRef, Count
from rest_framework import viewsets

from project.models import Request, Emprise
from public_data.models import Region
from utils.colors import get_color_gradient

from . import serializers


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = serializers.RegionSerializer

    def get_queryset(self):
        # # project_list = Request.objects.all().values_list("project", flat=True)
        # sub_qs = (
        #     Emprise.objects.filter(
        #         # project__in=project_list,
        #         mpoly__contained=OuterRef("mpoly"),
        #     )
        #     .annotate(total=Count("project_id", distinct=True))
        #     .values("total")[:1]
        # )
        # regions = list(
        #     Region.objects.annotate(total=Subquery(sub_qs)).order_by("total")
        # )
        regions = list(Region.objects.all())
        for region in regions:
            project_id = (
                Emprise.objects.all()
                .filter(mpoly__contained=region.mpoly)
                .values("project_id")
            )
            region.total = Request.objects.filter(project_id__in=project_id).count()
        regions.sort(key=lambda x: x.total, reverse=True)
        colors = get_color_gradient(scale=len(regions))
        for region in regions:
            if region.total > 0:
                region.map_color = colors.pop(0)
            else:
                region.map_color = colors[-1]
        return regions
