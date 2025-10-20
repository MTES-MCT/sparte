from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    LOGEMENT_VACANT_COLOR_PRIVE,
    LOGEMENT_VACANT_COLOR_SOCIAL,
)
from public_data.domain.containers import PublicDataContainer


class LogementVacantRatioProgressionChart(DiagnosticChart):
    """
    Graphique en barre d'évolution du taux de logements vacants privé et social
    """

    required_params = ["start_date", "end_date"]

    @property
    def name(self):
        return f"logement vacant ratio progression {self.params['start_date']}-{self.params['end_date']}"

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

        data_parc_prive = [d.logements_vacants_parc_prive_percent for d in logement_vacant_progression.logement_vacant]

        data_parc_social = [
            d.logements_vacants_parc_social_percent for d in logement_vacant_progression.logement_vacant
        ]

        return [
            {
                "name": "Taux de vacance de plus de 2 ans dans le parc privé",
                "data": data_parc_prive,
                "color": LOGEMENT_VACANT_COLOR_PRIVE,
            },
            {
                "name": "Taux de vacance de plus de 3 mois dans le parc des bailleurs sociaux",
                "data": data_parc_social,
                "color": LOGEMENT_VACANT_COLOR_SOCIAL,
            },
        ]

    @property
    def param(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Évolution du taux de vacance des logements sur le territoire (en %)"},
            "xAxis": {"categories": [str(year) for year in range(start_date, end_date + 1)]},
            "yAxis": {"title": {"text": ""}},
            "tooltip": {
                "tooltip": {"valueSuffix": " %"},
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": ('<span style="color:{point.color}">●</span> ' "{series.name}: <b>{point.y:.2f} %</b>"),
            },
            "series": self._get_series(),
        }
