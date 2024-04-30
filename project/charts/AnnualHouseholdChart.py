from project.charts.base_project_chart import ProjectChart
from project.charts.constants import INSEE_CREDITS, LEGEND_NAVIGATION_EXPORT


class AnnualHouseholdChart(ProjectChart):
    name = "Project ménages bar chart"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Evolution du nombre de ménages du territoire"},
            "yAxis": {"title": {"text": "Nouveaux ménages"}},
            "xAxis": {"type": "category"},
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


class AnnualHouseholdChartExport(AnnualHouseholdChart):
    @property
    def param(self):
        return super().param | {
            "credits": INSEE_CREDITS,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": (
                    f"Evolution annuelle du nombre de ménages du territoire de {self.project.territory_name} "
                    "et des territoires similaires "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date}"
                )
            },
        }
