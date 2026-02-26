from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcPopulation


class DcPopulationPyramidChart(DiagnosticChart):
    name = "dc population pyramid"

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

        categories = ["0-19 ans", "20-64 ans", "65 ans et +"]

        return super().param | {
            "chart": {"type": "bar"},
            "title": {"text": f"Pyramide des âges - {self.land.name} (2022)"},
            "credits": INSEE_CREDITS,
            "xAxis": {"categories": categories},
            "yAxis": {"title": {"text": "Population"}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y:,.0f}",
            },
            "plotOptions": {"column": {"grouping": True}},
            "series": [
                {
                    "name": "Hommes",
                    "data": [
                        d.pop_hommes_0_19_22 or 0,
                        d.pop_hommes_20_64_22 or 0,
                        d.pop_hommes_65_plus_22 or 0,
                    ],
                    "color": "#6A6AF4",
                },
                {
                    "name": "Femmes",
                    "data": [
                        d.pop_femmes_0_19_22 or 0,
                        d.pop_femmes_20_64_22 or 0,
                        d.pop_femmes_65_plus_22 or 0,
                    ],
                    "color": "#FA4B42",
                },
            ],
        }

    @property
    def data_table(self):
        d = self.data
        if not d:
            return None

        def fmt(v):
            return f"{v:,.0f}" if v else "-"

        return {
            "headers": ["Tranche d'âge", "Hommes", "Femmes"],
            "rows": [
                {"name": "", "data": ["0-19 ans", fmt(d.pop_hommes_0_19_22), fmt(d.pop_femmes_0_19_22)]},
                {"name": "", "data": ["20-64 ans", fmt(d.pop_hommes_20_64_22), fmt(d.pop_femmes_20_64_22)]},
                {"name": "", "data": ["65 ans et +", fmt(d.pop_hommes_65_plus_22), fmt(d.pop_femmes_65_plus_22)]},
            ],
        }
