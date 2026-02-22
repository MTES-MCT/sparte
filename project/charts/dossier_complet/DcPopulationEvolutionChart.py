from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcPopulation


class DcPopulationEvolutionChart(DiagnosticChart):
    name = "dc population evolution"

    @property
    def data(self):
        return LandDcPopulation.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).first()

    @property
    def param(self):
        d = self.data
        if not d:
            return super().param | {"series": []}

        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": f"Évolution de la population - {self.land.name}"},
            "credits": INSEE_CREDITS,
            "xAxis": {"categories": ["2011", "2016", "2022"]},
            "yAxis": {"title": {"text": "Population"}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y:,.0f}",
            },
            "plotOptions": {"column": {"dataLabels": {"enabled": True, "format": "{point.y:,.0f}"}}},
            "series": [
                {
                    "name": "Population totale",
                    "data": [d.population_11, d.population_16, d.population_22],
                    "color": "#6A6AF4",
                },
            ],
        }

    @property
    def data_table(self):
        d = self.data
        if not d:
            return None
        return {
            "headers": ["Année", "Population totale"],
            "rows": [
                {"name": "2011", "data": ["2011", f"{d.population_11:,.0f}" if d.population_11 else "-"]},
                {"name": "2016", "data": ["2016", f"{d.population_16:,.0f}" if d.population_16 else "-"]},
                {"name": "2022", "data": ["2022", f"{d.population_22:,.0f}" if d.population_22 else "-"]},
            ],
        }
