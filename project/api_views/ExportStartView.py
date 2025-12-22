import logging
import threading
from urllib.parse import urljoin

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from project.models import ExportJob, ReportDraft


def _build_export_urls(draft_id: str) -> tuple[str, str, str]:
    """Construit les URLs d'export pour un draft."""
    base_url = settings.EXPORT_BASE_URL
    url = urljoin(base_url, f"/exports/rapport-draft/{draft_id}")
    header_url = urljoin(base_url, "/exports/pdf-header")
    footer_url = urljoin(base_url, "/exports/pdf-footer")
    return url, header_url, footer_url


def _run_export_job(job_pk: int, export_server_url: str, url: str, header_url: str, footer_url: str):
    """Exécute l'export PDF en arrière-plan et stocke le résultat sur S3."""
    logger = logging.getLogger(__name__)

    try:
        job = ExportJob.objects.get(pk=job_pk)
    except ExportJob.DoesNotExist:
        logger.error(f"[Export] Job {job_pk} introuvable en base de données")
        return

    try:
        export_endpoint = f"{export_server_url}/api/export"
        response = requests.get(
            export_endpoint,
            params={
                "url": url,
                "headerUrl": header_url,
                "footerUrl": footer_url,
            },
            timeout=200,
        )

        if response.status_code == 200:
            content = response.content
            job.pdf_file.save(f"{job.job_id}.pdf", ContentFile(content), save=False)
            job.status = ExportJob.Status.COMPLETED
            job.save()
            logger.info(f"[Export] Job {job.job_id} terminé avec succès ({len(content)} bytes)")
        else:
            error_detail = (
                response.content[:1000].decode("utf-8", errors="replace") if response.content else "Pas de détail"
            )
            job.status = ExportJob.Status.FAILED
            job.error = f"Code {response.status_code}. Contenu: {error_detail}"
            job.save()
            logger.error(f"[Export] Job {job.job_id} échoué: {job.error}")

    except requests.exceptions.Timeout:
        job.status = ExportJob.Status.FAILED
        job.error = "Timeout après 200 secondes"
        job.save()
        logger.error(f"[Export] Job {job.job_id} - Timeout")
    except requests.exceptions.RequestException as e:
        job.status = ExportJob.Status.FAILED
        job.error = f"Erreur de communication: {type(e).__name__}: {e}"
        job.save()
        logger.error(f"[Export] Job {job.job_id} - {job.error}")


class ExportStartView(APIView):
    """
    Lance un export PDF d'un draft en arrière-plan.

    POST avec JSON body: {"draft_id": "uuid..."}
    Retourne: {"jobId": "uuid..."}
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger = logging.getLogger(__name__)

        export_server_url = getattr(settings, "EXPORT_SERVER_URL", None)
        if not export_server_url:
            return JsonResponse({"error": "Service d'export non configuré"}, status=503)

        draft_id = request.data.get("draft_id")
        if not draft_id:
            return JsonResponse({"error": "draft_id requis"}, status=400)

        try:
            draft = ReportDraft.objects.get(id=draft_id)
        except ReportDraft.DoesNotExist:
            return JsonResponse({"error": "Draft introuvable"}, status=404)

        if draft.report_type not in [choice[0] for choice in ExportJob.ReportType.choices]:
            return JsonResponse({"error": "report_type invalide"}, status=400)

        url, header_url, footer_url = _build_export_urls(draft_id)

        job = ExportJob.objects.create(
            user=request.user,
            land_type=draft.land_type,
            land_id=draft.land_id,
            report_type=draft.report_type,
        )
        logger.info(f"[Export] Job {job.job_id} créé pour draft {draft_id}")

        thread = threading.Thread(
            target=_run_export_job,
            args=(job.pk, export_server_url, url, header_url, footer_url),
            daemon=True,
        )
        thread.start()

        return JsonResponse({"jobId": str(job.job_id)})
