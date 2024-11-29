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
                    "labels": {"format": "{value:.0f} hab"},
                    "color": "transparent",
                    "connectorDistance": 40,
                },
            },
            "credits": {"enabled": False},
            "title": {
                "text": (
                    "Consommation d'espace au regard de l'évolution de la population "
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
                    "Consommation : <span class='fr-text--bold'>{point.y} ha</span><br />"
                    "Évolution démographique : <span class='fr-text--bold'>{point.x} hab</span><br />"
                    "Population totale (%s) : <span class='fr-text--bold'>{point.z} hab</span>"
                    % self.project.analyse_end_date
                ),
            },
            "series": [],
        }

    def get_bubble_series(self):
        lands = self.project.comparison_lands_and_self_land()
        start_date = int(self.project.analyse_start_date)
        end_date = int(self.project.analyse_end_date)
        highlighted_land_id = self.project.land_proxy.id

        consommation_total = {
            c.land.id: round(c.total, 2)
            for c in PublicDataContainer.consommation_stats_service().get_by_lands(lands, start_date, end_date)
        }
        population_evolution_total = {
            p.land.id: p.evolution
            for p in PublicDataContainer.population_stats_service().get_by_lands(lands, start_date, end_date)
        }

        last_year_populations = {
            p.land.id: p.last_year_population.population
            for p in PublicDataContainer.population_progression_service().get_by_lands(lands, start_date, end_date)
        }

        return [
            {
                "name": land.name,
                "data": [
                    {
                        "x": population_evolution_total.get(land.id, 0),
                        "y": consommation_total.get(land.id, 0),
                        "z": last_year_populations.get(land.id, 0),
                    }
                ],
                "color": HIGHLIGHT_COLOR if land.id == highlighted_land_id else None,
                # La couleur du territoire diagnostiqué est précisée, les autres sont aléatoires (valeur None)
            }
            for land in lands
        ]

    def get_trend_series(self):
        pop_comparison = PublicDataContainer.population_comparison_service().get_by_land(
            land=self.project.land_proxy,
            start_date=int(self.project.analyse_start_date),
            end_date=int(self.project.analyse_end_date),
        )
        pop_evolution_mediane = pop_comparison.evolution_median
        conso_mediane = (
            PublicDataContainer.consommation_comparison_service()
            .get_by_land(
                land=self.project.land_proxy,
                start_date=int(self.project.analyse_start_date),
                end_date=int(self.project.analyse_end_date),
            )
            .total_median
        )
        lands = self.project.comparison_lands_and_self_land()
        start_date = int(self.project.analyse_start_date)
        end_date = int(self.project.analyse_end_date)

        population_evolution = [
            p.evolution
            for p in PublicDataContainer.population_stats_service().get_by_lands(lands, start_date, end_date)
        ]

        max_population_evolution = max(population_evolution)
        min_population_evolution = min(population_evolution)

        max_conso = max(
            [
                c.total
                for c in PublicDataContainer.consommation_stats_service().get_by_lands(lands, start_date, end_date)
            ]
        )

        middle_point = {"x": pop_evolution_mediane, "y": conso_mediane}
        slope = (max_conso - conso_mediane) / (max_population_evolution - pop_evolution_mediane)
        low_point = {
            "x": min_population_evolution,
            "y": conso_mediane + slope * (min_population_evolution - pop_evolution_mediane),
        }
        high_point = {
            "x": max_population_evolution,
            "y": conso_mediane + slope * (max_population_evolution - pop_evolution_mediane),
        }

        return [
            {
                "name": (
                    f"Médiane des {self.project.land.land_type_label.lower()}s<br>à "
                    f"l'échelle de {pop_comparison.land.name}"
                ),
                "type": "line",
                "color": "black",
                "marker": {"enabled": False},
                "enableMouseTracking": False,
                "states": {"hover": {"enabled": False}},
                "data": [
                    low_point,
                    middle_point,
                    high_point,
                ],
            }
        ]

    def add_series(self):
        self.chart["series"] = self.get_bubble_series() + self.get_trend_series()
