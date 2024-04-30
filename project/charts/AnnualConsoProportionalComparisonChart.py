from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
)


class AnnualConsoProportionalComparisonChart(ProjectChart):
    name = "conso comparison"

    @property
    def param(self):
        return super().param | {
            "title": {"text": "Consommation d'espace proportionnelle à la surface des territoires (‰ - pour mille)"},
            "yAxis": {"title": {"text": "Proportion (‰ - pour mille)"}},
            "xAxis": {"type": "category"},
            "tooltip": {
                "headerFormat": DEFAULT_HEADER_FORMAT,
                "pointFormat": DEFAULT_POINT_FORMAT,
                "valueSuffix": " ‰ (pour mille)",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "series": [],
        }

    def add_series(self):
        self.add_serie(
            self.project.name,
            self.project.get_conso_per_year(
                coef=1000 / self.project.area,
            ),
            **{
                "color": "#ff0000",
                "dashStyle": "ShortDash",
            },
        )
        super().add_series()

    def get_series(self):
        return {
            land.name: land.get_conso_per_year(
                self.project.analyse_start_date,
                self.project.analyse_end_date,
                coef=1000 / land.area,
            )
            for land in self.project.get_look_a_like()
        }


class AnnualConsoProportionalComparisonChartExport(AnnualConsoProportionalComparisonChart):
    @property
    def param(self):
        return super().param | {
            "credits": CEREMA_CREDITS,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": (
                    f"Comparaison de la consommation proportionnelle d'espace de {self.project.territory_name} "
                    "et les territoires similaires "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (‰ - pour mille)"
                )
            },
        }
