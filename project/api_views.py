import json
import logging

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ParseError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Emprise, Project, ReportDraft, Request, RequestedDocumentChoices
from .serializers import (
    EmpriseSerializer,
    ProjectDetailSerializer,
    ProjectDownloadLinkSerializer,
    ReportDraftListSerializer,
    ReportDraftSerializer,
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

        draft_id = request.query_params.get("draft_id")
        report_draft = None
        if draft_id:
            try:
                report_draft = ReportDraft.objects.get(pk=draft_id, user=request.user)
            except ReportDraft.DoesNotExist:
                pass

        Request.objects.create(
            user=request.user,
            project=project,
            first_name=request.user.first_name,
            last_name=request.user.last_name,
            email=request.user.email,
            requested_document=requested_document,
            report_draft=report_draft,
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


@method_decorator(csrf_exempt, name="dispatch")
class UpdateProjectComparisonLandsAPIView(View):
    """
    API view pour mettre à jour les territoires de comparaison d'un projet.
    Format attendu: [{land_type, land_id, name}, ...]
    """

    def post(self, request, pk):
        try:
            project = get_object_or_404(Project, pk=pk)

            data = json.loads(request.body)
            comparison_lands = data.get("comparison_lands")

            if comparison_lands is None:
                return JsonResponse({"success": False, "error": "comparison_lands est requis"}, status=400)

            if not isinstance(comparison_lands, list):
                return JsonResponse({"success": False, "error": "comparison_lands doit être une liste"}, status=400)

            # Valider le format de chaque territoire
            for item in comparison_lands:
                if not isinstance(item, dict):
                    return JsonResponse(
                        {"success": False, "error": "Chaque territoire doit être un objet"}, status=400
                    )
                if not all(k in item for k in ["land_type", "land_id", "name"]):
                    return JsonResponse(
                        {"success": False, "error": "Chaque territoire doit avoir land_type, land_id et name"},
                        status=400,
                    )

            project.comparison_lands = comparison_lands
            project.save(update_fields=["comparison_lands"])

            return JsonResponse({"success": True, "comparison_lands": project.comparison_lands})

        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(
                f"Erreur lors de la mise à jour de comparison_lands pour le projet {pk}: {str(e)}", exc_info=True
            )
            return JsonResponse(
                {"success": False, "error": "Une erreur est survenue lors de la mise à jour"}, status=500
            )


class ReportDraftViewSet(viewsets.ModelViewSet):
    serializer_class = ReportDraftSerializer

    def get_permissions(self):
        if self.action == "retrieve":
            return []
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.action == "retrieve":
            return ReportDraft.objects.all()
        if self.request.user.is_authenticated:
            return ReportDraft.objects.filter(user=self.request.user)
        return ReportDraft.objects.none()

    def get_serializer_class(self):
        if self.action == "list":
            return ReportDraftListSerializer
        return ReportDraftSerializer

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        serializer.save(
            user=self.request.user,
            land_type=project.land_type,
            land_id=project.land_id,
        )

    def list(self, request, *args, **kwargs):
        project_id = request.query_params.get("project_id")
        report_type = request.query_params.get("report_type")

        queryset = self.get_queryset()

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if report_type:
            queryset = queryset.filter(report_type=report_type)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def report_types(self, request):
        return Response([{"value": choice[0], "label": choice[1]} for choice in RequestedDocumentChoices.choices])
