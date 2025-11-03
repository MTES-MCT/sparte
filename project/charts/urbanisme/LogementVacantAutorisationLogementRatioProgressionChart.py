from project.charts.base_project_chart import DiagnosticChart
from public_data.domain.containers import PublicDataContainer


class LogementVacantAutorisationLogementRatioProgressionChart(DiagnosticChart):
    """
    Graphique en barre d'évolution du rapport entre le nombre de logements vacants et le nombre
    d'autorisations de construction.
    """

    required_params = ["start_date", "end_date"]

    @property
    def name(self):
        return f"logement vacant autorisation ratio progression {self.params['start_date']}-{self.params['end_date']}"

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.land,
                start_date=start_date,
                end_date=end_date,
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
                "color": "#8856F0",
            },
        ]

    @property
    def data_table(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.land,
                start_date=start_date,
                end_date=end_date,
            )
        )

        years = list(range(start_date, end_date + 1))
        headers = ["Année"] + [str(year) for year in years]

        data = [
            round(d.percent_autorises_on_vacants_parc_general, 2)
            for d in autorisation_logement_progression.autorisation_logement
        ]

        rows = [{"name": "", "data": ["Rapport logements vacants / autorisations de construction (%)"] + data}]

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
        }

    @property
    def param(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        return super().param | {
            "chart": {"type": "column"},
            "title": {
                "text": (
                    "Évolution du rapport entre le nombre de logements vacants "
                    "et le nombre d'autorisations de construction de logements (%)"
                )
            },
            "xAxis": {"categories": [str(year) for year in range(start_date, end_date + 1)]},
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
