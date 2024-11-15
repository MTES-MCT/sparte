from project.charts.base_project_chart import ProjectChart


class PopDensityChart(ProjectChart):
    name = "pop density"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "lineargauge", "inverted": True, "height": 130, "marginTop": 80},
            "title": {"text": "Densité de population"},
            "xAxis": {"lineColor": "transparent", "labels": {"enabled": False}, "tickLength": 0},
            "yAxis": {
                "tickPositions": [0, 20, 40, 60, 80, 100],
                "min": 0,
                "max": 100,
                "gridLineWidth": 0,
                "title": None,
                "labels": {"format": "{value}"},
                "plotBands": [
                    {"from": 0, "to": 20, "color": "rgb(242, 181, 168)"},
                    {"from": 20, "to": 40, "color": "rgb(242, 159, 142)"},
                    {"from": 40, "to": 60, "color": "rgb(242, 133, 111)"},
                    {"from": 60, "to": 80, "color": "rgb(242, 77, 45)"},
                    {"from": 80, "to": 100, "color": "rgb(185, 52, 27)"},
                ],
            },
            "legend": {"enabled": False},
            "series": [],
        }

    def add_series(self):
        self.chart["series"] = [
            {
                "data": [92],
                "color": "#000000",
                "dataLabels": {
                    "enabled": True,
                    "useHTML": True,
                    "align": "center",
                    "verticalAlign": "top",
                    "color": "#000000",
                    "format": "{point.y} hab/km<sup>2</sup>",
                    "style": {"transform": "translateY(-12px)", "textOutline": "none"},
                },
            }
        ]
