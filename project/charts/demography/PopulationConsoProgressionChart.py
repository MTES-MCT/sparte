from project.charts.base_project_chart import DiagnosticChart
from public_data.domain.containers import PublicDataContainer

CENSUS_YEARS = {2011, 2016, 2022}


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
    def population_census_data(self):
        """Return population values only for census years, None for others."""
        start = int(self.params["start_date"])
        end = int(self.params["end_date"])
        pop_by_year = {
            year_data.year: year_data.population
            for year_data in self.data["population"]
            if not year_data.population_calculated
        }
        return [pop_by_year.get(year) if year in CENSUS_YEARS else None for year in range(start, end + 1)]

    @property
    def progression_consommation_dict(self):
        return {
            "total": [round(year.total, 2) for year in self.data["consommation"]],
            "habitat": [round(year.habitat, 2) for year in self.data["consommation"]],
        }

    @property
    def series(self):
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
                "name": "Population",
                "type": "spline",
                "data": self.population_census_data,
                "tooltip": {"valueSuffix": " hab"},
                "color": "#fa4b42",
                "connectNulls": True,
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
            "legend": {
                **super().param["legend"],
                "layout": "horizontal",
                "align": "center",
                "verticalAlign": "bottom",
            },
            "tooltip": {"shared": True},
            "series": self.series,
        }

    def _format_number(self, value):
        return f"{value:,.0f}" if value is not None else "-"

    def _format_consumption(self, value):
        return f"{value:.2f}" if value is not None else "-"

    def _get_value(self, data_list, index):
        return data_list[index] if index < len(data_list) else None

    @property
    def data_table(self):
        years = list(range(int(self.params["start_date"]), int(self.params["end_date"]) + 1))
        progression_consommation = self.progression_consommation_dict
        population_data = self.population_census_data

        headers = [
            "Année",
            "Population",
            "Consommation totale (ha)",
            "Consommation habitat (ha)",
        ]

        rows = []
        for i, year in enumerate(years):
            rows.append(
                {
                    "name": "",
                    "data": [
                        str(year),
                        self._format_number(self._get_value(population_data, i)),
                        self._format_consumption(self._get_value(progression_consommation["total"], i)),
                        self._format_consumption(self._get_value(progression_consommation["habitat"], i)),
                    ],
                }
            )

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
        }
