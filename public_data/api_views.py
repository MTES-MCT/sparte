"""Public data API views."""
from rest_framework import viewsets
from rest_framework_gis import filters

from .models import (
    Artificialisee2015to2018,
    Artificielle2018,
    CommunesSybarval,
    EnveloppeUrbaine2018,
    Renaturee2018to2015,
    Sybarval,
    Voirie2018,
    ZonesBaties2018,
)
from .serializers import (
    Artificialisee2015to2018Serializer,
    Artificielle2018Serializer,
    CommunesSybarvalSerializer,
    EnveloppeUrbaine2018Serializer,
    Renaturee2018to2015Serializer,
    SybarvalSerializer,
    Voirie2018Serializer,
    ZonesBaties2018Serializer,
)


class Artificialisee2015to2018ViewSet(viewsets.ReadOnlyModelViewSet):
    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)
    queryset = Artificialisee2015to2018.objects.all()
    serializer_class = Artificialisee2015to2018Serializer


class Artificielle2018ViewSet(viewsets.ReadOnlyModelViewSet):
    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)
    queryset = Artificielle2018.objects.all()
    serializer_class = Artificielle2018Serializer


class CommunesSybarvalViewSet(viewsets.ReadOnlyModelViewSet):
    """CommunesSybarval view set."""

    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)
    queryset = CommunesSybarval.objects.all()
    serializer_class = CommunesSybarvalSerializer


class EnveloppeUrbaine2018ViewSet(viewsets.ReadOnlyModelViewSet):
    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)
    queryset = EnveloppeUrbaine2018.objects.all()
    serializer_class = EnveloppeUrbaine2018Serializer


class Renaturee2018to2015ViewSet(viewsets.ReadOnlyModelViewSet):
    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)
    queryset = Renaturee2018to2015.objects.all()
    serializer_class = Renaturee2018to2015Serializer


class SybarvalViewSet(viewsets.ReadOnlyModelViewSet):
    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)
    queryset = Sybarval.objects.all()
    serializer_class = SybarvalSerializer


class Voirie2018ViewSet(viewsets.ReadOnlyModelViewSet):
    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)
    queryset = Voirie2018.objects.all()
    serializer_class = Voirie2018Serializer


class ZonesBaties2018ViewSet(viewsets.ReadOnlyModelViewSet):
    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)
    queryset = ZonesBaties2018.objects.all()
    serializer_class = ZonesBaties2018Serializer
