from django.template.loader import render_to_string

from public_data.domain.urbanisme.autorisation_logement.entity import (
    AutorisationLogementCollection,
)


class LogementVacantAutorisationConstructionRatioProgressionTableMapper:
    @staticmethod
    def map(
        autorisation_logement_progression: list[AutorisationLogementCollection],
    ):
        headers = [""] + [str(item.year) for item in autorisation_logement_progression.autorisation_logement]

        data = [
            ["rapport entre le nombre de logements vacants et le nombre d'autorisations de construction de logements"]
            + [
                round(item.percent_autorises_on_vacants_parc_general, 2)
                for item in autorisation_logement_progression.autorisation_logement
            ]
        ]

        return render_to_string(
            "public_data/partials/logement_vacant_autorisation_construction_ratio_progression_table.html",
            {
                "headers": headers,
                "data": data,
            },
        )
