from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
)


class AnnualConsoComparisonChart(ProjectChart):
    name = "conso comparison"
    param = {
        "title": {"text": "Consommation d'espace du territoire et des territoires similaires (en ha)"},
        "subtitle": {
            "text": (
                "Proposition de territoires de même maille administrative, "
                "il est possible de modifier cette selection dans la légende"
            ),
        },
        "yAxis": {"title": {"text": "Consommé (en ha)"}},
        "xAxis": {"type": "category"},
        "legend": {
            "layout": "vertical",
            "align": "right",
            "verticalAlign": "middle",
        },
        "tooltip": {
            "headerFormat": DEFAULT_HEADER_FORMAT,
            "pointFormat": DEFAULT_POINT_FORMAT,
            "valueSuffix": " Ha",
            "valueDecimals": DEFAULT_VALUE_DECIMALS,
        },
        "series": [],
    }

    def get_series(self):
        return {
            land.name: land.get_conso_per_year(
                self.project.analyse_start_date,
                self.project.analyse_end_date,
                coef=1,
            )
            for land in self.project.get_look_a_like()
        }

    def add_series(self):
        self.add_serie(
            self.project.name,
            self.project.get_conso_per_year(),
            **{
                "color": "#ff0000",
                "dashStyle": "ShortDash",
            },
        )
        super().add_series()


class AnnualConsoComparisonChartExport(AnnualConsoComparisonChart):
    @property
    def param(self):
        return super().param | {
            "credits": CEREMA_CREDITS,
            "subtitle": "",
            "title": {
                "text": (
                    f"Comparaison de la consommation annuelle d'espace entre {self.project.territory_name} "
                    "et les territoires similaires "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
