# from django.db.models import Subquery, OuterRef, Count
from rest_framework import viewsets

from project.models import Emprise, Request
from public_data.models import Region
from utils.colors import get_blue_gradient

from . import serializers


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = serializers.RegionSerializer

    def get_queryset(self):
        regions = list(Region.objects.all())
        for region in regions:
            project_id = (
                Emprise.objects.all()
                .filter(mpoly__contained=region.mpoly)
                .values("project_id")
            )
            region.total = Request.objects.filter(project_id__in=project_id).count()
        regions.sort(key=lambda x: x.total, reverse=True)
        colors = get_blue_gradient(len(regions))
        for region in regions:
            if region.total > 0:
                region.map_color = colors.pop(0)
            else:
                region.map_color = colors[-1]
        return regions
