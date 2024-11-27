from django.utils.functional import cached_property

from project.charts.base_project_chart import ProjectChart
from public_data.domain.containers import PublicDataContainer


class PopulationConsoProgressionChart(ProjectChart):
    name = "population conso progression"

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": "Évolutions comparées de la consommation d'espaces NAF et de la population du territoire"
            },
            "credits": {"enabled": False},
            "plotOptions": {"series": {"grouping": False, "borderWidth": 0}},
            "xAxis": [
                {
                    "categories": [
                        str(year)
                        for year in range(int(self.project.analyse_start_date), int(self.project.analyse_end_date) + 1)
                    ]
                }
            ],
            "yAxis": [
                {
                    "title": {"text": "Population (hab)", "style": {"color": "#fa4b42"}},
                    "labels": {"style": {"color": "#fa4b42"}},
                    "opposite": True,
                },
                {
                    "labels": {"style": {"color": "#6a6af4"}},
                    "title": {"text": "Consommation d'espaces NAF (ha)", "style": {"color": "#6a6af4"}},
                },
            ],
            "tooltip": {"shared": True},
            "series": [],
        }

    @cached_property
    def land_population(self):
        return PublicDataContainer.population_progression_service().get_by_land(
            land=self.project.land_proxy,
            start_date=int(self.project.analyse_start_date),
            end_date=int(self.project.analyse_end_date),
        )

    @cached_property
    def stock_population_from_insee(self):
        return [year.population for year in self.land_population.population if not year.population_calculated]

    @cached_property
    def stock_population_calculted(self):
        empty_years = [None] * (len(self.stock_population_from_insee) - 2)
        last_year_from_insee = self.stock_population_from_insee[-1]
        return (
            empty_years
            + [last_year_from_insee]
            + [year.population for year in self.land_population.population if year.population_calculated]
        )

    def get_progression_consommation(self):
        progresison_consommation = (
            PublicDataContainer.consommation_progression_service()
            .get_by_land(
                land=self.project.land_proxy,
                start_date=int(self.project.analyse_start_date),
                end_date=int(self.project.analyse_end_date),
            )
            .consommation
        )

        return {
            "total": [round(year.total, 2) for year in progresison_consommation],
            "habitat": [round(year.habitat, 2) for year in progresison_consommation],
        }

    def add_series(self):
        progression_consommation = self.get_progression_consommation()

        self.chart["series"] = [
            {
                "name": "Consommation totale",
                "type": "column",
                "yAxis": 1,
                "data": progression_consommation["total"],
                "tooltip": {"valueSuffix": " ha"},
                "color": "#CFD1E5",
                "id": "main",
            },
            {
                "name": "Consommation à destination de l'habitat",
                "type": "column",
                "yAxis": 1,
                "data": progression_consommation["habitat"],
                "tooltip": {"valueSuffix": " ha"},
                "color": "#6a6af4",
                "linkTo": "main",
            },
            {
                "name": "Population",
                "type": "spline",
                "data": self.stock_population_from_insee,
                "tooltip": {"valueSuffix": " hab"},
                "color": "#fa4b42",
            },
            {
                "name": "Population estimée",
                "type": "spline",
                "data": [None] + self.stock_population_calculted,
                "tooltip": {"valueSuffix": " hab"},
                "color": "#fa4b42",
                "dashStyle": "Dash",
            },
        ]
