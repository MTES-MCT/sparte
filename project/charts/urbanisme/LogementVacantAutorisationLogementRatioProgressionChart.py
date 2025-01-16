from project.charts.base_project_chart import ProjectChart
from public_data.domain.containers import PublicDataContainer


class LogementVacantAutorisationLogementRatioProgressionChart(ProjectChart):
    """
    Graphique en barre d'évolution du rapport entre le nombre de logements vacants et le nombre
    d'autorisations de construction.
    """

    # Dates en dur
    START_DATE = 2019
    END_DATE = 2023

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.project.land_proxy,
                start_date=self.START_DATE,
                end_date=self.END_DATE,
            )
        )

        data = [
            d.percent_autorises_on_vacants_parc_general
            for d in autorisation_logement_progression.autorisation_logement
        ]

        return [
            {
                "name": (
                    "Rapport entre le nombre total de logements vacants et le nombre "
                    "d'autorisations de construction de logements"
                ),
                "data": data,
            },
        ]

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {
                "text": (
                    "Évolution du rapport entre le nombre total de logements vacants "
                    "et le nombre d'autorisations de construction de logements (%)"
                )
            },
            "xAxis": {"categories": [str(year) for year in range(self.START_DATE, self.END_DATE + 1)]},
            "yAxis": {"title": {"text": ""}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: <b>{point.y:.0f} %</b>",
            },
            "plotOptions": {
                "series": {"dataLabels": {"enabled": True, "format": "{y:.0f} %", "style": {"fontSize": "12px"}}}
            },
            "legend": {
                "enabled": False,
            },
            "series": self._get_series(),
        }

    # To remove after refactoring
    def add_series(self):
        pass
