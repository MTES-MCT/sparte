from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.views import View

from project.models import ExportJob


class ExportStatusView(LoginRequiredMixin, View):
    """
    Vérifie le statut d'un job d'export PDF.

    GET /project/export/status/<job_id>/

    Retourne:
    - Si pending: {"status": "pending"}
    - Si completed: {"status": "completed"}
    - Si failed: {"status": "failed", "error": "..."}
    - Si job_id inconnu: 404
    """

    raise_exception = True

    def get(self, request, job_id):
        try:
            job = ExportJob.objects.get(job_id=job_id, user=request.user)
        except ExportJob.DoesNotExist:
            return JsonResponse({"error": "Job non trouvé"}, status=404)

        if job.status == ExportJob.Status.PENDING:
            return JsonResponse({"status": "pending"})

        if job.status == ExportJob.Status.FAILED:
            return JsonResponse({"status": "failed", "error": job.error}, status=500)

        if job.status == ExportJob.Status.COMPLETED:
            return JsonResponse({"status": "completed"})

        return JsonResponse({"error": "État inconnu"}, status=500)
