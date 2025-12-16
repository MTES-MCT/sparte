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

    return urljoin(settings.EXPORT_BASE_URL, path)


def _run_export_job(job_pk: int, export_server_url: str, url: str, header_url: str, footer_url: str):
    """Exécute l'export PDF en arrière-plan et stocke le résultat sur S3."""
    logger = logging.getLogger(__name__)

    logger.info(f"[Export] Début du thread d'export pour job_pk={job_pk}")

    try:
        job = ExportJob.objects.get(pk=job_pk)
        logger.info(f"[Export] Job {job.job_id} récupéré depuis la base de données")
    except ExportJob.DoesNotExist:
        logger.error(f"[Export] Job {job_pk} introuvable en base de données")
        return

    try:
        export_endpoint = f"{export_server_url}/api/export"
        logger.info(f"[Export] Job {job.job_id} - Appel au serveur d'export: {export_endpoint}")
        logger.info(
            f"[Export] Job {job.job_id} - Paramètres: url={url}, headerUrl={header_url}, footerUrl={footer_url}"
        )

        response = requests.get(
            export_endpoint,
            params={
                "url": url,
                "headerUrl": header_url,
                "footerUrl": footer_url,
            },
            timeout=200,
        )

        logger.info(f"[Export] Job {job.job_id} - Réponse reçue: status_code={response.status_code}")

        if response.status_code == 200:
            content = response.content
            logger.info(f"[Export] Job {job.job_id} - PDF généré: {len(content)} bytes")

            logger.info(f"[Export] Job {job.job_id} - Sauvegarde du PDF sur S3...")
            job.pdf_file.save(f"{job.job_id}.pdf", ContentFile(content), save=False)
            logger.info(f"[Export] Job {job.job_id} - PDF sauvegardé: {job.pdf_file.name}")

            job.status = ExportJob.Status.COMPLETED
            job.save()
            logger.info(f"[Export] Job {job.job_id} - Statut mis à jour: COMPLETED")
        else:
            error_detail = (
                response.content[:1000].decode("utf-8", errors="replace") if response.content else "Pas de détail"
            )
            job.status = ExportJob.Status.FAILED
            job.error = f"Code {response.status_code}. Contenu: {error_detail}"
            job.save()
            logger.error(
                f"[Export] Job {job.job_id} - Échec: status_code={response.status_code}, contenu={error_detail}"
            )

    except requests.exceptions.Timeout:
        job.status = ExportJob.Status.FAILED
        job.error = f"Timeout après 200 secondes. URL: {url}"
        job.save()
        logger.error(f"[Export] Job {job.job_id} - Timeout après 200 secondes")
    except requests.exceptions.RequestException as e:
        job.status = ExportJob.Status.FAILED
        job.error = f"Erreur de communication avec le service d'export: {type(e).__name__}: {e}"
        job.save()
        logger.error(f"[Export] Job {job.job_id} - Erreur de communication: {type(e).__name__}: {e}")


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

        logger.info(f"[Export] Nouvelle requête d'export reçue de l'utilisateur {request.user.id}")

        export_server_url = getattr(settings, "EXPORT_SERVER_URL", None)
        if not export_server_url:
            logger.error("[Export] EXPORT_SERVER_URL non configurée dans les settings")
            return JsonResponse({"error": "Service d'export non configuré"}, status=503)

        logger.info(f"[Export] Serveur d'export configuré: {export_server_url}")

        url = request.data.get("url")
        header_url = request.data.get("headerUrl")
        footer_url = request.data.get("footerUrl")

        logger.info(f"[Export] Paramètres reçus: url={url}, headerUrl={header_url}, footerUrl={footer_url}")

        if not all([url, header_url, footer_url]):
            logger.warning("[Export] Paramètres manquants dans la requête")
            return JsonResponse(
                {"error": "Paramètres manquants: url, headerUrl, footerUrl requis"},
                status=400,
            )

        try:
            logger.info("[Export] Validation et construction des URLs...")
            url = _build_export_url(url)
            header_url = _build_export_url(header_url)
            footer_url = _build_export_url(footer_url)
            logger.info(f"[Export] URLs validées: url={url}, headerUrl={header_url}, footerUrl={footer_url}")
        except InvalidExportPathError as e:
            logger.warning(f"[Export] Chemin d'export invalide: {e}")
            return JsonResponse({"error": str(e)}, status=400)

        logger.info(f"[Export] Création du job d'export pour l'utilisateur {request.user.id}...")
        job = ExportJob.objects.create(user=request.user)
        logger.info(f"[Export] Job {job.job_id} créé en base de données (pk={job.pk})")

        logger.info(f"[Export] Job {job.job_id} - Lancement du thread d'export...")
        thread = threading.Thread(
            target=_run_export_job,
            args=(job.pk, export_server_url, url, header_url, footer_url),
            daemon=True,
        )
        thread.start()
        logger.info(f"[Export] Job {job.job_id} - Thread démarré (thread_id={thread.ident})")

        return JsonResponse({"jobId": str(job.job_id)})
