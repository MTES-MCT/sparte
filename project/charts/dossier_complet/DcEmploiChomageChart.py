from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcActiviteChomage


class DcEmploiChomageChart(DiagnosticChart):
    name = "dc emploi chomage"

    @property
    def data(self):
        return LandDcActiviteChomage.objects.filter(
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
            "title": {"text": f"Activité et chômage (15-64 ans) - {self.land.name}"},
            "credits": INSEE_CREDITS,
            "xAxis": {"categories": ["2011", "2016", "2022"]},
            "yAxis": {"title": {"text": "Population 15-64 ans"}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y:,.0f}",
            },
            "plotOptions": {"column": {"stacking": "normal"}},
            "series": [
                {
                    "name": "Actifs occupés",
                    "data": [
                        d.actifs_occupes_15_64_11 or 0,
                        d.actifs_occupes_15_64_16 or 0,
                        d.actifs_occupes_15_64_22 or 0,
                    ],
                    "color": "#00E272",
                },
                {
                    "name": "Chômeurs",
                    "data": [
                        d.chomeurs_15_64_11 or 0,
                        d.chomeurs_15_64_16 or 0,
                        d.chomeurs_15_64_22 or 0,
                    ],
                    "color": "#FA4B42",
                },
                {
                    "name": "Inactifs",
                    "data": [
                        d.inactifs_15_64_11 or 0,
                        d.inactifs_15_64_16 or 0,
                        d.inactifs_15_64_22 or 0,
                    ],
                    "color": "#CFD1E5",
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
            "headers": ["Année", "Actifs occupés", "Chômeurs", "Inactifs", "Pop. 15-64 ans"],
            "rows": [
                {
                    "name": "2011",
                    "data": [
                        "2011",
                        fmt(d.actifs_occupes_15_64_11),
                        fmt(d.chomeurs_15_64_11),
                        fmt(d.inactifs_15_64_11),
                        fmt(d.pop_15_64_11),
                    ],
                },
                {
                    "name": "2016",
                    "data": [
                        "2016",
                        fmt(d.actifs_occupes_15_64_16),
                        fmt(d.chomeurs_15_64_16),
                        fmt(d.inactifs_15_64_16),
                        fmt(d.pop_15_64_16),
                    ],
                },
                {
                    "name": "2022",
                    "data": [
                        "2022",
                        fmt(d.actifs_occupes_15_64_22),
                        fmt(d.chomeurs_15_64_22),
                        fmt(d.inactifs_15_64_22),
                        fmt(d.pop_15_64_22),
                    ],
                },
            ],
        }
