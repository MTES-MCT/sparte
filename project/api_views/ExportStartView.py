import logging
import re
import threading
from urllib.parse import urljoin

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from project.models import ExportJob

ALLOWED_EXPORT_PATH = re.compile(r"^/exports/[\w\-/]+$")


class InvalidExportPathError(ValueError):
    """Chemin d'export invalide."""


def _build_export_url(path: str) -> str:
    """Construit l'URL complète pour l'export à partir d'un chemin relatif sécurisé."""
    if not path or not path.startswith("/"):
        raise InvalidExportPathError("Le chemin doit commencer par /")

    if not ALLOWED_EXPORT_PATH.match(path):
        raise InvalidExportPathError("Chemin d'export non autorisé")

    if any(c in path for c in ("@", ":", "\\", "\n", "\r")):
        raise InvalidExportPathError("Caractères non autorisés dans le chemin")

    base_url = getattr(settings, "EXPORT_BASE_URL", "http://django:8080")
    return urljoin(base_url, path)


def _run_export_job(job_pk: int, export_server_url: str, url: str, header_url: str, footer_url: str):
    """Exécute l'export PDF en arrière-plan et stocke le résultat sur S3."""
    logger = logging.getLogger(__name__)

    try:
        job = ExportJob.objects.get(pk=job_pk)
    except ExportJob.DoesNotExist:
        logger.error(f"Export job {job_pk} - Job introuvable")
        return

    try:
        logger.info(f"Export job {job.job_id} - Démarrage: URL={url}")
        response = requests.get(
            f"{export_server_url}/api/export",
            params={
                "url": url,
                "headerUrl": header_url,
                "footerUrl": footer_url,
            },
            timeout=200,
        )

        if response.status_code == 200:
            content = response.content
            logger.info(f"Export job {job.job_id} - Réponse reçue: {len(content)} bytes")
            job.pdf_file.save(f"{job.job_id}.pdf", ContentFile(content), save=False)
            job.status = ExportJob.Status.COMPLETED
            job.save()
            logger.info(f"Export job {job.job_id} - PDF sauvegardé sur S3")
        else:
            job.status = ExportJob.Status.FAILED
            job.error = f"Le serveur d'export a retourné le code {response.status_code}"
            job.save()
            logger.error(f"Export job {job.job_id} - Échec: code {response.status_code}")

    except requests.exceptions.Timeout:
        job.status = ExportJob.Status.FAILED
        job.error = "Le service d'export a mis trop de temps à répondre"
        job.save()
        logger.error(f"Export job {job.job_id} - Timeout")
    except requests.exceptions.RequestException as e:
        job.status = ExportJob.Status.FAILED
        job.error = "Erreur de communication avec le service d'export"
        job.save()
        logger.error(f"Export job {job.job_id} - Erreur: {e}")


class ExportStartView(APIView):
    """
    Lance un export PDF en arrière-plan.

    POST avec JSON body:
    {
        "url": "/exports/rapport-complet/COMMUNE/12345",
        "headerUrl": "/exports/pdf-header",
        "footerUrl": "/exports/pdf-footer"
    }

    Retourne: {"jobId": "uuid..."}
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger = logging.getLogger(__name__)

        export_server_url = getattr(settings, "EXPORT_SERVER_URL", None)
        if not export_server_url:
            logger.error("EXPORT_SERVER_URL non configurée")
            return JsonResponse({"error": "Service d'export non configuré"}, status=503)

        url = request.data.get("url")
        header_url = request.data.get("headerUrl")
        footer_url = request.data.get("footerUrl")

        if not all([url, header_url, footer_url]):
            return JsonResponse(
                {"error": "Paramètres manquants: url, headerUrl, footerUrl requis"},
                status=400,
            )

        try:
            url = _build_export_url(url)
            header_url = _build_export_url(header_url)
            footer_url = _build_export_url(footer_url)
        except InvalidExportPathError as e:
            return JsonResponse({"error": str(e)}, status=400)

        job = ExportJob.objects.create(user=request.user)

        thread = threading.Thread(
            target=_run_export_job,
            args=(job.pk, export_server_url, url, header_url, footer_url),
            daemon=True,
        )
        thread.start()

        logger.info(f"Export job {job.job_id} créé - URL: {url}")

        return JsonResponse({"jobId": str(job.job_id)})
