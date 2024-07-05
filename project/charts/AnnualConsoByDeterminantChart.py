from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
)


class AnnualConsoByDeterminantChart(ProjectChart):
    """
    Graphique en barre de consommation annuelle par destination (habitat, activité, mixte etc.)
    avec une courbe de consommation totale en pointillés.
    """

    name = "determinant per year"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Par an"},
            "yAxis": {
                "title": {"text": "Consommation annuelle (en ha)"},
                "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
            },
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y}",
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "xAxis": {"type": "category"},
            "legend": {
                **super().param["legend"],
                "layout": "vertical",
                "align": "right",
                "verticalAlign": "middle",
            },
            "plotOptions": {
                "column": {
                    "stacking": "normal",
                    "dataLabels": {"enabled": True, "format": "{point.y:,.1f}"},
                }
            },
            "series": [],
        }

    def get_series(self):
        if not self.series:
            self.series = self.project.get_determinants(group_name=self.group_name)
        return self.series

    def add_series(self):
        super().add_series()
        if not self.group_name:
            self.add_serie(
                self.project.name,
                self.project.get_conso_per_year(),
                **{
                    "type": "line",
                    "color": "#ff0000",
                    "dashStyle": "ShortDash",
                },
            )


class AnnualConsoByDeterminantChartExport(AnnualConsoByDeterminantChart):
    @property
    def param(self):
        return super().param | {
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "credits": CEREMA_CREDITS,
            "title": {
                "text": (
                    f"Consommation annuelle d'espace par destination de {self.project.territory_name}"
                    f" entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
