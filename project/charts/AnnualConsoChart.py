from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
    HIGHLIGHT_COLOR,
    LEGEND_NAVIGATION_EXPORT,
)
from public_data.models import AdminRef


class AnnualConsoChart(ProjectChart):
    name = "conso communes"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "area"},
            "title": {"text": ""},
            "yAxis": {"title": {"text": "Consommé (ha)"}},
            "xAxis": {"type": "category"},
            "tooltip": {
                "headerFormat": DEFAULT_HEADER_FORMAT,
                "pointFormat": DEFAULT_POINT_FORMAT,
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "plotOptions": {"area": {"stacking": "normal"}},
            "series": [],
        }

    def __init__(self, *args, **kwargs):
        self.level = kwargs.pop("level", AdminRef.COMMUNE)
        super().__init__(*args, **kwargs)

    def get_series(self):
        if not self.series:
            if self.level == "REGION":
                self.series = self.project.get_land_conso_per_year("region_name")
            elif self.level == "DEPART":
                self.series = self.project.get_land_conso_per_year("dept_name")
            elif self.level == "SCOT":
                self.series = self.project.get_land_conso_per_year("scot")
            elif self.level == "EPCI":
                self.series = self.project.get_land_conso_per_year("epci_name")
            else:
                self.series = self.project.get_city_conso_per_year(group_name=self.group_name)
        return self.series

    def add_series(self):
        super().add_series()
        if not self.group_name:
            self.add_serie(
                self.project.territory_name,
                self.project.get_conso_per_year(),
                **{
                    "type": "line",
                    "color": HIGHLIGHT_COLOR,
                    "dashStyle": "ShortDash",
                },
            )


class AnnualConsoChartExport(AnnualConsoChart):
    @property
    def param(self):
        if self.project.land_type == AdminRef.COMMUNE:
            title = (
                f"Consommation d'espace à {self.project.territory_name} "
                f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
            )
        else:
            title = (
                f"Consommation d'espace des communes composant {self.project.territory_name} "
                f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
            )
        return super().param | {
            "title": {"text": title},
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "credits": CEREMA_CREDITS,
            "chart": {"type": "column"},
            "plotOptions": {"area": {"stacking": None}},
        }
