from django.template.loader import render_to_string

from public_data.domain.urbanisme.logement_vacant.entity import LogementVacantCollection


class LogementVacantRatioProgressionTableMapper:
    @staticmethod
    def map(
        logement_vacant_progression: list[LogementVacantCollection],
    ):
        headers = [""] + [str(item.year) for item in logement_vacant_progression.logement_vacant]

        rows = [
            ("Taux de vacance de plus de 2 ans dans le parc privé", "logements_vacants_parc_prive_percent"),
            (
                "Taux de vacance de plus de 3 mois dans le parc des bailleurs sociaux",
                "logements_vacants_parc_social_percent",
            ),
        ]

        data = [
            [title] + [round(getattr(item, field), 2) for item in logement_vacant_progression.logement_vacant]
            for title, field in rows
        ]

        return render_to_string(
            "public_data/partials/logement_vacant_ratio_progression_table.html",
            {
                "headers": headers,
                "data": data,
            },
        )
