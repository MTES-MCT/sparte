import collections

from highcharts import charts

from public_data.models import AdminRef


class ProjectChart(charts.Chart):
    def __init__(self, project, group_name=None):
        self.project = project
        self.group_name = group_name
        super().__init__()


class ConsoComparisonChart(ProjectChart):
    name = "conso comparison"
    param = {
        "title": {"text": ""},
        "yAxis": {"title": {"text": "Consommé (en ha)"}},
        "xAxis": {"type": "category"},
        "legend": {"layout": "vertical", "align": "right", "verticalAlign": "top"},
        "series": [],
    }

    def __init__(self, *args, **kwargs):
        self.relative = kwargs.pop("relative") if "relative" in kwargs else False
        super().__init__(*args, **kwargs)
        if self.relative:
            self.chart["title"]["text"] = "Consommation proportionnelle à la surface"
            self.chart["yAxis"]["visible"] = False
            self.chart["tooltip"] = {"enabled": False}

    def get_series(self):
        datas = dict()
        for land in self.project.get_look_a_like():
            coef = self.project.area / land.area if self.relative else 1
            datas[land.name] = land.get_conso_per_year(
                self.project.analyse_start_date,
                self.project.analyse_end_date,
                coef=coef,
            )
        return datas

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


class ConsoCommuneChart(ProjectChart):
    name = "conso communes"
    param = {
        "chart": {"type": "area"},
        "title": {"text": ""},
        "yAxis": {"title": {"text": "Consommé (en ha)"}},
        "xAxis": {"type": "category"},
        "legend": {"layout": "vertical", "align": "right", "verticalAlign": "top"},
        "plotOptions": {"area": {"stacking": "normal"}},
        "series": [],
    }

    def __init__(self, *args, **kwargs):
        try:
            self.level = kwargs.pop("level")
        except KeyError:
            self.level = AdminRef.COMMUNE
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
            elif self.level == "EPCI":
                self.series = self.project.get_land_conso_per_year("epci_name")
            else:
                self.series = self.project.get_city_conso_per_year(
                    group_name=self.group_name
                )
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
                    "from": -0.5,
                    "to": 9.5,
                    "label": {
                        "text": "Période de référence",
                        "style": {"color": "#95ceff", "fontWeight": "bold"},
                    },
                    "className": "plotband_blue",
                },
                {
                    "from": 9.5,
                    "to": 19.5,
                    "label": {
                        "text": "Réduction de 50%",
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
        series = [
            {
                "name": "Conso. annuelle réelle",
                "yAxis": 1,
                "data": list(),
                "type": "line",
                "color": "#95ceff",
                "dashStyle": "ShortDash",
                "zIndex": 4,
            },
            {
                "name": "Conso. cumulée réelle",
                "data": list(),
                "color": "#95ceff",
                "zIndex": 3,
            },
            {
                "name": "Objectif conso. annuelle",
                "yAxis": 1,
                "data": list(),
                "type": "line",
                "color": "#87cc78",
                "dashStyle": "ShortDash",
                "zIndex": 2,
            },
            {
                "name": "Objectif conso. cumulée",
                "data": list(),
                "color": "#a9ff96",
                "zIndex": 1,
            },
        ]
        total = 0
        cpt = 0
        for year, val in self.project.get_bilan_conso_per_year().items():
            total += val
            cpt += 1
            series[1]["data"].append(
                {
                    "name": year,
                    "y": total,
                    "progression": val,
                }
            )
            series[0]["data"].append({"name": year, "y": val})

        self.previsionnal = total / cpt
        self.annual_objective_2031 = total / (cpt * 2)
        self.annual_objective_2050 = total / (cpt * 4)

        for year in range(int(year) + 1, 2021):
            total += self.previsionnal
            series[1]["data"].append(
                {
                    "name": str(year),
                    "y": total,
                    "progression": self.previsionnal,
                    "color": "#2b2d2e",
                }
            )
            series[0]["data"].append(
                {
                    "name": str(year),
                    "y": self.previsionnal,
                    "color": "#2b2d2e",
                }
            )

        self.total_real = total

        for year in range(int(year) + 1, 2031):
            total += self.annual_objective_2031
            series[3]["data"].append(
                {
                    "name": str(year),
                    "y": total,
                    "progression": self.annual_objective_2031,
                }
            )
            series[2]["data"].append(
                {"name": str(year), "y": self.annual_objective_2031}
            )

        self.conso_2031 = total - self.total_real
        self.total_2031 = total

        self.chart["yAxis"][0]["max"] = total * 1.2

        for serie in series:
            self.chart["series"].append(serie)


class DeterminantPerYearChart(ProjectChart):
    name = "determinant per year"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Par an"},
        "yAxis": {
            "title": {"text": "Consommé (en ha)"},
            "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
        },
        "tooltip": {
            "headerFormat": "<b>{point.x}</b><br/>",
            "pointFormat": "{series.name}: {point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": 1,
        },
        "xAxis": {"type": "category"},
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
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
        "title": {"text": "Par commune"},
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

    def get_series(self):
        if not self.series:
            self.series = {
                "Artificialisation": dict(),
                "Renaturation": dict(),
                "Artificialisation nette": dict(),
            }
            for prd in self.project.get_artif_evolution():
                key = prd["period"]
                self.series["Artificialisation"][key] = prd["new_artif"]
                self.series["Renaturation"][key] = prd["new_natural"]
                self.series["Artificialisation nette"][key] = prd["net_artif"]
        return self.series

    def add_series(self):
        series = self.get_series()
        self.add_serie(
            "Artificialisation", series["Artificialisation"], color="#ff0000"
        )
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
        "title": {"text": "Synthèse"},
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
        "title": {"text": "Dernier millésime", "floating": True},
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
            title = f"Progression de {self.first_millesime} à {self.last_millesime}"
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


class DetailArtifChart(ProjectChart):
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

    def __init__(self, project):
        self.first_millesime = project.first_year_ocsge
        self.last_millesime = project.last_year_ocsge
        super().__init__(project)

    def get_series(self):
        if not self.series:
            self.series = self.project.get_detail_artif()
        return self.series

    def add_series(self):
        self.chart["series"].append(
            {
                "name": "Artificialisation",
                "data": [
                    {
                        "name": couv["code_prefix"],
                        "y": couv["artif"],
                    }
                    for couv in self.get_series()
                ],
            }
        )
        self.chart["series"].append(
            {
                "name": "Renaturation",
                "data": [
                    {
                        "name": couv["code_prefix"],
                        "y": couv["renat"],
                    }
                    for couv in self.get_series()
                ],
            }
        )


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

    def __init__(self, project):
        self.millesime = project.last_year_ocsge
        super().__init__(project)

    def get_series(self):
        if not self.series:
            self.series = self.project.get_base_sol_artif(sol=self._sol)
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


class NetArtifComparaisonChart(ProjectChart):
    name = "Net artificialisation per cities"
    param = {
        "chart": {"type": "column"},
        "title": {"text": ""},
        "yAxis": {"title": {"text": "Artificialisation net (en ha)"}},
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
        "title": {
            "text": (
                "Consommation d'espace en fonction de l'évolution de la population du"
                " territoire"
            )
        },
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
            self.series = {
                self.project.name: self.project.get_pop_change_per_year(
                    criteria="household"
                )
            }
            self.series.update(
                self.project.get_look_a_like_pop_change_per_year(criteria="household")
            )
        return self.series


class ConsoComparisonHouseholdChart(ProjectChart):
    name = "conso comparison"
    param = {
        "title": {
            "text": (
                "Consommation d'espace en fonction de l'évolution du nombre de ménages"
                " du territoire"
            )
        },
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
            lands_pop = self.project.get_look_a_like_pop_change_per_year(
                criteria="household"
            )
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
            self.series = {self.project.name: {"surface": self.project.area}}
            self.series.update(
                {
                    land.name: {"surface": land.area}
                    for land in self.project.get_look_a_like()
                }
            )

        return self.series
