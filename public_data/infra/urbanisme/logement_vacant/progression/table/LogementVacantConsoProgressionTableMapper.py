from django.template.loader import render_to_string

from public_data.domain.consommation.entity import AnnualConsommation
from public_data.domain.urbanisme.logement_vacant.entity import LogementVacantCollection


class LogementVacantConsoProgressionTableMapper:
    @staticmethod
    def map(
        logement_vacant_progression: list[LogementVacantCollection],
        consommation_progression: list[AnnualConsommation],
    ):
        headers = [
            "Année",
            "Consommation totale (ha)",
            "Consommation à destination de l'habitat (ha)",
            "Nombre de logements en vacance structurelle (privé + bailleurs sociaux)",
        ]

        data = [
            {
                "year": str(consommation.year),
                "total": round(consommation.total, 2),
                "habitat": round(consommation.habitat, 2),
                "logement_vacant": int(logement_vacant.logements_vacants_parc_general),
            }
            for consommation, logement_vacant in zip(
                consommation_progression.consommation, logement_vacant_progression.logement_vacant
            )
        ]

        return render_to_string(
            "public_data/partials/logement_vacant_conso_progression_table.html",
            {
                "headers": headers,
                "data": data,
            },
        )
