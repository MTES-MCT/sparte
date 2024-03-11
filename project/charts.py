import collections
from typing import Dict, List

from django.contrib.gis.geos import MultiPolygon
from django.db.models import F, Sum, Value
from django.db.models.functions import Concat

from highcharts import charts
from project.models.project_base import Project
from public_data.models import AdminRef, CouvertureSol, OcsgeDiff, UsageSol


class ProjectChart(charts.Chart):
    def __init__(self, project: Project, group_name=None):
        self.project = project
        self.group_name = group_name
        super().__init__()


class ConsoChart(ProjectChart):
    name = "conso comparison"
    param = {
        "title": {"text": ""},
        "yAxis": {"title": {"text": "Consommé (en ha)"}},
        "xAxis": {"type": "category"},
        "legend": {"layout": "vertical", "align": "right", "verticalAlign": "top"},
        "tooltip": {
            "headerFormat": "<b>{series.name}</b><br/>",
            "pointFormat": "{point.name}: {point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": 0,
        },
        "series": [],
    }

    def get_series(self):
        return {
            land.name: land.get_conso_per_year(
                self.project.analyse_start_date,
                self.project.analyse_end_date,
                coef=1,
            )
            for land in self.project.get_look_a_like()
        }

    def add_series(self):
        self.add_serie(
            self.project.name,
            self.project.get_conso_per_year(),
            **{
                "color": "#ff0000",
                "dashStyle": "ShortDash",
            },
        )
        super().add_series()


class ConsoComparisonChart(ProjectChart):
    name = "conso comparison"
    param = {
        "title": {"text": "Consommation proportionnelle à la surface (‰)"},
        "yAxis": {"title": {"text": "Consommation d'espace proportionnelle à la surface du territoire (‰)"}},
        "xAxis": {"type": "category"},
        "legend": {"layout": "vertical", "align": "right", "verticalAlign": "top"},
        "tooltip": {
            "headerFormat": "<b>{series.name}</b><br/>",
            "pointFormat": "{point.name}: {point.y}",
            "valueSuffix": " ‰",
            "valueDecimals": 2,
        },
        "series": [],
    }

    def add_series(self):
        self.add_serie(
            self.project.name,
            self.project.get_conso_per_year(
                coef=1000 / self.project.area,
            ),
            **{
                "color": "#ff0000",
                "dashStyle": "ShortDash",
            },
        )
        super().add_series()

    def get_series(self):
        return {
            land.name: land.get_conso_per_year(
                self.project.analyse_start_date,
                self.project.analyse_end_date,
                coef=1000 / land.area,
            )
            for land in self.project.get_look_a_like()
        }


class ConsoCommuneChart(ProjectChart):
    name = "conso communes"
    param = {
        "chart": {"type": "area"},
        "title": {"text": ""},
        "yAxis": {"title": {"text": "Consommé (ha)"}},
        "xAxis": {"type": "category"},
        "tooltip": {
            "headerFormat": "<b>{series.name}</b><br/>",
            "pointFormat": "{point.name}: {point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": 2,
        },
        "legend": {
            "layout": "vertical",
            "align": "right",
            "verticalAlign": "bottom",
            "padding": 3,
            "margin": 25,
            "itemMarginTop": 1,
            "itemMarginBottom": 1,
        },
        "plotOptions": {"area": {"stacking": "normal"}},
        "series": [],
    }

    def __init__(self, *args, **kwargs):
        self.level = kwargs.pop("level", AdminRef.COMMUNE)
        super().__init__(*args, **kwargs)

    def get_legend_for_paper(self):
        if len(self.get_series()) > 20:
            return {"enabled": False}
        else:
            return {
                "layout": "vertical",
                "align": "center",
                "verticalAlign": "bottom",
            }

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
                self.project.name,
                self.project.get_conso_per_year(),
                **{
                    "type": "line",
                    "color": "#ff0000",
                    "dashStyle": "ShortDash",
                },
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
            "headerFormat": "<b>{series.name}</b><br/>",
            "pointFormat": "{point.name}: {point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": 1,
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
        cpt = 0
        for year, val in self.project.get_bilan_conso_per_year().items():
            if int(year) <= 2020:
                self.total_2020 += val
            self.total_real += val
            cpt += 1
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


class DeterminantPerYearChart(ProjectChart):
    name = "determinant per year"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Par an"},
        "yAxis": {
            "title": {"text": "Consommation annuelle (en ha)"},
            "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
        },
        "tooltip": {
            "headerFormat": "<b>{point.key}</b><br/>",
            "pointFormat": "{series.name}: {point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": 1,
        },
        "xAxis": {"type": "category"},
        "legend": {"layout": "vertical", "align": "right", "verticalAlign": "middle"},
        "plotOptions": {
            "column": {
                "stacking": "normal",
                "dataLabels": {"enabled": True, "format": "{point.y:,.1f}"},
            }
        },
        "series": [],
    }

    def get_series(self):
        if not self.series:
            self.series = self.project.get_determinants(group_name=self.group_name)
        return self.series

    def add_series(self):
        super().add_series()
        if not self.group_name:
            self.add_serie(
                self.project.name,
                self.project.get_conso_per_year(),
                **{
                    "type": "line",
                    "color": "#ff0000",
                    "dashStyle": "ShortDash",
                },
            )


class DeterminantPieChart(ProjectChart):
    name = "determinant overview"
    param = {
        "chart": {"type": "pie"},
        "title": {"text": "Sur la période"},
        "yAxis": {
            "title": {"text": "Consommé (en ha)"},
            "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
        },
        "tooltip": {"enabled": False, "pointFormat": "{point.name}: {point.y:.1f} Ha"},
        "xAxis": {"type": "category"},
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
        "plotOptions": {
            "pie": {
                "allowPointSelect": True,
                "cursor": "pointer",
                "dataLabels": {
                    "enabled": True,
                    "format": "<b>{point.name}</b>: {point.y:.1f} Ha",
                },
            }
        },
        "series": [],
    }

    def __init__(self, *args, **kwargs):
        if "series" in kwargs:
            self.series = kwargs.pop("series")
        super().__init__(*args, **kwargs)

    def get_series(self):
        if not self.series:
            self.series = self.project.get_determinants(group_name=self.group_name)
        return {"Déterminants": {n: sum(v.values()) for n, v in self.series.items()}}

    def add_series(self):
        super().add_series(sliced=True)


class EvolutionArtifChart(ProjectChart):
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
            "valueDecimals": 1,
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


class WaterfallnArtifChart(ProjectChart):
    name = "Evolution de l'artificialisation"
    param = {
        "chart": {"type": "waterfall"},
        "title": {"text": "Total pour l'ensemble du territoire du diagnostic"},
        "yAxis": {
            "title": {"text": "Surface (en ha)"},
            "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
        },
        "tooltip": {
            "pointFormat": "{series.name}: {point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": 1,
        },
        "xAxis": {"type": "category"},
        "legend": {"enabled": False},
        "plotOptions": {
            "column": {
                "dataLabels": {"enabled": True, "format": "{point.y:,.1f}"},
                "pointPadding": 0.2,
                "borderWidth": 0,
            }
        },
        "series": [],
    }

    def get_series(self):
        if not self.series:
            self.series = self.project.get_artif_progession_time_scoped()
        return self.series

    def add_series(self):
        series = self.get_series()
        self.chart["series"] = [
            {
                "data": [
                    {
                        "name": "Artificialisation",
                        "y": series["new_artif"],
                        "color": "#ff0000",
                    },
                    {
                        "name": "Renaturation",
                        "y": series["new_natural"] * -1,
                        "color": "#00ff00",
                    },
                    {
                        "name": "Artificialisation nette",
                        "isSum": True,
                        "color": "#0000ff",
                    },
                ],
            },
        ]


class CouvertureSolPieChart(ProjectChart):
    _level = 2
    _sol = "couverture"
    name = "Sol usage and couverture pie chart"
    param = {
        "chart": {"type": "pie"},
        "title": {"text": "Répartition en [DERNIER MILLESIME]", "floating": True},
        "yAxis": {
            "title": {"text": "Consommé (en ha)"},
            "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
        },
        "tooltip": {
            "valueSuffix": " Ha",
            "valueDecimals": 0,
            "pointFormat": "<b>{point.y}</b><br/>{point.percent}",
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

    def __init__(self, project):
        self.millesime = project.last_year_ocsge
        super().__init__(project)
        self.chart["title"]["text"] = self.chart["title"]["text"].replace("[DERNIER MILLESIME]", str(self.millesime))

    def get_series(self):
        if not self.series:
            self.series = self.project.get_base_sol(self.millesime, sol=self._sol)
        return self.series

    def add_series(self):
        series = [_ for _ in self.get_series() if _.level == self._level]
        surface_total = sum(_.surface for _ in series)
        if surface_total:
            self.chart["series"].append(
                {
                    "name": self.millesime,
                    "data": [
                        {
                            "name": f"{item.code_prefix} {item.label}",
                            "y": item.surface,
                            "color": item.map_color,
                            "percent": f"{int(100 * item.surface / surface_total)}%",
                        }
                        for item in series
                    ],
                }
            )


class UsageSolPieChart(CouvertureSolPieChart):
    _level = 1
    _sol = "usage"


class CouvertureSolProgressionChart(ProjectChart):
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
            "pointFormat": "{series.name}: {point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": 2,
            "headerFormat": "",
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


class UsageSolProgressionChart(CouvertureSolProgressionChart):
    _level = 1
    _sol = "usage"
    _sub_title = "l'usage"


class DetailCouvArtifChart(ProjectChart):
    name = "Progression des principaux postes de la couverture du sol"
    param = {
        "chart": {"type": "column", "alignThresholds": True},
        "title": {"text": ""},
        "yAxis": {
            "title": {"text": "Progression (en ha)"},
        },
        "tooltip": {
            "pointFormat": "{series.name}: {point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": 2,
            "headerFormat": "",
        },
        "xAxis": {"type": "category"},
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
        "series": [],
    }

    def __init__(self, project: Project, geom: MultiPolygon | None = None):
        self.first_millesime = project.first_year_ocsge
        self.last_millesime = project.last_year_ocsge
        self.geom = geom
        super().__init__(project)
        self.chart["title"]["text"] = (
            f"Evolution de l'artificialisation par type de couverture de {self.first_millesime} à "
            f"{self.last_millesime}"
        )

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
        return self.project.get_detail_artif(sol="couverture", geom=self.geom)

    def get_series(self) -> List[Dict]:
        if not self.series:
            self.series = list(self.get_data())
            if "CS1.1.2.2" not in [s["code_prefix"] for s in self.series]:
                required_couv = CouvertureSol.objects.get(code="1.1.2.2")
                self.series.append(
                    {
                        "code_prefix": required_couv.code_prefix,
                        "label": required_couv.label,
                        "label_short": required_couv.label_short,
                        "artif": 0,
                        "renat": 0,
                    }
                )
        return self.series

    def add_series(self, *args, **kwargs) -> None:
        self.chart["series"].append(
            {
                "name": "Artificialisation",
                "data": [
                    {
                        "name": item["code_prefix"],
                        "y": item["artif"],
                    }
                    for item in self.get_series()
                ],
            }
        )
        self.chart["series"].append(
            {
                "name": "Renaturation",
                "data": [
                    {
                        "name": item["code_prefix"],
                        "y": item["renat"],
                    }
                    for item in self.get_series()
                ],
            }
        )


class DetailUsageArtifChart(DetailCouvArtifChart):
    name = "Progression des principaux postes de l'usage du sol"

    def __init__(self, project: Project, geom: MultiPolygon | None = None):
        super().__init__(project, geom=geom)
        self.chart["title"]["text"] = (
            f"Evolution de l'artificialisation par type d'usage de {self.first_millesime} à " f"{self.last_millesime}"
        )

    def get_series(self):
        if not self.series:
            self.series = {  # TODO : tester que toutes les USAGES niveau 1 s'affichent.
                u.code_prefix: {
                    "code_prefix": u.code_prefix,
                    "label": u.label,
                    "label_short": u.label_short,
                    "artif": 0,
                    "renat": 0,
                }
                for u in UsageSol.objects.order_by("code_prefix")
                if u.level == 1
            }
            for row in self.project.get_detail_artif(sol="usage", geom=self.geom):
                code = row["code_prefix"].split(".")[0]
                self.series[code]["artif"] += row["artif"]
                self.series[code]["renat"] += row["renat"]
        return list(self.series.values())


class ArtifCouvSolPieChart(ProjectChart):
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
            "valueDecimals": 0,
            "pointFormat": "<b>{point.y}</b><br/>{point.percent}",
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


class ArtifUsageSolPieChart(ArtifCouvSolPieChart):
    _sol = "usage"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.chart["title"]["text"] = f"Surfaces artificialisées par type d'usage en {self.millesime}"

    def get_series(self):
        if not self.series:
            data = {}
            for row in list(super().get_series()):
                code = row["code_prefix"].split(".")[0]
                if code not in data:
                    data[code] = 0
                data[code] += row["surface"]
            usage_list = {u.code_prefix: u for u in UsageSol.objects.all() if u.code_prefix in data}
            self.series = [
                {
                    "code_prefix": code,
                    "label": usage_list[code].label,
                    "label_short": usage_list[code].label_short,
                    "map_color": usage_list[code].map_color,
                    "surface": value,
                }
                for code, value in data.items()
            ]
        return self.series


class NetArtifComparaisonChart(ProjectChart):
    name = "Net artificialisation per cities"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Répartition de l'artificialisation nette"},
        "yAxis": {"title": {"text": "Artificialisation nette (en ha)"}},
        "xAxis": {"type": "category"},
        "legend": {"layout": "vertical", "align": "right", "verticalAlign": "top"},
        "series": [],
    }

    def __init__(self, *args, **kwargs):
        self.level = kwargs.pop("level")
        super().__init__(*args, **kwargs)

    def get_legend_for_paper(self):
        if len(self.get_series()) > 20:
            return {"enabled": False}
        else:
            return {
                "layout": "vertical",
                "align": "center",
                "verticalAlign": "bottom",
            }

    def get_series(self):
        if not self.series:
            self.series = self.project.get_land_artif_per_year(self.level)
        return self.series

    def add_series(self):
        super().add_series()
        total = collections.defaultdict(lambda: 0)
        for data in self.get_series().values():
            for period, value in data.items():
                total[period] += value


class PopChart(ProjectChart):
    name = "Project population bar chart"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Evolution de la population du territoire"},
        "yAxis": {"title": {"text": "Evolution de la population"}},
        "xAxis": {"type": "category"},
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
            self.series = {self.project.name: self.project.get_pop_change_per_year()}
            self.series.update(self.project.get_look_a_like_pop_change_per_year())
        return self.series


class ConsoComparisonPopChart(ProjectChart):
    name = "conso comparison"
    param = {
        "title": {"text": ("Ha par nouvel habitant")},
        "yAxis": {"title": {"text": "Consommation par habitant (en ha)"}},
        "xAxis": {"type": "category"},
        "legend": {"layout": "vertical", "align": "right", "verticalAlign": "middle"},
        "series": [],
    }

    def get_options(self, serie_name):
        if serie_name == self.project.name:
            return {"color": "#ff0000", "dashStyle": "ShortDash"}
        else:
            return super().get_options(serie_name)

    def get_series(self):
        if not self.series:
            self.series = collections.defaultdict(lambda: dict())

            self_pop = self.project.get_pop_change_per_year()
            self_conso = self.project.get_conso_per_year()

            data = self.series[self.project.name]
            for year, pop_progression in self_pop.items():
                if pop_progression:
                    data[year] = self_conso[year] / pop_progression
                else:
                    data[year] = None

            lands_conso = self.project.get_look_a_like_conso_per_year()
            lands_pop = self.project.get_look_a_like_pop_change_per_year()
            for land_name, land_data in lands_conso.items():
                data = self.series[land_name]
                land_pop = lands_pop[land_name]
                for year, conso in land_data.items():
                    if land_pop[year]:
                        data[year] = conso / land_pop[year]
                    else:
                        data[year] = None
        return self.series


class HouseholdChart(ProjectChart):
    name = "Project ménages bar chart"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Evolution du nombre de ménages du territoire"},
        "yAxis": {"title": {"text": "Evolution du nombre de ménages"}},
        "xAxis": {"type": "category"},
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
            self.series = {self.project.name: self.project.get_pop_change_per_year(criteria="household")}
            self.series.update(self.project.get_look_a_like_pop_change_per_year(criteria="household"))
        return self.series


class ConsoComparisonHouseholdChart(ProjectChart):
    name = "conso comparison"
    param = {
        "title": {"text": ("Ha par nouveau ménage accueilli")},
        "yAxis": {"title": {"text": "Consommation par ménage (en ha)"}},
        "xAxis": {"type": "category"},
        "legend": {"layout": "vertical", "align": "right", "verticalAlign": "middle"},
        "series": [],
    }

    def get_options(self, serie_name):
        if serie_name == self.project.name:
            return {"color": "#ff0000", "dashStyle": "ShortDash"}
        else:
            return super().get_options(serie_name)

    def get_series(self):
        if not self.series:
            self.series = collections.defaultdict(lambda: dict())

            self_pop = self.project.get_pop_change_per_year(criteria="household")
            self_conso = self.project.get_conso_per_year()

            data = self.series[self.project.name]
            for year, pop_progression in self_pop.items():
                if pop_progression:
                    data[year] = self_conso[year] / pop_progression
                else:
                    data[year] = None

            lands_conso = self.project.get_look_a_like_conso_per_year()
            lands_pop = self.project.get_look_a_like_pop_change_per_year(criteria="household")
            for land_name, land_data in lands_conso.items():
                data = self.series[land_name]
                land_pop = lands_pop[land_name]
                for year, conso in land_data.items():
                    if land_pop[year]:
                        data[year] = conso / land_pop[year]
                    else:
                        data[year] = None
        return self.series


class SurfaceChart(ProjectChart):
    name = "Surface des territoires"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Surface des territoires"},
        "yAxis": {"title": {"text": "Surface (en ha)"}},
        "xAxis": {"type": "category"},
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


class CouvWheelChart(ProjectChart):
    name = "Matrice de passage de la couverture"
    prefix = "cs"
    title = "Matrice d'évolution de la couverture de [PREMIER MILLESIME] à " "[DERNIER MILLESIME]"
    name_sol = "couverture"
    items = CouvertureSol.objects.all()
    param = {
        "title": {"text": ""},
        "accessibility": {
            "point": {"valueDescriptionFormat": ("{index}. From {point.from} to {point.to}: {point.weight}.")}
        },
        "series": [],
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        title = self.title
        title = title.replace("[PREMIER MILLESIME]", str(self.project.first_year_ocsge))
        title = title.replace("[DERNIER MILLESIME]", str(self.project.last_year_ocsge))
        self.chart["title"]["text"] = title

    def add_series(self):
        self.chart["series"].append(
            {
                "keys": ["from", "to", "weight", "color"],
                "data": self.get_data(),
                "type": "dependencywheel",
                "styledMode": True,
                "dataLabels": {
                    "align": "left",
                    "crop": False,
                    "inside": False,
                    "color": "#333",
                    "style": {"textOutline": "none"},
                    "textPath": {"enabled": True},
                    "distance": 10,
                },
                "size": "100%",
                "nodes": [
                    {
                        "id": f"{_.code_prefix} {_.label_short}",
                        "color": _.map_color,
                    }
                    for _ in self.items
                ],
            }
        )

    def get_data(self):
        self.data = (
            OcsgeDiff.objects.intersect(self.project.combined_emprise)
            .filter(
                year_old__gte=self.project.analyse_start_date,
                year_new__lte=self.project.analyse_end_date,
            )
            .annotate(
                old_label=Concat(
                    f"{self.prefix}_old",
                    Value(" "),
                    f"old_matrix__{self.name_sol}__label_short",
                ),
                new_label=Concat(
                    f"{self.prefix}_new",
                    Value(" "),
                    f"new_matrix__{self.name_sol}__label_short",
                ),
                color=F(f"old_matrix__{self.name_sol}__map_color"),
            )
            .values("old_label", "new_label", "color")
            .annotate(total=Sum("surface") / 10000)
            .order_by("old_label", "new_label", "color")
        )
        return [
            [_["old_label"], _["new_label"], round(_["total"], 2), _["color"]]
            for _ in self.data
            if _["old_label"] != _["new_label"]
        ]


class UsageWheelChart(CouvWheelChart):
    name = "Matrice de passage de l'usage"
    title = "Matrice d'évolution de l'usage de [PREMIER MILLESIME] à [DERNIER MILLESIME]"
    prefix = "us"
    name_sol = "usage"
    items = UsageSol.objects.all()
