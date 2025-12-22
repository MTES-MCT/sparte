from django.http import HttpResponse, JsonResponse
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from project.models import ExportJob, Project, Request


class RecordDownloadRequestAPIView(generics.RetrieveAPIView):
    """
    Enregistre une demande de téléchargement et retourne le PDF.

    GET /project/export/download/<job_id>/?project_id=123
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = ExportJob.objects.get(job_id=job_id, user=request.user)
        except ExportJob.DoesNotExist:
            return JsonResponse({"error": "Job non trouvé"}, status=404)

        if job.status != ExportJob.Status.COMPLETED or not job.pdf_file:
            return JsonResponse({"error": "PDF non disponible"}, status=404)

        project_id = request.query_params.get("project_id")
        project = None
        if project_id:
            try:
                project = Project.objects.get(pk=project_id)
            except Project.DoesNotExist:
                return JsonResponse({"error": "project_id invalide"}, status=400)

        Request.objects.create(
            user=request.user,
            project=project,
            first_name=request.user.first_name,
            last_name=request.user.last_name,
            email=request.user.email,
            requested_document=job.report_type,
        )

        return HttpResponse(
            content=job.pdf_file.read(),
            status=200,
            content_type="application/pdf",
        )
