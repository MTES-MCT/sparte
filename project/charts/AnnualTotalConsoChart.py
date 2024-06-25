from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
)
from public_data.models import AdminRef


class AnnualTotalConsoChart(ProjectChart):
    name = "conso communes"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": ""},
            "yAxis": {"title": {"text": "Consommé (ha)"}},
            "xAxis": {"type": "category"},
            "tooltip": {
                "headerFormat": DEFAULT_HEADER_FORMAT,
                "pointFormat": DEFAULT_POINT_FORMAT,
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "legend": {"enabled": False},
            "series": [],
        }

    def __init__(self, *args, **kwargs):
        self.level = kwargs.pop("level", AdminRef.COMMUNE)
        super().__init__(*args, **kwargs)

    def get_series(self):
        return {self.project.territory_name: self.project.get_conso_per_year()}


class AnnualTotalConsoChartExport(AnnualTotalConsoChart):
    @property
    def param(self):
        return super().param | {
            "title": {
                "text": (
                    f"Consommation d'espace à {self.project.territory_name} "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
            "credits": CEREMA_CREDITS,
            "plotOptions": {
                "column": {
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.y:,.1f}",
                        "allowOverlap": True,
                    },
                }
            },
        }
