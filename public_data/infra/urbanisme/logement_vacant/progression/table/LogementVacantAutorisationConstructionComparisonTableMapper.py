from django.template.loader import render_to_string

from public_data.domain.urbanisme.autorisation_logement.entity import (
    AutorisationLogementCollection,
)
from public_data.domain.urbanisme.logement_vacant.entity import LogementVacantCollection


class LogementVacantAutorisationConstructionComparisonTableMapper:
    @staticmethod
    def map(
        logement_vacant_progression: LogementVacantCollection,
        autorisation_logement_progression: AutorisationLogementCollection,
    ):
        headers = [
            "",
            "Nombre de logements",
            "% du parc total de logements (privé + bailleurs sociaux)",
        ]

        last_year_logement_vacant = logement_vacant_progression.get_last_year_logement_vacant()
        last_year_autorisation_logement = autorisation_logement_progression.get_last_year_autorisation_logement()

        data = [
            {
                "name": "Autorisations de construction",
                "quantity": last_year_autorisation_logement.logements_autorises,
                "percentage": round(last_year_autorisation_logement.percent_autorises_on_parc_general, 2),
            },
            {
                "name": "Logements vacants depuis plus de 2 ans (privé)",
                "quantity": last_year_logement_vacant.logements_vacants_parc_prive,
                "percentage": round(
                    last_year_logement_vacant.logements_vacants_parc_prive_on_parc_general_percent,
                    2,
                ),
            },
            {
                "name": "Logements vacants depuis plus de 3 mois (bailleurs sociaux)",
                "quantity": last_year_logement_vacant.logements_vacants_parc_social,
                "percentage": round(
                    last_year_logement_vacant.logements_vacants_parc_social_on_parc_general_percent,
                    2,
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
