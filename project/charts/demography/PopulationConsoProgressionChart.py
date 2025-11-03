from project.charts.base_project_chart import DiagnosticChart
from public_data.domain.containers import PublicDataContainer


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
                "text": f"Évolution de la consommation d'espaces NAF et de la population à {self.land.name} ({self.params['start_date']} - {self.params['end_date']})"  # noqa: E501
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

    def _format_population(self, value):
        """Format population value."""
        return f"{value:,.0f}" if value is not None else "-"

    def _format_consumption(self, value):
        """Format consumption value."""
        return f"{value:.2f}" if value is not None else "-"

    def _get_population_value(self, population_list, index):
        """Get population value at index or None."""
        return population_list[index] if index < len(population_list) else None

    @property
    def data_table(self):
        """Generate data table for population and consumption progression."""
        years = list(range(int(self.params["start_date"]), int(self.params["end_date"]) + 1))
        progression_consommation = self.progression_consommation_dict

        # Match the exact logic from the series
        population_insee_data = self.stock_population_from_insee
        # The graph uses [None] + stock_population_calculted, so we replicate that
        population_calculated_data = [None] + self.stock_population_calculted

        # Headers
        headers = [
            "Année",
            "Population totale (hab)",
            "Population estimée (hab)",
            "Consommation totale (ha)",
            "Consommation habitat (ha)",
        ]

        # Data rows
        rows = []
        for i, year in enumerate(years):
            pop_insee = self._get_population_value(population_insee_data, i)
            pop_calc = self._get_population_value(population_calculated_data, i)
            conso_total = self._get_population_value(progression_consommation["total"], i)
            conso_habitat = self._get_population_value(progression_consommation["habitat"], i)

            rows.append(
                {
                    "name": "",
                    "data": [
                        str(year),
                        self._format_population(pop_insee),
                        self._format_population(pop_calc),
                        self._format_consumption(conso_total),
                        self._format_consumption(conso_habitat),
                    ],
                }
            )

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
        }
