from project.charts.base_project_chart import ProjectChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS, OCSGE_CREDITS


class ArtifByCouverturePieChart(ProjectChart):
    _sol = "couverture"
    name = "Artificialisation usage and couverture pie chart"
    param = {
        "chart": {"type": "pie"},
        "title": {"text": ""},
        "yAxis": {
            "title": {"text": "Consommé (en ha)"},
            "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
        },
        "tooltip": {
            "valueSuffix": " Ha",
            "valueDecimals": DEFAULT_VALUE_DECIMALS,
            "pointFormat": "{point.y} - {point.percent}",
            "headerFormat": "<b>{point.key}</b><br/>",
        },
        "xAxis": {"type": "category"},
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
        "plotOptions": {
            "pie": {
                "innerSize": "60%",
            }
        },
        "series": [],
    }

    def __init__(self, project, get_data=None):
        self.millesime = project.last_year_ocsge
        if get_data:
            self.get_data = get_data
        super().__init__(project)
        self.chart["title"]["text"] = f"Surfaces artificialisées par type de couverture en {self.millesime}"

    def get_data(self):
        """Should return data formated like this:
        [
            {
                "code_prefix": "CS1.1.1",
                "label": "Zone Bâti (maison,...)",
                "label_short": "Zone Bâti",
                "map_color": "#FF0000",
                "surface": 1000.0,
            },
            {...}
        ]
        """
        return self.project.get_base_sol_artif(sol=self._sol)

    def get_series(self):
        if not self.series:
            self.series = self.get_data()
        return self.series

    def add_series(self):
        surface_total = sum(_["surface"] for _ in self.get_series())
        self.chart["series"].append(
            {
                "name": "Sol artificiel",
                "data": [
                    {
                        "name": f"{item['code_prefix']} {item['label_short']}",
                        "y": item["surface"],
                        "color": item["map_color"],
                        "percent": f"{int(100 * item['surface'] / surface_total)}%",
                    }
                    for item in self.get_series()
                ],
            }
        )


class ArtifByCouverturePieChartExport(ArtifByCouverturePieChart):
    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {
                "text": (
                    f"Surfaces artificialisées par type de couverture en {self.millesime}"
                    f"pour {self.project.territory_name}"
                )
            },
        }
