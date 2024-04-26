from project.charts.base_project_chart import ProjectChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS, OCSGE_CREDITS


class CouvertureProgressionChart(ProjectChart):
    _level = 2
    _sol = "couverture"
    _sub_title = "la couverture"
    name = "Progression des principaux postes de la couverture du sol"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Progression"},
        "yAxis": {
            "title": {"text": "Surface (en ha)"},
            "plotLines": [{"value": 0, "width": 2, "color": "#ff0000"}],
        },
        "tooltip": {
            "pointFormat": "{point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": DEFAULT_VALUE_DECIMALS,
            "headerFormat": "<b>{point.key}</b><br/>",
        },
        "xAxis": {"type": "category"},
        "legend": {"enabled": False},
        "series": [],
    }

    def __init__(self, project):
        self.first_millesime = project.first_year_ocsge
        self.last_millesime = project.last_year_ocsge
        super().__init__(project)

    def get_series(self):
        if not self.series:
            title = f"Evolution de {self._sub_title} des sols de {self.first_millesime} à {self.last_millesime}"
            self.chart["title"]["text"] = title
            self.series = self.project.get_base_sol_progression(
                self.first_millesime, self.last_millesime, sol=self._sol
            )
        return self.series

    def add_series(self):
        self.chart["series"].append(
            {
                "name": "Evolution",
                "data": [
                    {
                        "name": f"{couv.code_prefix} {couv.label}",
                        "y": couv.surface_diff,
                        "color": couv.map_color,
                    }
                    for couv in self.get_series()
                    if couv.level == self._level
                ],
            }
        )


class CouvertureProgressionChartExport(CouvertureProgressionChart):
    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {"text": f"Progression de la couverture du sol de {self.project.territory_name}"},
        }
