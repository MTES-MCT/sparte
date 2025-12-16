from django.http import JsonResponse
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from project.models import Project, Request, RequestedDocumentChoices


class RecordDownloadRequestView(generics.RetrieveAPIView):
    """
    Enregistre une demande de téléchargement (pour rapport-local envoyé par email).

    GET /project/<pk>/downloadRequest/<requested_document>/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk, requested_document):
        if requested_document not in RequestedDocumentChoices.values:
            return JsonResponse({"error": f"Type de rapport invalide {requested_document}"}, status=400)

        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return JsonResponse({"error": "Projet non trouvé"}, status=404)

        Request.objects.create(
            user=request.user,
            project=project,
            first_name=request.user.first_name,
            last_name=request.user.last_name,
            email=request.user.email,
            requested_document=requested_document,
        )

        return JsonResponse({"success": True})
