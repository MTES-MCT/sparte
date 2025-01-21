from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    LOGEMENT_VACANT_COLOR_PRIVE,
    LOGEMENT_VACANT_COLOR_SOCIAL,
)
from public_data.domain.containers import PublicDataContainer


class LogementVacantProgressionChart(ProjectChart):
    """
    Graphique en stacked column d'évolution du nombre de logements vacants privé et social
    """

    def __init__(self, project, start_date, end_date):
        super().__init__(project=project, start_date=start_date, end_date=end_date)

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.project.land_proxy,
            start_date=self.start_date,
            end_date=self.end_date,
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
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Évolution du nombre de logements vacants sur le territoire"},
            "xAxis": {"categories": [str(year) for year in range(self.start_date, self.end_date + 1)]},
            "yAxis": {"title": {"text": ""}},
            "tooltip": {
                "tooltip": {"valueSuffix": " %"},
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": ('<span style="color:{point.color}">●</span> ' "{series.name}: <b>{point.y}</b>"),
            },
            "plotOptions": {"column": {"stacking": "normal"}},
            "series": self._get_series(),
        }

    # To remove after refactoring
    def add_series(self):
        pass
