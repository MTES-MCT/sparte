from project.charts.base_project_chart import DiagnosticChart


class ArtifSyntheseChart(DiagnosticChart):
    @property
    def param(self):
        return {
            "chart": {"type": "bar"},
            "title": {"text": "Historic World Population by Region"},
            "subtitle": {
                "text": 'Source: <a href="https://en.wikipedia.org/wiki/List_of_continents_and_continental_subregions_by_population"target="_blank">Wikipedia.org</a>'  # noqa: E501
            },
            "xAxis": {
                "categories": ["Africa", "America", "Asia", "Europe"],
                "title": {"text": None},
                "gridLineWidth": 1,
                "lineWidth": 0,
            },
            "yAxis": {
                "min": 0,
                "title": {"text": "Population (millions)", "align": "high"},
                "labels": {"overflow": "justify"},
                "gridLineWidth": 0,
            },
            "tooltip": {"valueSuffix": " millions"},
            "plotOptions": {"bar": {"borderRadius": "50%", "dataLabels": {"enabled": True}, "groupPadding": 0.1}},
            "legend": {
                "layout": "vertical",
                "align": "right",
                "verticalAlign": "top",
                "x": -40,
                "y": 80,
                "floating": True,
                "borderWidth": 1,
                "backgroundColor": "var(--highcharts-background-color, #ffffff)",
                "shadow": True,
            },
            "credits": {"enabled": False},
            "series": [
                {"name": "Year 1990", "data": [632, 727, 3202, 721]},
                {"name": "Year 2000", "data": [814, 841, 3714, 726]},
                {"name": "Year 2021", "data": [1393, 1031, 4695, 745]},
            ],
        }

    @property
    def data_table(self):
        return {
            "headers": [],
            "rows": [],
        }
