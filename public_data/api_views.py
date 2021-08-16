"""Public data API views."""
from rest_framework import viewsets
from rest_framework_gis import filters

from .models import CommunesSybarval
from .serializers import CommunesSybarvalSerializer


class CommunesSybarvalViewSet(viewsets.ReadOnlyModelViewSet):
    """CommunesSybarval view set."""

    bbox_filter_field = "mpoly"
    filter_backends = (filters.InBBoxFilter,)
    queryset = CommunesSybarval.objects.all()
    serializer_class = CommunesSybarvalSerializer
