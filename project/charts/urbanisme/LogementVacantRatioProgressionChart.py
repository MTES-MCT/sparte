from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    LOGEMENT_VACANT_COLOR_PRIVE,
    LOGEMENT_VACANT_COLOR_SOCIAL,
)
from public_data.domain.containers import PublicDataContainer


class LogementVacantRatioProgressionChart(ProjectChart):
    """
    Graphique en barre d'évolution du taux de logements vacants privé et social
    """

    # Dates en dur
    START_DATE = 2019
    END_DATE = 2023

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.project.land_proxy,
            start_date=self.START_DATE,
            end_date=self.END_DATE,
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
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Évolution du taux de vacance des logements sur le territoire (en %)"},
            "xAxis": {"categories": [str(year) for year in range(self.START_DATE, self.END_DATE + 1)]},
            "yAxis": {"title": {"text": ""}},
            "tooltip": {
                "tooltip": {"valueSuffix": " %"},
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": ('<span style="color:{point.color}">●</span> ' "{series.name}: <b>{point.y:.2f} %</b>"),
            },
            "series": self._get_series(),
        }

    # To remove after refactoring
    def add_series(self):
        pass
