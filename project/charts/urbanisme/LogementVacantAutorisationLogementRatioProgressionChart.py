from project.charts.base_project_chart import ProjectChart
from public_data.domain.containers import PublicDataContainer


class LogementVacantAutorisationLogementRatioProgressionChart(ProjectChart):
    """
    Graphique en barre d'évolution du rapport entre le nombre de logements vacants et le nombre
    d'autorisations de construction.
    """

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.project.land_proxy,
                start_date=self.project.analyse_start_date,
                end_date=self.project.analyse_end_date,
            )
        )

        data = [
            d.percent_autorises_on_vacants_parc_general
            for d in autorisation_logement_progression.autorisation_logement
        ]

        categories = [str(d.year) for d in autorisation_logement_progression.autorisation_logement]

        return [
            {
                "name": (
                    "Rapport entre le nombre total de logements vacants et le nombre"
                    "de constructions de logements autorisées"
                ),
                "data": data,
            },
        ], categories

    @property
    def param(self):
        series, categories = self._get_series()

        return super().param | {
            "chart": {"type": "column"},
            "title": {
                "text": (
                    "Evolution du rapport entre le nombre total de logements vacants "
                    "et le nombre de constructions de logements autorisées (%)"
                )
            },
            "xAxis": [{"categories": categories}],
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
            "series": series,
        }

    # To remove after refactoring
    def add_series(self):
        pass
