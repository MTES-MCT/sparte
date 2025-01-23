from django.template.loader import render_to_string

from public_data.domain.urbanisme.logement_vacant.entity import LogementVacantCollection


class LogementVacantProgressionTableMapper:
    @staticmethod
    def map(
        logement_vacant_progression: list[LogementVacantCollection],
    ):
        headers = [""] + [str(item.year) for item in logement_vacant_progression.logement_vacant]

        rows = [
            (
                "Logements vacants de plus de 3 mois dans le parc des bailleurs sociaux",
                "logements_vacants_parc_social",
            ),
            ("Logements vacants de plus de 2 ans dans le parc privé", "logements_vacants_parc_prive"),
        ]

        data = [
            [title] + [round(getattr(item, field), 2) for item in logement_vacant_progression.logement_vacant]
            for title, field in rows
        ]

        print(data)

        return render_to_string(
            "public_data/partials/logement_vacant_progression_table.html",
            {
                "headers": headers,
                "data": data,
            },
        )
