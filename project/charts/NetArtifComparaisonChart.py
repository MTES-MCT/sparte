from collections import defaultdict

from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
    OCSGE_CREDITS,
)


class NetArtifComparaisonChart(ProjectChart):
    name = "Net artificialisation per cities"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Répartition de l'artificialisation nette"},
            "yAxis": {"title": {"text": "Artificialisation nette (en ha)"}},
            "tooltip": {
                "headerFormat": DEFAULT_HEADER_FORMAT,
                "pointFormat": DEFAULT_POINT_FORMAT,
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "xAxis": {"type": "category"},
            "series": [],
        }

    def __init__(self, *args, **kwargs):
        self.level = kwargs.pop("level")
        super().__init__(*args, **kwargs)

    def get_series(self):
        if not self.series:
            self.series = self.project.get_land_artif_per_year(self.level)
        return self.series

    def add_series(self):
        super().add_series()
        total = defaultdict(lambda: 0)
        for data in self.get_series().values():
            for period, value in data.items():
                total[period] += value


class NetArtifComparaisonChartExport(NetArtifComparaisonChart):
    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "plotOptions": {
                "column": {
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.y:,.1f} ha",
                        "allowOverlap": True,
                    },
                }
            },
            "title": {
                "text": (
                    f"Répartition de l'artificialisation nette par commune à {self.project.territory_name} "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
