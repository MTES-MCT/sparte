"""Public data API views."""
from rest_framework.exceptions import ParseError

from public_data.api_views import DataViewSet

from .models import Emprise
from .serializers import EmpriseSerializer


class EmpriseViewSet(DataViewSet):
    """Endpoint that provide geojson data for a specific project"""

    queryset = Emprise.objects.all()
    serializer_class = EmpriseSerializer

    def get_queryset(self):
        """Check project_id is provided and return linked Emprises"""
        try:
            project_id = int(self.request.query_params["project_id"])
        except KeyError:
            raise ParseError("project_id is required in query parameter.")
        except ValueError:
            raise ParseError("project_id must be an int.")

        return Emprise.objects.filter(project_id=project_id)
