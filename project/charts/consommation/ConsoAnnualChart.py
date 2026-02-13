from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS
from public_data.models import LandConso


class ConsoAnnualChart(DiagnosticChart):
    @property
    def data(self):
        return LandConso.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
            year__gte=2011,
        ).order_by("year")

    @property
    def data_table(self):
        headers = [
            "Année",
            "Consommation totale (ha)",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": f"{item.year}",
                    "data": [
                        item.year,
                        item.total / 10000,  # Conversion m² -> ha
                    ],
                }
                for item in self.data
            ],
        }

    @property
    def series(self):
        data = [
            {
                "name": str(item.year),
                "y": item.total / 10000,  # Conversion m² -> ha
            }
            for item in self.data
        ]

        return [
            {
                "name": "Consommation totale",
                "data": data,
            },
        ]

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": (
                    f"Consommation annuelle d'espaces NAF "
                    f"de {self.land.name} ({self.data.first().year}-{self.data.last().year})"
                ),
                "style": {"fontSize": "14px", "fontWeight": "600"},
                "margin": 25,
            },
            "series": self.series,
            "chart": {"type": "column", "height": 280},
            "yAxis": {"title": {"text": ""}},
            "xAxis": {
                "type": "category",
                "plotBands": [
                    {
                        "color": "#f5f5f5",
                        "from": -0.5,
                        "to": 9.5,
                        "label": {
                            "text": "Période de référence de la loi Climat & Résilience",
                            "style": {"color": "#666666", "fontWeight": "600"},
                        },
                        "className": "plotband_blue",
                    },
                ],
            },
            "tooltip": {
                "valueSuffix": " ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": "Consommation: {point.y:,.1f} ha",
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "legend": {"enabled": False},
        }
