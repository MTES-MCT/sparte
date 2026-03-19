from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcLogement


class DcLogementConstructionChart(DiagnosticChart):
    name = "dc logement construction"

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

        categories = [
            "Avant 1919",
            "1919-1945",
            "1946-1970",
            "1971-1990",
            "1991-2005",
            "2006-2019",
        ]

        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": f"Résidences principales par époque de construction - {self.land.name} (2022)"},
            "credits": INSEE_CREDITS,
            "xAxis": {"categories": categories},
            "yAxis": {"title": {"text": "Nombre de résidences principales"}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y:,.0f}",
            },
            "legend": {"enabled": False},
            "series": [
                {
                    "name": "Résidences principales",
                    "data": [
                        d.rp_avant_1919_22 or 0,
                        d.rp_1919_1945_22 or 0,
                        d.rp_1946_1970_22 or 0,
                        d.rp_1971_1990_22 or 0,
                        d.rp_1991_2005_22 or 0,
                        d.rp_2006_2019_22 or 0,
                    ],
                    "color": "#6A6AF4",
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

        periods = [
            ("Avant 1919", d.rp_avant_1919_22),
            ("1919-1945", d.rp_1919_1945_22),
            ("1946-1970", d.rp_1946_1970_22),
            ("1971-1990", d.rp_1971_1990_22),
            ("1991-2005", d.rp_1991_2005_22),
            ("2006-2019", d.rp_2006_2019_22),
        ]

        return {
            "headers": ["Période", "Résidences principales"],
            "rows": [{"name": "", "data": [label, fmt(val)]} for label, val in periods],
        }
