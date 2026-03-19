from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcLogement


class DcLogementParcChart(DiagnosticChart):
    name = "dc logement parc"

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

        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": f"Parc de logements - {self.land.name}"},
            "credits": INSEE_CREDITS,
            "xAxis": {"categories": ["2011", "2016", "2022"]},
            "yAxis": {"title": {"text": "Nombre de logements"}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y:,.0f}",
            },
            "plotOptions": {"column": {"grouping": True}},
            "series": [
                {
                    "name": "Résidences principales",
                    "data": [d.residences_principales_11, d.residences_principales_16, d.residences_principales_22],
                    "color": "#6A6AF4",
                },
                {
                    "name": "Résidences secondaires",
                    "data": [d.residences_secondaires_11, d.residences_secondaires_16, d.residences_secondaires_22],
                    "color": "#8ecac7",
                },
                {
                    "name": "Logements vacants",
                    "data": [d.logements_vacants_11, d.logements_vacants_16, d.logements_vacants_22],
                    "color": "#D6AE73",
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
            "headers": ["Année", "Rés. principales", "Rés. secondaires", "Logements vacants", "Total"],
            "rows": [
                {
                    "name": "2011",
                    "data": [
                        "2011",
                        fmt(d.residences_principales_11),
                        fmt(d.residences_secondaires_11),
                        fmt(d.logements_vacants_11),
                        fmt(d.logements_11),
                    ],
                },
                {
                    "name": "2016",
                    "data": [
                        "2016",
                        fmt(d.residences_principales_16),
                        fmt(d.residences_secondaires_16),
                        fmt(d.logements_vacants_16),
                        fmt(d.logements_16),
                    ],
                },
                {
                    "name": "2022",
                    "data": [
                        "2022",
                        fmt(d.residences_principales_22),
                        fmt(d.residences_secondaires_22),
                        fmt(d.logements_vacants_22),
                        fmt(d.logements_22),
                    ],
                },
            ],
        }
