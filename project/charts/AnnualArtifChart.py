from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    ARTIFICIALISATION_COLOR,
    ARTIFICIALISATION_NETTE_COLOR,
    DEFAULT_VALUE_DECIMALS,
    DESARTIFICIALISATION_COLOR,
    LANG_MISSING_OCSGE_DIFF_ARTIF,
)

ARTIFICIALISATION = "Artificialisation"
RENATURATION = "Désartificialisation"
NET_ARTIFICIALISATION = "Artificialisation nette"


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
                "dataLabels": {"enabled": True, "format": "{point.y:,.1f} ha"},
                "pointPadding": 0.2,
                "borderWidth": 0,
            }
        },
        "lang": LANG_MISSING_OCSGE_DIFF_ARTIF,
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
                ARTIFICIALISATION: dict(),
                RENATURATION: dict(),
                NET_ARTIFICIALISATION: dict(),
            }
            for prd in self.get_data():
                key = prd["period"]
                if prd["new_artif"] or prd["new_natural"]:
                    self.series[ARTIFICIALISATION][key] = prd["new_artif"]
                    self.series[RENATURATION][key] = prd["new_natural"]
                    self.series[NET_ARTIFICIALISATION][key] = prd["net_artif"]
        return self.series

    def add_series(self):
        series = self.get_series()
        self.add_serie(ARTIFICIALISATION, series[ARTIFICIALISATION], color=ARTIFICIALISATION_COLOR)
        self.add_serie(RENATURATION, series[RENATURATION], color=DESARTIFICIALISATION_COLOR)
        self.add_serie(
            NET_ARTIFICIALISATION,
            series[NET_ARTIFICIALISATION],
            color=ARTIFICIALISATION_NETTE_COLOR,
        )
