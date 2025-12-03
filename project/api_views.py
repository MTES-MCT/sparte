import json
import logging

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, viewsets
from rest_framework.exceptions import ParseError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Emprise, Project, Request, RequestedDocumentChoices
from .serializers import (
    EmpriseSerializer,
    ProjectDetailSerializer,
    ProjectDownloadLinkSerializer,
)


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

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), context={"request": request})
        return Response(data=serializer.data)


class ProjectDownloadLinkView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectDownloadLinkSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response(data=serializer.data)


class RecordDownloadRequestAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, requested_document):
        if requested_document not in RequestedDocumentChoices.values:
            return JsonResponse({"error": f"Type de rapport invalide {requested_document}"}, status=400)

        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return JsonResponse({"error": "Projet non trouvé"}, status=404)

        # Création de la requête
        Request.objects.create(
            user=request.user,
            project=project,
            first_name=request.user.first_name,
            last_name=request.user.last_name,
            email=request.user.email,
            requested_document=requested_document,
        )

        return JsonResponse({"success": True})


@method_decorator(csrf_exempt, name="dispatch")
class UpdateProjectTarget2031APIView(View):
    """
    API view pour mettre à jour l'objectif de réduction target_2031 d'un projet.
    """

    def post(self, request, pk):
        try:
            project = get_object_or_404(Project, pk=pk)

            # Récupérer la valeur du paramètre
            data = json.loads(request.body)
            target_2031 = data.get("target_2031")

            if target_2031 is None:
                return JsonResponse({"success": False, "error": "target_2031 est requis"}, status=400)

            # Valider la valeur (entre 0 et 100)
            try:
                target_value = float(target_2031)
                if not 0 <= target_value <= 100:
                    return JsonResponse(
                        {"success": False, "error": "target_2031 doit être entre 0 et 100"}, status=400
                    )
            except (ValueError, TypeError):
                return JsonResponse({"success": False, "error": "target_2031 doit être un nombre"}, status=400)

            project.target_2031 = target_value
            project.save()

            return JsonResponse({"success": True, "target_2031": float(project.target_2031)})

        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Erreur lors de la mise à jour de target_2031 pour le projet {pk}: {str(e)}", exc_info=True)
            return JsonResponse(
                {"success": False, "error": "Une erreur est survenue lors de la mise à jour"}, status=500
            )
