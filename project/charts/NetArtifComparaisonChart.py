from collections import defaultdict

from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
    LANG_MISSING_OCSGE_DIFF_ARTIF,
    LEGEND_NAVIGATION_EXPORT,
    OCSGE_CREDITS,
)
from project.utils import add_total_line_column


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
            "lang": LANG_MISSING_OCSGE_DIFF_ARTIF,
            "series": [],
        }

    def __init__(self, *args, **kwargs):
        self.level = kwargs.pop("level")
        super().__init__(*args, **kwargs)

    def get_series(self):
        if not self.series:
            self.series = self.project.get_land_artif_per_year(self.level)
        return self.series

    def get_table(self):
        """
        Return the series preformatted for the table:
        - with a column total if there are multiple periods
        - with a row total if there are multiple cities
        """
        more_than_one_period = len(self.project.get_artif_periods()) > 1

        if more_than_one_period:
            return add_total_line_column(
                series=self.get_series(),
                column=True,
                line=False,
            )

        return self.get_series()

    def get_table_headers(self) -> list[str]:
        periods = self.project.get_artif_periods()

        if len(periods) > 1:
            return [f"{period[0] - period[1]}" for period in self.project.get_artif_periods()]

        return [f"Artificialisation nette entre {periods[0][0]} et {periods[0][1]} (ha)"]

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
            "chart": {
                "type": "column",
                "height": 600,
            },
            "legend": {
                **super().param["legend"],
                "layout": "horizontal",
                "verticalAlign": "bottom",
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
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
