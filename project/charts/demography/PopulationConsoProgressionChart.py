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

    def get_progression_population(self):
        progression_population = (
            PublicDataContainer.population_progression_service()
            .get_by_land(
                land=self.project.land_proxy,
                start_date=int(self.project.analyse_start_date),
                end_date=int(self.project.analyse_end_date),
            )
            .population
        )

        return [year.population for year in progression_population]

    def get_progression_consommation_data(self):
        return (
            PublicDataContainer.consommation_progression_service()
            .get_by_land(
                land=self.project.land_proxy,
                start_date=int(self.project.analyse_start_date),
                end_date=int(self.project.analyse_end_date),
            )
            .consommation
        )

    def get_progression_consommation_total(self):
        consommation_data = self.get_progression_consommation_data()
        return [year.total for year in consommation_data]

    def get_progression_consommation_habitat(self):
        consommation_data = self.get_progression_consommation_data()
        return [year.habitat for year in consommation_data]

    def add_series(self):
        self.chart["series"] = [
            {
                "name": "Consommation totale",
                "type": "column",
                "stacking": "normal",
                "yAxis": 1,
                "data": self.get_progression_consommation_total(),
                "tooltip": {"valueSuffix": " ha"},
                "color": "#CFD1E5",
            },
            {
                "name": "Consommation à destination de l'habitat",
                "type": "column",
                "stacking": "normal",
                "yAxis": 1,
                "data": self.get_progression_consommation_habitat(),
                "tooltip": {"valueSuffix": " ha"},
                "color": "#6a6af4",
            },
            {
                "name": "Population",
                "type": "spline",
                "data": self.get_progression_population(),
                "tooltip": {"valueSuffix": " hab"},
                "color": "#fa4b42",
            },
        ]
