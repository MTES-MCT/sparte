from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    CONSOMMATION_HABITAT_COLOR,
    CONSOMMATION_TOTALE_COLOR,
    HIGHLIGHT_COLOR,
    INSEE_CREDITS,
)
from public_data.models import LandConso, LandDcPopulation


class DcPopulationVsConsoChart(DiagnosticChart):
    name = "dc population vs conso"
    required_params = ["start_date", "end_date"]

    @property
    def population_data(self):
        return LandDcPopulation.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).first()

    @property
    def conso_data(self):
        return LandConso.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
            year__gte=int(self.params["start_date"]),
            year__lte=int(self.params["end_date"]),
        ).order_by("year")

    @property
    def param(self):
        pop = self.population_data
        conso_qs = self.conso_data

        if not pop or not conso_qs.exists():
            return super().param | {"series": []}

        conso_years = [c.year for c in conso_qs]
        conso_total = [round(c.total / 10000, 2) for c in conso_qs]
        conso_habitat = [round(c.habitat / 10000, 2) for c in conso_qs]

        # Build population data aligned with conso years
        pop_by_year = {}
        if pop.population_11:
            pop_by_year[2011] = pop.population_11
        if pop.population_16:
            pop_by_year[2016] = pop.population_16
        if pop.population_22:
            pop_by_year[2022] = pop.population_22

        pop_series = []
        for y in conso_years:
            pop_series.append(pop_by_year.get(y, None))

        return super().param | {
            "chart": {"zoomType": "xy"},
            "title": {
                "text": (
                    f"Population et consommation d'espaces - {self.land.name} "
                    f"({self.params['start_date']} - {self.params['end_date']})"
                )
            },
            "credits": INSEE_CREDITS,
            "xAxis": [{"categories": [str(y) for y in conso_years]}],
            "yAxis": [
                {
                    "title": {"text": "Population", "style": {"color": HIGHLIGHT_COLOR}},
                    "labels": {"style": {"color": HIGHLIGHT_COLOR}},
                    "opposite": True,
                },
                {
                    "title": {"text": "Consommation d'espaces (ha)", "style": {"color": CONSOMMATION_HABITAT_COLOR}},
                    "labels": {"style": {"color": CONSOMMATION_HABITAT_COLOR}},
                },
            ],
            "tooltip": {"shared": True},
            "plotOptions": {"series": {"grouping": False, "borderWidth": 0}},
            "series": [
                {
                    "name": "Consommation totale",
                    "type": "column",
                    "yAxis": 1,
                    "data": conso_total,
                    "tooltip": {"valueSuffix": " ha"},
                    "color": CONSOMMATION_TOTALE_COLOR,
                    "id": "main",
                },
                {
                    "name": "Consommation habitat",
                    "type": "column",
                    "yAxis": 1,
                    "data": conso_habitat,
                    "tooltip": {"valueSuffix": " ha"},
                    "color": CONSOMMATION_HABITAT_COLOR,
                    "linkedTo": "main",
                },
                {
                    "name": "Population",
                    "type": "spline",
                    "data": pop_series,
                    "tooltip": {"valueSuffix": " hab"},
                    "color": HIGHLIGHT_COLOR,
                    "connectNulls": True,
                },
            ],
        }

    @property
    def data_table(self):
        pop = self.population_data
        conso_qs = self.conso_data

        if not pop or not conso_qs.exists():
            return None

        pop_by_year = {}
        if pop.population_11:
            pop_by_year[2011] = pop.population_11
        if pop.population_16:
            pop_by_year[2016] = pop.population_16
        if pop.population_22:
            pop_by_year[2022] = pop.population_22

        return {
            "headers": ["Année", "Consommation totale (ha)", "Consommation habitat (ha)", "Population"],
            "rows": [
                {
                    "name": str(c.year),
                    "data": [
                        str(c.year),
                        f"{c.total / 10000:.2f}",
                        f"{c.habitat / 10000:.2f}",
                        f"{pop_by_year[c.year]:,.0f}" if c.year in pop_by_year else "-",
                    ],
                }
                for c in conso_qs
            ],
        }
