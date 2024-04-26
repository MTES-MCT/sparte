from project.charts.base_project_chart import ProjectChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS, OCSGE_CREDITS


class AnnualArtifChart(ProjectChart):
    name = "Evolution de l'artificialisation"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Artificialisation sur la période"},
        "yAxis": {
            "title": {"text": "Surface (en ha)"},
            "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
        },
        "tooltip": {
            "pointFormat": "{series.name}: {point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": DEFAULT_VALUE_DECIMALS,
        },
        "xAxis": {"type": "category"},
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
        "plotOptions": {
            "column": {
                "dataLabels": {"enabled": True, "format": "{point.y:,.1f}"},
                "pointPadding": 0.2,
                "borderWidth": 0,
            }
        },
        "series": [],
    }

    def __init__(self, project, get_data=None):
        """get_data is the function to fetch data, can be overriden for ZoneUrba for example."""
        if get_data:
            self.get_data = get_data
        super().__init__(project, group_name=None)

    def get_data(self):
        """Should return data formated like this:
        [
            {"period": "2013 - 2016", "new_artif": 12, "new_natural": 2: "net_artif": 10},
            {"period": "2016 - 2019", "new_artif": 15, "new_natural": 7: "net_artif": 8},
        ]
        default (for retro compatibility purpose) return data from project.get_artif_evolution()
        """
        return self.project.get_artif_evolution()

    def get_series(self):
        if not self.series:
            self.series = {
                "Artificialisation": dict(),
                "Renaturation": dict(),
                "Artificialisation nette": dict(),
            }
            for prd in self.get_data():
                key = prd["period"]
                self.series["Artificialisation"][key] = prd["new_artif"]
                self.series["Renaturation"][key] = prd["new_natural"]
                self.series["Artificialisation nette"][key] = prd["net_artif"]
        return self.series

    def add_series(self):
        series = self.get_series()
        self.add_serie("Artificialisation", series["Artificialisation"], color="#ff0000")
        self.add_serie("Renaturation", series["Renaturation"], color="#00ff00")
        self.add_serie(
            "Artificialisation nette",
            series["Artificialisation nette"],
            # type="line",
            color="#0000ff",
        )


class AnnualArtifChartExport(AnnualArtifChart):
    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {
                "text": (
                    f"Evolution de l'artificialisation de {self.project.territory_name}"
                    f" entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
