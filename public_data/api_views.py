"""Public data API views."""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_gis import filters

from .models import (
    Artificialisee2015to2018,
    Artificielle2018,
    CommunesSybarval,
    CouvertureSol,
    EnveloppeUrbaine2018,
    Ocsge2015,
    Ocsge2018,
    Renaturee2018to2015,
    Sybarval,
    UsageSol,
    Voirie2018,
    ZonesBaties2018,
)
from .serializers import (
    Artificialisee2015to2018Serializer,
    Artificielle2018Serializer,
    CommunesSybarvalSerializer,
    CouvertureSolSerializer,
    EnveloppeUrbaine2018Serializer,
    Ocsge2015Serializer,
    Ocsge2018Serializer,
    Renaturee2018to2015Serializer,
    SybarvalSerializer,
    UsageSolSerializer,
    Voirie2018Serializer,
    ZonesBaties2018Serializer,
)


class DataViewSet(viewsets.ReadOnlyModelViewSet):
    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)

    @action(detail=False, methods=["get"])
    def gradient(self, request):
        property_name = color_name = None
        if "property_name" in request.query_params:
            property_name = str(request.query_params["property_name"])
        if "color_name" in request.query_params:
            color_name = str(request.query_params["color_name"])
        gradient = self.queryset.model.get_gradient(
            property_name=property_name,
            color_name=color_name,
        )
        gradient = [{"value": int(k), "color": v.hex_l} for k, v in gradient.items()]
        return Response(gradient)


class EnveloppeUrbaine2018ViewSet(DataViewSet):
    queryset = EnveloppeUrbaine2018.objects.all()
    serializer_class = EnveloppeUrbaine2018Serializer


class Artificialisee2015to2018ViewSet(DataViewSet):
    queryset = Artificialisee2015to2018.objects.all()
    serializer_class = Artificialisee2015to2018Serializer


class Artificielle2018ViewSet(DataViewSet):
    queryset = Artificielle2018.objects.all()
    serializer_class = Artificielle2018Serializer


class CommunesSybarvalViewSet(DataViewSet):
    """CommunesSybarval view set."""

    queryset = CommunesSybarval.objects.all()
    serializer_class = CommunesSybarvalSerializer


class CouvertureSolViewset(viewsets.ReadOnlyModelViewSet):
    queryset = CouvertureSol.objects.all()
    serializer_class = CouvertureSolSerializer


class Ocsge2015ViewSet(DataViewSet):
    queryset = Ocsge2015.objects.all()
    serializer_class = Ocsge2015Serializer


class Ocsge2018ViewSet(DataViewSet):
    queryset = Ocsge2018.objects.all()
    serializer_class = Ocsge2018Serializer


class Renaturee2018to2015ViewSet(DataViewSet):
    queryset = Renaturee2018to2015.objects.all()
    serializer_class = Renaturee2018to2015Serializer


class SybarvalViewSet(DataViewSet):
    queryset = Sybarval.objects.all()
    serializer_class = SybarvalSerializer


class UsageSolViewset(viewsets.ReadOnlyModelViewSet):
    queryset = UsageSol.objects.all()
    serializer_class = UsageSolSerializer


class Voirie2018ViewSet(DataViewSet):
    queryset = Voirie2018.objects.all()
    serializer_class = Voirie2018Serializer


class ZonesBaties2018ViewSet(DataViewSet):
    queryset = ZonesBaties2018.objects.all()
    serializer_class = ZonesBaties2018Serializer
