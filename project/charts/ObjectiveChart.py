from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
)


class ObjectiveChart(ProjectChart):
    name = "suivi de l'objectif"
    param = {
        "chart": {"type": "column"},
        "title": {"text": ""},
        "yAxis": [
            {
                "title": {"text": "Consommation cumulée (en ha)"},
                "labels": {"format": "{value} Ha"},
                "opposite": True,
            },
            {
                "title": {"text": "Consommation annuelle"},
                "labels": {"format": "{value} Ha"},
                "min": 0,
            },
        ],
        "xAxis": {
            "type": "category",
            "categories": [str(i) for i in range(2011, 2031)],
            "plotBands": [
                {
                    "color": "#f4faff",
                    "from": 2011,
                    "to": 2021,
                    "label": {
                        "text": "Période de référence",
                        "style": {"color": "#95ceff", "fontWeight": "bold"},
                    },
                    "className": "plotband_blue",
                },
                {
                    "color": "#f6fff4",
                    "from": 2022,
                    "to": 2031,
                    "label": {
                        "text": "Projection 2031",
                        "style": {"color": "#87cc78", "fontWeight": "bold"},
                    },
                    "className": "plotband_green",
                },
            ],
        },
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
        "tooltip": {
            "headerFormat": DEFAULT_HEADER_FORMAT,
            "pointFormat": DEFAULT_POINT_FORMAT,
            "valueSuffix": " Ha",
            "valueDecimals": DEFAULT_VALUE_DECIMALS,
        },
        "series": [],
    }

    def add_serie(self, name, data, **options):
        serie = {
            "name": name,
            "data": [{"name": n, "y": y} for n, y in data.items()],
        }
        serie.update(options)
        self.chart["series"].append(serie)

    def add_series(self):
        self.series = [
            {
                "name": "Conso. annuelle réelle",
                "yAxis": 1,
                "data": list(),
                "color": "#95ceff",
                "zIndex": 4,
            },
            {
                "name": "Conso. cumulée réelle",
                "data": list(),
                "type": "line",
                "color": "#95ceff",
                "zIndex": 3,
            },
            {
                "name": "Objectif conso. annuelle",
                "yAxis": 1,
                "data": list(),
                "color": "#87cc78",
                "zIndex": 2,
            },
            {
                "name": "Objectif conso. cumulée",
                "data": list(),
                "type": "line",
                "dashStyle": "ShortDash",
                "color": "#a9ff96",
                "zIndex": 1,
            },
        ]
        self.total_real = self.total_2020 = 0
        for year, val in self.project.get_bilan_conso_per_year().items():
            if int(year) <= 2020:
                self.total_2020 += val
            self.total_real += val
            self.series[1]["data"].append(
                {
                    "name": year,
                    "y": self.total_real,
                    "progression": val,
                }
            )
            self.series[0]["data"].append({"name": year, "y": val})

        self.annual_2020 = self.total_2020 / 10
        self.annual_objective_2031 = self.total_2020 * self.project.target_2031 / 1000
        self.annual_real = self.total_real / 10
        self.total_2031 = self.total_2020
        self.conso_2031 = self.annual_objective_2031 * 10

        for year in range(2020 + 1, 2031):  # noqa: B020
            self.total_2031 += self.annual_objective_2031
            self.series[3]["data"].append(
                {
                    "name": str(year),
                    "y": self.total_2031,
                    "progression": self.annual_objective_2031,
                }
            )
            self.series[2]["data"].append({"name": str(year), "y": self.annual_objective_2031})

        self.chart["yAxis"][0]["max"] = self.total_2031 * 1.2

        self.chart["series"] = self.series

    def get_data_table(self):
        real = {_["name"]: _["y"] for _ in self.series[0]["data"]}
        added_real = {_["name"]: _["y"] for _ in self.series[1]["data"]}
        objective = {_["name"]: _["y"] for _ in self.series[2]["data"]}
        added_objective = {_["name"]: _["y"] for _ in self.series[3]["data"]}
        years = set(real.keys()) | set(objective.keys()) | set(added_real.keys())
        years |= set(added_objective.keys())
        for year in sorted(years):
            yield {
                "year": year,
                "real": real.get(year, "-"),
                "added_real": added_real.get(year, "-"),
                "objective": objective.get(year, "-"),
                "added_objective": added_objective.get(year, "-"),
            }


class ObjectiveChartExport(ObjectiveChart):
    pass
