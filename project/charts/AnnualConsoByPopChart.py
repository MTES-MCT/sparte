from collections import defaultdict

from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
)


class AnnualConsoByPopChart(ProjectChart):
    name = "conso comparison"

    @property
    def param(self):
        return super().param | {
            "title": {"text": "Consommation d'espace par nouvel habitant (en ha)"},
            "yAxis": {"title": {"text": "Consommé (en ha)"}},
            "tooltip": {
                "headerFormat": DEFAULT_HEADER_FORMAT,
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": DEFAULT_POINT_FORMAT,
            },
            "xAxis": {"type": "category"},
            "series": [],
        }

    def get_options(self, serie_name):
        if serie_name == self.project.name:
            return {"color": "#ff0000", "dashStyle": "ShortDash"}
        else:
            return super().get_options(serie_name)

    def get_series(self):
        if not self.series:
            self.series = defaultdict(lambda: dict())

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


class AnnualConsoByPopChartExport(AnnualConsoByPopChart):
    @property
    def param(self):
        return super().param | {
            "credits": CEREMA_CREDITS,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": (
                    f"Consommation annuelle d'espace par nouvel habitant de {self.project.territory_name} "
                    "et des territoires similaires "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
