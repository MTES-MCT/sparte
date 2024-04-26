from project.charts.base_project_chart import ProjectChart
from project.charts.constants import INSEE_CREDITS


class AnnualPopChart(ProjectChart):
    name = "Project population bar chart"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Evolution de la population du territoire"},
        "yAxis": {
            "title": {"text": "Nouveaux habitants"},
        },
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


class AnnualPopChartExport(AnnualPopChart):
    @property
    def param(self):
        return super().param | {
            "credits": INSEE_CREDITS,
            "title": {
                "text": (
                    f"Evolution de la population de {self.project.territory_name} "
                    "et des territoires similaires "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date}"
                )
            },
        }
