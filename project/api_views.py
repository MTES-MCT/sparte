from rest_framework import generics, viewsets
from rest_framework.exceptions import ParseError

from .models import Emprise, Project
from .serializers import EmpriseSerializer, ProjectDetailSerializer


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


class ProjectDetailView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectDetailSerializer
