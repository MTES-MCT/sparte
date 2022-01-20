"""Public data API views."""
from rest_framework.exceptions import ParseError
from rest_framework import viewsets

from .models import Emprise, PlanEmprise
from .serializers import EmpriseSerializer, PlanEmpriseSerializer


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


class PlanEmpriseViewSet(EmpriseViewSet):
    queryset = PlanEmprise.objects.all()
    serializer_class = PlanEmpriseSerializer
    filter_field = "plan_id"
