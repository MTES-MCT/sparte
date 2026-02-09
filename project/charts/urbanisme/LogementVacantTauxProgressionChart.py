from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    LOGEMENT_VACANT_COLOR_PRIVE,
    LOGEMENT_VACANT_COLOR_SOCIAL,
)
from public_data.domain.containers import PublicDataContainer


class LogementVacantTauxProgressionChart(DiagnosticChart):
    """
    Graphique d'évolution du taux de vacance des logements sur le territoire (en %).
    Affiche le taux de vacance structurelle pour le parc privé et le parc social.
    """

    required_params = ["start_date", "end_date"]

    @property
    def name(self):
        return f"logement vacant taux progression {self.params['start_date']}-{self.params['end_date']}"

    def _get_data(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])
        years = list(range(start_date, end_date + 1))

        logement_vacant_progression = (
            PublicDataContainer.logement_vacant_progression_service()
            .get_by_land(
                land=self.land,
                start_date=start_date,
                end_date=end_date,
            )
            .logement_vacant
        )

        data_parc_prive_percent = [
            round(item.logements_vacants_parc_prive_percent, 2)
            if item.logements_vacants_parc_prive_percent is not None
            else None
            for item in logement_vacant_progression
        ]
        data_parc_social_percent = [
            round(item.logements_vacants_parc_social_percent, 2)
            if item.logements_vacants_parc_social_percent is not None
            else None
            for item in logement_vacant_progression
        ]

        return {
            "years": years,
            "data_parc_prive_percent": data_parc_prive_percent,
            "data_parc_social_percent": data_parc_social_percent,
        }

    def _get_series(self):
        data = self._get_data()

        series = [
            {
                "name": "Taux de vacance de plus de 2 ans dans le parc privé",
                "type": "column",
                "data": data["data_parc_prive_percent"],
                "color": LOGEMENT_VACANT_COLOR_PRIVE,
            },
        ]

        if self.land.has_logements_vacants_social:
            series.append(
                {
                    "name": "Taux de vacance de plus de 3 mois dans le parc des bailleurs sociaux",
                    "type": "column",
                    "data": data["data_parc_social_percent"],
                    "color": LOGEMENT_VACANT_COLOR_SOCIAL,
                }
            )

        return series

    @property
    def data_table(self):
        data = self._get_data()
        headers = ["Année"] + [str(year) for year in data["years"]]

        rows = [
            {
                "name": "",
                "data": ["Taux de vacance de plus de 2 ans dans le parc privé (%)"] + data["data_parc_prive_percent"],
            },
        ]

        if self.land.has_logements_vacants_social:
            rows.append(
                {
                    "name": "",
                    "data": ["Taux de vacance de plus de 3 mois dans le parc des bailleurs sociaux (%)"]
                    + data["data_parc_social_percent"],
                }
            )

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
        }

    @property
    def param(self):
        data = self._get_data()

        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Évolution du taux de vacance des logements sur le territoire"},
            "credits": {"enabled": False},
            "xAxis": {
                "categories": [str(year) for year in data["years"]],
            },
            "yAxis": {
                "title": {"text": "Taux de vacance (%)"},
                "labels": {"format": "{value} %"},
            },
            "tooltip": {
                "shared": True,
                "useHTML": True,
                "formatter": """function() {
                    var s = '<b>' + this.x + '</b><br/>';
                    var xIndex = this.point ? this.point.index : this.points[0].point.index;
                    var chart = this.point ? this.series.chart : this.points[0].series.chart;
                    chart.series.forEach(function(series) {
                        var value = series.options.data[xIndex];
                        if (value === null || value === undefined) {
                            s += '<span style="color:' + series.color + '">●
                            </span> ' + series.name + ': <b>Indisponible</b><br/>';
                        } else {
                            s += '<span style="color:' + series.color + '">●
                            </span> ' + series.name + ': <b>' + value + ' %</b><br/>';
                        }
                    });
                    return s;
                }""",
            },
            "plotOptions": {
                "column": {
                    "grouping": True,
                    "borderWidth": 0,
                },
            },
            "series": self._get_series(),
        }
