from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    CONSOMMATION_TOTALE_COLOR,
    DESTINATION_ACTIVITE_COLOR,
    HIGHLIGHT_COLOR,
    INSEE_CREDITS,
)
from public_data.models import LandConso, LandDcCreationsEntreprises


class DcEmploiVsConsoChart(DiagnosticChart):
    name = "dc emploi vs conso"
    required_params = ["start_date", "end_date"]

    @property
    def entreprises_data(self):
        return LandDcCreationsEntreprises.objects.filter(
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
        ent = self.entreprises_data
        conso_qs = self.conso_data

        if not ent or not conso_qs.exists():
            return super().param | {"series": []}

        conso_years = [c.year for c in conso_qs]
        conso_total = [round(c.total / 10000, 2) for c in conso_qs]
        conso_activite = [round(c.activite / 10000, 2) for c in conso_qs]

        creations_series = []
        individuelles_series = []
        for y in conso_years:
            creations_series.append(getattr(ent, f"creations_entreprises_{y}", None))
            individuelles_series.append(getattr(ent, f"creations_individuelles_{y}", None))

        return super().param | {
            "chart": {"zoomType": "xy"},
            "title": {
                "text": (
                    f"Créations d'entreprises et consommation d'espaces - {self.land.name} "
                    f"({self.params['start_date']} - {self.params['end_date']})"
                )
            },
            "credits": INSEE_CREDITS,
            "xAxis": [{"categories": [str(y) for y in conso_years]}],
            "yAxis": [
                {
                    "title": {"text": "Créations d'entreprises", "style": {"color": HIGHLIGHT_COLOR}},
                    "labels": {"style": {"color": HIGHLIGHT_COLOR}},
                    "opposite": True,
                },
                {
                    "title": {"text": "Consommation d'espaces (ha)", "style": {"color": DESTINATION_ACTIVITE_COLOR}},
                    "labels": {"style": {"color": DESTINATION_ACTIVITE_COLOR}},
                },
            ],
            "tooltip": {"shared": True},
            "plotOptions": {"column": {"stacking": "normal"}},
            "series": [
                {
                    "name": "Consommation totale",
                    "type": "column",
                    "yAxis": 1,
                    "data": conso_total,
                    "tooltip": {"valueSuffix": " ha"},
                    "color": CONSOMMATION_TOTALE_COLOR,
                    "stack": "conso",
                },
                {
                    "name": "Consommation activité",
                    "type": "column",
                    "yAxis": 1,
                    "data": conso_activite,
                    "tooltip": {"valueSuffix": " ha"},
                    "color": DESTINATION_ACTIVITE_COLOR,
                    "stack": "conso",
                },
                {
                    "name": "Créations d'entreprises",
                    "type": "column",
                    "data": creations_series,
                    "tooltip": {"valueSuffix": " créations"},
                    "color": HIGHLIGHT_COLOR,
                    "stack": "entreprises",
                },
                {
                    "name": "Créations individuelles",
                    "type": "column",
                    "data": individuelles_series,
                    "tooltip": {"valueSuffix": " créations"},
                    "color": "#FFB347",
                    "stack": "entreprises",
                },
            ],
        }

    @property
    def data_table(self):
        ent = self.entreprises_data
        conso_qs = self.conso_data

        if not ent or not conso_qs.exists():
            return None

        def fmt(v):
            return f"{v:,.0f}" if v else "-"

        return {
            "headers": [
                "Année",
                "Conso. totale (ha)",
                "Conso. activité (ha)",
                "Créations entreprises",
                "Créations individuelles",
            ],
            "rows": [
                {
                    "name": str(c.year),
                    "data": [
                        str(c.year),
                        f"{c.total / 10000:.2f}",
                        f"{c.activite / 10000:.2f}",
                        fmt(getattr(ent, f"creations_entreprises_{c.year}", None)),
                        fmt(getattr(ent, f"creations_individuelles_{c.year}", None)),
                    ],
                }
                for c in conso_qs
            ],
        }
