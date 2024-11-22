from project.charts.base_project_chart import ProjectChart
from project.charts.constants import HIGHLIGHT_COLOR
from public_data.domain.containers import PublicDataContainer


class PopulationConsoComparisonChart(ProjectChart):
    name = "population conso comparison"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "bubble"},
            "legend": {
                "layout": "vertical",
                "align": "right",
                "verticalAlign": "middle",
                "bubbleLegend": {
                    "enabled": True,
                    "borderWidth": 1,
                    "legendIndex": 100,
                    "labels": {"format": "{value} hab"},
                },
            },
            "credits": {"enabled": False},
            "title": {
                "text": (
                    "Consommation foncière au regard de l'évolution de la population "
                    "du territoire et des territoires similaires"
                )
            },
            "xAxis": {
                "gridLineWidth": 1,
                "title": {"text": "Évolution démographique (hab)"},
                "plotLines": [{"color": "#000", "width": 1, "value": 0, "zIndex": 3}],
            },
            "yAxis": {"title": {"text": "Consommation d'espaces NAF (ha)"}, "maxPadding": 0.2, "min": 0},
            "tooltip": {
                "pointFormat": (
                    "Consommation: <span class='fr-text--bold'>{point.y} ha</span><br />"
                    "Évolution démographique: <span class='fr-text--bold'>{point.x} hab</span><br />"
                    "Population totale: <span class='fr-text--bold'>{point.z} hab</span>"
                ),
            },
            "series": [],
        }

    def add_series(self):
        lands = self.project.comparison_lands_and_self_land()
        start_date = int(self.project.analyse_start_date)
        end_date = int(self.project.analyse_end_date)
        highlighted_land_id = self.project.land_proxy.id

        consommation_stats = {
            c.land.id: round(c.consommation[0].total / 10000, 3)  # en hectare
            for c in PublicDataContainer.consommation_stats_service().get_by_lands(lands, start_date, end_date)
        }
        population_stats = {
            p.land.id: p.population[0].evolution
            for p in PublicDataContainer.population_stats_service().get_by_lands(lands, start_date, end_date)
        }
        annual_population = {
            land.id: PublicDataContainer.population_annual_service().get_annual_population(land, end_date).population
            for land in lands
        }

        # Créer les séries
        self.chart["series"] = [
            {
                "name": land.name,
                "data": [
                    {
                        "x": population_stats.get(land.id, 0),
                        "y": consommation_stats.get(land.id, 0),
                        "z": annual_population.get(land.id, 0),
                    }
                ],
                "color": HIGHLIGHT_COLOR if land.id == highlighted_land_id else None,
            }
            for land in lands
        ]
