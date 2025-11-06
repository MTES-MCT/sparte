from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
)
from public_data.domain.containers import PublicDataContainer


class ObjectiveChart(DiagnosticChart):
    name = "suivi de l'objectif"

    def __init__(self, land, params):
        super().__init__(land, params)
        self.add_series()

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
                    "color": "#e5f3ff",
                    "from": -0.5,
                    "to": 9.5,
                    "label": {
                        "text": "Période de référence de la loi Climat & Résilience",
                        "style": {"color": "#95ceff", "fontWeight": "bold"},
                    },
                    "className": "plotband_blue",
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
        self.total_real = 0
        self.total_2020 = 0

        conso = PublicDataContainer.consommation_progression_service().get_by_land(
            land=self.land,
            start_date=2011,
            end_date=2023,
        )
        conso_per_year = {str(c.year): float(c.total) for c in conso.consommation}

        for year, val in conso_per_year.items():
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

        self.annual_2020 = self.total_2020 / 10.0
        # Get target_2031 from params, default to 50% if not provided
        target_2031 = float(self.params.get("target_2031", 50))
        self.annual_objective_2031 = self.annual_2020 - (self.annual_2020 / 100.0 * target_2031)
        self.annual_real = self.total_real / 10.0
        self.total_2031 = self.total_2020
        self.conso_2031 = self.annual_objective_2031 * 10.0

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

    @property
    def data_table(self):
        """Retourne les données sous forme de tableau pour l'affichage."""
        real = {_["name"]: _["y"] for _ in self.series[0]["data"]}
        added_real = {_["name"]: _["y"] for _ in self.series[1]["data"]}
        objective = {_["name"]: _["y"] for _ in self.series[2]["data"]}
        added_objective = {_["name"]: _["y"] for _ in self.series[3]["data"]}
        years = set(real.keys()) | set(objective.keys()) | set(added_real.keys())
        years |= set(added_objective.keys())

        headers = [
            "Millésime",
            "Réelle (Ha)",
            "Réelle cumulée (Ha)",
            "Projection annualisée de l'objectif 2031 (Ha)",
            "Cumulé de la projection (Ha)",
        ]
        rows = []

        for year in sorted(years):
            rows.append(
                {
                    "name": year,
                    "data": [
                        year,
                        real.get(year, "-"),
                        added_real.get(year, "-"),
                        objective.get(year, "-"),
                        added_objective.get(year, "-"),
                    ],
                }
            )

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
            "boldLastColumn": True,
        }


class ObjectiveChartExport(ObjectiveChart):
    @property
    def param(self):
        return super().param | {
            "title": {"text": f"Trajectoire de consommation d'espaces et objectif 2031 de {self.land.name}"}
        }
