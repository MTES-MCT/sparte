from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    CONSOMMATION_HABITAT_COLOR,
    CONSOMMATION_TOTALE_COLOR,
    INSEE_CREDITS,
)
from public_data.models import LandConso, LandDcMenages


class DcMenagesEvolutionChart(DiagnosticChart):
    name = "dc menages evolution"
    required_params = ["start_date", "end_date"]

    @property
    def menages_data(self):
        return LandDcMenages.objects.filter(
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
        d = self.menages_data
        conso_qs = self.conso_data

        if not d or not conso_qs.exists():
            return super().param | {"series": []}

        conso_years = [c.year for c in conso_qs]
        conso_total = [round(c.total / 10000, 2) for c in conso_qs]
        conso_habitat = [round(c.habitat / 10000, 2) for c in conso_qs]

        menages_by_year = {}
        if d.menages_11:
            menages_by_year[2011] = d.menages_11
        if d.menages_16:
            menages_by_year[2016] = d.menages_16
        if d.menages_22:
            menages_by_year[2022] = d.menages_22

        menages_series = [menages_by_year.get(y, None) for y in conso_years]

        return super().param | {
            "chart": {"zoomType": "xy"},
            "title": {
                "text": (
                    f"Ménages et consommation d'espaces - {self.land.name} "
                    f"({self.params['start_date']} - {self.params['end_date']})"
                )
            },
            "credits": INSEE_CREDITS,
            "xAxis": [{"categories": [str(y) for y in conso_years]}],
            "yAxis": [
                {
                    "title": {"text": "Nombre de ménages", "style": {"color": "#6A6AF4"}},
                    "labels": {"style": {"color": "#6A6AF4"}},
                },
                {
                    "title": {"text": "Consommation d'espaces (ha)", "style": {"color": CONSOMMATION_HABITAT_COLOR}},
                    "labels": {"style": {"color": CONSOMMATION_HABITAT_COLOR}},
                    "opposite": True,
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
                    "name": "Ménages",
                    "type": "spline",
                    "data": menages_series,
                    "tooltip": {"valueSuffix": " ménages"},
                    "color": "#6A6AF4",
                    "connectNulls": True,
                },
            ],
        }

    @property
    def data_table(self):
        d = self.menages_data
        conso_qs = self.conso_data

        if not d or not conso_qs.exists():
            return None

        def fmt(v):
            return f"{v:,.0f}" if v is not None else "-"

        menages_by_year = {2011: d.menages_11, 2016: d.menages_16, 2022: d.menages_22}

        return {
            "headers": ["Année", "Conso. totale (ha)", "Conso. habitat (ha)", "Ménages"],
            "rows": [
                {
                    "name": str(c.year),
                    "data": [
                        str(c.year),
                        f"{c.total / 10000:.2f}",
                        f"{c.habitat / 10000:.2f}",
                        fmt(menages_by_year.get(c.year)),
                    ],
                }
                for c in conso_qs
            ],
        }
