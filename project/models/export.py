import logging
from datetime import date, datetime
from io import BytesIO

from django.urls import reverse
from openpyxl import Workbook
from openpyxl.styles import Font

from project.models import Request
from public_data.models import Departement, Epci, Region
from utils.functions import get_url_with_domain

logger = logging.getLogger("management.commands")


def to_row(request: Request, headers: dict[str, str]) -> list:
    result = {k: "" for k in headers}
    result.update(
        {
            "Date de création": request.created_date.replace(tzinfo=None)
            if request.created_date
            else "",
            "Date d'envoi": request.sent_date.replace(tzinfo=None)
            if request.sent_date
            else "",
            "Organisme": request.organism,
            "Fonction": request.function,
            "Utilisateur inscris": "non",
            "Lien vers la fiche de la demande": get_url_with_domain(
                reverse(
                    "admin:project_request_change", kwargs={"object_id": request.id}
                )
            ),
        }
    )
    if request.project:
        result.update(
            {
                "Territoire": request.project.get_territory_name(),
                "Niveau administratif": request.project.land_type or "",
                "Maille d'analyse": request.project.level or "",
                "Date de début": int(request.project.analyse_start_date),
                "Date de fin": int(request.project.analyse_end_date),
                "Lien vers le diagnostic": get_url_with_domain(
                    request.project.get_absolute_url()
                ),
            }
        )
        qs_cities = request.project.cities.all()
        epci_list = Epci.objects.filter(commune__in=qs_cities).distinct()
        if epci_list.count() == 1:
            result["Nom EPCI"] = epci_list.first().name
        dept_list = Departement.objects.filter(commune__in=qs_cities).distinct()
        if dept_list.count() == 1:
            result["Nom departement"] = dept_list.first().name
        reg_list = Region.objects.filter(departement__commune__in=qs_cities).distinct()
        if reg_list.count() == 1:
            result["Nom region"] = reg_list.values_list("name", flat=True)[0]
    if request.user:
        result.update(
            {
                "Utilisateur inscris": "oui",
                "Lien vers la fiche utilisateur": get_url_with_domain(
                    reverse("admin:users_user_change", args=[request.user.id])
                ),
            }
        )
    return list(result.values())


def export_dl_diag(start: datetime, end: datetime) -> BytesIO:
    """
    Contenu du fichier Excel:
    * 1 onglet
    * 1 ligne = un diagnostic téléchargé pour un mois
    * Colonnes:
        - Date du diagnostic (jj/mm/aaaa)
        - Territoire du diagnostic (exemple: CA de la communauté de Rouen)
        - Niveau administratif (exemple: EPCI)
        - Nom EPCI (si niveau administratif supérieur laissé vide)
        - Nom departement
        - Nom region
        - Organisme de l'utilisateur
        - Fonction de l'utilisateur
        - Période de début
        - Période de fin
        - Utilisateur inscris (oui/non)
        - Date d'envoi
        - Lien vers la fiche de la demande
        - Lien vers le diagnostic
        - Lien vers la fiche utilisateur
    """
    qs = (
        Request.objects.filter(created_date__gte=start, created_date__lte=end)
        .select_related("user", "project")
        .order_by("created_date")
    )
    wb = Workbook()
    sheet = wb.active
    sheet.title = "Diagnostics téléchargés"
    headers = [
        "Date de création",
        "Date d'envoi",
        "Territoire",
        "Niveau administratif",
        "Maille d'analyse",
        "Nom EPCI",
        "Nom departement",
        "Nom region",
        "Date de début",
        "Date de fin",
        "Utilisateur inscris",
        "Organisme",
        "Fonction",
        "Lien vers la fiche de la demande",
        "Lien vers le diagnostic",
        "Lien vers la fiche utilisateur",
    ]
    sheet.append(headers)
    for r in sheet[1]:
        r.font = Font(bold=True)
    logger.info("%d lines to export", qs.count())
    for request in qs:
        sheet.append(to_row(request, headers))
    inmemory_file = BytesIO()
    wb.save(inmemory_file)
    inmemory_file.seek(0)
    return inmemory_file
