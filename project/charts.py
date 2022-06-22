import collections

from highcharts import charts


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

    def get_series(self):
        datas = dict()
        for land in self.project.get_lands():
            coef = self.project.area / land.area if self.relative else 1
            datas[land.name] = land.get_conso_per_year(
                self.project.analyse_start_date,
                self.project.analyse_end_date,
                coef=coef,
            )
        return datas

    def add_series(self):
        super().add_series()
        self.add_serie(
            self.project.name,
            self.project.get_conso_per_year(),
            **{
                "color": "#ff0000",
                "dashStyle": "ShortDash",
            },
        )


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
            self.level = "COMM"
        super().__init__(*args, **kwargs)

    def get_legend_for_paper(self):
        return {
            "enabled": False,
        }

    def get_series(self):
        if not self.series:
            if self.level == "REGI":
                self.series = self.project.get_land_conso_per_year("region_name")
            elif self.level == "DEPT":
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
        # self.add_serie(
        #     self.project.name,
        #     total,
        #     **{
        #         "color": "#ff0000",
        #         "dashStyle": "ShortDash",
        #     },
        # )
