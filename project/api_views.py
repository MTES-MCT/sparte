from django.http import JsonResponse
from django.urls import reverse
from rest_framework import generics, viewsets
from rest_framework.exceptions import ParseError
from rest_framework.response import Response

from brevo.tasks import send_diagnostic_request_to_brevo
from project import tasks
from public_data.infra.planning_competency.PlanningCompetencyServiceSudocuh import (
    PlanningCompetencyServiceSudocuh,
)

from .models import Emprise, Project, Request, RequestedDocumentChoices
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

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), context={"request": request})
        return Response(data=serializer.data)


class DiagnosticDownloadAPIView(generics.RetrieveAPIView):
    def get(self, request, pk, requested_document):
        if not request.user.is_authenticated:
            next_url = reverse("project:report_downloads", kwargs={"pk": pk})
            login_url = reverse("users:signin") + f"?next={next_url}"
            signup_url = reverse("users:signup") + f"?next={next_url}"
            error_message = (
                "Le téléchargement des rapports n'est accessible qu'aux utilisateurs connectés.</br>"
                f'<a class="fr-link fr-text--sm" href="{login_url}">Se connecter</a> ou '
                f'<a class="fr-link fr-text--sm" href="{signup_url}">créer un compte</a>.'
            )
            return JsonResponse({"error": error_message}, status=401)

        if requested_document not in RequestedDocumentChoices.values:
            return JsonResponse({"error": f"Type de rapport invalide {requested_document}"}, status=400)

        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return JsonResponse({"error": "Projet non trouvé"}, status=404)

        # Création de la requête
        new_request = Request.objects.create(
            user=request.user,
            project=project,
            first_name=request.user.first_name,
            last_name=request.user.last_name,
            function=request.user.function,
            organism=request.user.organism,
            email=request.user.email,
            requested_document=requested_document,
            du_en_cours=PlanningCompetencyServiceSudocuh.planning_document_in_revision(project.land),
            competence_urba=PlanningCompetencyServiceSudocuh.has_planning_competency(project.land),
        )
        new_request._change_reason = "New request"
        new_request.save()

        # Lancement des tâches
        send_diagnostic_request_to_brevo.delay(new_request.id)
        tasks.send_email_request_bilan.delay(new_request.id)
        tasks.generate_word_diagnostic.apply_async((new_request.id,), link=tasks.send_word_diagnostic.s())

        return JsonResponse(
            {
                "success": True,
                "message": (
                    "Vous recevrez le document par email dans quelques minutes. Si vous ne recevez "
                    "pas le document, veuillez vérifier votre dossier spams ou ajouter notre "
                    "adresse email (contact@mondiagartif.beta.gouv.fr) à la "
                    "liste blanche de votre pare-feu."
                ),
            }
        )
