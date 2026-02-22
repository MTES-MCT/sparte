from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcLogement


class DcResidencesSecondairesChart(DiagnosticChart):
    name = "dc residences secondaires"

    @property
    def data(self):
        return LandDcLogement.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).first()

    @property
    def param(self):
        d = self.data
        if not d:
            return super().param | {"series": []}

        years = ["2011", "2016", "2022"]
        rs = [d.residences_secondaires_11, d.residences_secondaires_16, d.residences_secondaires_22]

        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": f"Résidences secondaires - {self.land.name}"},
            "credits": INSEE_CREDITS,
            "xAxis": {"categories": years},
            "yAxis": {"title": {"text": "Nombre de résidences secondaires"}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y:,.0f}",
            },
            "series": [
                {
                    "name": "Résidences secondaires",
                    "data": rs,
                    "color": "#f4a582",
                },
            ],
        }

    @property
    def data_table(self):
        d = self.data
        if not d:
            return None

        def fmt(v):
            return f"{v:,.0f}" if v is not None else "-"

        return {
            "headers": ["Année", "Rés. secondaires"],
            "rows": [
                {"name": "2011", "data": ["2011", fmt(d.residences_secondaires_11)]},
                {"name": "2016", "data": ["2016", fmt(d.residences_secondaires_16)]},
                {"name": "2022", "data": ["2022", fmt(d.residences_secondaires_22)]},
            ],
        }
