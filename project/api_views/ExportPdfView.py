from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponse, JsonResponse
from django.views import View

from project.models import ExportJob


class ExportPdfView(LoginRequiredMixin, View):
    """Récupère un PDF depuis S3."""

    raise_exception = True

    def get(self, request, job_id):
        try:
            job = ExportJob.objects.get(job_id=job_id, user=request.user)
        except ExportJob.DoesNotExist:
            return JsonResponse({"error": "Job non trouvé"}, status=404)

        if job.status != ExportJob.Status.COMPLETED or not job.pdf_file:
            return JsonResponse({"error": "PDF non disponible"}, status=404)

        return HttpResponse(
            content=job.pdf_file.read(),
            status=200,
            content_type="application/pdf",
        )
