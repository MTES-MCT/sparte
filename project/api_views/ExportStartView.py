import logging
import threading
from urllib.parse import urljoin

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from project.models import ExportJob


def _build_export_urls(land_type: str, land_id: str, report_type: str) -> tuple[str, str, str]:
    """Construit les URLs d'export à partir des paramètres land."""
    base_url = settings.EXPORT_BASE_URL
    url = urljoin(base_url, f"/exports/{report_type}/{land_type}/{land_id}")
    header_url = urljoin(base_url, "/exports/pdf-header")
    footer_url = urljoin(base_url, "/exports/pdf-footer")
    return url, header_url, footer_url


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
        "land_type": "COMMUNE",
        "land_id": "12345",
        "report_type": "rapport-complet"
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

        land_type = request.data.get("land_type")
        land_id = request.data.get("land_id")
        report_type = request.data.get("report_type")

        logger.info(f"[Export] Paramètres reçus: land_type={land_type}, land_id={land_id}, report_type={report_type}")

        if not all([land_type, land_id, report_type]):
            logger.warning("[Export] Paramètres manquants dans la requête")
            return JsonResponse(
                {"error": "Paramètres manquants: land_type, land_id, report_type requis"},
                status=400,
            )

        if report_type not in [choice[0] for choice in ExportJob.ReportType.choices]:
            logger.warning(f"[Export] report_type invalide: {report_type}")
            return JsonResponse({"error": "report_type invalide"}, status=400)

        url, header_url, footer_url = _build_export_urls(land_type, land_id, report_type)
        logger.info(f"[Export] URLs construites: url={url}, headerUrl={header_url}, footerUrl={footer_url}")

        logger.info(f"[Export] Création du job d'export pour l'utilisateur {request.user.id}...")
        job = ExportJob.objects.create(
            user=request.user,
            land_type=land_type,
            land_id=land_id,
            report_type=report_type,
        )
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
