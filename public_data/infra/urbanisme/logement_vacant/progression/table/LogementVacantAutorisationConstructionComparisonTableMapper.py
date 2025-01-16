from django.template.loader import render_to_string

from public_data.domain.urbanisme.autorisation_logement.entity import (
    AutorisationLogementCollection,
)
from public_data.domain.urbanisme.logement_vacant.entity import LogementVacantCollection


class LogementVacantAutorisationConstructionComparisonTableMapper:
    @staticmethod
    def map(
        logement_vacant_progression: list[LogementVacantCollection],
        autorisation_logement_progression: list[AutorisationLogementCollection],
    ):
        headers = [
            "",
            "Nombre de logements",
            "% du parc total de logements (privé + bailleurs sociaux)",
        ]

        data = [
            {
                "name": "Autorisations de construction",
                "quantity": autorisation_logement_progression.autorisation_logement[-1].logements_autorises,
                "percentage": round(
                    autorisation_logement_progression.autorisation_logement[-1].percent_autorises_on_parc_general, 2
                ),
            },
            {
                "name": "Logements vacants depuis plus de 2ans (privé)",
                "quantity": logement_vacant_progression.logement_vacant[-1].logements_vacants_parc_prive,
                "percentage": round(
                    logement_vacant_progression.logement_vacant[-1].logements_vacants_parc_prive_percent, 2
                ),
            },
            {
                "name": "Logements vacants depuis plus de 3mois (bailleurs sociaux)",
                "quantity": logement_vacant_progression.logement_vacant[-1].logements_vacants_parc_social,
                "percentage": round(
                    logement_vacant_progression.logement_vacant[-1].logements_vacants_parc_social_percent, 2
                ),
            },
        ]

        return render_to_string(
            "public_data/partials/logement_vacant_autorisation_construction_comparison_table.html",
            {
                "headers": headers,
                "data": data,
            },
        )
