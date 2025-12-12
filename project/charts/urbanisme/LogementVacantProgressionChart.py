from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    LOGEMENT_VACANT_COLOR_PRIVE,
    LOGEMENT_VACANT_COLOR_SOCIAL,
)
from public_data.domain.containers import PublicDataContainer


class LogementVacantProgressionChart(DiagnosticChart):
    """
    Graphique en stacked column d'évolution du nombre de logements vacants privé et social
    """

    required_params = ["start_date", "end_date"]

    @property
    def name(self):
        return f"logement vacant progression {self.params['start_date']}-{self.params['end_date']}"

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.land,
            start_date=start_date,
            end_date=end_date,
        )

        data_parc_prive = [d.logements_vacants_parc_prive for d in logement_vacant_progression.logement_vacant]

        data_parc_social = [d.logements_vacants_parc_social for d in logement_vacant_progression.logement_vacant]

        return [
            {
                "name": "Logements vacants de plus de 3 mois dans le parc des bailleurs sociaux",
                "data": data_parc_social,
                "color": LOGEMENT_VACANT_COLOR_SOCIAL,
            },
            {
                "name": "Logements vacants de plus de 2 ans dans le parc privé",
                "data": data_parc_prive,
                "color": LOGEMENT_VACANT_COLOR_PRIVE,
            },
        ]

    @property
    def data_table(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.land,
            start_date=start_date,
            end_date=end_date,
        )

        years = list(range(start_date, end_date + 1))
        headers = ["Année"] + [str(year) for year in years]

        rows = []

        # Ligne pour le parc privé
        data_parc_prive = [d.logements_vacants_parc_prive for d in logement_vacant_progression.logement_vacant]
        rows.append({"name": "", "data": ["Logements vacants de plus de 2 ans dans le parc privé"] + data_parc_prive})

        # Ligne pour le parc social
        data_parc_social = [d.logements_vacants_parc_social for d in logement_vacant_progression.logement_vacant]
        rows.append(
            {
                "name": "",
                "data": ["Logements vacants de plus de 3 mois dans le parc des bailleurs sociaux"] + data_parc_social,
            }
        )

        # Ligne Total
        total_data = [prive + social for prive, social in zip(data_parc_prive, data_parc_social)]
        rows.append({"name": "", "data": ["Total"] + total_data})

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
            "boldLastRow": True,
        }

    @property
    def param(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Évolution du nombre de logements vacants sur le territoire"},
            "xAxis": {"categories": [str(year) for year in range(start_date, end_date + 1)]},
            "yAxis": {"title": {"text": ""}},
            "tooltip": {
                "tooltip": {"valueSuffix": " %"},
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": ('<span style="color:{point.color}">●</span> ' "{series.name}: <b>{point.y}</b>"),
            },
            "plotOptions": {"column": {"stacking": "normal"}},
            "series": self._get_series(),
        }
