from project.charts.base_project_chart import DiagnosticChart
from public_data.domain.containers import PublicDataContainer
from public_data.infra.demography.population.progression.table import (
    PopulationConsoProgressionTableMapper,
)


class PopulationConsoProgressionChart(DiagnosticChart):
    required_params = ["start_date", "end_date"]
    name = "population conso progression"

    @property
    def data(self):
        """Get population and consumption data for the land."""
        land_population = PublicDataContainer.population_progression_service().get_by_land(
            land=self.land,
            start_date=int(self.params["start_date"]),
            end_date=int(self.params["end_date"]),
        )

        progression_consommation = (
            PublicDataContainer.consommation_progression_service()
            .get_by_land(
                land=self.land,
                start_date=int(self.params["start_date"]),
                end_date=int(self.params["end_date"]),
            )
            .consommation
        )

        return {
            "population": land_population.population,
            "consommation": progression_consommation,
        }

    @property
    def stock_population_from_insee(self):
        return [year.population for year in self.data["population"] if not year.population_calculated]

    @property
    def stock_population_calculted(self):
        empty_years = [None] * (len(self.stock_population_from_insee) - 2)
        last_year_from_insee = self.stock_population_from_insee[-1]
        return (
            empty_years
            + [last_year_from_insee]
            + [year.population for year in self.data["population"] if year.population_calculated]
        )

    @property
    def progression_consommation_dict(self):
        return {
            "total": [round(year.total, 2) for year in self.data["consommation"]],
            "habitat": [round(year.habitat, 2) for year in self.data["consommation"]],
        }

    @property
    def series(self):
        """Generate series data from population and consumption data."""
        progression_consommation = self.progression_consommation_dict

        return [
            {
                "name": "Consommation totale ",
                "type": "column",
                "yAxis": 1,
                "data": progression_consommation["total"],
                "tooltip": {"valueSuffix": " ha"},
                "color": "#CFD1E5",
                "id": "main",
            },
            {
                "name": "Consommation à destination de l'habitat ",
                "type": "column",
                "yAxis": 1,
                "data": progression_consommation["habitat"],
                "tooltip": {"valueSuffix": " ha"},
                "color": "#6a6af4",
                "linkTo": "main",
            },
            {
                "name": "Population totale",
                "type": "spline",
                "data": self.stock_population_from_insee,
                "tooltip": {"valueSuffix": " hab"},
                "color": "#fa4b42",
            },
            {
                "name": "Population totale estimée",
                "type": "spline",
                "data": [None] + self.stock_population_calculted,
                "tooltip": {"valueSuffix": " hab"},
                "color": "#fa4b42",
                "dashStyle": "Dash",
            },
        ]

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": f"Évolutions de la consommation d'espaces et de la population à {self.land.name} ({self.params['start_date']} - {self.params['end_date']})"  # noqa: E501
            },
            "credits": {"enabled": False},
            "plotOptions": {"series": {"grouping": False, "borderWidth": 0}},
            "xAxis": [
                {
                    "categories": [
                        str(year) for year in range(int(self.params["start_date"]), int(self.params["end_date"]) + 1)
                    ]
                }
            ],
            "yAxis": [
                {
                    "title": {"text": "Population totale (hab)", "style": {"color": "#fa4b42"}},
                    "labels": {"style": {"color": "#fa4b42"}},
                    "opposite": True,
                },
                {
                    "labels": {"style": {"color": "#6a6af4"}},
                    "title": {"text": "Consommation d'espaces NAF (ha)", "style": {"color": "#6a6af4"}},
                },
            ],
            "tooltip": {"shared": True},
            "series": self.series,
        }

    @property
    def data_table(self):
        return PopulationConsoProgressionTableMapper.map(
            consommation_progression=self.data["consommation"],
            population_progression=self.data["population"],
        )
