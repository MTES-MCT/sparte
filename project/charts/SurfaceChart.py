from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
)


class SurfaceChart(ProjectChart):
    name = "Surface des territoires"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Surface des territoires"},
        "yAxis": {"title": {"text": "Surface (en ha)"}},
        "xAxis": {"type": "category"},
        "tooltip": {
            "headerFormat": DEFAULT_HEADER_FORMAT,
            "pointFormat": DEFAULT_POINT_FORMAT,
            "valueSuffix": " Ha",
            "valueDecimals": DEFAULT_VALUE_DECIMALS,
        },
        "legend": {"layout": "vertical", "align": "right", "verticalAlign": "middle"},
        "series": [],
    }

    def get_options(self, serie_name):
        if serie_name == self.project.name:
            return {"color": "#ff0000"}
        else:
            return super().get_options(serie_name)

    def get_series(self):
        if not self.series:
            self.series = {self.project.name: {"Territoire": self.project.area}}
            self.series.update({land.name: {"Territoire": land.area} for land in self.project.get_look_a_like()})

        return self.series


class SurfaceChartExport(SurfaceChart):
    @property
    def param(self):
        return super().param | {
            "credits": CEREMA_CREDITS,
            "title": {
                "text": (
                    f"Surface de {self.project.territory_name} "
                    "et des territoires similaires "
                    f"({self.project.analyse_start_date} - {self.project.analyse_end_date})"
                )
            },
            "plotOptions": {
                "column": {
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.y:,.1f} ha",
                        "allowOverlap": True,
                    },
                    "pointPadding": 0.3,
                }
            },
        }
