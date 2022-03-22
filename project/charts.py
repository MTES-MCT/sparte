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
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
        "series": [],
    }

    def get_series(self):
        return self.project.get_look_a_like_conso_per_year()

    def add_series(self):
        super().add_series()
        self.add_serie(
            self.project.name,
            self.project.get_conso_per_year(),
            **{
                "color": "#ff0000",
                "dashStyle": "ShortDash",
            }
        )


class ConsoCommuneChart(ProjectChart):
    name = "conso communes"
    param = {
        "chart": {"type": "area"},
        "title": {"text": ""},
        "yAxis": {"title": {"text": "Consommé (en ha)"}},
        "xAxis": {"type": "category"},
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
        "plotOptions": {"area": {"stacking": "normal"}},
        "series": [],
    }

    def get_series(self):
        if not self.series:
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
                }
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
                }
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

    def get_series(self):
        return {
            "Déterminants": {
                n: sum(v.values())
                for n, v in self.project.get_determinants(
                    group_name=self.group_name
                ).items()
            }
        }

    def add_series(self):
        super().add_series(sliced=True)
