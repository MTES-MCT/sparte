from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcCreationsEntreprises


class DcCreationsEntreprisesChart(DiagnosticChart):
    name = "dc creations entreprises"

    @property
    def data(self):
        return LandDcCreationsEntreprises.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).first()

    @property
    def param(self):
        d = self.data
        if not d:
            return super().param | {"series": []}

        years = list(range(2012, 2025))
        categories = [str(y) for y in years]

        total = [getattr(d, f"creations_entreprises_{y}", None) or 0 for y in years]
        individuelles = [getattr(d, f"creations_individuelles_{y}", None) or 0 for y in years]

        return super().param | {
            "chart": {"type": "line"},
            "title": {"text": f"Créations d'entreprises - {self.land.name} (2012-2024)"},
            "credits": INSEE_CREDITS,
            "xAxis": {"categories": categories},
            "yAxis": {"title": {"text": "Nombre de créations"}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y:,.0f}",
            },
            "series": [
                {
                    "name": "Total créations",
                    "data": total,
                    "color": "#6A6AF4",
                },
                {
                    "name": "Créations individuelles",
                    "data": individuelles,
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

        years = list(range(2012, 2025))
        return {
            "headers": ["Année", "Total créations", "Créations individuelles"],
            "rows": [
                {
                    "name": str(y),
                    "data": [
                        str(y),
                        fmt(getattr(d, f"creations_entreprises_{y}", None)),
                        fmt(getattr(d, f"creations_individuelles_{y}", None)),
                    ],
                }
                for y in years
            ],
        }
